import type { Challenge, Waypoint } from '../data/mockData'

// --- SVG terrain illustration helpers ---

function CityScene({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Tall building */}
      <rect x={-18} y={-50} width={14} height={50} rx={2} fill="#64748b" />
      <rect x={-16} y={-46} width={3} height={4} rx={0.5} fill="#fef08a" />
      <rect x={-11} y={-46} width={3} height={4} rx={0.5} fill="#fef08a" />
      <rect x={-16} y={-38} width={3} height={4} rx={0.5} fill="#fef08a" />
      <rect x={-11} y={-38} width={3} height={4} rx={0.5} fill="#93c5fd" />
      <rect x={-16} y={-30} width={3} height={4} rx={0.5} fill="#fef08a" />
      <rect x={-11} y={-30} width={3} height={4} rx={0.5} fill="#fef08a" />
      {/* Medium building */}
      <rect x={0} y={-35} width={12} height={35} rx={2} fill="#94a3b8" />
      <rect x={2} y={-31} width={3} height={3} rx={0.5} fill="#bfdbfe" />
      <rect x={7} y={-31} width={3} height={3} rx={0.5} fill="#bfdbfe" />
      <rect x={2} y={-24} width={3} height={3} rx={0.5} fill="#fef08a" />
      <rect x={7} y={-24} width={3} height={3} rx={0.5} fill="#bfdbfe" />
      {/* Short building */}
      <rect x={16} y={-25} width={10} height={25} rx={2} fill="#cbd5e1" />
      <rect x={18} y={-21} width={2.5} height={3} rx={0.5} fill="#bfdbfe" />
      <rect x={21.5} y={-21} width={2.5} height={3} rx={0.5} fill="#fef08a" />
    </g>
  )
}

function MountainScene({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Big mountain */}
      <polygon points="-30,0 0,-55 30,0" fill="#818cf8" />
      <polygon points="-8,-30 0,-55 8,-30" fill="white" opacity={0.7} />
      {/* Small mountain */}
      <polygon points="15,0 35,-30 55,0" fill="#a5b4fc" />
      <polygon points="29,-18 35,-30 41,-18" fill="white" opacity={0.6} />
      {/* Trees at base */}
      <polygon points="-20,0 -16,-12 -12,0" fill="#22c55e" />
      <polygon points="45,0 49,-10 53,0" fill="#22c55e" />
    </g>
  )
}

function DesertScene({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Sand dunes */}
      <ellipse cx={0} cy={0} rx={40} ry={8} fill="#fcd34d" opacity={0.4} />
      <ellipse cx={30} cy={-3} rx={25} ry={6} fill="#fbbf24" opacity={0.3} />
      {/* Cactus 1 */}
      <rect x={-10} y={-30} width={5} height={30} rx={2.5} fill="#16a34a" />
      <rect x={-15} y={-22} width={5} height={12} rx={2.5} fill="#16a34a" />
      <rect x={-5} y={-18} width={5} height={10} rx={2.5} fill="#16a34a" />
      {/* Cactus 2 */}
      <rect x={20} y={-20} width={4} height={20} rx={2} fill="#15803d" />
      <rect x={16} y={-14} width={4} height={8} rx={2} fill="#15803d" />
      {/* Sun */}
      <circle cx={35} cy={-40} r={8} fill="#fbbf24" opacity={0.6} />
    </g>
  )
}

function PlainsScene({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Wheat/grass */}
      {[-20, -10, 0, 10, 20, 30].map((dx, i) => (
        <g key={i}>
          <line x1={dx} y1={0} x2={dx - 2} y2={-14 - (i % 3) * 3} stroke="#a3e635" strokeWidth={2} />
          <circle cx={dx - 2} cy={-14 - (i % 3) * 3} r={2} fill="#facc15" />
        </g>
      ))}
      {/* Barn */}
      <rect x={-30} y={-20} width={16} height={18} rx={1} fill="#dc2626" />
      <polygon points="-32,-20 -22,-30 -12,-20" fill="#991b1b" />
      <rect x={-25} y={-14} width={4} height={6} fill="#fef08a" />
    </g>
  )
}

function CoastScene({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Water waves */}
      <path d="M-30,0 Q-20,-5 -10,0 Q0,5 10,0 Q20,-5 30,0 Q40,5 50,0" fill="none" stroke="#38bdf8" strokeWidth={3} opacity={0.5} />
      <path d="M-25,6 Q-15,1 -5,6 Q5,11 15,6 Q25,1 35,6" fill="none" stroke="#38bdf8" strokeWidth={2} opacity={0.3} />
      {/* Palm tree */}
      <rect x={-5} y={-40} width={4} height={35} rx={2} fill="#92400e" />
      <ellipse cx={-12} cy={-42} rx={12} ry={5} fill="#22c55e" transform="rotate(-20 -12 -42)" />
      <ellipse cx={8} cy={-44} rx={10} ry={4} fill="#16a34a" transform="rotate(15 8 -44)" />
      <ellipse cx={-2} cy={-46} rx={11} ry={4} fill="#4ade80" transform="rotate(-5 -2 -46)" />
      {/* Beach umbrella */}
      <rect x={20} y={-18} width={2} height={18} fill="#f97316" />
      <path d="M12,-18 Q21,-28 30,-18" fill="#f43f5e" />
    </g>
  )
}

function RiverScene({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Bridge */}
      <path d="M-20,0 Q0,-18 20,0" fill="none" stroke="#94a3b8" strokeWidth={4} />
      <rect x={-22} y={-2} width={4} height={8} rx={1} fill="#94a3b8" />
      <rect x={18} y={-2} width={4} height={8} rx={1} fill="#94a3b8" />
      {/* Water */}
      <path d="M-30,8 Q-18,4 -6,8 Q6,12 18,8 Q30,4 42,8" fill="none" stroke="#60a5fa" strokeWidth={3} opacity={0.6} />
      <path d="M-25,14 Q-13,10 -1,14 Q11,18 23,14" fill="none" stroke="#93c5fd" strokeWidth={2} opacity={0.4} />
      {/* Arch detail */}
      <circle cx={-8} cy={-8} r={2} fill="#e2e8f0" />
      <circle cx={8} cy={-8} r={2} fill="#e2e8f0" />
    </g>
  )
}

function HillsScene({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Rolling hills */}
      <ellipse cx={-15} cy={0} rx={30} ry={15} fill="#86efac" opacity={0.5} />
      <ellipse cx={25} cy={2} rx={25} ry={12} fill="#4ade80" opacity={0.4} />
      {/* Trees */}
      <polygon points="-20,-15 -16,-28 -12,-15" fill="#15803d" />
      <polygon points="0,-12 4,-25 8,-12" fill="#16a34a" />
      <polygon points="30,-10 34,-22 38,-10" fill="#15803d" />
      {/* Flower */}
      <circle cx={15} cy={-5} r={2.5} fill="#f472b6" />
      <circle cx={-5} cy={-3} r={2} fill="#fbbf24" />
    </g>
  )
}

function ForestScene({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Tall pines */}
      {[-20, -5, 12, 28].map((dx, i) => (
        <g key={i}>
          <rect x={dx + 2} y={-8} width={3} height={10} fill="#92400e" />
          <polygon points={`${dx - 4},-8 ${dx + 3.5},-30 ${dx + 11},-8`} fill={i % 2 ? '#15803d' : '#166534'} />
          <polygon points={`${dx - 2},-18 ${dx + 3.5},-35 ${dx + 9},-18`} fill={i % 2 ? '#16a34a' : '#15803d'} />
        </g>
      ))}
      {/* Mushroom */}
      <rect x={35} y={-4} width={2} height={5} fill="#fef3c7" />
      <ellipse cx={36} cy={-5} rx={4} ry={3} fill="#ef4444" />
    </g>
  )
}

const terrainScenes: Record<string, React.FC<{ x: number; y: number; scale?: number }>> = {
  city: CityScene,
  mountains: MountainScene,
  desert: DesertScene,
  plains: PlainsScene,
  coast: CoastScene,
  river: RiverScene,
  hills: HillsScene,
  forest: ForestScene,
}

const terrainBgColors: Record<string, string> = {
  city: '#e2e8f0',
  plains: '#ecfccb',
  mountains: '#e0e7ff',
  desert: '#fef9c3',
  forest: '#dcfce7',
  coast: '#cffafe',
  hills: '#d1fae5',
  river: '#dbeafe',
}

// --- Serpentine path builder ---
// Creates a zigzag road: right → down → left → down → right → ...

interface RoadPoint {
  x: number
  y: number
  mile: number
}

function buildSerpentinePath(
  waypoints: Waypoint[],
  _totalDist: number,
  width: number,
  rowHeight: number,
  padding: number,
): { pathD: string; roadPoints: RoadPoint[]; totalHeight: number; rowBands: { y: number; h: number; terrain: string }[] } {
  const rows = Math.ceil(waypoints.length / 2)
  const totalHeight = rows * rowHeight + padding * 2
  const leftX = padding + 30
  const rightX = width - padding - 30
  const midX = width / 2

  const roadPoints: RoadPoint[] = []
  const rowBands: { y: number; h: number; terrain: string }[] = []

  // Place waypoints along a serpentine
  waypoints.forEach((wp, i) => {
    const row = Math.floor(i / 2)
    const isEvenRow = row % 2 === 0
    const isFirstInRow = i % 2 === 0
    const y = padding + row * rowHeight + rowHeight / 2

    let x: number
    if (isFirstInRow) {
      x = isEvenRow ? leftX : rightX
    } else {
      x = isEvenRow ? rightX : leftX
    }

    roadPoints.push({ x, y, mile: wp.mile })

    // Build row bands for terrain background
    if (isFirstInRow) {
      rowBands.push({
        y: padding + row * rowHeight,
        h: rowHeight,
        terrain: wp.terrain,
      })
    }
  })

  // Build smooth path through all road points
  let pathD = `M ${roadPoints[0].x} ${roadPoints[0].y}`
  for (let i = 1; i < roadPoints.length; i++) {
    const prev = roadPoints[i - 1]
    const curr = roadPoints[i]

    if (Math.abs(curr.y - prev.y) < 5) {
      // Horizontal segment — smooth curve
      const cpY = prev.y
      pathD += ` C ${prev.x + (curr.x - prev.x) * 0.4} ${cpY}, ${curr.x - (curr.x - prev.x) * 0.4} ${cpY}, ${curr.x} ${curr.y}`
    } else {
      // Going down to next row — U-turn
      const turnX = prev.x < midX ? rightX + 25 : leftX - 25
      pathD += ` C ${turnX} ${prev.y}, ${turnX} ${curr.y}, ${curr.x} ${curr.y}`
    }
  }

  return { pathD, roadPoints, totalHeight, rowBands }
}

export default function QuestMap({ challenge }: { challenge: Challenge }) {
  const waypoints = challenge.waypoints || []
  const dist = challenge.raceDistance || 1
  const progress = challenge.raceProgress || 0
  const pct = (progress / dist) * 100

  const svgWidth = 360
  const rowHeight = 110
  const padding = 25

  const { pathD, roadPoints, totalHeight, rowBands } = buildSerpentinePath(
    waypoints, dist, svgWidth, rowHeight, padding,
  )

  // Compute position along the path using the SVG path API
  function getPositionAtPercent(percent: number) {
    // Interpolate between roadPoints based on mile distance
    const targetMile = (percent / 100) * dist
    for (let i = 1; i < roadPoints.length; i++) {
      if (targetMile <= roadPoints[i].mile) {
        const segPct = (targetMile - roadPoints[i - 1].mile) / (roadPoints[i].mile - roadPoints[i - 1].mile)
        return {
          x: roadPoints[i - 1].x + (roadPoints[i].x - roadPoints[i - 1].x) * segPct,
          y: roadPoints[i - 1].y + (roadPoints[i].y - roadPoints[i - 1].y) * segPct,
        }
      }
    }
    return roadPoints[roadPoints.length - 1]
  }

  const currentPos = getPositionAtPercent(pct)

  // Approximate path length for dash array
  let approxLen = 0
  for (let i = 1; i < roadPoints.length; i++) {
    const dx = roadPoints[i].x - roadPoints[i - 1].x
    const dy = roadPoints[i].y - roadPoints[i - 1].y
    approxLen += Math.sqrt(dx * dx + dy * dy) * 1.3 // curves are longer
  }
  const walkedLen = (pct / 100) * approxLen

  return (
    <div className="mt-3 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 flex items-center justify-between">
        <span className="text-sm font-bold text-white">🗺️ {challenge.raceName}</span>
        <span className="text-xs text-brand-100 font-semibold">
          {progress.toLocaleString()} / {dist.toLocaleString()} mi
        </span>
      </div>

      {/* Scrollable illustrated map */}
      <div className="overflow-y-auto bg-gradient-to-b from-sky-50 via-green-50 to-amber-50" style={{ maxHeight: 360 }}>
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${totalHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="qmTrailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="qmGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="qmShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Sky background */}
          <rect x={0} y={0} width={svgWidth} height={totalHeight} fill="#f0f9ff" />

          {/* Clouds */}
          <ellipse cx={60} cy={18} rx={25} ry={8} fill="white" opacity={0.7} />
          <ellipse cx={45} cy={15} rx={15} ry={7} fill="white" opacity={0.6} />
          <ellipse cx={250} cy={12} rx={20} ry={7} fill="white" opacity={0.5} />
          <ellipse cx={310} cy={22} rx={18} ry={6} fill="white" opacity={0.6} />

          {/* Terrain band backgrounds */}
          {rowBands.map((band, i) => (
            <rect
              key={i}
              x={0}
              y={band.y}
              width={svgWidth}
              height={band.h}
              fill={terrainBgColors[band.terrain] || '#f1f5f9'}
              opacity={0.6}
            />
          ))}

          {/* Terrain scene illustrations */}
          {waypoints.map((wp, i) => {
            const rp = roadPoints[i]
            if (!rp) return null
            const Scene = terrainScenes[wp.terrain]
            if (!Scene) return null
            // Offset scenes away from the road
            const isLeft = rp.x < svgWidth / 2
            const sceneX = isLeft ? rp.x + 70 : rp.x - 70
            return <Scene key={i} x={sceneX} y={rp.y + 20} scale={0.7} />
          })}

          {/* Decorative flags along the road */}
          {roadPoints.filter((_, i) => i % 2 === 0).map((rp, i) => {
            const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e']
            return (
              <g key={`flag-${i}`}>
                <line x1={rp.x + 18} y1={rp.y - 8} x2={rp.x + 18} y2={rp.y - 22} stroke="#94a3b8" strokeWidth={1} />
                <polygon
                  points={`${rp.x + 18},${rp.y - 22} ${rp.x + 26},${rp.y - 19} ${rp.x + 18},${rp.y - 16}`}
                  fill={colors[i % colors.length]}
                />
              </g>
            )
          })}

          {/* Road shadow */}
          <path d={pathD} fill="none" stroke="#1e293b" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={0.08} />

          {/* Road base (grey track) */}
          <path d={pathD} fill="none" stroke="#e2e8f0" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />

          {/* Road border lines */}
          <path d={pathD} fill="none" stroke="#cbd5e1" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
          <path d={pathD} fill="none" stroke="white" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD} fill="none" stroke="#e2e8f0" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />

          {/* Road center line (dashed) */}
          <path d={pathD} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeLinecap="round" strokeDasharray="6 6" />

          {/* Walked portion (colored overlay) */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#qmTrailGrad)"
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${walkedLen} 10000`}
            opacity={0.35}
          />

          {/* Waypoint markers */}
          {waypoints.map((wp, i) => {
            const rp = roadPoints[i]
            if (!rp) return null
            const isStart = i === 0
            const isEnd = i === waypoints.length - 1
            const isNext = !wp.reached && (i === 0 || waypoints[i - 1].reached)

            return (
              <g key={`wp-${i}`}>
                {/* Waypoint circle */}
                <circle
                  cx={rp.x}
                  cy={rp.y}
                  r={isStart || isEnd ? 14 : 10}
                  fill={wp.reached ? '#7c3aed' : isNext ? '#ddd6fe' : '#f1f5f9'}
                  stroke={wp.reached ? '#5b21b6' : isNext ? '#a78bfa' : '#cbd5e1'}
                  strokeWidth={2.5}
                  filter="url(#qmShadow)"
                />
                {/* Waypoint icon */}
                <text
                  x={rp.x}
                  y={rp.y + 5}
                  textAnchor="middle"
                  fontSize={isStart || isEnd ? 14 : 11}
                >
                  {isStart ? '📍' : isEnd ? '🏁' : wp.reached ? '✅' : isNext ? '👟' : '⬜'}
                </text>
                {/* City name label */}
                <rect
                  x={rp.x - 30}
                  y={rp.y + (isStart || isEnd ? 18 : 14)}
                  width={60}
                  height={14}
                  rx={4}
                  fill={wp.reached ? '#7c3aed' : isNext ? '#ede9fe' : 'white'}
                  stroke={wp.reached ? '#5b21b6' : '#e2e8f0'}
                  strokeWidth={0.5}
                  opacity={0.9}
                />
                <text
                  x={rp.x}
                  y={rp.y + (isStart || isEnd ? 28 : 24)}
                  textAnchor="middle"
                  fontSize={7}
                  fontWeight={700}
                  fill={wp.reached ? 'white' : isNext ? '#6d28d9' : '#64748b'}
                >
                  {wp.name.split(',')[0]}
                </text>
                {/* Landmark */}
                {wp.landmark && (
                  <text
                    x={rp.x}
                    y={rp.y + (isStart || isEnd ? 40 : 36)}
                    textAnchor="middle"
                    fontSize={6}
                    fill="#94a3b8"
                    fontStyle="italic"
                  >
                    {wp.landmark}
                  </text>
                )}
                {/* Mile marker */}
                <text
                  x={rp.x}
                  y={rp.y - (isStart || isEnd ? 18 : 14)}
                  textAnchor="middle"
                  fontSize={6}
                  fontWeight={600}
                  fill={wp.reached ? '#7c3aed' : '#94a3b8'}
                >
                  {wp.mile.toLocaleString()} mi
                </text>
                {/* NEXT badge */}
                {isNext && (
                  <>
                    <rect x={rp.x - 14} y={rp.y - 30} width={28} height={11} rx={5.5} fill="#7c3aed" />
                    <text x={rp.x} y={rp.y - 22} textAnchor="middle" fontSize={6} fontWeight={800} fill="white">
                      NEXT
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {/* Current position — animated walker */}
          <circle cx={currentPos.x} cy={currentPos.y} r={18} fill="#7c3aed" opacity={0.15} filter="url(#qmGlow)">
            <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={currentPos.x} cy={currentPos.y} r={12} fill="white" stroke="#7c3aed" strokeWidth={3} filter="url(#qmShadow)" />
          <text x={currentPos.x} y={currentPos.y + 5} textAnchor="middle" fontSize={14}>
            🚶
          </text>
        </svg>
      </div>

      {/* Progress footer */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-500">{Math.round(pct)}% complete</span>
          <span className="text-[11px] text-slate-400">
            {(dist - progress).toLocaleString()} mi remaining
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
