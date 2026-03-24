import { TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import StreakPanel from '../components/StreakPanel'
import AdaptiveGoalCard from '../components/AdaptiveGoalCard'
import QPBar from '../components/XPBar'
import { userProfile, weeklyStepData, habitStacks } from '../data/mockData'

const HEALTH_ZONE = 7_500

export default function Progress() {
  const activeStacks = habitStacks.filter(h => h.active)

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-warm-800 tracking-tight">Progress</h1>

      {/* QP / Level Bar — forest green badge */}
      <div className="bg-white rounded-[22px] p-4.5 card-shadow grain relative overflow-hidden">
        <QPBar current={userProfile.qp} max={userProfile.qpToNextLevel} level={userProfile.level} />
      </div>

      {/* Streak — now a warm color block */}
      <StreakPanel />

      {/* Weekly Chart — with colored background */}
      <div className="bg-gradient-to-br from-sage-50 to-cream-50 rounded-[22px] p-5 card-shadow relative overflow-hidden color-block">
        <div className="flex items-center justify-between mb-3 relative">
          <h2 className="text-sm font-bold text-warm-700 flex items-center gap-1.5">
            <TrendingUp size={15} className="text-forest-500" /> This Week
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyStepData} barCategoryGap="20%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a39890', fontWeight: 600 }} />
            <ReferenceLine y={HEALTH_ZONE} stroke="#d4a843" strokeDasharray="3 3" label={{ value: '7.5k', fontSize: 9, fill: '#d4a843', position: 'right' }} />
            <ReferenceLine y={10000} stroke="#e8e0d4" strokeDasharray="3 3" />
            <Bar dataKey="steps" radius={[8, 8, 0, 0]}>
              {weeklyStepData.map((entry, i) => (
                <Cell key={i} fill={entry.steps >= 10000 ? '#4A6741' : entry.steps >= HEALTH_ZONE ? '#aec2a0' : '#e8e0d4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 relative">
          <span className="text-[9px] text-warm-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-forest-500 inline-block" /> Goal</span>
          <span className="text-[9px] text-warm-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sage-300 inline-block" /> Health zone</span>
          <span className="text-[9px] text-warm-400 font-semibold flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cream-200 inline-block" /> Below</span>
        </div>
      </div>

      {/* Adaptive Goal */}
      <AdaptiveGoalCard />

      {/* Habit Stacks */}
      {activeStacks.length > 0 && (
        <div className="bg-gradient-to-br from-mustard-50 to-cream-50 rounded-[22px] p-5 card-shadow relative overflow-hidden color-block">
          <h2 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5 relative">
            🔗 Habit Stacks
          </h2>
          <div className="space-y-2 relative">
            {activeStacks.map(h => (
              <div key={h.id} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-[18px] px-4 py-3.5 card-hover">
                <span className="text-lg">{h.icon}</span>
                <p className="text-xs text-warm-600 font-medium">
                  <span className="font-bold text-warm-700">{h.anchor}</span>, {h.habit}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-warm-400 mt-3 text-center font-medium relative">
            Habit stacking increases success by 64%
          </p>
        </div>
      )}
    </div>
  )
}
