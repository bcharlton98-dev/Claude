import { getCurrentTitle } from '../data/mockData'

interface ProgressPathProps {
  lifetimeMiles: number
}

export default function ProgressPath({ lifetimeMiles }: ProgressPathProps) {
  const { current, next, progress } = getCurrentTitle(lifetimeMiles)
  const pct = next ? progress : 1
  const width = 320
  const height = 60

  // Winding path: 3 curves snaking left to right
  const pathD = `M 20 45 C 60 45, 70 15, 110 15 C 150 15, 160 45, 200 45 C 240 45, 250 15, 290 15`
  const totalLen = 420 // approximate
  const walkedLen = pct * totalLen

  // Milestone markers along the path
  const milestones = [
    { pct: 0, x: 20, y: 45 },
    { pct: 0.33, x: 110, y: 15 },
    { pct: 0.66, x: 200, y: 45 },
    { pct: 1, x: 290, y: 15 },
  ]

  // Interpolate current position
  const currentX = 20 + pct * 270
  const currentY = 45 + Math.sin(pct * Math.PI * 3) * -15

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="pathTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A6741" />
            <stop offset="100%" stopColor="#6b8f5e" />
          </linearGradient>
          <filter id="pathGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trail background */}
        <path d={pathD} fill="none" stroke="#e8e0d4" strokeWidth={6} strokeLinecap="round" />

        {/* Trail dashes */}
        <path d={pathD} fill="none" stroke="#d9cfc0" strokeWidth={1} strokeLinecap="round" strokeDasharray="4 6" />

        {/* Walked portion */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#pathTrailGrad)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${walkedLen} 10000`}
          opacity={0.9}
        />

        {/* Milestone dots */}
        {milestones.map((m, i) => {
          const reached = pct >= m.pct
          return (
            <g key={i}>
              <circle
                cx={m.x}
                cy={m.y}
                r={i === 0 || i === milestones.length - 1 ? 6 : 4.5}
                fill={reached ? '#4A6741' : '#e8e0d4'}
                stroke={reached ? '#3d5636' : '#d9cfc0'}
                strokeWidth={1.5}
              />
              {(i === 1 || i === 2) && reached && (
                <polygon
                  points={`${m.x},${m.y - 4} ${m.x + 1.5},${m.y - 1} ${m.x + 4},${m.y - 1} ${m.x + 2},${m.y + 1} ${m.x + 3},${m.y + 4} ${m.x},${m.y + 2} ${m.x - 3},${m.y + 4} ${m.x - 2},${m.y + 1} ${m.x - 4},${m.y - 1} ${m.x - 1.5},${m.y - 1}`}
                  fill="#D4A847"
                />
              )}
            </g>
          )
        })}

        {/* Current position — walker */}
        <circle cx={currentX} cy={currentY} r={10} fill="#4A6741" opacity={0.12} filter="url(#pathGlow)">
          <animate attributeName="r" values="9;13;9" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={currentX} cy={currentY} r={7} fill="white" stroke="#4A6741" strokeWidth={2} />
        {/* Walker figure */}
        <circle cx={currentX} cy={currentY - 2.5} r={1.8} fill="#4A6741" />
        <path d={`M${currentX - 1.5} ${currentY} L${currentX} ${currentY + 3} L${currentX + 1.5} ${currentY}`} fill="#4A6741" />
      </svg>

      {/* Title text below */}
      <div className="flex items-center justify-between mt-1 px-1">
        <span className="text-[10px] font-bold text-warm-500">{current.title}</span>
        <span className="text-[10px] font-extrabold text-forest-600 tabular-nums">{lifetimeMiles.toLocaleString()} mi</span>
        {next && <span className="text-[10px] font-bold text-warm-400">{next.title}</span>}
      </div>
    </div>
  )
}
