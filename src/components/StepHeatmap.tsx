import { heatmapData } from '../data/mockData'

const INTENSITY_COLORS = [
  '#e8e0d4', // 0 — no steps / rest day
  '#e4ebe0', // 1 — < 5000
  '#cddac4', // 2 — 5000-7499
  '#8ba67a', // 3 — 7500-9999
  '#4A6741', // 4 — 10000+
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
      <div className="flex gap-[3px] mb-1 ml-0">
        {dayLabels.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[8px] font-bold text-warm-400">{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div className="flex flex-col gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className="flex-1 aspect-square rounded-[4px] transition-colors"
                style={{ backgroundColor: day ? INTENSITY_COLORS[getIntensity(day.steps)] : 'transparent' }}
                title={day ? `${day.date}: ${day.steps.toLocaleString()} steps` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[8px] text-warm-400 font-medium mr-1">Less</span>
        {INTENSITY_COLORS.map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[8px] text-warm-400 font-medium ml-1">More</span>
      </div>
    </div>
  )
}
