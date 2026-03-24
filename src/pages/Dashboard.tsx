import StepRing from '../components/StepRing'
import { todayStats, userProfile, dailyQuests, challenges, notifications } from '../data/mockData'

const HEALTH_ZONE = 7_500

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getHealthZoneLabel(steps: number): { label: string; color: string; bg: string } {
  if (steps >= 10_000) return { label: 'Peak Zone', color: 'text-peach-600', bg: 'bg-peach-50' }
  if (steps >= HEALTH_ZONE) return { label: 'Health Zone', color: 'text-sage-600', bg: 'bg-sage-50' }
  if (steps >= 5_000) return { label: 'Active Zone', color: 'text-mustard-600', bg: 'bg-mustard-50' }
  return { label: 'Warming Up', color: 'text-warm-500', bg: 'bg-cream-100' }
}

/** Pick the single most relevant nudge to show */
function getNudge(): { icon: string; title: string; subtitle: string; accent: string } {
  // Priority 1: Competitive — someone just passed you
  const competitiveNotif = notifications.find(n => !n.read && n.type === 'competitive')
  if (competitiveNotif) {
    return {
      icon: '⚔️',
      title: competitiveNotif.message.split('!')[0] + '!',
      subtitle: 'Time to take back your spot',
      accent: 'from-peach-50 to-peach-100 border-peach-200',
    }
  }

  // Priority 2: Quest progress — show closest incomplete quest
  const activeQuest = [...dailyQuests]
    .filter(q => !q.completed)
    .sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]
  if (activeQuest) {
    const pct = Math.round((activeQuest.current / activeQuest.target) * 100)
    return {
      icon: activeQuest.type === 'steps' ? '👟' : activeQuest.type === 'distance' ? '🗺️' : '⏱️',
      title: `${activeQuest.title} — ${pct}%`,
      subtitle: `${activeQuest.current} of ${activeQuest.target.toLocaleString()} · +${activeQuest.qpReward} QP`,
      accent: 'from-sage-50 to-sage-100 border-sage-200',
    }
  }

  // Priority 3: Streak status
  return {
    icon: '🔥',
    title: `${userProfile.streak}-day streak!`,
    subtitle: userProfile.streak >= 7 ? 'Incredible consistency. Keep it alive!' : 'Build your streak one day at a time',
    accent: 'from-mustard-50 to-mustard-100 border-mustard-200',
  }
}

export default function Dashboard() {
  const stepsToGo = Math.max(todayStats.goal - todayStats.steps, 0)
  const zone = getHealthZoneLabel(todayStats.steps)
  const nudge = getNudge()
  const raceChallenge = challenges.find(c => c.type === 'virtual_race' && c.isActive)

  return (
    <div className="flex flex-col gap-5">
      {/* ── 1. Top Bar: Greeting + Streak/Gems ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-500 font-semibold">
          {getGreeting()}, <span className="text-warm-700 font-extrabold">{userProfile.name.split(' ')[0]}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-peach-50 text-peach-500 px-2.5 py-1.5 rounded-2xl text-xs font-extrabold">
            <span className="animate-flame inline-block text-sm">🔥</span> {userProfile.streak}
          </span>
          <span className="flex items-center gap-1 bg-mustard-50 text-mustard-500 px-2.5 py-1.5 rounded-2xl text-xs font-extrabold">
            💎 {userProfile.gems}
          </span>
        </div>
      </div>

      {/* ── 2. Hero Step Ring (60% of viewport) ── */}
      <div className="bg-white rounded-3xl card-shadow relative overflow-hidden grain warm-glow flex flex-col items-center px-6 py-10">
        <StepRing current={todayStats.steps} goal={todayStats.goal} size={220} strokeWidth={14} />

        {stepsToGo > 0 ? (
          <p className="text-base text-warm-400 mt-5 font-medium">
            <span className="font-extrabold text-warm-700 text-xl tabular-nums">{stepsToGo.toLocaleString()}</span>{' '}
            steps to go
          </p>
        ) : (
          <p className="text-lg text-peach-500 font-extrabold mt-5">Goal complete!</p>
        )}

        {/* Health Zone Badge */}
        <div className={`mt-4 flex items-center gap-2 ${zone.bg} px-5 py-2.5 rounded-2xl`}>
          <span className="text-sm">
            {todayStats.steps >= 10_000 ? '🏔️' : todayStats.steps >= HEALTH_ZONE ? '✨' : todayStats.steps >= 5_000 ? '🌿' : '🌅'}
          </span>
          <span className={`text-xs font-bold ${zone.color}`}>{zone.label}</span>
        </div>

        {/* Virtual race mini-status */}
        {raceChallenge && raceChallenge.raceProgress && raceChallenge.raceDistance && (
          <p className="text-[10px] text-warm-400 mt-3 font-medium">
            🗺️ {raceChallenge.raceName}: {raceChallenge.raceProgress.toLocaleString()} / {raceChallenge.raceDistance.toLocaleString()} mi
          </p>
        )}
      </div>

      {/* ── 3. Stat Pills Row ── */}
      <div className="flex gap-2">
        {[
          { value: todayStats.calories.toString(), label: 'cal', bg: 'bg-peach-50', text: 'text-peach-600' },
          { value: `${todayStats.distance}`, label: 'mi', bg: 'bg-sage-50', text: 'text-sage-600' },
          { value: todayStats.activeMinutes.toString(), label: 'min', bg: 'bg-mustard-50', text: 'text-mustard-600' },
          { value: `+${todayStats.qpEarned}`, label: 'QP', bg: 'bg-lavender-50', text: 'text-lavender-600' },
        ].map(s => (
          <div key={s.label} className={`flex-1 ${s.bg} rounded-2xl py-2.5 px-2 text-center`}>
            <p className={`text-sm font-extrabold ${s.text} tabular-nums`}>{s.value}</p>
            <p className="text-[9px] text-warm-400 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── 4. Single Contextual Nudge Card ── */}
      <div className={`bg-gradient-to-br ${nudge.accent} border rounded-3xl p-5 flex items-center gap-4`}>
        <span className="text-3xl shrink-0">{nudge.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-warm-800 leading-snug">{nudge.title}</p>
          <p className="text-xs text-warm-500 mt-0.5 font-medium">{nudge.subtitle}</p>
        </div>
      </div>
    </div>
  )
}
