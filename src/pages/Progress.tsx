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
    <div className="space-y-0">
      <h1 className="text-xl font-bold text-warm-800 tracking-tight mb-6">Progress</h1>

      {/* Streak — full width, no section label needed, it IS the hero */}
      <StreakPanel />

      {/* Week — tonal cream band for visual break */}
      <div className="-mx-5 px-5 py-6 mt-6 bg-cream-100">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">This Week</p>
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weeklyStepData} barCategoryGap="18%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9E9284', fontWeight: 600 }} />
              <ReferenceLine y={HEALTH_ZONE} stroke="#D4A050" strokeDasharray="3 3" label={{ value: '7.5k', fontSize: 9, fill: '#D4A050', position: 'right' }} />
              <ReferenceLine y={10000} stroke="#E5D9C8" strokeDasharray="3 3" />
              <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
                {weeklyStepData.map((entry, i) => (
                  <Cell key={i} fill={entry.steps >= 10000 ? '#2D5E3B' : entry.steps >= HEALTH_ZONE ? '#7E8E4E' : '#D6C9B5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2">
            <span className="text-xs text-warm-400 font-medium leading-tight flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-forest-500 inline-block" /> Goal</span>
            <span className="text-xs text-warm-400 font-medium leading-tight flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-olive-400 inline-block" /> Health zone</span>
            <span className="text-xs text-warm-400 font-medium leading-tight flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cream-300 inline-block" /> Below</span>
          </div>
        </div>

        {/* Heatmap — compact, same cream band */}
        <div className="bg-white rounded-2xl card-shadow p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-warm-700">Last 28 Days</p>
            <p className="text-xs text-warm-400 font-medium leading-tight">step intensity</p>
          </div>
          <StepHeatmap />
        </div>
      </div>

      {/* Goals — back to page bg */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Goals</p>
        <AdaptiveGoalCard />
      </div>

      {/* Title — dark card block for contrast */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Title</p>
        <div className="bg-forest-600 rounded-2xl p-4 shadow-forest edge-highlight">
          <ProgressPath lifetimeMiles={userProfile.lifetimeMiles} dark />
        </div>
      </div>

      {/* Habits */}
      {activeStacks.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Habits</p>
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-warm-700 flex items-center gap-1.5">
                <LinkIcon size={14} /> Habit Stacks
              </h2>
              <span className="text-xs text-warm-400 font-medium">0/{activeStacks.length} today</span>
            </div>
            <div className="space-y-2">
              {activeStacks.map(h => (
                <div key={h.id} className="flex items-center gap-3 bg-cream-50 rounded-xl px-4 py-3 border-l-3 border-forest-400">
                  <HabitIcon icon={h.icon} size={18} />
                  <p className="text-sm text-warm-600 font-medium">
                    <span className="font-bold text-warm-700">{h.anchor}</span>, {h.habit}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-warm-400 mt-3 text-center">Build your routine</p>
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  )
}
