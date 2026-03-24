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

type ZoneInfo = { label: string; iconType: 'star' | 'mountain' | 'leaf' | 'sunrise' }

function getHealthZoneLabel(steps: number): ZoneInfo {
  if (steps >= 10_000) return { label: 'Peak Zone', iconType: 'mountain' }
  if (steps >= HEALTH_ZONE) return { label: 'Health Zone', iconType: 'star' }
  if (steps >= 5_000) return { label: 'Active Zone', iconType: 'leaf' }
  return { label: 'Warming Up', iconType: 'sunrise' }
}

/** Get terrain-themed background based on current virtual race position */
function getTerrainTheme(): { bg: string; accent: string; label: string } {
  const race = challenges.find(c => c.type === 'virtual_race' && c.isActive)
  if (!race?.waypoints || !race.raceProgress) {
    return { bg: 'from-forest-500 via-forest-500 to-forest-400', accent: 'forest', label: '' }
  }
  const reached = race.waypoints.filter(w => w.reached)
  const currentTerrain = reached.length > 0 ? reached[reached.length - 1].terrain : 'city'

  const terrainThemes: Record<string, { bg: string; accent: string; label: string }> = {
    city: { bg: 'from-forest-600 via-forest-500 to-forest-400', accent: 'forest', label: 'Near Oklahoma City' },
    plains: { bg: 'from-forest-500 via-sage-500 to-mustard-500', accent: 'sage', label: 'Crossing the Plains' },
    mountains: { bg: 'from-forest-700 via-forest-600 to-sage-500', accent: 'forest', label: 'Mountain Territory' },
    desert: { bg: 'from-mustard-600 via-peach-500 to-mustard-500', accent: 'mustard', label: 'Desert Stretch' },
    forest: { bg: 'from-forest-700 via-forest-600 to-forest-500', accent: 'forest', label: 'Deep Forest' },
    coast: { bg: 'from-sky-500 via-forest-400 to-forest-500', accent: 'sky', label: 'Coastal Road' },
    hills: { bg: 'from-sage-600 via-forest-500 to-sage-500', accent: 'sage', label: 'Rolling Hills' },
    river: { bg: 'from-forest-500 via-sky-500 to-forest-500', accent: 'sky', label: 'River Crossing' },
  }
  return terrainThemes[currentTerrain] || terrainThemes.city
}

type NudgeType = 'challenge' | 'quest' | 'streak'

function getNudge(): { nudgeType: NudgeType; title: string; subtitle: string } {
  const competitiveNotif = notifications.find(n => !n.read && n.type === 'competitive')
  if (competitiveNotif) {
    return {
      nudgeType: 'challenge',
      title: competitiveNotif.message.split('!')[0] + '!',
      subtitle: 'Time to take back your spot',
    }
  }

  const activeQuest = [...dailyQuests]
    .filter(q => !q.completed)
    .sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]
  if (activeQuest) {
    const pct = Math.round((activeQuest.current / activeQuest.target) * 100)
    return {
      nudgeType: 'quest',
      title: `${activeQuest.title} — ${pct}%`,
      subtitle: `${activeQuest.current} of ${activeQuest.target.toLocaleString()} · +${activeQuest.qpReward} QP`,
    }
  }

  return {
    nudgeType: 'streak',
    title: `${userProfile.streak}-day streak!`,
    subtitle: userProfile.streak >= 7 ? 'Incredible consistency. Keep it alive!' : 'Build your streak one day at a time',
  }
}

export default function Dashboard() {
  const stepsToGo = Math.max(todayStats.goal - todayStats.steps, 0)
  const zone = getHealthZoneLabel(todayStats.steps)
  const nudge = getNudge()
  const raceChallenge = challenges.find(c => c.type === 'virtual_race' && c.isActive)
  const goalPct = Math.round((todayStats.steps / todayStats.goal) * 100)
  const terrain = getTerrainTheme()
  const titleInfo = getCurrentTitle(userProfile.lifetimeMiles)

  return (
    <div className="flex flex-col gap-4">
      {/* ── Terrain-Themed Header ── */}
      <div className={`-mx-5 -mt-6 px-5 pt-6 pb-5 bg-gradient-to-br ${terrain.bg} relative overflow-hidden`}>
        {/* Decorative terrain blobs */}
        <div className="absolute top-[-40px] right-[-30px] w-[140px] h-[140px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-20px] left-[-20px] w-[80px] h-[80px] rounded-full bg-black/5" />
        <div className="absolute top-[20px] right-[60px] w-[40px] h-[40px] rounded-full bg-white/5" />

        {/* WalkQuest Logo */}
        <div className="relative mb-3">
          <svg width="130" height="28" viewBox="0 0 260 56" fill="none" aria-label="WalkQuest">
            <text x="0" y="44" fontFamily="system-ui, -apple-system, sans-serif" fontSize="48" fontWeight="800" fill="white" letterSpacing="-1">
              Walk
            </text>
            <text x="120" y="44" fontFamily="system-ui, -apple-system, sans-serif" fontSize="48" fontWeight="800" fill="white" letterSpacing="-1">
              Quest
            </text>
            <g transform="translate(172, 4)" stroke="#d4a843" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="0" x2="4" y2="7" />
              <line x1="0" y1="3.5" x2="8" y2="3.5" />
              <line x1="1" y1="0.5" x2="7" y2="6.5" />
              <line x1="7" y1="0.5" x2="1" y2="6.5" />
            </g>
          </svg>
        </div>

        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-white/70 text-sm font-semibold">{getGreeting()},</p>
            <p className="text-white text-xl font-extrabold tracking-tight">{userProfile.name.split(' ')[0]}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-3.5 py-2 rounded-2xl text-xs font-extrabold">
              <FlameIconWhite size={16} /> {userProfile.streak} day streak
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: userProfile.streakFreezesMax }).map((_, i) => {
                const available = i < userProfile.streakFreezes
                return (
                  <svg key={i} width="28" height="28" viewBox="0 0 64 64" fill="none" className={available ? 'opacity-100' : 'opacity-25'} aria-label="Streak freeze">
                    <circle cx="32" cy="32" r="26" fill={available ? '#DCEFF5' : '#ffffff'} fillOpacity={available ? 0.3 : 0.1} />
                    <circle cx="32" cy="32" r="25" stroke={available ? '#A9CBD6' : '#ffffff'} strokeWidth="2" strokeOpacity={available ? 0.6 : 0.2} />
                    <g stroke={available ? '#ffffff' : '#ffffff'} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" opacity={available ? 1 : 0.4}>
                      <path d="M32 19V45" /><path d="M20.7 25.5L43.3 38.5" /><path d="M20.7 38.5L43.3 25.5" />
                      <path d="M32 19L28.8 22.2" /><path d="M32 19L35.2 22.2" />
                      <path d="M32 45L28.8 41.8" /><path d="M32 45L35.2 41.8" />
                      <path d="M20.7 25.5L25 25.9" /><path d="M20.7 25.5L22.5 29.3" />
                      <path d="M43.3 38.5L39 38.1" /><path d="M43.3 38.5L41.5 34.7" />
                      <path d="M20.7 38.5L22.5 34.7" /><path d="M20.7 38.5L25 38.1" />
                      <path d="M43.3 25.5L41.5 29.3" /><path d="M43.3 25.5L39 25.9" />
                    </g>
                  </svg>
                )
              })}
            </div>
          </div>
        </div>
        {/* Terrain label */}
        {terrain.label && (
          <p className="text-white/50 text-[10px] font-medium mt-2 relative">{terrain.label}</p>
        )}
      </div>

      {/* ── Section: TODAY ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-forest-500" />
          <span className="text-[12px] font-bold uppercase tracking-widest text-forest-600">Today</span>
        </div>

          {/* Hero card: steps + ring unified */}
          <div className="bg-white rounded-[22px] card-shadow relative overflow-hidden grain px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-end gap-1.5">
                  <span className="text-[72px] font-extrabold text-forest-600 tabular-nums leading-none tracking-tight">
                    {todayStats.steps.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-warm-400 mt-0.5 block">steps</span>
                <div className="flex items-end gap-5 mt-3">
                  <div>
                    <span className="text-xl font-extrabold text-peach-500 tabular-nums leading-none">{todayStats.distance}</span>
                    <span className="text-[10px] font-bold text-warm-400 ml-1">mi</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold text-mustard-500 tabular-nums leading-none">{todayStats.activeMinutes}</span>
                    <span className="text-[10px] font-bold text-warm-400 ml-1">min</span>
                  </div>
                </div>
              </div>
              {/* Goal ring */}
              <div className="flex flex-col items-center">
                <svg width={120} height={120} viewBox="0 0 120 120" className="-rotate-90">
                  <circle cx={60} cy={60} r={50} fill="none" stroke="#e8e0d4" strokeWidth={8} />
                  <circle
                    cx={60} cy={60} r={50} fill="none"
                    stroke="url(#heroRingGrad)" strokeWidth={8} strokeLinecap="round"
                    strokeDasharray={`${Math.min(goalPct, 100) * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#aec2a0" />
                      <stop offset="100%" stopColor="#4A6741" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center" style={{ width: 120, height: 120 }}>
                  <span className="text-2xl font-extrabold text-forest-600 tabular-nums">{goalPct}%</span>
                  <span className="text-[9px] text-warm-400 font-bold">of {todayStats.goal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Zone — celebration style */}
          <div className="rounded-[20px] px-5 py-4 flex items-center gap-3 mt-3 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #8ba67a 0%, #aec2a0 40%, #d4a843 100%)' }}>
            <span className="relative z-10">
              <StarIcon size={24} color="white" />
            </span>
            <div className="flex-1 relative z-10">
              <p className="text-[15px] font-extrabold text-white">{zone.label}</p>
              <p className="text-[11px] text-white/80 font-semibold">
                {todayStats.steps >= HEALTH_ZONE
                  ? stepsToGo > 0 ? `${stepsToGo.toLocaleString()} to daily goal` : 'Daily goal complete!'
                  : `${(HEALTH_ZONE - todayStats.steps).toLocaleString()} to Health Zone`}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 3s ease-in-out infinite' }} />
          </div>

          {/* QP + Title tiles */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-forest-600 rounded-[20px] py-4 px-4 text-center color-block flex flex-col justify-center">
              <p className="text-2xl font-extrabold text-white tabular-nums leading-none">+{todayStats.qpEarned}</p>
              <p className="text-[10px] text-forest-200 font-bold mt-1">QP earned</p>
            </div>
            <div className="bg-lavender-50 rounded-[20px] py-4 px-4 text-center color-block flex flex-col justify-center">
              <p className="text-lg font-extrabold text-lavender-600 leading-none">{titleInfo.current.title}</p>
              {titleInfo.next && (
                <p className="text-[10px] text-lavender-400 font-bold mt-1">{titleInfo.milesToNext.toLocaleString()} mi to {titleInfo.next.title}</p>
              )}
            </div>
          </div>
      </div>

      {/* ── Section: JOURNEY ── */}
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-mustard-500" />
          <span className="text-[12px] font-bold uppercase tracking-widest text-mustard-600">Journey</span>
        </div>
        <div>
          <div className="bg-white rounded-[22px] card-shadow p-4 relative overflow-hidden grain">
            <ProgressPath lifetimeMiles={userProfile.lifetimeMiles} />
          </div>

          {/* Virtual race status */}
          {raceChallenge && raceChallenge.raceProgress && raceChallenge.raceDistance && (
            <div className="bg-gradient-to-r from-forest-500 to-sage-500 rounded-[20px] px-5 py-4 flex items-center gap-3 mt-3 color-block relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-10px] w-[60px] h-[60px] rounded-full bg-white/5" />
              <RouteIcon size={24} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{raceChallenge.raceName}</p>
                <p className="text-[11px] text-forest-100 font-medium tabular-nums">
                  {raceChallenge.raceProgress.toLocaleString()} / {raceChallenge.raceDistance.toLocaleString()} mi
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-white tabular-nums">
                  {Math.round((raceChallenge.raceProgress / raceChallenge.raceDistance) * 100)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section: FRIENDS ── */}
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-peach-500" />
          <span className="text-[12px] font-bold uppercase tracking-widest text-peach-600">Friends</span>
        </div>
        <div>
          <div className="bg-white rounded-[22px] card-shadow relative overflow-hidden grain">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <p className="text-sm font-bold text-warm-700">Today's Steps</p>
              <p className="text-[10px] text-warm-400 font-medium">{friends.length} friends</p>
            </div>
            <div className="divide-y divide-cream-100">
              {[...friends].sort((a, b) => b.stepsToday - a.stepsToday).map((f, i) => {
                const rank = i + 1
                return (
                  <div
                    key={f.id}
                    className={`flex items-center gap-3 px-5 py-3 ${f.isYou ? 'bg-forest-50/50' : ''}`}
                  >
                    <RankCircle rank={rank} size={24} />
                    <AvatarCircle name={f.name} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-tight ${f.isYou ? 'text-forest-600' : 'text-warm-700'}`}>
                        {f.name} {f.isYou && <span className="text-[10px] text-forest-400 font-medium">(you)</span>}
                      </p>
                      <span className="text-[10px] text-warm-400 font-medium flex items-center gap-1">
                        <FlameIcon size={10} /> {f.streak} day streak
                      </span>
                    </div>
                    <span className={`text-sm font-extrabold tabular-nums ${f.isYou ? 'text-forest-600' : 'text-warm-600'}`}>
                      {f.stepsToday.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="px-5 py-3 border-t border-cream-100">
              <button className="w-full text-center text-xs font-bold text-forest-500 btn-press">
                See full leaderboard
              </button>
            </div>
          </div>

          {/* Nudge card — bold color block */}
          <div className="rounded-[22px] p-5 flex items-center gap-4 color-block mt-3 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C67B5C, #D4886A)' }}>
            <span className="shrink-0 relative z-10">
              {nudge.nudgeType === 'challenge' ? <ChallengeIcon size={28} /> : nudge.nudgeType === 'streak' ? <FlameIconWhite size={28} /> : <StarIcon size={28} color="white" />}
            </span>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-sm font-bold text-white leading-snug">{nudge.title}</p>
              <p className="text-xs text-white/70 mt-0.5 font-medium">{nudge.subtitle}</p>
            </div>
            <div className="absolute top-[-20px] right-[-10px] w-[60px] h-[60px] rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  )
}
