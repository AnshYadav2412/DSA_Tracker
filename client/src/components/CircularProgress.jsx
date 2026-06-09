/**
 * SVG circular progress ring component.
 * @param {number} percent - 0 to 100
 * @param {number} size - diameter in px
 * @param {number} strokeWidth - ring thickness
 * @param {string} color - ring color
 * @param {string} label - center label text
 * @param {string} sublabel - smaller text below label
 */
export default function CircularProgress({
  percent = 0,
  size = 88,
  strokeWidth = 8,
  color = '#3b82f6',
  label,
  sublabel,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {/* Center text */}
      <div className="flex flex-col items-center justify-center" style={{ zIndex: 1 }}>
        {label !== undefined && (
          <span
            className="font-bold leading-none"
            style={{ fontSize: size * 0.2, color: 'var(--text-primary)' }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            className="leading-none mt-0.5"
            style={{ fontSize: size * 0.13, color: 'var(--text-muted)' }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
