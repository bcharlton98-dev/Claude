import { Flame, Zap, Footprints, Clock, Gem, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import StepRing from '../components/StepRing'
import XPBar from '../components/XPBar'
import { todayStats, dailyQuests, userProfile, weeklyStepData } from '../data/mockData'

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-slate-100">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Walk Quest</h1>
          <p className="text-sm text-slate-500">Let's crush today's goals!</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-sm font-semibold">
            <Flame size={16} />
            {userProfile.streak}
          </div>
          <div className="flex items-center gap-1 bg-purple-50 text-purple-500 px-2.5 py-1 rounded-full text-sm font-semibold">
            <Gem size={14} />
            {userProfile.gems}
          </div>
        </div>
      </div>

      {/* Step Ring */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
        <StepRing current={todayStats.steps} goal={todayStats.goal} />
        <p className="text-sm text-slate-500 mt-2">
          <span className="font-semibold text-emerald-600">{(todayStats.goal - todayStats.steps).toLocaleString()}</span> steps to go
        </p>
      </div>

      {/* XP Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <XPBar current={userProfile.xp} max={userProfile.xpToNextLevel} level={userProfile.level} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame} label="Calories" value={todayStats.calories.toString()} color="bg-orange-500" />
        <StatCard icon={Footprints} label="Distance" value={`${todayStats.distance} mi`} color="bg-blue-500" />
        <StatCard icon={Clock} label="Active Min" value={todayStats.activeMinutes.toString()} color="bg-purple-500" />
        <StatCard icon={Zap} label="XP Today" value={`+${todayStats.xpEarned}`} color="bg-emerald-500" />
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-emerald-500" /> This Week
          </h2>
          <span className="text-xs text-slate-400">Daily steps</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyStepData} barCategoryGap="20%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis hide />
            <ReferenceLine y={10000} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
              {weeklyStepData.map((entry, i) => (
                <Cell key={i} fill={entry.steps >= 10000 ? '#10b981' : '#a7f3d0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Quests */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Daily Quests</h2>
        <div className="space-y-2">
          {dailyQuests.map(q => (
            <div
              key={q.id}
              className={`bg-white rounded-xl p-3.5 shadow-sm border flex items-center gap-3 ${
                q.completed ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                q.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100'
              }`}>
                {q.completed ? '✓' : q.type === 'steps' ? '👟' : q.type === 'distance' ? '📏' : q.type === 'active_minutes' ? '⏱️' : '👋'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className={`font-medium text-sm ${q.completed ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                    {q.title}
                  </p>
                  <span className="text-xs text-amber-600 font-semibold shrink-0 ml-2">+{q.xpReward} XP</span>
                </div>
                <p className="text-xs text-slate-500">{q.description}</p>
                {!q.completed && (
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
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
