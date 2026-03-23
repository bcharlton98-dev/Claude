interface StepRingProps {
  current: number
  goal: number
  size?: number
  strokeWidth?: number
}

export default function StepRing({ current, goal, size = 180, strokeWidth = 12 }: StepRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(current / goal, 1)
  const offset = circumference - progress * circumference
  const percentage = Math.round(progress * 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progress >= 1 ? '#10b981' : '#34d399'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-800">{current.toLocaleString()}</span>
        <span className="text-sm text-slate-500">/ {goal.toLocaleString()}</span>
        <span className="text-xs font-semibold text-emerald-600 mt-0.5">{percentage}%</span>
      </div>
    </div>
  )
}
