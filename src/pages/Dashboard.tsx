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
  if (pct >= 1) return "You crushed it today! 🎉"
  if (steps >= HEALTH_ZONE) return "Health zone reached! Keep going."
  if (pct >= 0.5) return "Over halfway — you've got this."
  return "Every step counts. Let's go."
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
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Walk Quest</h1>
          <p className="text-sm text-slate-400 font-medium">{getGreeting()}, {userProfile.name.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-fire-500/10 text-fire-500 px-2.5 py-1.5 rounded-2xl text-xs font-extrabold btn-press">
            <span className="animate-flame inline-block text-sm">🔥</span> {userProfile.streak}
          </span>
          <span className="flex items-center gap-1 bg-royal-50 text-royal-500 px-2.5 py-1.5 rounded-2xl text-xs font-extrabold btn-press">
            💎 {userProfile.gems}
          </span>
        </div>
      </div>

      {/* Step Ring — Hero Card */}
      <div className="bg-white rounded-3xl p-6 card-shadow relative overflow-hidden grain flex flex-col items-center">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-accent-400 to-accent-500" />
        <StepRing current={todayStats.steps} goal={todayStats.goal} />
        {stepsToGo > 0 ? (
          <p className="text-sm text-slate-400 mt-3 font-medium">
            <span className="font-extrabold text-accent-600 tabular-nums">{stepsToGo.toLocaleString()}</span> steps to go
          </p>
        ) : (
          <p className="text-sm text-brand-600 font-extrabold mt-3">Goal complete! 🎉</p>
        )}
        <p className="text-xs text-slate-400 mt-1">{getMotivation(todayStats.steps, todayStats.goal)}</p>

        {/* Health Zone Badge */}
        {hitHealthZone && (
          <div className="mt-3 flex items-center gap-2 bg-gradient-to-r from-brand-50 to-accent-50 px-4 py-2 rounded-2xl">
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold text-brand-600">Health Zone — major benefits unlocked!</span>
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
          { icon: '🔥', value: todayStats.calories.toString(), label: 'cal', color: 'from-fire-500/5 to-brand-500/5' },
          { icon: '👟', value: `${todayStats.distance}`, label: 'miles', color: 'from-accent-500/5 to-accent-500/10' },
          { icon: '⏱️', value: todayStats.activeMinutes.toString(), label: 'min', color: 'from-sky-500/5 to-sky-500/10' },
          { icon: '⚡', value: `+${todayStats.qpEarned}`, label: 'QP', color: 'from-royal-500/5 to-royal-500/10' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-3 text-center card-hover`}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-base font-extrabold text-slate-800 mt-1 tabular-nums">{s.value}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Adaptive Goal */}
      <AdaptiveGoalCard />

      {/* Habit Stacks */}
      {activeStacks.length > 0 && (
        <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
            🔗 Habit Stacks
          </h2>
          <div className="space-y-2">
            {activeStacks.map(h => (
              <div key={h.id} className="flex items-center gap-3 bg-sand-50 rounded-2xl px-4 py-3 card-hover">
                <span className="text-lg">{h.icon}</span>
                <p className="text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-700">{h.anchor}</span>, {h.habit}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center font-medium">
            Habit stacking increases success by 64%
          </p>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <TrendingUp size={15} className="text-accent-500" /> This Week
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={weeklyStepData} barCategoryGap="20%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
            <ReferenceLine y={HEALTH_ZONE} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '7.5k', fontSize: 9, fill: '#f59e0b', position: 'right' }} />
            <ReferenceLine y={10000} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
              {weeklyStepData.map((entry, i) => (
                <Cell key={i} fill={entry.steps >= 10000 ? '#0d9488' : entry.steps >= HEALTH_ZONE ? '#99f6e4' : '#f0e4d4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent-600 inline-block" /> Goal</span>
          <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent-200 inline-block" /> Health zone</span>
          <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sand-200 inline-block" /> Below</span>
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-1.5">
          <Sparkles size={16} className="text-brand-500" /> Daily Quests
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
                  <p className={`font-bold text-sm ${q.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {q.title}
                  </p>
                  <span className="text-[11px] text-royal-600 font-extrabold bg-royal-50 px-2 py-0.5 rounded-full">+{q.qpReward} QP</span>
                </div>
                {!q.completed && (
                  <div className="mt-2 h-2 bg-sand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500"
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
      <div className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#fbbf24,transparent_50%)]" />
        <p className="text-white text-lg font-extrabold relative">Commit to My Quest</p>
        <p className="text-accent-100 text-xs mt-1 relative font-medium">Walk 7,500+ steps every day this week</p>
        <button className="mt-4 bg-white text-accent-700 font-extrabold text-sm px-8 py-3 rounded-2xl shadow-lg btn-press relative hover:shadow-xl transition-shadow">
          I'm In
        </button>
      </div>
    </div>
  )
}
