import { useState } from 'react'
import { Plus, ChevronRight, Crown } from 'lucide-react'
import { challenges, type Challenge, type Participant } from '../data/mockData'

const typeConfig: Record<string, { icon: string; color: string }> = {
  leaderboard: { icon: '🏆', color: 'bg-gold-500' },
  team_leaderboard: { icon: '⚔️', color: 'bg-rose-500' },
  virtual_race: { icon: '🗺️', color: 'bg-sky-500' },
  group_target: { icon: '🎯', color: 'bg-brand-500' },
  streak: { icon: '🔥', color: 'bg-fire-500' },
}

const typeLabels: Record<string, string> = {
  leaderboard: 'Leaderboard',
  team_leaderboard: 'Team Battle',
  virtual_race: 'Virtual Race',
  group_target: 'Group Target',
  streak: 'Streak',
}

function ProgressBar({ current, total, color = 'bg-sky-500' }: { current: number; total: number; color?: string }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-medium">
        <span>{pct}% complete</span>
        <span>{current.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function VirtualRaceMap({ challenge }: { challenge: Challenge }) {
  const waypoints = challenge.waypoints || []
  const pct = ((challenge.raceProgress || 0) / (challenge.raceDistance || 1)) * 100

  return (
    <div className="mt-3 bg-slate-50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-600">🗺️ {challenge.raceName}</span>
        <span className="text-xs text-sky-600 font-bold">{(challenge.raceProgress || 0).toLocaleString()} / {(challenge.raceDistance || 0).toLocaleString()} mi</span>
      </div>
      {/* Route visualization */}
      <div className="relative h-8 mb-2">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 rounded-full -translate-y-1/2" />
        <div className="absolute top-1/2 left-0 h-1 bg-sky-400 rounded-full -translate-y-1/2 transition-all" style={{ width: `${pct}%` }} />
        {/* Runner marker */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-lg transition-all" style={{ left: `${pct}%` }}>
          🏃
        </div>
        {/* Start & End */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-sm">📍</div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 text-sm">🏁</div>
      </div>
      {/* Waypoints */}
      <div className="space-y-1 mt-3">
        {waypoints.map((wp, i) => (
          <div key={i} className={`flex items-center gap-2 text-xs ${wp.reached ? 'text-slate-600' : 'text-slate-300'}`}>
            <span>{wp.reached ? '✅' : '⬜'}</span>
            <span className={wp.reached ? 'font-medium' : ''}>{wp.name}</span>
            <span className="ml-auto text-[10px]">{wp.mile} mi</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamLeaderboard({ participants }: { participants: Participant[] }) {
  const teams = new Map<string, { steps: number; members: Participant[] }>()
  participants.forEach(p => {
    const team = p.team || 'Unknown'
    if (!teams.has(team)) teams.set(team, { steps: 0, members: [] })
    const t = teams.get(team)!
    t.steps += p.steps
    t.members.push(p)
  })
  const sorted = [...teams.entries()].sort((a, b) => b[1].steps - a[1].steps)

  return (
    <div className="mt-3 space-y-3">
      {sorted.map(([name, data], i) => (
        <div key={name} className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-slate-700">
              {i === 0 ? '👑 ' : ''}{name}
            </span>
            <span className="text-sm font-bold text-slate-600">{data.steps.toLocaleString()} steps</span>
          </div>
          <div className="space-y-1">
            {data.members.sort((a, b) => b.steps - a.steps).map(p => (
              <div key={p.name} className={`flex items-center gap-2 text-xs ${p.isYou ? 'text-brand-700 font-semibold' : 'text-slate-500'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-500">{p.avatar}</span>
                <span className="flex-1">{p.name} {p.isYou && '(You)'}</span>
                <span>{p.steps.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Leaderboard({ participants, sortBy = 'steps' }: { participants: Participant[]; sortBy?: 'steps' | 'streak' }) {
  const sorted = [...participants].sort((a, b) => sortBy === 'streak' ? b.streak - a.streak : b.steps - a.steps)
  return (
    <div className="mt-3 space-y-1">
      {sorted.map((p, i) => (
        <div
          key={p.name}
          className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
            p.isYou ? 'bg-brand-50' : ''
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            i === 0 ? 'bg-gold-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-fire-400 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {i === 0 ? <Crown size={10} /> : i + 1}
          </span>
          <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-500">
            {p.avatar}
          </span>
          <span className={`flex-1 text-xs font-medium ${p.isYou ? 'text-brand-700' : 'text-slate-600'}`}>
            {p.name} {p.isYou && <span className="text-brand-400">(You)</span>}
          </span>
          <span className="text-xs font-bold text-slate-600">
            {sortBy === 'streak' ? `🔥 ${p.streak}d` : p.steps.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = typeConfig[challenge.type]

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3.5 flex items-start gap-3 text-left"
      >
        <span className="text-2xl w-8 text-center shrink-0">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-800">{challenge.name}</h3>
            <ChevronRight size={14} className={`text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{challenge.description}</p>
          <div className="flex gap-2 mt-1.5">
            <span className="text-[10px] text-slate-400 font-medium">👥 {challenge.participants.length}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              challenge.mode === 'private' ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-600'
            }`}>
              {challenge.mode}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-400 font-medium">
              {typeLabels[challenge.type]}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 border-t border-slate-50 pt-3">
          {challenge.type === 'virtual_race' && (
            <>
              <VirtualRaceMap challenge={challenge} />
              <p className="text-xs font-semibold text-slate-500 mt-3 mb-1">Individual Contributions</p>
              <Leaderboard participants={challenge.participants} />
            </>
          )}
          {challenge.type === 'group_target' && challenge.collectiveGoal && (
            <>
              <ProgressBar current={challenge.collectiveProgress || 0} total={challenge.collectiveGoal} color="bg-brand-500" />
              <Leaderboard participants={challenge.participants} />
            </>
          )}
          {challenge.type === 'team_leaderboard' && (
            <TeamLeaderboard participants={challenge.participants} />
          )}
          {challenge.type === 'leaderboard' && (
            <Leaderboard participants={challenge.participants} />
          )}
          {challenge.type === 'streak' && (
            <Leaderboard participants={challenge.participants} sortBy="streak" />
          )}
          <p className="text-[10px] text-slate-300 mt-3">
            {new Date(challenge.startDate).toLocaleDateString()} — {new Date(challenge.endDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default function Challenges() {
  const [filter, setFilter] = useState<string>('all')
  const filtered = filter === 'all' ? challenges : challenges.filter(c => c.type === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Challenges</h1>
        <button className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md hover:bg-brand-600 transition-colors">
          <Plus size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'all', label: 'All', icon: '✨' },
          { key: 'leaderboard', label: 'Board', icon: '🏆' },
          { key: 'team_leaderboard', label: 'Teams', icon: '⚔️' },
          { key: 'virtual_race', label: 'Race', icon: '🗺️' },
          { key: 'group_target', label: 'Target', icon: '🎯' },
          { key: 'streak', label: 'Streak', icon: '🔥' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
              filter === t.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Challenge List */}
      <div className="space-y-2">
        {filtered.map(c => (
          <ChallengeCard key={c.id} challenge={c} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-300">
          <p className="text-3xl mb-2">🏜️</p>
          <p className="text-sm">No challenges here yet</p>
        </div>
      )}
    </div>
  )
}
