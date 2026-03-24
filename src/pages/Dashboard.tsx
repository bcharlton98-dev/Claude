import ProgressPath from '../components/ProgressPath'
import { FlameIconWhite, StarIcon, RouteIcon, RankCircle, AvatarCircle, FlameIcon } from '../components/Icons'
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

/* Scout corgi SVG — walking pose (simplified) */
function ScoutWalking({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Body */}
      <ellipse cx="20" cy="22" rx="10" ry="7" fill="#D4884D" />
      {/* Belly */}
      <ellipse cx="20" cy="24" rx="7" ry="4" fill="#F5C9A0" />
      {/* Head */}
      <circle cx="28" cy="15" r="6" fill="#D4884D" />
      {/* Snout */}
      <ellipse cx="32" cy="16" rx="3" ry="2.5" fill="#F5C9A0" />
      <circle cx="33" cy="15.5" r="1" fill="#352D24" />
      {/* Eye */}
      <circle cx="29" cy="13.5" r="1.2" fill="#352D24" />
      <circle cx="29.4" cy="13.2" r="0.4" fill="white" />
      {/* Ears */}
      <ellipse cx="25" cy="10" rx="2.5" ry="3.5" fill="#BE7339" transform="rotate(-15 25 10)" />
      <ellipse cx="30" cy="10.5" rx="2" ry="3" fill="#BE7339" transform="rotate(10 30 10.5)" />
      {/* Legs (walking pose) */}
      <rect x="13" y="27" width="3" height="8" rx="1.5" fill="#BE7339" transform="rotate(-10 14 27)" />
      <rect x="18" y="27" width="3" height="7" rx="1.5" fill="#D4884D" transform="rotate(5 19 27)" />
      <rect x="23" y="27" width="3" height="8" rx="1.5" fill="#BE7339" transform="rotate(-5 24 27)" />
      <rect x="27" y="27" width="3" height="7" rx="1.5" fill="#D4884D" transform="rotate(10 28 27)" />
      {/* Tail */}
      <path d="M10 20 Q6 14 8 11" stroke="#D4884D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/* Scout running pose — for nudge card */
function ScoutRunning({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Body — stretched for running */}
      <ellipse cx="24" cy="24" rx="12" ry="7" fill="#D4884D" />
      <ellipse cx="24" cy="26" rx="8" ry="4" fill="#F5C9A0" />
      {/* Head — forward lean */}
      <circle cx="34" cy="17" r="6" fill="#D4884D" />
      <ellipse cx="38" cy="18" rx="3" ry="2.5" fill="#F5C9A0" />
      <circle cx="39" cy="17.5" r="1" fill="#352D24" />
      <circle cx="35" cy="15.5" r="1.2" fill="#352D24" />
      <circle cx="35.4" cy="15.2" r="0.4" fill="white" />
      {/* Ears — wind-blown */}
      <ellipse cx="31" cy="12" rx="2.5" ry="3.5" fill="#BE7339" transform="rotate(-25 31 12)" />
      <ellipse cx="35" cy="12" rx="2" ry="3" fill="#BE7339" transform="rotate(-10 35 12)" />
      {/* Legs — full stride */}
      <rect x="14" y="28" width="3" height="9" rx="1.5" fill="#BE7339" transform="rotate(-20 15 28)" />
      <rect x="20" y="29" width="3" height="8" rx="1.5" fill="#D4884D" transform="rotate(15 21 29)" />
      <rect x="27" y="28" width="3" height="9" rx="1.5" fill="#BE7339" transform="rotate(-15 28 28)" />
      <rect x="32" y="29" width="3" height="8" rx="1.5" fill="#D4884D" transform="rotate(20 33 29)" />
      {/* Tail — bouncing up */}
      <path d="M12 22 Q7 15 10 10" stroke="#D4884D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Motion lines */}
      <line x1="8" y1="22" x2="4" y2="22" stroke="#D4884D" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <line x1="9" y1="25" x2="5" y2="25" stroke="#D4884D" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
    </svg>
  )
}

/* WalkQuest logo — mountains + flame droplet, matching brand lockup */
function WalkQuestLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="30" height="28" viewBox="0 0 30 28" fill="none">
        {/* Back mountain — lighter olive */}
        <path d="M2 26L12 6L22 26H2Z" fill="#a4b47a" />
        {/* Front mountain — darker forest */}
        <path d="M10 26L19 10L28 26H10Z" fill="#7fa389" />
        {/* Flame/droplet on peak */}
        <ellipse cx="19" cy="6" rx="2.5" ry="3.5" fill="#D4A050" />
        <path d="M19 2.5C19 2.5 17 5 17 6.5C17 7.6 17.9 8.5 19 8.5C20.1 8.5 21 7.6 21 6.5C21 5 19 2.5 19 2.5Z" fill="#e5a66d" />
      </svg>
      <span className="text-xl font-bold text-white tracking-tight">WalkQuest</span>
    </div>
  )
}

export default function Dashboard() {
  const stepsToGo = Math.max(todayStats.goal - todayStats.steps, 0)
  const zoneLabel = getHealthZoneLabel(todayStats.steps)
  const nudge = getNudge()
  const raceChallenge = challenges.find(c => c.type === 'virtual_race' && c.isActive)
  const terrain = getTerrainTheme()
  const titleInfo = getCurrentTitle(userProfile.lifetimeMiles)

  return (
    <div className="flex flex-col">

      {/* ══ HEADER — compact: logo, greeting+Scout, step count, stats ══ */}
      <div className={`-mx-5 -mt-6 px-5 pt-6 pb-6 bg-gradient-to-b ${terrain.bg}`}>
        {/* Logo + streak badge */}
        <div className="flex items-center justify-between mb-4">
          <WalkQuestLogo />
          <span className="flex items-center gap-1.5 bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <span className={userProfile.streak >= 7 ? 'flame-hot' : 'flame-idle'}><FlameIconWhite size={14} /></span> {userProfile.streak} days
          </span>
        </div>

        {/* Greeting with Scout */}
        <div className="flex items-center gap-2 mb-5">
          <ScoutWalking size={36} />
          <div>
            <p className="text-white/50 text-xs font-medium">{getGreeting()},</p>
            <p className="text-white text-xl font-bold tracking-tight">{userProfile.name.split(' ')[0]}</p>
          </div>
        </div>

        {/* Step count — hero number, no ring */}
        <div>
          <span className="text-7xl font-bold text-white tabular-nums leading-none tracking-tighter block">
            {todayStats.steps.toLocaleString()}
            <span className="text-2xl font-semibold text-white/40 ml-1">steps</span>
          </span>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm font-medium"><span className="font-bold text-olive-200 tabular-nums">{todayStats.distance}</span> <span className="text-white/40">mi</span></span>
            <span className="text-sm font-medium"><span className="font-bold text-gold-200 tabular-nums">{todayStats.activeMinutes}</span> <span className="text-white/40">min</span></span>
            {terrain.label && <span className="text-xs text-white/25 font-medium ml-auto">{terrain.label}</span>}
          </div>
        </div>
      </div>

      {/* ══ HEALTH ZONE BAR — on cream bg, not overlapping header ══ */}
      <div className="mt-3 card-stagger" style={{ '--i': 0 } as React.CSSProperties}>
        <div className="bg-olive-400 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-forest zone-bar">
          <StarIcon size={16} color="white" />
          <span className="text-sm font-bold text-white">{zoneLabel}</span>
          <span className="text-xs text-white/60 font-medium ml-auto">
            {todayStats.steps >= HEALTH_ZONE
              ? stepsToGo > 0 ? `${stepsToGo.toLocaleString()} to goal` : 'Goal complete'
              : `${(HEALTH_ZONE - todayStats.steps).toLocaleString()} to zone`}
          </span>
        </div>
      </div>

      {/* ══ TITLE CARD — light sage bg, distinct from header ══ */}
      <div className="mt-6 card-stagger" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="bg-olive-50 rounded-2xl p-5 card-shadow border border-olive-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-forest-700 leading-none tracking-tight">{titleInfo.current.title}</p>
              <p className="text-xs text-warm-500 font-medium mt-1">{userProfile.lifetimeMiles.toLocaleString()} lifetime miles</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gold-400 tabular-nums">+{todayStats.qpEarned} <span className="text-xs font-medium text-warm-400">QP</span></p>
              <p className="text-xs text-warm-400 font-medium leading-tight">today</p>
            </div>
          </div>
          {titleInfo.next && (
            <div className="mt-4">
              <div className="h-2.5 rounded-full overflow-hidden bg-olive-200">
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${Math.round(titleInfo.progress * 100)}%`,
                  background: 'linear-gradient(90deg, #7E8E4E, #D4A050)',
                }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-warm-400 font-medium leading-tight">{titleInfo.current.title}</span>
                <span className="text-xs font-medium leading-tight"><span className="font-bold text-gold-400 tabular-nums">{titleInfo.milesToNext.toLocaleString()}</span> <span className="text-warm-400">mi to {titleInfo.next.title}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ NUDGE — warm ember block with Scout ══ */}
      <div className="mt-3 card-stagger" style={{ '--i': 2 } as React.CSSProperties}>
        <div className="bg-ember-400 rounded-2xl p-4 flex items-center gap-3 nudge-card edge-highlight">
          <span className="shrink-0">
            <ScoutRunning size={48} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-snug">{nudge.title}</p>
            <p className="text-xs text-white/60 mt-0.5 font-medium">{nudge.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ══ JOURNEY — tonal cream background ══ */}
      <div className="mt-6 -mx-5 px-5 py-6 bg-cream-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-forest-500 rounded-full" />
          <p className="text-sm font-bold text-warm-700 uppercase tracking-widest">Journey</p>
        </div>

        <div className="bg-white rounded-2xl card-shadow p-4">
          <ProgressPath lifetimeMiles={userProfile.lifetimeMiles} />
        </div>

        {raceChallenge && raceChallenge.raceProgress && raceChallenge.raceDistance && (
          <div className="bg-forest-600 rounded-2xl px-4 py-4 flex items-center gap-3 mt-3 shadow-forest edge-highlight">
            <RouteIcon size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{raceChallenge.raceName}</p>
              <p className="text-xs font-medium tabular-nums">
                <span className="text-white font-bold">{raceChallenge.raceProgress.toLocaleString()}</span>
                <span className="text-forest-200"> / {raceChallenge.raceDistance.toLocaleString()}</span>
                <span className="text-white/30"> mi</span>
              </p>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {Math.round((raceChallenge.raceProgress / raceChallenge.raceDistance) * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* ══ FRIENDS ══ */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-forest-500 rounded-full" />
          <p className="text-sm font-bold text-warm-700 uppercase tracking-widest">Friends</p>
        </div>

        <div className="bg-forest-600 rounded-2xl overflow-hidden shadow-forest">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-sm font-bold text-white">Today's Steps</p>
            <p className="text-xs text-white/40 font-medium leading-tight">{friends.length} friends</p>
          </div>
          <div>
            {[...friends].sort((a, b) => b.stepsToday - a.stepsToday).map((f, i) => (
              <div key={f.id} className={`flex items-center gap-3 px-4 py-3 card-stagger ${f.isYou ? 'bg-white/10' : ''} ${i > 0 ? 'border-t border-white/5' : ''}`} style={{ '--i': i } as React.CSSProperties}>
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
                  <span className={`text-xs font-medium ml-0.5 ${f.isYou ? 'text-gold-300/50' : 'text-white/30'}`}>steps</span>
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-white/5">
            <button className="w-full text-center text-xs font-semibold text-white/50 btn-press">See full leaderboard</button>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}
