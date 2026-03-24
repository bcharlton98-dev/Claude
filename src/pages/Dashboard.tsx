import StepRing from '../components/StepRing'
import StepHeatmap from '../components/StepHeatmap'
import ProgressPath from '../components/ProgressPath'
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

/** Get terrain-themed background based on current virtual race position */
function getTerrainTheme(): { bg: string; accent: string; label: string } {
  const race = challenges.find(c => c.type === 'virtual_race' && c.isActive)
  if (!race?.waypoints || !race.raceProgress) {
    return { bg: 'from-forest-500 via-forest-500 to-forest-400', accent: 'forest', label: '' }
  }
  // Find current terrain zone
  const reached = race.waypoints.filter(w => w.reached)
  const currentTerrain = reached.length > 0 ? reached[reached.length - 1].terrain : 'city'

  const terrainThemes: Record<string, { bg: string; accent: string; label: string }> = {
    city: { bg: 'from-forest-600 via-forest-500 to-forest-400', accent: 'forest', label: '🏙️ Near Oklahoma City' },
    plains: { bg: 'from-forest-500 via-sage-500 to-mustard-500', accent: 'sage', label: '🌾 Crossing the Plains' },
    mountains: { bg: 'from-forest-700 via-forest-600 to-sage-500', accent: 'forest', label: '🏔️ Mountain Territory' },
    desert: { bg: 'from-mustard-600 via-peach-500 to-mustard-500', accent: 'mustard', label: '🌵 Desert Stretch' },
    forest: { bg: 'from-forest-700 via-forest-600 to-forest-500', accent: 'forest', label: '🌲 Deep Forest' },
    coast: { bg: 'from-sky-500 via-forest-400 to-forest-500', accent: 'sky', label: '🏖️ Coastal Road' },
    hills: { bg: 'from-sage-600 via-forest-500 to-sage-500', accent: 'sage', label: '⛰️ Rolling Hills' },
    river: { bg: 'from-forest-500 via-sky-500 to-forest-500', accent: 'sky', label: '🌊 River Crossing' },
  }
  return terrainThemes[currentTerrain] || terrainThemes.city
}

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
  const goalPct = Math.round((todayStats.steps / todayStats.goal) * 100)
  const terrain = getTerrainTheme()

  return (
    <div className="flex flex-col gap-4">
      {/* ── Terrain-Themed Header ── */}
      <div className={`-mx-5 -mt-6 px-5 pt-6 pb-5 bg-gradient-to-br ${terrain.bg} relative overflow-hidden`}>
        {/* Decorative terrain blobs */}
        <div className="absolute top-[-40px] right-[-30px] w-[140px] h-[140px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-20px] left-[-20px] w-[80px] h-[80px] rounded-full bg-black/5" />
        <div className="absolute top-[20px] right-[60px] w-[40px] h-[40px] rounded-full bg-white/5" />

        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-white/70 text-sm font-semibold">{getGreeting()},</p>
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
        {/* Terrain label */}
        {terrain.label && (
          <p className="text-white/50 text-[10px] font-medium mt-2 relative">{terrain.label}</p>
        )}
      </div>

      {/* ═══ BENTO GRID ═══ */}

      {/* ── Section: TODAY ── */}
      <div className="relative">
        <span className="absolute -top-1 left-0 text-[40px] font-extrabold text-warm-100 leading-none tracking-tight pointer-events-none select-none">TODAY</span>
        <div className="relative pt-7">
          {/* Row 1: Hero stats card (wide) + Step Ring (square) */}
          <div className="grid grid-cols-5 gap-3">
            {/* Hero stats — StrideKick style */}
            <div className="col-span-3 bg-white rounded-[22px] card-shadow relative overflow-hidden grain px-5 py-5">
              <div className="flex items-end gap-1.5">
                <span className="text-[48px] font-extrabold text-forest-600 tabular-nums leading-none tracking-tight">
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

            {/* Step Ring — compact square tile */}
            <div className="col-span-2 bg-white rounded-[22px] card-shadow flex flex-col items-center justify-center py-3 relative overflow-hidden grain">
              <StepRing current={todayStats.steps} goal={todayStats.goal} size={100} strokeWidth={8} />
              <p className="text-[9px] text-warm-400 font-bold mt-1 tabular-nums">{goalPct}%</p>
            </div>
          </div>

          {/* Row 2: Health Zone (wide landscape) */}
          <div className={`${zone.bg} rounded-[20px] px-5 py-3.5 flex items-center gap-3 color-block mt-3`}>
            <span className="text-xl">{zone.icon}</span>
            <div className="flex-1">
              <p className={`text-sm font-extrabold ${zone.color}`}>{zone.label}</p>
              <p className="text-[10px] text-warm-500 font-medium">
                {todayStats.steps >= HEALTH_ZONE
                  ? stepsToGo > 0 ? `${stepsToGo.toLocaleString()} to daily goal` : 'Daily goal complete!'
                  : `${(HEALTH_ZONE - todayStats.steps).toLocaleString()} to Health Zone`}
              </p>
            </div>
            {/* Mini progress arc */}
            <div className="w-10 h-10 relative">
              <svg width={40} height={40} className="-rotate-90">
                <circle cx={20} cy={20} r={16} fill="none" stroke="#e8e0d4" strokeWidth={3} />
                <circle
                  cx={20} cy={20} r={16} fill="none"
                  stroke="#4A6741" strokeWidth={3} strokeLinecap="round"
                  strokeDasharray={`${Math.min(goalPct, 100) * 1.005} 100.5`}
                />
              </svg>
            </div>
          </div>

          {/* Row 3: Bento grid — 3 tiles (calories big, miles small, minutes small) */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div className="col-span-2 bg-peach-50 rounded-[20px] py-4 px-4 color-block">
              <p className="text-3xl font-extrabold text-peach-600 tabular-nums leading-none">{todayStats.calories}</p>
              <p className="text-[10px] text-peach-400 font-bold mt-1">calories</p>
            </div>
            <div className="col-span-1 bg-forest-50 rounded-[18px] py-3 px-3 text-center color-block flex flex-col justify-center">
              <p className="text-lg font-extrabold text-forest-600 tabular-nums leading-none">+{todayStats.qpEarned}</p>
              <p className="text-[8px] text-forest-400 font-bold mt-0.5">QP</p>
            </div>
            <div className="col-span-1 bg-lavender-50 rounded-[18px] py-3 px-3 text-center color-block flex flex-col justify-center">
              <p className="text-lg font-extrabold text-lavender-600 tabular-nums leading-none">Lv{userProfile.level}</p>
              <p className="text-[8px] text-lavender-400 font-bold mt-0.5">{userProfile.league}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: JOURNEY ── */}
      <div className="relative mt-2">
        <span className="absolute -top-1 left-0 text-[40px] font-extrabold text-warm-100 leading-none tracking-tight pointer-events-none select-none">JOURNEY</span>
        <div className="relative pt-7">
          {/* Progress Path — winding trail for QP */}
          <div className="bg-white rounded-[22px] card-shadow p-4 relative overflow-hidden grain">
            <ProgressPath current={userProfile.qp} max={userProfile.qpToNextLevel} level={userProfile.level} />
          </div>

          {/* Virtual race status */}
          {raceChallenge && raceChallenge.raceProgress && raceChallenge.raceDistance && (
            <div className="bg-gradient-to-r from-forest-500 to-sage-500 rounded-[20px] px-5 py-4 flex items-center gap-3 mt-3 color-block relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-10px] w-[60px] h-[60px] rounded-full bg-white/5" />
              <span className="text-2xl">🗺️</span>
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

      {/* ── Section: ACTIVITY ── */}
      <div className="relative mt-2">
        <span className="absolute -top-1 left-0 text-[40px] font-extrabold text-warm-100 leading-none tracking-tight pointer-events-none select-none">ACTIVITY</span>
        <div className="relative pt-7">
          {/* Heatmap */}
          <div className="bg-white rounded-[22px] card-shadow p-5 relative overflow-hidden grain">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-warm-700">Last 28 Days</p>
              <p className="text-[10px] text-warm-400 font-medium">step intensity</p>
            </div>
            <StepHeatmap />
          </div>

          {/* Nudge card */}
          <div className={`bg-gradient-to-br ${nudge.accent} border rounded-[22px] p-5 flex items-center gap-4 color-block mt-3`}>
            <span className="text-3xl shrink-0">{nudge.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-warm-800 leading-snug">{nudge.title}</p>
              <p className="text-xs text-warm-500 mt-0.5 font-medium">{nudge.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
