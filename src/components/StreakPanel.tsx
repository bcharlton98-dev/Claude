import { userProfile, streakMilestones } from '../data/mockData'

export default function StreakPanel() {
  const nextMilestone = streakMilestones.find(m => !m.reached)
  const daysToNext = nextMilestone ? nextMilestone.days - userProfile.streak : 0

  return (
    <div className="rounded-[24px] card-shadow relative overflow-hidden color-block space-y-4">
      {/* Bold gradient header */}
      <div className="px-5 pt-5 pb-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C67B5C 0%, #d4a843 50%, #C67B5C 100%)' }}>
        <div className="absolute top-[-30px] right-[-20px] w-[100px] h-[100px] rounded-full bg-white/10" />
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-flame inline-block">🔥</span>
            <div>
              <p className="text-4xl font-extrabold text-white tracking-tight tabular-nums leading-none">{userProfile.streak}</p>
              <p className="text-[11px] text-white/70 font-medium mt-0.5">day streak</p>
            </div>
          </div>
          {/* Streak Freezes */}
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-[16px]">
            <svg width="18" height="18" viewBox="0 0 64 64" fill="none" aria-label="Streak freeze">
              <circle cx="32" cy="32" r="26" fill="#DCEFF5" fillOpacity={0.3} />
              <g stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M32 19V45" /><path d="M20.7 25.5L43.3 38.5" /><path d="M20.7 38.5L43.3 25.5" />
                <path d="M32 19L28.8 22.2" /><path d="M32 19L35.2 22.2" />
                <path d="M32 45L28.8 41.8" /><path d="M32 45L35.2 41.8" />
              </g>
            </svg>
            <span className="text-sm font-extrabold text-white tabular-nums">{userProfile.streakFreezes}</span>
            <span className="text-[10px] text-white/70 font-medium">left</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-peach-50 via-cream-50 to-mustard-50 px-5 pb-5 space-y-4">

      {/* Milestone Progress */}
      <div className="flex items-center gap-1.5 relative">
        {streakMilestones.map((m, i) => {
          const isActive = !m.reached && streakMilestones[i - 1]?.reached !== false
          return (
            <div key={m.days} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={`text-lg ${m.reached ? '' : isActive ? 'animate-pulse' : 'grayscale opacity-30'}`}>
                {m.icon}
              </span>
              <div className={`h-2.5 w-full rounded-full ${
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

      {/* Next Milestone — color block */}
      {nextMilestone && (
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-[18px] px-4 py-3.5 relative">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{nextMilestone.icon}</span>
            <div>
              <p className="text-xs font-bold text-warm-700">{nextMilestone.label}</p>
              <p className="text-[10px] text-warm-400 font-medium">{daysToNext} days to go · {nextMilestone.reward}</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-peach-600 bg-peach-100 px-2.5 py-1.5 rounded-[12px]">{nextMilestone.days}d</span>
        </div>
      )}
      </div>
    </div>
  )
}
