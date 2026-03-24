import { getCurrentTitle } from '../data/mockData'

interface QPBarProps {
  lifetimeMiles: number
}

export default function QPBar({ lifetimeMiles }: QPBarProps) {
  const { current, next, milesToNext, progress } = getCurrentTitle(lifetimeMiles)
  const pct = Math.round(progress * 100)

  return (
    <div className="flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-forest-400 to-forest-600 text-white flex items-center justify-center text-[9px] font-extrabold shrink-0 shadow-md leading-tight text-center px-0.5">
        {current.title.length <= 8 ? current.title : current.title.split(' ').map(w => w[0]).join('')}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-[11px] text-warm-400 mb-1.5 font-semibold">
          <span className="font-bold text-warm-600">{current.title}</span>
          <span className="tabular-nums">{lifetimeMiles.toLocaleString()} mi</span>
        </div>
        <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forest-400 to-forest-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {next && (
          <p className="text-[10px] text-warm-400 font-medium mt-1">{milesToNext.toLocaleString()} mi to {next.title}</p>
        )}
      </div>
    </div>
  )
}
