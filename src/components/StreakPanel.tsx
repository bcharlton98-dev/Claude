import { userProfile, streakMilestones } from '../data/mockData'

export default function StreakPanel() {
  const nextMilestone = streakMilestones.find(m => !m.reached)
  const daysToNext = nextMilestone ? nextMilestone.days - userProfile.streak : 0

  return (
    <div className="bg-white rounded-3xl p-5 card-shadow relative overflow-hidden grain space-y-4">
      {/* Warm gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-peach-400 via-mustard-400 to-peach-500" />

      {/* Streak Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-flame inline-block">🔥</span>
          <div>
            <p className="text-3xl font-extrabold text-warm-800 tracking-tight tabular-nums">{userProfile.streak}</p>
            <p className="text-xs text-warm-400 font-medium">day streak</p>
          </div>
        </div>
        {/* Streak Freezes */}
        <div className="flex items-center gap-1.5 bg-sky-50 px-3 py-2 rounded-2xl">
          <span className="text-base">🧊</span>
          <span className="text-sm font-extrabold text-sky-600 tabular-nums">{userProfile.streakFreezes}</span>
          <span className="text-[10px] text-sky-400 font-medium">left</span>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="flex items-center gap-1.5">
        {streakMilestones.map((m, i) => {
          const isActive = !m.reached && streakMilestones[i - 1]?.reached !== false
          return (
            <div key={m.days} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={`text-lg ${m.reached ? '' : isActive ? 'animate-pulse' : 'grayscale opacity-30'}`}>
                {m.icon}
              </span>
              <div className={`h-2 w-full rounded-full ${
                m.reached ? 'bg-gradient-to-r from-peach-400 to-mustard-400' : isActive ? 'bg-cream-200' : 'bg-cream-100'
              }`}>
                {isActive && (
                  <div
                    className="h-full bg-gradient-to-r from-peach-400 to-mustard-400 rounded-full transition-all"
                    style={{ width: `${Math.min(((userProfile.streak - (streakMilestones[i - 1]?.days || 0)) / (m.days - (streakMilestones[i - 1]?.days || 0))) * 100, 100)}%` }}
                  />
                )}
              </div>
              <span className={`text-[9px] font-bold ${m.reached ? 'text-peach-500' : 'text-warm-300'}`}>
                {m.days}d
              </span>
            </div>
          )
        })}
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="flex items-center justify-between bg-gradient-to-r from-peach-50 to-mustard-50 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{nextMilestone.icon}</span>
            <div>
              <p className="text-xs font-bold text-warm-700">{nextMilestone.label}</p>
              <p className="text-[10px] text-warm-400 font-medium">{daysToNext} days to go · {nextMilestone.reward}</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-peach-500 bg-peach-50 px-2.5 py-1 rounded-xl">{nextMilestone.days}d</span>
        </div>
      )}
    </div>
  )
}
