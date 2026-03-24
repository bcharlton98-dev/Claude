import StepRing from '../components/StepRing'
import { todayStats, userProfile, dailyQuests, challenges, notifications } from '../data/mockData'

const HEALTH_ZONE = 7_500

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getHealthZoneLabel(steps: number): { label: string; color: string; bg: string; icon: string } {
  if (steps >= 10_000) return { label: 'Peak Zone', color: 'text-peach-600', bg: 'bg-gradient-to-r from-peach-100 to-mustard-100', icon: '🏔️' }
  if (steps >= HEALTH_ZONE) return { label: 'Health Zone', color: 'text-forest-600', bg: 'bg-gradient-to-r from-forest-100 to-sage-100', icon: '✨' }
  if (steps >= 5_000) return { label: 'Active Zone', color: 'text-mustard-600', bg: 'bg-gradient-to-r from-mustard-100 to-mustard-50', icon: '🌿' }
  return { label: 'Warming Up', color: 'text-warm-500', bg: 'bg-gradient-to-r from-cream-200 to-cream-100', icon: '🌅' }
}

/** Pick the single most relevant nudge to show */
function getNudge(): { icon: string; title: string; subtitle: string; accent: string } {
  const competitiveNotif = notifications.find(n => !n.read && n.type === 'competitive')
  if (competitiveNotif) {
    return {
      icon: '⚔️',
      title: competitiveNotif.message.split('!')[0] + '!',
      subtitle: 'Time to take back your spot',
      accent: 'from-peach-100 to-peach-50 border-peach-200',
    }
  }

  const activeQuest = [...dailyQuests]
    .filter(q => !q.completed)
    .sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]
  if (activeQuest) {
    const pct = Math.round((activeQuest.current / activeQuest.target) * 100)
    return {
      icon: activeQuest.type === 'steps' ? '👟' : activeQuest.type === 'distance' ? '🗺️' : '⏱️',
      title: `${activeQuest.title} — ${pct}%`,
      subtitle: `${activeQuest.current} of ${activeQuest.target.toLocaleString()} · +${activeQuest.qpReward} QP`,
      accent: 'from-forest-100 to-sage-50 border-forest-200',
    }
  }

  return {
    icon: '🔥',
    title: `${userProfile.streak}-day streak!`,
    subtitle: userProfile.streak >= 7 ? 'Incredible consistency. Keep it alive!' : 'Build your streak one day at a time',
    accent: 'from-mustard-100 to-mustard-50 border-mustard-200',
  }
}

export default function Dashboard() {
  const stepsToGo = Math.max(todayStats.goal - todayStats.steps, 0)
  const zone = getHealthZoneLabel(todayStats.steps)
  const nudge = getNudge()
  const raceChallenge = challenges.find(c => c.type === 'virtual_race' && c.isActive)

  return (
    <div className="flex flex-col gap-4">
      {/* ── 1. Forest Green Branded Header ── */}
      <div className="-mx-5 -mt-6 px-5 pt-6 pb-5 bg-gradient-to-b from-forest-500 via-forest-500 to-forest-400 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-40px] right-[-30px] w-[140px] h-[140px] rounded-full bg-forest-400/30" />
        <div className="absolute bottom-[-20px] left-[-20px] w-[80px] h-[80px] rounded-full bg-forest-600/20" />

        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-forest-200 text-sm font-semibold">{getGreeting()},</p>
            <p className="text-white text-xl font-extrabold tracking-tight">{userProfile.name.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-2xl text-xs font-extrabold">
              <span className="animate-flame inline-block text-sm">🔥</span> {userProfile.streak}
            </span>
            <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-2xl text-xs font-extrabold">
              💎 {userProfile.gems}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Hero Step Ring — large, dramatic ── */}
      <div className="bg-white rounded-[24px] card-shadow relative overflow-hidden grain warm-glow flex flex-col items-center px-6 py-10 -mt-6">
        <StepRing current={todayStats.steps} goal={todayStats.goal} size={230} strokeWidth={16} />

        {stepsToGo > 0 ? (
          <p className="text-base text-warm-400 mt-5 font-medium">
            <span className="font-extrabold text-warm-800 text-2xl tabular-nums">{stepsToGo.toLocaleString()}</span>{' '}
            <span className="text-warm-400">steps to go</span>
          </p>
        ) : (
          <p className="text-xl text-forest-500 font-extrabold mt-5">Goal complete!</p>
        )}

        {/* Virtual race mini-status */}
        {raceChallenge && raceChallenge.raceProgress && raceChallenge.raceDistance && (
          <p className="text-[10px] text-warm-400 mt-3 font-medium">
            🗺️ {raceChallenge.raceName}: {raceChallenge.raceProgress.toLocaleString()} / {raceChallenge.raceDistance.toLocaleString()} mi
          </p>
        )}
      </div>

      {/* ── 3. Health Zone Banner — full color block ── */}
      <div className={`${zone.bg} rounded-[20px] px-5 py-4 flex items-center gap-3 color-block`}>
        <span className="text-2xl">{zone.icon}</span>
        <div className="flex-1">
          <p className={`text-sm font-extrabold ${zone.color}`}>{zone.label}</p>
          <p className="text-[11px] text-warm-500 font-medium">
            {todayStats.steps >= HEALTH_ZONE ? 'Great work! You\'re in the zone.' : `${(HEALTH_ZONE - todayStats.steps).toLocaleString()} steps to Health Zone`}
          </p>
        </div>
        <span className={`text-lg font-extrabold ${zone.color} tabular-nums`}>{todayStats.steps.toLocaleString()}</span>
      </div>

      {/* ── 4. Mixed-size Stat Grid — 2 big + 2 small ── */}
      <div className="grid grid-cols-4 gap-2">
        {/* Big hero stat */}
        <div className="col-span-2 bg-forest-50 rounded-[20px] py-4 px-4 color-block">
          <p className="text-3xl font-extrabold text-forest-600 tabular-nums">{todayStats.calories}</p>
          <p className="text-[10px] text-forest-400 font-bold mt-0.5">calories burned</p>
        </div>
        {/* Two small pills stacked */}
        <div className="col-span-1 flex flex-col gap-2">
          <div className="flex-1 bg-peach-50 rounded-[16px] py-3 px-3 text-center color-block">
            <p className="text-lg font-extrabold text-peach-600 tabular-nums">{todayStats.distance}</p>
            <p className="text-[8px] text-peach-400 font-bold">miles</p>
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-2">
          <div className="flex-1 bg-mustard-50 rounded-[16px] py-3 px-3 text-center color-block">
            <p className="text-lg font-extrabold text-mustard-600 tabular-nums">{todayStats.activeMinutes}</p>
            <p className="text-[8px] text-mustard-500 font-bold">min</p>
          </div>
        </div>
      </div>

      {/* QP earned — wide landscape card */}
      <div className="bg-gradient-to-r from-lavender-50 to-forest-50 rounded-[20px] px-5 py-3.5 flex items-center justify-between color-block">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-forest-400 to-forest-600 text-white flex items-center justify-center text-sm font-extrabold shadow-md">
            {userProfile.level}
          </span>
          <div>
            <p className="text-xs font-bold text-warm-700">Level {userProfile.level}</p>
            <p className="text-[10px] text-warm-400 font-medium">{userProfile.qp.toLocaleString()} / {userProfile.qpToNextLevel.toLocaleString()} QP</p>
          </div>
        </div>
        <span className="text-sm font-extrabold text-forest-600 bg-forest-100 px-3 py-1.5 rounded-2xl">+{todayStats.qpEarned} QP</span>
      </div>

      {/* ── 5. Contextual Nudge Card — color block ── */}
      <div className={`bg-gradient-to-br ${nudge.accent} border rounded-[22px] p-5 flex items-center gap-4 color-block`}>
        <span className="text-3xl shrink-0">{nudge.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-warm-800 leading-snug">{nudge.title}</p>
          <p className="text-xs text-warm-500 mt-0.5 font-medium">{nudge.subtitle}</p>
        </div>
      </div>
    </div>
  )
}
