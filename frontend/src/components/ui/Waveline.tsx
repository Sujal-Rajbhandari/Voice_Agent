type WavelineProps = {
  width?: number | string;
  height?: number;
  color?: string;
  opacity?: number;
  className?: string;
};

/** Static waveform line — the brand's signature mark, used as a quiet divider. */
export default function Waveline({
  width = '100%',
  height = 28,
  color = 'currentColor',
  opacity = 1,
  className,
}: WavelineProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 480 28"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <path
        d="M0 14 H96 L104 6 L112 22 L120 2 L128 26 L136 9 L144 19 L152 14 H214 L222 8 L230 20 L238 5 L246 23 L254 11 L262 14 H336 L344 10 L352 18 L360 7 L368 21 L376 14 H480"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
