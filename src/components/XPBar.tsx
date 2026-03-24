import { getCurrentTitle } from '../data/mockData'

interface QPBarProps {
  lifetimeMiles: number
}

export default function QPBar({ lifetimeMiles }: QPBarProps) {
  const { current, next, milesToNext, progress } = getCurrentTitle(lifetimeMiles)
  const pct = Math.round(progress * 100)

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-forest-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 leading-tight text-center px-0.5">
        {current.title.length <= 8 ? current.title : current.title.split(' ').map(w => w[0]).join('')}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-warm-400 mb-1 font-medium">
          <span className="font-semibold text-warm-600">{current.title}</span>
          <span className="tabular-nums">{lifetimeMiles.toLocaleString()} mi</span>
        </div>
        <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
          <div className="h-full bg-forest-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        {next && (
          <p className="text-[10px] text-warm-400 font-medium mt-1">{milesToNext.toLocaleString()} mi to {next.title}</p>
        )}
      </div>
    </div>
  )
}
