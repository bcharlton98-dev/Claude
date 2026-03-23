interface XPBarProps {
  current: number
  max: number
  level: number
}

export default function XPBar({ current, max, level }: XPBarProps) {
  const pct = Math.round((current / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Level {level}</span>
          <span>{current.toLocaleString()} / {max.toLocaleString()} XP</span>
        </div>
        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
