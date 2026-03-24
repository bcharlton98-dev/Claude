import type { Challenge } from '../data/mockData'

const terrainEmoji: Record<string, string> = {
  city: '🏙️',
  plains: '🌾',
  mountains: '⛰️',
  desert: '🏜️',
  forest: '🌲',
  coast: '🏖️',
  hills: '🌄',
  river: '🌊',
}

const terrainColors: Record<string, { bg: string; path: string }> = {
  city: { bg: '#e2e8f0', path: '#94a3b8' },
  plains: { bg: '#dcfce7', path: '#86efac' },
  mountains: { bg: '#e0e7ff', path: '#a5b4fc' },
  desert: { bg: '#fef3c7', path: '#fcd34d' },
  forest: { bg: '#d1fae5', path: '#6ee7b7' },
  coast: { bg: '#cffafe', path: '#67e8f9' },
  hills: { bg: '#fce7f3', path: '#f9a8d4' },
  river: { bg: '#dbeafe', path: '#93c5fd' },
}

export default function QuestMap({ challenge }: { challenge: Challenge }) {
  const waypoints = challenge.waypoints || []
  const totalDist = challenge.raceDistance || 1
  const progress = challenge.raceProgress || 0
  const pct = (progress / totalDist) * 100

  // SVG dimensions
  const width = 340
  const height = 200
  const padding = 20

  // Generate a winding path through the map
  const pathPoints: { x: number; y: number }[] = []
  const segments = 40
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = padding + t * (width - 2 * padding)
    // Create a winding S-curve
    const wave = Math.sin(t * Math.PI * 3) * 30
    const baseY = height * 0.35 + (t * height * 0.3)
    const y = baseY + wave
    pathPoints.push({ x, y })
  }

  // Build SVG path string
  const pathD = pathPoints.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const pr = pathPoints[i - 1]
    return `${d} Q ${pr.x + (p.x - pr.x) * 0.5} ${pr.y}, ${p.x} ${p.y}`
  }, '')

  // Find position along path for a given percentage
  function getPointAtPercent(percent: number) {
    const idx = Math.min(Math.floor((percent / 100) * segments), segments - 1)
    const frac = ((percent / 100) * segments) - idx
    const p1 = pathPoints[idx]
    const p2 = pathPoints[Math.min(idx + 1, segments)]
    return {
      x: p1.x + (p2.x - p1.x) * frac,
      y: p1.y + (p2.y - p1.y) * frac,
    }
  }

  const currentPos = getPointAtPercent(pct)

  // Terrain background segments
  const terrainSegments: { x: number; w: number; terrain: string }[] = []
  for (let i = 0; i < waypoints.length; i++) {
    const startPct = waypoints[i].mile / totalDist
    const endPct = i < waypoints.length - 1 ? waypoints[i + 1].mile / totalDist : 1
    terrainSegments.push({
      x: padding + startPct * (width - 2 * padding),
      w: (endPct - startPct) * (width - 2 * padding),
      terrain: waypoints[i].terrain,
    })
  }

  return (
    <div className="mt-3 bg-slate-50 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-600">🗺️ {challenge.raceName}</span>
        <span className="text-xs text-brand-600 font-bold">
          {progress.toLocaleString()} / {totalDist.toLocaleString()} mi
        </span>
      </div>

      {/* Visual Map */}
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-sky-100 to-green-50" style={{ height: height + 20 }}>
        <svg width="100%" height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} preserveAspectRatio="xMidYMid meet">
          {/* Terrain background bands */}
          {terrainSegments.map((seg, i) => (
            <rect
              key={i}
              x={seg.x}
              y={0}
              width={seg.w}
              height={height + 20}
              fill={terrainColors[seg.terrain]?.bg || '#f1f5f9'}
              opacity={0.5}
            />
          ))}

          {/* Trail shadow */}
          <path d={pathD} fill="none" stroke="#cbd5e1" strokeWidth={8} strokeLinecap="round" opacity={0.3} />

          {/* Unwalked trail */}
          <path d={pathD} fill="none" stroke="#e2e8f0" strokeWidth={5} strokeLinecap="round" />

          {/* Walked trail */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#trailGradient)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={`${pct * 8.5} 10000`}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Waypoint markers */}
          {waypoints.map((wp, i) => {
            const wpPct = (wp.mile / totalDist) * 100
            const pos = getPointAtPercent(wpPct)
            const emoji = terrainEmoji[wp.terrain] || '📍'
            return (
              <g key={i}>
                {/* Waypoint dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={wp.reached ? 6 : 4}
                  fill={wp.reached ? '#7c3aed' : '#e2e8f0'}
                  stroke="white"
                  strokeWidth={2}
                />
                {/* Terrain emoji above */}
                <text
                  x={pos.x}
                  y={pos.y - 14}
                  textAnchor="middle"
                  fontSize={i === 0 || i === waypoints.length - 1 ? 14 : 11}
                >
                  {i === 0 ? '📍' : i === waypoints.length - 1 ? '🏁' : emoji}
                </text>
                {/* City name below (only for key waypoints) */}
                {(i === 0 || i === waypoints.length - 1 || wp.reached && !waypoints[i + 1]?.reached) && (
                  <text
                    x={pos.x}
                    y={pos.y + 18}
                    textAnchor="middle"
                    fontSize={8}
                    fontWeight="600"
                    fill={wp.reached ? '#475569' : '#94a3b8'}
                  >
                    {wp.name.split(',')[0]}
                  </text>
                )}
              </g>
            )
          })}

          {/* Current position marker */}
          <circle cx={currentPos.x} cy={currentPos.y} r={10} fill="#7c3aed" opacity={0.2} filter="url(#glow)" />
          <circle cx={currentPos.x} cy={currentPos.y} r={6} fill="#7c3aed" stroke="white" strokeWidth={2.5} />
          <text x={currentPos.x} y={currentPos.y - 16} textAnchor="middle" fontSize={16}>
            🚶
          </text>
        </svg>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400 text-center">{Math.round(pct)}% complete</p>

      {/* Waypoint list with terrain */}
      <div className="space-y-1 mt-1">
        {waypoints.map((wp, i) => {
          const isNext = !wp.reached && (i === 0 || waypoints[i - 1].reached)
          return (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg ${
                isNext ? 'bg-brand-50 ring-1 ring-brand-200' :
                wp.reached ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              <span className={`text-sm ${!wp.reached && !isNext ? 'grayscale opacity-40' : ''}`}>
                {terrainEmoji[wp.terrain]}
              </span>
              <div className="flex-1">
                <span className={`${wp.reached ? 'font-medium' : ''} ${isNext ? 'text-brand-700 font-semibold' : ''}`}>
                  {wp.name}
                </span>
                {wp.landmark && (
                  <span className={`ml-1.5 text-[10px] ${wp.reached ? 'text-slate-400' : isNext ? 'text-brand-400' : 'text-slate-300'}`}>
                    · {wp.landmark}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{wp.mile.toLocaleString()} mi</span>
              {wp.reached && <span className="text-brand-500 text-[10px]">✓</span>}
              {isNext && <span className="text-[10px] font-bold text-brand-500">NEXT</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
