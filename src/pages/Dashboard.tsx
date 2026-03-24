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
    plains: { bg: 'from-forest-600 via-forest-500 to-sage-500', label: 'Crossing the Plains' },
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
    <div className="flex flex-col gap-5">

      {/* ── HEADER — extends into the step count for visual continuity ── */}
      <div className={`-mx-5 -mt-6 px-5 pt-6 pb-8 bg-gradient-to-b ${terrain.bg}`}>
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

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/50 text-xs font-medium">{getGreeting()},</p>
            <p className="text-white text-xl font-bold tracking-tight">{userProfile.name.split(' ')[0]}</p>
          </div>
          <span className="flex items-center gap-1.5 bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <FlameIconWhite size={14} /> {userProfile.streak} days
          </span>
        </div>

        {/* Step count — BIG number lives in the header, not a card */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[64px] font-bold text-white tabular-nums leading-none tracking-tight block">
              {todayStats.steps.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <StarIcon size={12} color="rgba(255,255,255,0.6)" />
              <span className="text-xs text-white/60 font-medium">{zoneLabel}</span>
              <span className="text-xs text-white/40 font-medium">
                {todayStats.steps >= HEALTH_ZONE
                  ? stepsToGo > 0 ? `· ${stepsToGo.toLocaleString()} to goal` : '· Goal complete'
                  : `· ${(HEALTH_ZONE - todayStats.steps).toLocaleString()} to zone`}
              </span>
            </div>
          </div>

          {/* Ring — sits in header, glows */}
          <div className="relative mb-1">
            <svg width={80} height={80} viewBox="0 0 80 80" className="-rotate-90" style={{ filter: 'drop-shadow(0 0 8px rgba(174, 194, 160, 0.4))' }}>
              <circle cx={40} cy={40} r={33} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={6} />
              <circle cx={40} cy={40} r={33} fill="none" stroke="white" strokeWidth={6} strokeLinecap="round"
                strokeDasharray={`${Math.min(goalPct, 100) * 2.07} 207`}
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white tabular-nums">{goalPct}%</span>
            </div>
          </div>
        </div>

        {terrain.label && <p className="text-white/30 text-[10px] font-medium mt-2">{terrain.label}</p>}
      </div>

      {/* Stats row — overlaps the header with negative margin */}
      <div className="flex gap-3 -mt-5">
        {[
          { value: todayStats.distance, unit: 'mi', label: 'Distance' },
          { value: todayStats.activeMinutes, unit: 'min', label: 'Active' },
          { value: todayStats.qpEarned, unit: 'QP', label: 'Earned' },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-white rounded-2xl p-3 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}>
            <p className="text-lg font-bold text-warm-800 tabular-nums leading-none">
              {typeof s.value === 'number' && s.unit === 'QP' ? `+${s.value}` : s.value}
            </p>
            <p className="text-[10px] text-warm-400 font-medium mt-1">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* ── TITLE CARD — breaks the system, feels like an achievement ── */}
      <div className="relative">
        {/* Subtle glow behind */}
        <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(ellipse at center, rgba(74,103,65,0.08), transparent 70%)', transform: 'scale(1.05)', filter: 'blur(20px)' }} />
        <div className="relative bg-forest-600 rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(74,103,65,0.15), 0 8px 24px rgba(74,103,65,0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white leading-none">{titleInfo.current.title}</p>
              <p className="text-xs text-forest-200 font-medium mt-1">{userProfile.lifetimeMiles.toLocaleString()} miles walked</p>
            </div>
            {titleInfo.next && (
              <div className="text-right">
                <p className="text-xs text-forest-200 font-medium">Next</p>
                <p className="text-sm font-bold text-white">{titleInfo.next.title}</p>
              </div>
            )}
          </div>
          {titleInfo.next && (
            <div className="mt-4">
              <div className="h-2 bg-forest-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${Math.round(titleInfo.progress * 100)}%`,
                  background: 'linear-gradient(90deg, #a4b47a, #D4A050)',
                }} />
              </div>
              <p className="text-[11px] text-forest-200 font-medium mt-1.5">{titleInfo.milesToNext.toLocaleString()} mi remaining</p>
            </div>
          )}
        </div>
      </div>

      {/* ── JOURNEY ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-3">Journey</p>

        <div className="bg-white rounded-2xl card-shadow p-4">
          <ProgressPath lifetimeMiles={userProfile.lifetimeMiles} />
        </div>

        {raceChallenge && raceChallenge.raceProgress && raceChallenge.raceDistance && (
          <div className="bg-forest-600 rounded-2xl px-4 py-4 flex items-center gap-3 mt-3" style={{ boxShadow: '0 2px 8px rgba(74,103,65,0.15)' }}>
            <RouteIcon size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{raceChallenge.raceName}</p>
              <p className="text-xs text-forest-200 font-medium tabular-nums">
                {raceChallenge.raceProgress.toLocaleString()} / {raceChallenge.raceDistance.toLocaleString()} mi
              </p>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">
              {Math.round((raceChallenge.raceProgress / raceChallenge.raceDistance) * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* ── FRIENDS ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-3">Friends</p>

        <div className="bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-sm font-bold text-warm-700">Today's Steps</p>
            <p className="text-[10px] text-warm-400 font-medium">{friends.length} friends</p>
          </div>
          <div>
            {[...friends].sort((a, b) => b.stepsToday - a.stepsToday).map((f, i) => (
              <div key={f.id} className={`flex items-center gap-3 px-4 py-3 ${f.isYou ? 'bg-forest-50/50' : ''} ${i > 0 ? 'border-t border-cream-100' : ''}`}>
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

        {/* Nudge — warm, bold */}
        <div className="bg-peach-500 rounded-2xl p-4 flex items-center gap-4 mt-3" style={{ boxShadow: '0 2px 8px rgba(224,120,64,0.2)' }}>
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
