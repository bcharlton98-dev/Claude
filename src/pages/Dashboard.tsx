import ProgressPath from '../components/ProgressPath'
import { FlameIconWhite, StarIcon, RouteIcon, ChallengeIcon, RankCircle, AvatarCircle, FlameIcon } from '../components/Icons'
import { todayStats, userProfile, dailyQuests, challenges, notifications, friends, getCurrentTitle } from '../data/mockData'

const HEALTH_ZONE = 7_500

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getHealthZoneLabel(steps: number): string {
  if (steps >= 10_000) return 'Peak Zone'
  if (steps >= HEALTH_ZONE) return 'Health Zone'
  if (steps >= 5_000) return 'Active Zone'
  return 'Warming Up'
}

function getTerrainTheme(): { bg: string; label: string } {
  const race = challenges.find(c => c.type === 'virtual_race' && c.isActive)
  if (!race?.waypoints || !race.raceProgress) {
    return { bg: 'from-forest-600 to-forest-500', label: '' }
  }
  const reached = race.waypoints.filter(w => w.reached)
  const currentTerrain = reached.length > 0 ? reached[reached.length - 1].terrain : 'city'
  const themes: Record<string, { bg: string; label: string }> = {
    city: { bg: 'from-forest-600 to-forest-500', label: 'Near Oklahoma City' },
    plains: { bg: 'from-forest-600 to-forest-500', label: 'Crossing the Plains' },
    mountains: { bg: 'from-forest-700 to-forest-500', label: 'Mountain Territory' },
    desert: { bg: 'from-warm-700 to-warm-600', label: 'Desert Stretch' },
    forest: { bg: 'from-forest-700 to-forest-600', label: 'Deep Forest' },
    coast: { bg: 'from-forest-600 to-forest-500', label: 'Coastal Road' },
    hills: { bg: 'from-forest-600 to-forest-500', label: 'Rolling Hills' },
    river: { bg: 'from-forest-600 to-forest-500', label: 'River Crossing' },
  }
  return themes[currentTerrain] || themes.city
}

type NudgeType = 'challenge' | 'quest' | 'streak'

function getNudge(): { nudgeType: NudgeType; title: string; subtitle: string } {
  const competitiveNotif = notifications.find(n => !n.read && n.type === 'competitive')
  if (competitiveNotif) {
    return { nudgeType: 'challenge', title: competitiveNotif.message.split('!')[0] + '!', subtitle: 'Time to take back your spot' }
  }
  const activeQuest = [...dailyQuests].filter(q => !q.completed).sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]
  if (activeQuest) {
    const pct = Math.round((activeQuest.current / activeQuest.target) * 100)
    return { nudgeType: 'quest', title: `${activeQuest.title} — ${pct}%`, subtitle: `${activeQuest.current} of ${activeQuest.target.toLocaleString()} · +${activeQuest.qpReward} QP` }
  }
  return { nudgeType: 'streak', title: `${userProfile.streak}-day streak!`, subtitle: userProfile.streak >= 7 ? 'Incredible consistency. Keep it alive!' : 'Build your streak one day at a time' }
}

export default function Dashboard() {
  const stepsToGo = Math.max(todayStats.goal - todayStats.steps, 0)
  const zoneLabel = getHealthZoneLabel(todayStats.steps)
  const nudge = getNudge()
  const raceChallenge = challenges.find(c => c.type === 'virtual_race' && c.isActive)
  const goalPct = Math.round((todayStats.steps / todayStats.goal) * 100)
  const terrain = getTerrainTheme()
  const titleInfo = getCurrentTitle(userProfile.lifetimeMiles)

  return (
    <div className="flex flex-col gap-6">
      {/* Header — clean, no blobs */}
      <div className={`-mx-5 -mt-6 px-5 pt-6 pb-6 bg-gradient-to-b ${terrain.bg}`}>
        {/* WalkQuest Logo */}
        <div className="mb-4">
          <svg width="130" height="28" viewBox="0 0 260 56" fill="none" aria-label="WalkQuest">
            <text x="0" y="44" fontFamily="system-ui, -apple-system, sans-serif" fontSize="48" fontWeight="800" fill="white" letterSpacing="-1">Walk</text>
            <text x="120" y="44" fontFamily="system-ui, -apple-system, sans-serif" fontSize="48" fontWeight="800" fill="white" letterSpacing="-1">Quest</text>
            <g transform="translate(172, 4)" stroke="#d4a843" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="0" x2="4" y2="7" /><line x1="0" y1="3.5" x2="8" y2="3.5" />
              <line x1="1" y1="0.5" x2="7" y2="6.5" /><line x1="7" y1="0.5" x2="1" y2="6.5" />
            </g>
          </svg>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium">{getGreeting()},</p>
            <p className="text-white text-lg font-bold tracking-tight">{userProfile.name.split(' ')[0]}</p>
          </div>
          <span className="flex items-center gap-1.5 bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <FlameIconWhite size={14} /> {userProfile.streak} days
          </span>
        </div>
        {terrain.label && <p className="text-white/40 text-[10px] font-medium mt-2">{terrain.label}</p>}
      </div>

      {/* ── TODAY ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Today</p>

        {/* Hero: step count + ring — one card, clean */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[56px] font-bold text-warm-800 tabular-nums leading-none tracking-tight block">
                {todayStats.steps.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-warm-400 mt-1 block">steps</span>
              <div className="flex items-center gap-6 mt-4">
                <div>
                  <span className="text-lg font-bold text-warm-700 tabular-nums">{todayStats.distance}</span>
                  <span className="text-[10px] font-medium text-warm-400 ml-1">mi</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-warm-700 tabular-nums">{todayStats.activeMinutes}</span>
                  <span className="text-[10px] font-medium text-warm-400 ml-1">min</span>
                </div>
              </div>
            </div>
            {/* Goal ring — smaller, cleaner */}
            <div className="relative">
              <svg width={96} height={96} viewBox="0 0 96 96" className="-rotate-90">
                <circle cx={48} cy={48} r={40} fill="none" stroke="#e8e0d4" strokeWidth={6} />
                <circle cx={48} cy={48} r={40} fill="none" stroke="#4A6741" strokeWidth={6} strokeLinecap="round"
                  strokeDasharray={`${Math.min(goalPct, 100) * 2.51} 251`}
                  className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-forest-600 tabular-nums">{goalPct}%</span>
                <span className="text-[9px] text-warm-400 font-medium">of {todayStats.goal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Zone — single line indicator, not a card */}
        <div className="flex items-center gap-2 mt-3 px-1">
          <StarIcon size={14} color="#4A6741" />
          <span className="text-xs font-semibold text-forest-600">{zoneLabel}</span>
          <span className="text-xs text-warm-400 font-medium">
            {todayStats.steps >= HEALTH_ZONE
              ? stepsToGo > 0 ? `· ${stepsToGo.toLocaleString()} to goal` : '· Goal complete'
              : `· ${(HEALTH_ZONE - todayStats.steps).toLocaleString()} to zone`}
          </span>
        </div>

        {/* Title progress — unified card */}
        <div className="bg-forest-600 rounded-2xl p-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-white leading-none">{titleInfo.current.title}</p>
              <p className="text-xs text-forest-200 font-medium mt-1">{userProfile.lifetimeMiles.toLocaleString()} miles walked</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white tabular-nums">+{todayStats.qpEarned} QP</p>
              <p className="text-[10px] text-forest-200 font-medium">today</p>
            </div>
          </div>
          {titleInfo.next && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-forest-200 font-medium mb-1">
                <span>{titleInfo.current.title}</span>
                <span>{titleInfo.next.title}</span>
              </div>
              <div className="h-1.5 bg-forest-700 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 rounded-full transition-all duration-700"
                  style={{ width: `${Math.round(titleInfo.progress * 100)}%` }} />
              </div>
              <p className="text-[10px] text-forest-200 font-medium mt-1">{titleInfo.milesToNext.toLocaleString()} mi to {titleInfo.next.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── JOURNEY ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Journey</p>

        <div className="bg-white rounded-2xl card-shadow p-4">
          <ProgressPath lifetimeMiles={userProfile.lifetimeMiles} />
        </div>

        {raceChallenge && raceChallenge.raceProgress && raceChallenge.raceDistance && (
          <div className="bg-forest-600 rounded-2xl px-5 py-4 flex items-center gap-3 mt-3">
            <RouteIcon size={22} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{raceChallenge.raceName}</p>
              <p className="text-xs text-forest-200 font-medium tabular-nums">
                {raceChallenge.raceProgress.toLocaleString()} / {raceChallenge.raceDistance.toLocaleString()} mi
              </p>
            </div>
            <p className="text-lg font-bold text-white tabular-nums">
              {Math.round((raceChallenge.raceProgress / raceChallenge.raceDistance) * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* ── FRIENDS ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Friends</p>

        <div className="bg-white rounded-2xl card-shadow">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-sm font-bold text-warm-700">Today's Steps</p>
            <p className="text-[10px] text-warm-400 font-medium">{friends.length} friends</p>
          </div>
          <div className="divide-y divide-cream-100">
            {[...friends].sort((a, b) => b.stepsToday - a.stepsToday).map((f, i) => (
              <div key={f.id} className={`flex items-center gap-3 px-4 py-3 ${f.isYou ? 'bg-forest-50/40' : ''}`}>
                <RankCircle rank={i + 1} size={24} />
                <AvatarCircle name={f.name} size={28} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${f.isYou ? 'text-forest-600' : 'text-warm-700'}`}>
                    {f.name} {f.isYou && <span className="text-[10px] text-warm-400 font-medium">(you)</span>}
                  </p>
                  <span className="text-[10px] text-warm-400 font-medium flex items-center gap-1">
                    <FlameIcon size={10} /> {f.streak}d
                  </span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${f.isYou ? 'text-forest-600' : 'text-warm-600'}`}>
                  {f.stepsToday.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-cream-100">
            <button className="w-full text-center text-xs font-semibold text-forest-500 btn-press">See full leaderboard</button>
          </div>
        </div>

        {/* Nudge — solid terracotta, no blob */}
        <div className="bg-peach-500 rounded-2xl p-4 flex items-center gap-4 mt-3">
          <span className="shrink-0">
            {nudge.nudgeType === 'challenge' ? <ChallengeIcon size={24} /> : nudge.nudgeType === 'streak' ? <FlameIconWhite size={24} /> : <StarIcon size={24} color="white" />}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-snug">{nudge.title}</p>
            <p className="text-xs text-white/70 mt-0.5 font-medium">{nudge.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
