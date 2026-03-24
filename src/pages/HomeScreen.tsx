import { useNavigate } from 'react-router-dom'
import { Flame, Map, Star, ChevronRight } from 'lucide-react'
import { todayStats, userProfile, challenges, notifications, dailyQuests, getCurrentTitle } from '../data/mockData'

const HEALTH_ZONE = 7_500

function getScoutMessage(steps: number, goal: number, streak: number): string {
  const pct = steps / goal
  if (pct >= 1) return "You crushed it today! Time to celebrate! 🎉"
  if (pct >= 0.8) return "Almost there — a quick walk finishes the job!"
  if (pct >= 0.5) return "Great momentum! Keep it going!"
  if (streak >= 7) return `${streak}-day streak! Don't let it drop!`
  return "Let's get moving! Every step counts."
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const goalPct = Math.min(Math.round((todayStats.steps / todayStats.goal) * 100), 100)
  const titleInfo = getCurrentTitle(userProfile.lifetimeMiles)
  const raceChallenge = challenges.find(c => c.type === 'virtual_race' && c.isActive)
  const racePct = raceChallenge?.raceProgress && raceChallenge?.raceDistance
    ? Math.round((raceChallenge.raceProgress / raceChallenge.raceDistance) * 100) : null
  const atHealthZone = todayStats.steps >= HEALTH_ZONE
  const scoutMsg = getScoutMessage(todayStats.steps, todayStats.goal, userProfile.streak)

  // Determine the one nudge to show
  const competitiveNotif = notifications.find(n => !n.read && n.type === 'competitive')
  const topQuest = [...dailyQuests].filter(q => !q.completed).sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]

  // Ring geometry
  const ringSize = 200
  const strokeWidth = 12
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (goalPct / 100) * circumference

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">

      {/* ═══════ ZONE 1 — The Header ═══════ */}
      <div className="-mx-5 -mt-6 px-5 pt-5 pb-8 bg-gradient-to-b from-forest-700 to-forest-600 flex flex-col items-center">

        {/* Top bar: logo left, streak + gems right */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-2">
            <img src="/brand/logo-icon.png" alt="" width={24} height={24} className="object-contain" />
            <span className="text-base font-bold text-white tracking-tight">WalkQuest</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-white/15 text-white px-2.5 py-1 rounded-full text-xs font-bold">
              <Flame size={14} className="text-ember-300" /> {userProfile.streak}
            </span>
            <span className="flex items-center gap-1 bg-white/15 text-white px-2.5 py-1 rounded-full text-xs font-bold">
              💎 {userProfile.gems}
            </span>
          </div>
        </div>

        {/* The Ring — visual centerpiece */}
        <div className="relative flex items-center justify-center">
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            {/* Track */}
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={radius}
              fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={strokeWidth}
            />
            {/* Filled arc */}
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={radius}
              fill="none"
              stroke={goalPct >= 100 ? '#D4A050' : '#a4b47a'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
              className="transition-all duration-1000 ease-out"
              style={{ filter: goalPct >= 100 ? 'drop-shadow(0 0 12px rgba(212,160,80,0.4))' : 'drop-shadow(0 0 8px rgba(164,180,122,0.3))' }}
            />
          </svg>

          {/* Number inside the ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[80px] font-bold text-white tabular-nums leading-none tracking-tighter">
              {todayStats.steps.toLocaleString()}
            </span>
            <span className="text-sm text-white/60 font-medium mt-1">steps today</span>
          </div>
        </div>

        {/* Stats below ring */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-white/50 font-medium tabular-nums">{todayStats.distance} mi</span>
          <span className="text-white/20">·</span>
          <span className="text-sm text-white/50 font-medium tabular-nums">{todayStats.activeMinutes} min</span>
        </div>
      </div>

      {/* ═══════ ZONE 2 — The Action Strip ═══════ */}
      <div className="px-1 -mt-4 relative z-10">
        <div className="flex gap-2">
          {/* Title progress pill */}
          <button
            onClick={() => navigate('/progress')}
            className="flex-1 flex items-center gap-1.5 bg-white rounded-full px-3 py-2 card-shadow btn-press"
          >
            <span className="text-sm">🏔</span>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-warm-700 truncate">{titleInfo.current.title}</p>
              <p className="text-xs text-warm-400 font-medium truncate tabular-nums">{titleInfo.milesToNext.toLocaleString()} mi to go</p>
            </div>
          </button>

          {/* Health Zone pill */}
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center gap-1.5 bg-white rounded-full px-3 py-2 card-shadow btn-press"
          >
            <Star className={`w-4 h-4 ${atHealthZone ? 'text-olive-400' : 'text-warm-300'}`} />
            <span className={`text-xs font-bold ${atHealthZone ? 'text-olive-500' : 'text-warm-400'}`}>
              {atHealthZone ? 'In Zone' : 'Zone'}
            </span>
          </button>

          {/* Race progress pill */}
          {racePct !== null && (
            <button
              onClick={() => navigate('/challenges')}
              className="flex items-center gap-1.5 bg-white rounded-full px-3 py-2 card-shadow btn-press"
            >
              <Map size={16} className="text-forest-500" />
              <span className="text-xs font-bold text-warm-700 tabular-nums">{racePct}%</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══════ ZONE 3 — The One Nudge ═══════ */}
      <div className="mt-5 flex-1">
        {competitiveNotif ? (
          /* Competitive nudge — terracotta */
          <div className="bg-ember-400 rounded-2xl p-4 flex items-center gap-3 shadow-ember edge-highlight">
            <img src="/brand/scout-run.png" alt="Scout" width={48} height={48} className="object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-snug">{competitiveNotif.message.split('!')[0]}!</p>
              <p className="text-xs text-white/60 mt-0.5 font-medium">Time to take back your spot</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 shrink-0" />
          </div>
        ) : topQuest ? (
          /* Quest nudge — sage green */
          <div className="bg-olive-50 rounded-2xl p-4 flex items-center gap-3 card-shadow border border-olive-200">
            <img src="/brand/scout-walk.png" alt="Scout" width={48} height={48} className="object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-warm-700 leading-snug">{topQuest.title} — {Math.round((topQuest.current / topQuest.target) * 100)}%</p>
              <p className="text-xs text-warm-500 mt-0.5 font-medium">{topQuest.current.toLocaleString()} of {topQuest.target.toLocaleString()} · +{topQuest.qpReward} QP</p>
            </div>
            <ChevronRight className="w-5 h-5 text-warm-300 shrink-0" />
          </div>
        ) : (
          /* Streak nudge — amber */
          <div className="bg-gold-50 rounded-2xl p-4 flex items-center gap-3 card-shadow border border-gold-200">
            <img src="/brand/scout-walk.png" alt="Scout" width={48} height={48} className="object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-warm-700 leading-snug">{userProfile.streak}-day streak! 🔥</p>
              <p className="text-xs text-warm-500 mt-0.5 font-medium">Keep it alive — walk today</p>
            </div>
          </div>
        )}

        {/* See friends link */}
        <button
          onClick={() => navigate('/progress')}
          className="flex items-center justify-center gap-1 mt-3 w-full py-2 text-xs font-semibold text-warm-400 btn-press"
        >
          See friends leaderboard <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* ═══════ ZONE 4 — Scout's Message ═══════ */}
      <div className="flex items-center gap-3 mt-4 mb-2 px-1">
        <img src="/brand/scout-walk.png" alt="Scout" width={40} height={40} className="object-contain shrink-0" />
        <div className="bg-cream-200 rounded-2xl rounded-bl-sm px-3 py-2 flex-1">
          <p className="text-xs text-warm-600 font-medium leading-normal">{scoutMsg}</p>
        </div>
      </div>
    </div>
  )
}
