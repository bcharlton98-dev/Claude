import { userProfile, streakMilestones } from '../data/mockData'

export default function StreakPanel() {
  const nextMilestone = streakMilestones.find(m => !m.reached)
  const daysToNext = nextMilestone ? nextMilestone.days - userProfile.streak : 0

  return (
    <div className="bg-white rounded-xl p-4 space-y-3">
      {/* Streak Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{userProfile.streak} days</p>
            <p className="text-[11px] text-slate-400">You're becoming a walker</p>
          </div>
        </div>
        {/* Streak Freezes */}
        <div className="flex items-center gap-1 bg-sky-50 px-2.5 py-1.5 rounded-xl">
          <span className="text-sm">🧊</span>
          <span className="text-xs font-bold text-sky-600">{userProfile.streakFreezes}</span>
          <span className="text-[10px] text-sky-400">freezes</span>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="flex items-center gap-1">
        {streakMilestones.map((m, i) => {
          const isActive = !m.reached && streakMilestones[i - 1]?.reached !== false
          return (
            <div key={m.days} className="flex-1 flex flex-col items-center gap-1">
              <span className={`text-base ${m.reached ? '' : isActive ? 'animate-pulse' : 'grayscale opacity-30'}`}>
                {m.icon}
              </span>
              <div className={`h-1.5 w-full rounded-full ${
                m.reached ? 'bg-fire-500' : isActive ? 'bg-fire-200' : 'bg-slate-100'
              }`}>
                {isActive && (
                  <div
                    className="h-full bg-fire-400 rounded-full transition-all"
                    style={{ width: `${Math.min(((userProfile.streak - (streakMilestones[i - 1]?.days || 0)) / (m.days - (streakMilestones[i - 1]?.days || 0))) * 100, 100)}%` }}
                  />
                )}
              </div>
              <span className={`text-[9px] font-semibold ${m.reached ? 'text-fire-500' : 'text-slate-300'}`}>
                {m.days}d
              </span>
            </div>
          )
        })}
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="flex items-center justify-between bg-fire-500/5 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{nextMilestone.icon}</span>
            <div>
              <p className="text-xs font-semibold text-slate-700">{nextMilestone.label}</p>
              <p className="text-[10px] text-slate-400">{daysToNext} days to go · {nextMilestone.reward}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-fire-500">{nextMilestone.days}d</span>
        </div>
      )}
    </div>
  )
}
