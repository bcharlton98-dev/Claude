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
  if (pct >= 1) return "You crushed it! You're a walker. 🎉"
  if (steps >= HEALTH_ZONE) return "You've hit the health zone! Keep going."
  if (pct >= 0.5) return "Over halfway — you've got this."
  return "Every step counts. Let's build that habit."
}

export default function Dashboard() {
  const stepsToGo = todayStats.goal - todayStats.steps
  const hitHealthZone = todayStats.steps >= HEALTH_ZONE
  const activeStacks = habitStacks.filter(h => h.active)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Walk Quest</h1>
          <p className="text-xs text-slate-400">{getGreeting()}, {userProfile.name.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-fire-500/10 text-fire-500 px-2 py-1 rounded-full text-xs font-bold">
            🔥 {userProfile.streak}
          </span>
          <span className="flex items-center gap-1 bg-sky-400/10 text-sky-500 px-2 py-1 rounded-full text-xs font-bold">
            🧊 {userProfile.streakFreezes}
          </span>
          <span className="flex items-center gap-1 bg-royal-500/10 text-royal-500 px-2 py-1 rounded-full text-xs font-bold">
            💎 {userProfile.gems}
          </span>
        </div>
      </div>

      {/* Step Ring */}
      <div className="bg-white rounded-2xl p-5 flex flex-col items-center">
        <StepRing current={todayStats.steps} goal={todayStats.goal} />
        {stepsToGo > 0 ? (
          <p className="text-xs text-slate-400 mt-2">
            <span className="font-bold text-brand-600">{stepsToGo.toLocaleString()}</span> steps to go
          </p>
        ) : (
          <p className="text-xs text-brand-600 font-bold mt-2">Goal complete! 🎉</p>
        )}
        <p className="text-[11px] text-slate-400 mt-1">{getMotivation(todayStats.steps, todayStats.goal)}</p>

        {/* 7,500 Health Zone Indicator */}
        {hitHealthZone && (
          <div className="mt-2 flex items-center gap-1.5 bg-gold-400/10 px-3 py-1.5 rounded-full">
            <span className="text-xs">✨</span>
            <span className="text-[11px] font-semibold text-gold-500">Health Zone reached — major benefits unlocked!</span>
          </div>
        )}
      </div>

      {/* Streak Panel */}
      <StreakPanel />

      {/* QP Bar */}
      <div className="bg-white rounded-xl p-3.5">
        <QPBar current={userProfile.qp} max={userProfile.qpToNextLevel} level={userProfile.level} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: '🔥', value: todayStats.calories.toString(), label: 'cal' },
          { icon: '👟', value: `${todayStats.distance}`, label: 'mi' },
          { icon: '⏱️', value: todayStats.activeMinutes.toString(), label: 'min' },
          { icon: '⚡', value: `+${todayStats.qpEarned}`, label: 'QP' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 text-center">
            <span className="text-lg">{s.icon}</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{s.value}</p>
            <p className="text-[10px] text-slate-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Adaptive Goal Card */}
      <AdaptiveGoalCard />

      {/* Habit Stacks */}
      {activeStacks.length > 0 && (
        <div className="bg-white rounded-xl p-3.5">
          <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
            🔗 My Habit Stacks
          </h2>
          <div className="space-y-1.5">
            {activeStacks.map(h => (
              <div key={h.id} className="flex items-center gap-2 bg-brand-50/50 rounded-lg px-3 py-2">
                <span className="text-base">{h.icon}</span>
                <p className="text-xs text-slate-600">
                  <span className="font-medium text-slate-700">{h.anchor}</span>, {h.habit}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Habit stacking increases success by 64%
          </p>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="bg-white rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
            <TrendingUp size={14} className="text-brand-500" /> This Week
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={weeklyStepData} barCategoryGap="25%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <ReferenceLine y={HEALTH_ZONE} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '7.5k', fontSize: 9, fill: '#f59e0b', position: 'right' }} />
            <ReferenceLine y={10000} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
              {weeklyStepData.map((entry, i) => (
                <Cell key={i} fill={entry.steps >= 10000 ? '#7c3aed' : entry.steps >= HEALTH_ZONE ? '#c4b5fd' : '#e2e8f0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-3 mt-1">
          <span className="text-[9px] text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block" /> Goal</span>
          <span className="text-[9px] text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-200 inline-block" /> Health zone</span>
          <span className="text-[9px] text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" /> Below</span>
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
          <Sparkles size={14} className="text-gold-500" /> Daily Quests
        </h2>
        <div className="space-y-1.5">
          {dailyQuests.map(q => (
            <div
              key={q.id}
              className={`bg-white rounded-xl p-3 flex items-center gap-3 ${
                q.completed ? 'opacity-60' : ''
              }`}
            >
              <span className="text-xl w-8 text-center">
                {q.completed ? '✅' : q.type === 'steps' ? '👟' : q.type === 'distance' ? '🗺️' : q.type === 'active_minutes' ? '⏱️' : '👋'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className={`font-medium text-sm ${q.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {q.title}
                  </p>
                  <span className="text-[11px] text-brand-600 font-bold">+{q.qpReward} QP</span>
                </div>
                {!q.completed && (
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-400 rounded-full"
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
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-4 text-center">
        <p className="text-white text-sm font-bold">Commit to My Quest</p>
        <p className="text-brand-100 text-[11px] mt-0.5">Walk 7,500+ steps every day this week</p>
        <button className="mt-2 bg-white text-brand-600 font-bold text-xs px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
          I'm In
        </button>
      </div>
    </div>
  )
}
