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

/*
 * Brand assets — drop your PNGs into public/brand/:
 *   - logo-icon.png  (mountains + flame, transparent bg, ~60x60)
 *   - scout-walk.png (walking corgi, transparent bg, ~80x80)
 *   - scout-run.png  (running corgi, transparent bg, ~96x96)
 */

function WalkQuestLogo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/brand/logo-icon.png" alt="" width={28} height={28} className="object-contain" />
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
          <img src="/brand/scout-walk.png" alt="Scout" width={36} height={36} className="object-contain" />
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
          <img src="/brand/scout-run.png" alt="Scout" width={48} height={48} className="object-contain shrink-0" />
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
