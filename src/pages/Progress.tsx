import { TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import StreakPanel from '../components/StreakPanel'
import AdaptiveGoalCard from '../components/AdaptiveGoalCard'
import ProgressPath from '../components/ProgressPath'
import StepHeatmap from '../components/StepHeatmap'
import { LinkIcon, HabitIcon } from '../components/Icons'
import { userProfile, weeklyStepData, habitStacks } from '../data/mockData'

const HEALTH_ZONE = 7_500

export default function Progress() {
  const activeStacks = habitStacks.filter(h => h.active)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-warm-800 tracking-tight">Progress</h1>

      {/* Streak first — highest engagement */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Streak</p>
        <StreakPanel />
      </div>

      {/* This Week */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Week</p>
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-warm-700 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-forest-500" /> This Week
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyStepData} barCategoryGap="20%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a39890', fontWeight: 600 }} />
              <ReferenceLine y={HEALTH_ZONE} stroke="#d4a843" strokeDasharray="3 3" label={{ value: '7.5k', fontSize: 9, fill: '#d4a843', position: 'right' }} />
              <ReferenceLine y={10000} stroke="#e8e0d4" strokeDasharray="3 3" />
              <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
                {weeklyStepData.map((entry, i) => (
                  <Cell key={i} fill={entry.steps >= 10000 ? '#4A6741' : entry.steps >= HEALTH_ZONE ? '#aec2a0' : '#D4C5A9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-[10px] text-warm-400 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-forest-500 inline-block" /> Goal</span>
            <span className="text-[10px] text-warm-400 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#aec2a0' }} /> Health zone</span>
            <span className="text-[10px] text-warm-400 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#D4C5A9' }} /> Below</span>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-2xl card-shadow p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-warm-700">Last 28 Days</p>
            <p className="text-[10px] text-warm-400 font-medium">step intensity</p>
          </div>
          <StepHeatmap />
        </div>
      </div>

      {/* Goals */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Goals</p>
        <AdaptiveGoalCard />
      </div>

      {/* Title */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Title</p>
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <ProgressPath lifetimeMiles={userProfile.lifetimeMiles} />
        </div>
      </div>

      {/* Habits */}
      {activeStacks.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Habits</p>
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <h2 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5">
              <LinkIcon size={14} /> Habit Stacks
            </h2>
            <div className="space-y-2">
              {activeStacks.map(h => (
                <div key={h.id} className="flex items-center gap-3 bg-cream-50 rounded-xl px-4 py-3">
                  <HabitIcon icon={h.icon} size={16} />
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
        </div>
      )}
    </div>
  )
}
