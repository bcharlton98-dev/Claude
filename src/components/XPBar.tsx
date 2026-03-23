interface QPBarProps {
  current: number
  max: number
  level: number
}

export default function QPBar({ current, max, level }: QPBarProps) {
  const pct = Math.round((current / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-medium">
          <span>Level {level}</span>
          <span>{current.toLocaleString()} / {max.toLocaleString()} QP</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
