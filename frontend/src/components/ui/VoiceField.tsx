import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import './VoiceField.css';

/**
 * The "live line" — a particle voice waveform rendered in 3D.
 * Sits fixed behind the page; scroll morphs it from a speaking
 * ridge (inbound voice) into radiating rings (outbound dialing).
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform float uMorph;
  uniform float uPointSize;
  varying float vH;
  varying float vFade;

  float ridge(vec2 p, float t) {
    float band = exp(-p.y * p.y * 0.075);
    float w = sin(p.x * 0.55 - t * 1.5) * 0.45
            + sin(p.x * 1.35 + t * 0.85) * 0.25
            + sin(p.x * 2.60 - t * 2.10) * 0.12;
    return w * band;
  }

  float rings(vec2 p, float t) {
    float d = length(p);
    float w = sin(d * 0.95 - t * 1.7) * 0.5
            + sin(d * 1.80 - t * 2.5) * 0.2;
    return w * exp(-d * 0.055);
  }

  void main() {
    vec2 p = position.xz;
    float h = mix(ridge(p, uTime), rings(p, uTime), uMorph) * uAmp * 3.4;
    h += sin(p.x * 7.3 + p.y * 4.1 + uTime * 0.7) * 0.05 * uAmp;

    vec3 pos = vec3(position.x, h, position.z);
    vH = clamp(h * 0.34 + 0.5, 0.0, 1.0);

    vec2 edge = abs(p) / vec2(34.0, 18.0);
    vFade = 1.0 - smoothstep(0.62, 1.0, max(edge.x, edge.y));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPointSize * (1.0 + vH * 0.9) * (64.0 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform float uOpacity;
  varying float vH;
  varying float vFade;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float alpha = (1.0 - smoothstep(0.14, 0.25, d)) * vFade * uOpacity;
    vec3 col = mix(uColorLow, uColorHigh, smoothstep(0.55, 0.95, vH));
    gl_FragColor = vec4(col, alpha);
  }
`;

type FieldProps = {
  scrollProgress?: MotionValue<number>;
  frozen?: boolean;
  dark?: boolean;
};

function Field({ scrollProgress, frozen, dark }: FieldProps) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const isMobile = useThree((s) => s.size.width < 768);

  const geometry = useMemo(() => {
    const cols = isMobile ? 160 : 250;
    const rows = isMobile ? 76 : 110;
    const positions = new Float32Array(cols * rows * 3);
    let i = 0;
    for (let x = 0; x < cols; x++) {
      for (let z = 0; z < rows; z++) {
        positions[i++] = (x / (cols - 1) - 0.5) * 68;
        positions[i++] = 0;
        positions[i++] = (z / (rows - 1) - 0.5) * 36;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [isMobile]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.5 },
      uMorph: { value: 0 },
      uPointSize: { value: 1.6 },
      uOpacity: { value: 0.65 },
      uColorLow: { value: new THREE.Color('#B7C3B9') },
      uColorHigh: { value: new THREE.Color('#0D9162') },
    }),
    []
  );

  useEffect(() => {
    const mat = material.current;
    if (!mat) return;
    (mat.uniforms.uColorLow.value as THREE.Color).set(dark ? '#6B92AD' : '#B7C3B9');
    (mat.uniforms.uColorHigh.value as THREE.Color).set(dark ? '#5FE3B0' : '#0D9162');
    mat.uniforms.uOpacity.value = dark ? 0.85 : 0.65;
    mat.uniforms.uPointSize.value = dark ? 1.9 : 1.6;
  }, [dark]);

  useFrame((state, delta) => {
    if (!material.current || !points.current) return;
    const u = material.current.uniforms;

    if (!frozen) {
      u.uTime.value += delta;
      // Speech envelope: bursts and pauses, like a real voice on the line
      const t = u.uTime.value;
      const speech =
        Math.max(0, Math.sin(t * 0.9) * 0.5 + Math.sin(t * 2.3) * 0.3 + Math.sin(t * 0.37) * 0.45);
      const target = 0.3 + Math.min(1, speech) * 0.7;
      u.uAmp.value += (target - u.uAmp.value) * Math.min(1, delta * 2.5);
    }

    const scroll = scrollProgress ? scrollProgress.get() : 0;
    // Inbound ridge -> outbound rings as the page tells the outbound story
    const morph = THREE.MathUtils.smoothstep(scroll, 0.28, 0.62);
    u.uMorph.value += (morph - u.uMorph.value) * Math.min(1, delta * 4);

    // Camera pitches down enough that the field fills the whole frame,
    // drifting higher and slowly rotating with scroll
    const cam = state.camera;
    const camY = 7.4 + scroll * 4.2;
    cam.position.y += (camY - cam.position.y) * Math.min(1, delta * 4);
    cam.lookAt(0, -2.6, 1.5);
    points.current.rotation.y = scroll * 0.5 + state.clock.elapsedTime * 0.012;
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

type VoiceFieldProps = {
  scrollProgress?: MotionValue<number>;
  className?: string;
  dark?: boolean;
};

export default function VoiceField({ scrollProgress, className, dark }: VoiceFieldProps) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className={`voice-field ${className ?? ''}`} aria-hidden="true">
      <Canvas
        camera={{ fov: 40, position: [0, 6.2, 16.5], near: 0.1, far: 80 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
      >
        <Field scrollProgress={scrollProgress} frozen={prefersReducedMotion} dark={dark} />
      </Canvas>
    </div>
  );
}
