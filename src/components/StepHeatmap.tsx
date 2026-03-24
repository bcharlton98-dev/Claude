import { heatmapData } from '../data/mockData'

const INTENSITY_COLORS = [
  '#E5D9C8', // 0 — no steps / rest day
  '#e4e8d5', // 1 — < 5000
  '#c9d1ab', // 2 — 5000-7499
  '#7E8E4E', // 3 — 7500-9999
  '#2D5E3B', // 4 — 10000+
]

function getIntensity(steps: number): number {
  if (steps === 0) return 0
  if (steps < 5000) return 1
  if (steps < 7500) return 2
  if (steps < 10000) return 3
  return 4
}

export default function StepHeatmap() {
  // Build 4 rows x 7 cols (4 weeks)
  const weeks: (typeof heatmapData[0] | null)[][] = []
  let weekIdx = 0

  // Align to start on Monday
  const firstDate = new Date(heatmapData[0].date)
  const startDow = (firstDate.getDay() + 6) % 7 // Mon=0

  // Pad the first week
  const firstWeek: (typeof heatmapData[0] | null)[] = Array(startDow).fill(null)
  weeks.push(firstWeek)

  heatmapData.forEach(d => {
    const dow = (new Date(d.date).getDay() + 6) % 7
    if (dow === 0 && weeks[weekIdx].length > 0) {
      weekIdx++
      weeks.push([])
    }
    weeks[weekIdx].push(d)
  })

  // Pad last week
  while (weeks[weeks.length - 1].length < 7) {
    weeks[weeks.length - 1].push(null)
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div>
      {/* Day labels */}
      <div className="flex gap-1 mb-0.5 ml-0">
        {dayLabels.map((d, i) => (
          <div key={i} className="flex-1 text-center text-xs font-bold text-warm-400 leading-snug">{d}</div>
        ))}
      </div>
      {/* Grid — compact dense */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className="flex-1 rounded-sm transition-colors"
                style={{ backgroundColor: day ? INTENSITY_COLORS[getIntensity(day.steps)] : 'transparent', aspectRatio: '1' }}
                title={day ? `${day.date}: ${day.steps.toLocaleString()} steps` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-end gap-0.5 mt-1.5">
        <span className="text-xs text-warm-400 font-medium mr-0.5 leading-snug">Less</span>
        {INTENSITY_COLORS.map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs text-warm-400 font-medium ml-0.5 leading-snug">More</span>
      </div>
    </div>
  )
}
