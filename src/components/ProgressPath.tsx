import { getCurrentTitle } from '../data/mockData'

interface ProgressPathProps {
  lifetimeMiles: number
  dark?: boolean
}

export default function ProgressPath({ lifetimeMiles, dark = false }: ProgressPathProps) {
  const { current, next, progress } = getCurrentTitle(lifetimeMiles)
  const pct = next ? progress : 1
  const width = 320
  const height = 60
  const pathD = `M 20 45 C 60 45, 70 15, 110 15 C 150 15, 160 45, 200 45 C 240 45, 250 15, 290 15`
  const totalLen = 420
  const walkedLen = pct * totalLen

  const milestones = [
    { pct: 0, x: 20, y: 45 },
    { pct: 0.33, x: 110, y: 15 },
    { pct: 0.66, x: 200, y: 45 },
    { pct: 1, x: 290, y: 15 },
  ]

  const currentX = 20 + pct * 270
  const currentY = 45 + Math.sin(pct * Math.PI * 3) * -15

  const trackColor = dark ? 'rgba(255,255,255,0.12)' : '#E5D9C8'
  const dashColor = dark ? 'rgba(255,255,255,0.06)' : '#D6C9B5'
  const walkedColor = dark ? '#a4b47a' : '#2D5E3B'
  const dotReached = dark ? '#a4b47a' : '#2D5E3B'
  const dotUnreached = dark ? 'rgba(255,255,255,0.1)' : '#E5D9C8'
  const dotStroke = dark ? 'rgba(255,255,255,0.2)' : '#D6C9B5'
  const walkerFill = dark ? '#a4b47a' : '#2D5E3B'
  const textPrimary = dark ? 'text-white/80' : 'text-warm-500'
  const textAccent = dark ? 'text-gold-300' : 'text-forest-600'
  const textSecondary = dark ? 'text-white/40' : 'text-warm-400'

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="pathGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={pathD} fill="none" stroke={trackColor} strokeWidth={6} strokeLinecap="round" />
        <path d={pathD} fill="none" stroke={dashColor} strokeWidth={1} strokeLinecap="round" strokeDasharray="4 6" />
        <path d={pathD} fill="none" stroke={walkedColor} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={`${walkedLen} 10000`} opacity={0.9} />

        {milestones.map((m, i) => {
          const reached = pct >= m.pct
          return (
            <g key={i}>
              <circle cx={m.x} cy={m.y} r={i === 0 || i === milestones.length - 1 ? 6 : 4.5}
                fill={reached ? dotReached : dotUnreached} stroke={reached ? walkedColor : dotStroke} strokeWidth={1.5} />
              {(i === 1 || i === 2) && reached && (
                <polygon points={`${m.x},${m.y-4} ${m.x+1.5},${m.y-1} ${m.x+4},${m.y-1} ${m.x+2},${m.y+1} ${m.x+3},${m.y+4} ${m.x},${m.y+2} ${m.x-3},${m.y+4} ${m.x-2},${m.y+1} ${m.x-4},${m.y-1} ${m.x-1.5},${m.y-1}`}
                  fill="#D4A050" />
              )}
            </g>
          )
        })}

        <circle cx={currentX} cy={currentY} r={10} fill={walkerFill} opacity={0.15} filter="url(#pathGlow)">
          <animate attributeName="r" values="9;13;9" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={currentX} cy={currentY} r={7} fill="white" stroke={walkerFill} strokeWidth={2} />
        <circle cx={currentX} cy={currentY - 2.5} r={1.8} fill={walkerFill} />
        <path d={`M${currentX-1.5} ${currentY} L${currentX} ${currentY+3} L${currentX+1.5} ${currentY}`} fill={walkerFill} />
      </svg>

      <div className="flex items-center justify-between mt-1 px-1">
        <span className={`text-[10px] font-bold ${textPrimary}`}>{current.title}</span>
        <span className={`text-[10px] font-bold tabular-nums ${textAccent}`}>{lifetimeMiles.toLocaleString()} mi</span>
        {next && <span className={`text-[10px] font-bold ${textSecondary}`}>{next.title}</span>}
      </div>
    </div>
  )
}
