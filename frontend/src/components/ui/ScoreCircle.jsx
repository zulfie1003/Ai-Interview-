import { getScoreColor } from '../../utils/helpers';

const ScoreCircle = ({ score, size = 80, label, animate = true }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(10, Math.max(0, score));
  const dashOffset = circumference - (normalizedScore / 10) * circumference;
  const color = getScoreColor(normalizedScore);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 84 84"
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
          />
          {/* Score circle */}
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 4px ${color}60)`,
              transition: animate ? 'stroke-dashoffset 1.5s ease-out' : 'none',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-white" style={{ fontSize: size * 0.2 }}>
            {normalizedScore.toFixed(1)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-mono text-gray-400 text-center leading-tight">{label}</span>
      )}
    </div>
  );
};

export default ScoreCircle;
