import { userProfile, streakMilestones } from '../data/mockData'
import { FlameIcon, BadgeIcon } from './Icons'

export default function StreakPanel() {
  const nextMilestone = streakMilestones.find(m => !m.reached)
  const daysToNext = nextMilestone ? nextMilestone.days - userProfile.streak : 0

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Header — solid with edge highlight */}
      <div className="bg-peach-500 px-5 py-5 edge-highlight">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlameIcon size={32} />
            <div>
              <p className="text-3xl font-bold text-white tracking-tight tabular-nums leading-none">{userProfile.streak}</p>
              <p className="text-xs text-white/60 font-medium mt-0.5">day streak</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
            <svg width="14" height="14" viewBox="0 0 64 64" fill="none">
              <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
                <path d="M32 19V45" /><path d="M20.7 25.5L43.3 38.5" /><path d="M20.7 38.5L43.3 25.5" />
              </g>
            </svg>
            <span className="text-xs font-bold text-white tabular-nums">{userProfile.streakFreezes} left</span>
          </div>
        </div>
      </div>

      {/* Milestones — clean white body */}
      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center gap-2">
          {streakMilestones.map((m, i) => {
            const isActive = !m.reached && streakMilestones[i - 1]?.reached !== false
            return (
              <div key={m.days} className="flex-1 flex flex-col items-center gap-1">
                <BadgeIcon icon={m.icon} size={16} color={m.reached ? '#2D5E3B' : isActive ? '#9E9284' : '#ddd6cb'} />
                <div className={`h-2 w-full rounded-full ${m.reached ? 'bg-forest-500' : 'bg-forest-100'}`}>
                  {isActive && (
                    <div className="h-full bg-forest-500 rounded-full transition-all"
                      style={{ width: `${Math.min(((userProfile.streak - (streakMilestones[i - 1]?.days || 0)) / (m.days - (streakMilestones[i - 1]?.days || 0))) * 100, 100)}%` }} />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${m.reached ? 'text-forest-600' : 'text-warm-300'}`}>{m.days}d</span>
              </div>
            )
          })}
        </div>

        {nextMilestone && (
          <div className="flex items-center justify-between bg-cream-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <BadgeIcon icon={nextMilestone.icon} size={20} color="#9E9284" />
              <div>
                <p className="text-xs font-bold text-warm-700">{nextMilestone.label}</p>
                <p className="text-[10px] text-warm-400 font-medium">{daysToNext} days to go · {nextMilestone.reward}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-warm-500 bg-cream-200 px-2 py-1 rounded-lg">{nextMilestone.days}d</span>
          </div>
        )}
      </div>
    </div>
  )
}
