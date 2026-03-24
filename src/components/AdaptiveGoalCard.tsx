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
    <div className="bg-white rounded-[22px] p-5 card-shadow relative overflow-hidden grain space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-warm-700 flex items-center gap-1.5">
          🎯 Adaptive Goal
        </h3>
        <span className="text-[10px] font-bold text-forest-600 bg-forest-50 px-2.5 py-1 rounded-full">
          Week {adaptiveGoal.weekNumber}
        </span>
      </div>

      {/* Dramatic number */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-warm-800 tabular-nums leading-none">{adaptiveGoal.currentGoal.toLocaleString()}</span>
        <span className="text-[11px] text-warm-400 font-medium">steps/day</span>
        <span className="text-[10px] font-bold text-forest-600 ml-auto bg-forest-50 px-2 py-0.5 rounded-full">+{improvement}%</span>
      </div>

      {/* Stat blocks — mixed colors */}
      <div className="flex gap-2.5 text-center">
        <div className="flex-1 bg-cream-100 rounded-[16px] py-3">
          <p className="text-base font-extrabold text-warm-600 tabular-nums">{adaptiveGoal.baseline.toLocaleString()}</p>
          <p className="text-[9px] text-warm-400 font-medium">Baseline</p>
        </div>
        <div className="flex-1 bg-forest-50 rounded-[16px] py-3">
          <p className="text-base font-extrabold text-forest-700 tabular-nums">{adaptiveGoal.currentGoal.toLocaleString()}</p>
          <p className="text-[9px] text-forest-500 font-medium">Current</p>
        </div>
        <div className="flex-1 bg-peach-50 rounded-[16px] py-3">
          <p className="text-base font-extrabold text-peach-600 tabular-nums">10,000</p>
          <p className="text-[9px] text-peach-400 font-medium">Target</p>
        </div>
      </div>

      {/* Mini trend chart */}
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="stepGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A6741" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#4A6741" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="week" hide />
          <ReferenceLine y={7500} stroke="#d4a843" strokeDasharray="3 3" strokeWidth={1} />
          <Area type="monotone" dataKey="steps" stroke="#4A6741" fill="url(#stepGradient)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="goal" stroke="#a39890" fill="none" strokeWidth={1} strokeDasharray="3 3" dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-warm-400 text-center font-medium">
        📈 Avg steps vs. goal · <span className="text-mustard-500 font-bold">7,500 = health zone</span>
      </p>
    </div>
  )
}
