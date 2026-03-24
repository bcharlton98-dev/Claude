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
          {/* Forest green gradient — bold brand stroke */}
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b8f5e" />
            <stop offset="40%" stopColor="#4A6741" />
            <stop offset="100%" stopColor="#3d5636" />
          </linearGradient>
          <linearGradient id="ringGradComplete" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ee9460" />
            <stop offset="100%" stopColor="#e07840" />
          </linearGradient>
          {/* Glow filter for active ring */}
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e8e0d4"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc — forest green brand color */}
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
          filter="url(#ringGlow)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[44px] font-extrabold text-warm-800 tracking-tight tabular-nums animate-count leading-none">
          {displaySteps.toLocaleString()}
        </span>
        <span className="text-[11px] text-warm-400 font-medium mt-1">of {goal.toLocaleString()} steps</span>
      </div>
    </div>
  )
}
