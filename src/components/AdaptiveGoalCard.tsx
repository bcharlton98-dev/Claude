import { AreaChart, Area, XAxis, ResponsiveContainer, ReferenceLine } from 'recharts'
import { userProfile } from '../data/mockData'

export default function AdaptiveGoalCard() {
  const { adaptiveGoal } = userProfile
  const improvement = Math.round(((adaptiveGoal.currentGoal - adaptiveGoal.baseline) / adaptiveGoal.baseline) * 100)

  const chartData = adaptiveGoal.history.map(h => ({
    week: `W${h.week}`,
    steps: h.avgSteps,
    goal: h.goal,
  }))

  return (
    <div className="bg-white rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
          🎯 Your Adaptive Goal
        </h3>
        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          Week {adaptiveGoal.weekNumber}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-xl font-extrabold text-slate-800">{adaptiveGoal.currentGoal.toLocaleString()}</span>
        <span className="text-xs text-slate-400">steps/day</span>
        <span className="text-[10px] font-bold text-brand-600 ml-auto">+{improvement}% from start</span>
      </div>

      <div className="flex gap-3 text-center">
        <div className="flex-1 bg-slate-50 rounded-lg py-1.5">
          <p className="text-xs font-bold text-slate-600">{adaptiveGoal.baseline.toLocaleString()}</p>
          <p className="text-[9px] text-slate-400">Baseline</p>
        </div>
        <div className="flex-1 bg-brand-50 rounded-lg py-1.5">
          <p className="text-xs font-bold text-brand-700">{adaptiveGoal.currentGoal.toLocaleString()}</p>
          <p className="text-[9px] text-brand-500">Current Goal</p>
        </div>
        <div className="flex-1 bg-gold-400/10 rounded-lg py-1.5">
          <p className="text-xs font-bold text-gold-500">10,000</p>
          <p className="text-[9px] text-slate-400">Target</p>
        </div>
      </div>

      {/* Mini trend chart */}
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="stepGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="week" hide />
          <ReferenceLine y={7500} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
          <Area type="monotone" dataKey="steps" stroke="#7c3aed" fill="url(#stepGradient)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="goal" stroke="#94a3b8" fill="none" strokeWidth={1} strokeDasharray="3 3" dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-slate-400 text-center">
        📈 Avg steps vs. goal over {adaptiveGoal.weekNumber} weeks · <span className="text-gold-500 font-semibold">7,500 = health zone</span>
      </p>
    </div>
  )
}
