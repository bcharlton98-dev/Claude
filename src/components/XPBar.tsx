interface QPBarProps {
  current: number
  max: number
  level: number
}

export default function QPBar({ current, max, level }: QPBarProps) {
  const pct = Math.round((current / max) * 100)
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 text-white flex items-center justify-center text-sm font-extrabold shrink-0 shadow-md">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-[11px] text-warm-400 mb-1.5 font-semibold">
          <span>Level {level}</span>
          <span className="tabular-nums">{current.toLocaleString()} / {max.toLocaleString()} QP</span>
        </div>
        <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
