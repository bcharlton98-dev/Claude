import { Flame, Footprints, Clock, TrendingUp, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import StepRing from '../components/StepRing'
import QPBar from '../components/XPBar'
import { todayStats, dailyQuests, userProfile, weeklyStepData } from '../data/mockData'

export default function Dashboard() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Walk Quest</h1>
          <p className="text-xs text-slate-400">Let's crush it today</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-fire-500/10 text-fire-500 px-2 py-1 rounded-full text-xs font-bold">
            🔥 {userProfile.streak}
          </span>
          <span className="flex items-center gap-1 bg-royal-500/10 text-royal-500 px-2 py-1 rounded-full text-xs font-bold">
            💎 {userProfile.gems}
          </span>
        </div>
      </div>

      {/* Step Ring */}
      <div className="bg-white rounded-2xl p-5 flex flex-col items-center">
        <StepRing current={todayStats.steps} goal={todayStats.goal} />
        <p className="text-xs text-slate-400 mt-2">
          <span className="font-bold text-brand-600">{(todayStats.goal - todayStats.steps).toLocaleString()}</span> steps to go
        </p>
      </div>

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
            <ReferenceLine y={10000} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
              {weeklyStepData.map((entry, i) => (
                <Cell key={i} fill={entry.steps >= 10000 ? '#22c55e' : '#bbf7d0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
    </div>
  )
}
