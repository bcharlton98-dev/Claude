import { useEffect, useState } from 'react'

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
  const isComplete = progress >= 1

  // Animated counting
  const [displaySteps, setDisplaySteps] = useState(0)
  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const pct = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - pct, 3)
      setDisplaySteps(Math.round(current * eased))
      if (pct < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [current])

  return (
    <div className={`relative inline-flex items-center justify-center ${isComplete ? 'animate-ring-complete' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="ringGradComplete" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f0e4d4"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? 'url(#ringGradComplete)' : 'url(#ringGrad)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold text-slate-800 tracking-tight tabular-nums animate-count">
          {displaySteps.toLocaleString()}
        </span>
        <span className="text-xs text-slate-400 font-medium mt-0.5">of {goal.toLocaleString()} steps</span>
      </div>
    </div>
  )
}
