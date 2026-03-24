import { TrendingUp, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import StepRing from '../components/StepRing'
import QPBar from '../components/XPBar'
import StreakPanel from '../components/StreakPanel'
import AdaptiveGoalCard from '../components/AdaptiveGoalCard'
import { todayStats, dailyQuests, userProfile, weeklyStepData, habitStacks } from '../data/mockData'

const HEALTH_ZONE = 7_500

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getMotivation(steps: number, goal: number): string {
  const pct = steps / goal
  if (pct >= 1) return "You crushed it today!"
  if (steps >= HEALTH_ZONE) return "Health zone reached! Keep going."
  if (pct >= 0.5) return "Over halfway — you've got this."
  return "Every step counts. Let's go."
}

function CalendarStrip() {
  const today = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const currentDay = today.getDay()

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - currentDay + i)
    return { day: days[i], date: d.getDate(), isToday: i === currentDay }
  })

  return (
    <div className="flex gap-1.5 justify-between">
      {weekDates.map(d => (
        <button
          key={d.day}
          className={`flex flex-col items-center gap-1 py-2 px-2.5 rounded-2xl transition-all btn-press flex-1 ${
            d.isToday
              ? 'day-active'
              : 'text-warm-400 hover:bg-cream-100'
          }`}
        >
          <span className={`text-[10px] font-semibold ${d.isToday ? 'text-white/80' : ''}`}>{d.day}</span>
          <span className={`text-sm font-bold ${d.isToday ? '' : ''}`}>{d.date}</span>
        </button>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const stepsToGo = todayStats.goal - todayStats.steps
  const hitHealthZone = todayStats.steps >= HEALTH_ZONE
  const activeStacks = habitStacks.filter(h => h.active)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-warm-400 font-medium">{getGreeting()}</p>
          <h1 className="text-2xl font-extrabold text-warm-800 tracking-tight">{userProfile.name.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-peach-50 text-peach-500 px-2.5 py-1.5 rounded-2xl text-xs font-extrabold btn-press">
            <span className="animate-flame inline-block text-sm">🔥</span> {userProfile.streak}
          </span>
          <span className="flex items-center gap-1 bg-mustard-50 text-mustard-500 px-2.5 py-1.5 rounded-2xl text-xs font-extrabold btn-press">
            💎 {userProfile.gems}
          </span>
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="bg-white rounded-3xl p-4 card-shadow">
        <CalendarStrip />
      </div>

      {/* Step Ring — Hero Card */}
      <div className="bg-white rounded-3xl p-6 card-shadow relative overflow-hidden grain flex flex-col items-center warm-glow">
        <StepRing current={todayStats.steps} goal={todayStats.goal} />
        {stepsToGo > 0 ? (
          <p className="text-sm text-warm-400 mt-3 font-medium">
            <span className="font-extrabold text-sage-600 tabular-nums">{stepsToGo.toLocaleString()}</span> steps to go
          </p>
        ) : (
          <p className="text-sm text-peach-500 font-extrabold mt-3">Goal complete!</p>
        )}
        <p className="text-xs text-warm-400 mt-1">{getMotivation(todayStats.steps, todayStats.goal)}</p>

        {/* Health Zone Badge */}
        {hitHealthZone && (
          <div className="mt-3 flex items-center gap-2 bg-sage-50 px-4 py-2 rounded-2xl">
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold text-sage-600">Health Zone — major benefits unlocked!</span>
          </div>
        )}
      </div>

      {/* Streak */}
      <StreakPanel />

      {/* QP Bar */}
      <div className="bg-white rounded-3xl p-4.5 card-shadow grain relative overflow-hidden">
        <QPBar current={userProfile.qp} max={userProfile.qpToNextLevel} level={userProfile.level} />
      </div>

      {/* Quick Stats — Bento Grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '🔥', value: todayStats.calories.toString(), label: 'cal', bg: 'bg-peach-50' },
          { icon: '👟', value: `${todayStats.distance}`, label: 'miles', bg: 'bg-sage-50' },
          { icon: '⏱️', value: todayStats.activeMinutes.toString(), label: 'min', bg: 'bg-mustard-50' },
          { icon: '⚡', value: `+${todayStats.qpEarned}`, label: 'QP', bg: 'bg-lavender-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center card-hover`}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-base font-extrabold text-warm-800 mt-1 tabular-nums">{s.value}</p>
            <p className="text-[10px] text-warm-400 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Adaptive Goal */}
      <AdaptiveGoalCard />

      {/* Habit Stacks */}
      {activeStacks.length > 0 && (
        <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
          <h2 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5">
            🔗 Habit Stacks
          </h2>
          <div className="space-y-2">
            {activeStacks.map(h => (
              <div key={h.id} className="flex items-center gap-3 bg-cream-50 rounded-2xl px-4 py-3 card-hover">
                <span className="text-lg">{h.icon}</span>
                <p className="text-xs text-warm-600 font-medium">
                  <span className="font-bold text-warm-700">{h.anchor}</span>, {h.habit}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-warm-400 mt-3 text-center font-medium">
            Habit stacking increases success by 64%
          </p>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-warm-700 flex items-center gap-1.5">
            <TrendingUp size={15} className="text-sage-500" /> This Week
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={weeklyStepData} barCategoryGap="20%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a39890', fontWeight: 600 }} />
            <ReferenceLine y={HEALTH_ZONE} stroke="#d4a843" strokeDasharray="3 3" label={{ value: '7.5k', fontSize: 9, fill: '#d4a843', position: 'right' }} />
            <ReferenceLine y={10000} stroke="#e8e0d4" strokeDasharray="3 3" />
            <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
              {weeklyStepData.map((entry, i) => (
                <Cell key={i} fill={entry.steps >= 10000 ? '#6f8d5e' : entry.steps >= HEALTH_ZONE ? '#cddac4' : '#e8e0d4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-[9px] text-warm-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sage-500 inline-block" /> Goal</span>
          <span className="text-[9px] text-warm-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sage-200 inline-block" /> Health zone</span>
          <span className="text-[9px] text-warm-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cream-200 inline-block" /> Below</span>
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <h2 className="text-base font-bold text-warm-700 mb-3 flex items-center gap-1.5">
          <Sparkles size={16} className="text-mustard-400" /> Daily Quests
        </h2>
        <div className="space-y-2">
          {dailyQuests.map(q => (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-4 flex items-center gap-3.5 card-shadow card-hover ${
                q.completed ? 'opacity-60' : ''
              }`}
            >
              <span className="text-2xl w-10 text-center">
                {q.completed ? '✅' : q.type === 'steps' ? '👟' : q.type === 'distance' ? '🗺️' : q.type === 'active_minutes' ? '⏱️' : '👋'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className={`font-bold text-sm ${q.completed ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                    {q.title}
                  </p>
                  <span className="text-[11px] text-sage-600 font-extrabold bg-sage-50 px-2 py-0.5 rounded-full">+{q.qpReward} QP</span>
                </div>
                {!q.completed && (
                  <div className="mt-2 h-2 bg-cream-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((q.current / q.target) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commit to Quest CTA */}
      <div className="bg-gradient-to-br from-sage-500 to-sage-700 rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#d4a843,transparent_50%)]" />
        <p className="text-white text-lg font-extrabold relative">Commit to My Quest</p>
        <p className="text-sage-200 text-xs mt-1 relative font-medium">Walk 7,500+ steps every day this week</p>
        <button className="mt-4 bg-white text-sage-700 font-extrabold text-sm px-8 py-3 rounded-2xl shadow-lg btn-press relative hover:shadow-xl transition-shadow">
          I'm In
        </button>
      </div>
    </div>
  )
}
