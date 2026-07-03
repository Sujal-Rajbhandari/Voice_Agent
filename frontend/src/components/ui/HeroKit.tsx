import { useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/* ============ KineticTitle ============
   Word-by-word masked rise — headlines enter like a voice
   finding its rhythm, not like a fading slide. */

type TitleLine = { text: string; accent?: boolean };

const lineVariants = {
  hidden: {},
  show: (i: number) => ({
    transition: { staggerChildren: 0.05, delayChildren: 0.12 + i * 0.14 },
  }),
};

const wordVariants = {
  hidden: { y: '115%' },
  show: {
    y: '0%',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function KineticTitle({ lines, className }: { lines: TitleLine[]; className?: string }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <h1 className={className}>
        {lines.map((line) => (
          <span key={line.text} className={`kt-line ${line.accent ? 'kt-accent' : ''}`}>
            {line.text}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <h1 className={className}>
      {lines.map((line, i) => (
        <motion.span
          key={line.text}
          className={`kt-line ${line.accent ? 'kt-accent' : ''}`}
          variants={lineVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={i}
        >
          {line.text.split(' ').map((word, wi) => (
            <span className="kt-mask" key={`${word}-${wi}`}>
              <motion.span className="kt-word" variants={wordVariants}>
                {word}
              </motion.span>
            </span>
          ))}
        </motion.span>
      ))}
    </h1>
  );
}

/* ============ HeroParallax ============
   Hero content drifts up and fades as you scroll past it,
   handing the stage to the wave underneath. */

export function HeroParallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { opacity, y }}>
      {children}
    </motion.div>
  );
}

/* ============ ScrollCue ============ */

export function ScrollCue({ label = 'Scroll' }: { label?: string }) {
  return (
    <div className="scroll-cue" aria-hidden="true">
      <span className="scroll-cue-label mono">{label}</span>
      <span className="scroll-cue-line">
        <span />
      </span>
    </div>
  );
}
