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
  if (!race?.waypoints || !race.raceProgress) return { bg: 'from-forest-600 to-forest-500', label: '' }
  const reached = race.waypoints.filter(w => w.reached)
  const t = reached.length > 0 ? reached[reached.length - 1].terrain : 'city'
  const themes: Record<string, { bg: string; label: string }> = {
    city: { bg: 'from-forest-600 to-forest-500', label: 'Near Oklahoma City' },
    plains: { bg: 'from-forest-600 via-forest-500 to-olive-500', label: 'Crossing the Plains' },
    mountains: { bg: 'from-forest-700 to-forest-500', label: 'Mountain Territory' },
    desert: { bg: 'from-warm-700 to-warm-600', label: 'Desert Stretch' },
    forest: { bg: 'from-forest-700 to-forest-600', label: 'Deep Forest' },
    coast: { bg: 'from-forest-600 to-forest-500', label: 'Coastal Road' },
    hills: { bg: 'from-forest-600 to-forest-500', label: 'Rolling Hills' },
    river: { bg: 'from-forest-600 to-forest-500', label: 'River Crossing' },
  }
  return themes[t] || themes.city
}

type NudgeType = 'challenge' | 'quest' | 'streak'
function getNudge(): { nudgeType: NudgeType; title: string; subtitle: string } {
  const n = notifications.find(n => !n.read && n.type === 'competitive')
  if (n) return { nudgeType: 'challenge', title: n.message.split('!')[0] + '!', subtitle: 'Time to take back your spot' }
  const q = [...dailyQuests].filter(q => !q.completed).sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]
  if (q) { const p = Math.round((q.current / q.target) * 100); return { nudgeType: 'quest', title: `${q.title} — ${p}%`, subtitle: `${q.current} of ${q.target.toLocaleString()} · +${q.qpReward} QP` } }
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
    <div className="flex flex-col">

      {/* ══ HEADER — big, extends down, holds the step count + ring ══ */}
      <div className={`-mx-5 -mt-6 px-5 pt-6 pb-12 bg-gradient-to-b ${terrain.bg} relative`}>
        {/* Logo */}
        <div className="mb-5">
          <svg width="130" height="28" viewBox="0 0 260 56" fill="none" aria-label="WalkQuest">
            <text x="0" y="44" fontFamily="system-ui, -apple-system, sans-serif" fontSize="48" fontWeight="800" fill="white" letterSpacing="-1">Walk</text>
            <text x="120" y="44" fontFamily="system-ui, -apple-system, sans-serif" fontSize="48" fontWeight="800" fill="white" letterSpacing="-1">Quest</text>
            <g transform="translate(172, 4)" stroke="#D4A050" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="0" x2="4" y2="7" /><line x1="0" y1="3.5" x2="8" y2="3.5" />
              <line x1="1" y1="0.5" x2="7" y2="6.5" /><line x1="7" y1="0.5" x2="1" y2="6.5" />
            </g>
          </svg>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-white/50 text-xs font-medium">{getGreeting()},</p>
            <p className="text-white text-xl font-bold tracking-tight">{userProfile.name.split(' ')[0]}</p>
          </div>
          <span className="flex items-center gap-1.5 bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <FlameIconWhite size={14} /> {userProfile.streak} days
          </span>
        </div>

        {/* Step count + ring — big, white on green */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-7xl font-bold text-white tabular-nums leading-none tracking-tighter block">
              {todayStats.steps.toLocaleString()}
            </span>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-white/70 font-medium">{todayStats.distance} mi</span>
              <span className="text-sm text-white/70 font-medium">{todayStats.activeMinutes} min</span>
            </div>
          </div>

          {/* Ring — large, glowing */}
          <div className="relative -mb-2">
            <svg width={100} height={100} viewBox="0 0 100 100" className="-rotate-90" style={{ filter: 'drop-shadow(0 0 12px rgba(164,180,122,0.5))' }}>
              <circle cx={50} cy={50} r={42} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={8} />
              <circle cx={50} cy={50} r={42} fill="none" stroke="white" strokeWidth={8} strokeLinecap="round"
                strokeDasharray={`${Math.min(goalPct, 100) * 2.64} 264`}
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white tabular-nums">{goalPct}%</span>
              <span className="text-xs text-white/50 font-medium leading-tight">goal</span>
            </div>
          </div>
        </div>

        {terrain.label && <p className="text-white/25 text-xs font-medium mt-3 leading-normal">{terrain.label}</p>}
      </div>

      {/* ══ ZONE + STATS — overlapping cards that bridge header and body ══ */}
      <div className="-mt-6 px-0 space-y-3">
        {/* Health zone bar */}
        <div className="bg-olive-400 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-forest edge-highlight mx-0">
          <StarIcon size={16} color="white" />
          <span className="text-sm font-bold text-white">{zoneLabel}</span>
          <span className="text-xs text-white/60 font-medium ml-auto">
            {todayStats.steps >= HEALTH_ZONE
              ? stepsToGo > 0 ? `${stepsToGo.toLocaleString()} to goal` : 'Goal complete'
              : `${(HEALTH_ZONE - todayStats.steps).toLocaleString()} to zone`}
          </span>
        </div>

        {/* ══ TITLE CARD — the big visual break, dark block ══ */}
        <div className="bg-forest-600 rounded-2xl p-5 shadow-forest edge-highlight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white leading-none tracking-tight">{titleInfo.current.title}</p>
              <p className="text-xs text-white/50 font-medium mt-1">{userProfile.lifetimeMiles.toLocaleString()} lifetime miles</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gold-300 tabular-nums">+{todayStats.qpEarned}</p>
              <p className="text-xs text-white/40 font-medium leading-tight">QP today</p>
            </div>
          </div>
          {titleInfo.next && (
            <div className="mt-4">
              <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${Math.round(titleInfo.progress * 100)}%`,
                  background: 'linear-gradient(90deg, #a4b47a, #D4A050)',
                }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-white/40 font-medium leading-tight">{titleInfo.current.title}</span>
                <span className="text-xs text-gold-300 font-medium leading-tight">{titleInfo.milesToNext.toLocaleString()} mi to {titleInfo.next.title}</span>
              </div>
            </div>
          )}
        </div>

        {/* ══ NUDGE — warm ember block, visual contrast ══ */}
        <div className="bg-ember-400 rounded-2xl p-4 flex items-center gap-4 shadow-ember edge-highlight">
          <span className="shrink-0">
            {nudge.nudgeType === 'challenge' ? <ChallengeIcon size={24} /> : nudge.nudgeType === 'streak' ? <FlameIconWhite size={24} /> : <StarIcon size={24} color="white" />}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-snug">{nudge.title}</p>
            <p className="text-xs text-white/60 mt-0.5 font-medium">{nudge.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ══ JOURNEY — tonal cream background to break up the white ══ */}
      <div className="mt-6 -mx-5 px-5 py-6 bg-cream-100">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Journey</p>

        <div className="bg-white rounded-2xl card-shadow p-4">
          <ProgressPath lifetimeMiles={userProfile.lifetimeMiles} />
        </div>

        {raceChallenge && raceChallenge.raceProgress && raceChallenge.raceDistance && (
          <div className="bg-forest-600 rounded-2xl px-4 py-4 flex items-center gap-3 mt-3 shadow-forest edge-highlight">
            <RouteIcon size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{raceChallenge.raceName}</p>
              <p className="text-xs text-forest-200 font-medium tabular-nums">
                {raceChallenge.raceProgress.toLocaleString()} / {raceChallenge.raceDistance.toLocaleString()} mi
              </p>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {Math.round((raceChallenge.raceProgress / raceChallenge.raceDistance) * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* ══ FRIENDS — back to page bg ══ */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Friends</p>

        {/* Dark leaderboard — forest background, not white */}
        <div className="bg-forest-600 rounded-2xl overflow-hidden shadow-forest">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-sm font-bold text-white">Today's Steps</p>
            <p className="text-xs text-white/40 font-medium leading-tight">{friends.length} friends</p>
          </div>
          <div>
            {[...friends].sort((a, b) => b.stepsToday - a.stepsToday).map((f, i) => (
              <div key={f.id} className={`flex items-center gap-3 px-4 py-3 ${f.isYou ? 'bg-white/10' : ''} ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <RankCircle rank={i + 1} size={24} />
                <AvatarCircle name={f.name} size={28} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${f.isYou ? 'text-white' : 'text-white/80'}`}>
                    {f.name} {f.isYou && <span className="text-xs text-white/40 font-medium">(you)</span>}
                  </p>
                  <span className="text-xs text-white/30 font-medium flex items-center gap-1 leading-tight">
                    <FlameIcon size={10} /> {f.streak}d
                  </span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${f.isYou ? 'text-gold-300' : 'text-white/70'}`}>
                  {f.stepsToday.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-white/5">
            <button className="w-full text-center text-xs font-semibold text-white/50 btn-press">See full leaderboard</button>
          </div>
        </div>
      </div>

      {/* Bottom spacer for tab bar */}
      <div className="h-8" />
    </div>
  )
}
