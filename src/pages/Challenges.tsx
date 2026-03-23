import { useState } from 'react'
import { Trophy, Users, Target, Flame, Plus, Crown, ChevronRight } from 'lucide-react'
import { challenges, type Challenge } from '../data/mockData'

const typeIcons: Record<string, any> = {
  leaderboard: Trophy,
  collective: Users,
  streak: Flame,
  target: Target,
  teams: Users,
}

const typeColors: Record<string, string> = {
  leaderboard: 'bg-amber-500',
  collective: 'bg-blue-500',
  streak: 'bg-orange-500',
  target: 'bg-emerald-500',
  teams: 'bg-purple-500',
}

function CollectiveProgress({ challenge }: { challenge: Challenge }) {
  const pct = Math.round(((challenge.collectiveProgress || 0) / (challenge.collectiveGoal || 1)) * 100)
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Team Progress</span>
        <span>{(challenge.collectiveProgress || 0).toLocaleString()} / {(challenge.collectiveGoal || 0).toLocaleString()}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-blue-600 font-semibold mt-1">{pct}% complete</p>
    </div>
  )
}

function Leaderboard({ participants }: { participants: Challenge['participants'] }) {
  const sorted = [...participants].sort((a, b) => b.steps - a.steps)
  return (
    <div className="mt-3 space-y-1.5">
      {sorted.map((p, i) => (
        <div
          key={p.name}
          className={`flex items-center gap-2.5 p-2 rounded-lg text-sm ${
            p.isYou ? 'bg-emerald-50 border border-emerald-200' : ''
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {i === 0 ? <Crown size={12} /> : i + 1}
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
            {p.avatar}
          </div>
          <span className={`flex-1 font-medium ${p.isYou ? 'text-emerald-700' : 'text-slate-700'}`}>
            {p.name} {p.isYou && <span className="text-xs text-emerald-500">(You)</span>}
          </span>
          <span className="text-sm font-semibold text-slate-600">{p.steps.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = typeIcons[challenge.type]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${typeColors[challenge.type]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{challenge.name}</h3>
            <ChevronRight size={16} className={`text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{challenge.description}</p>
          <div className="flex gap-3 mt-1.5">
            <span className="text-xs text-slate-400">{challenge.participants.length} participants</span>
            <span className="text-xs text-slate-400 capitalize">{challenge.type}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              challenge.mode === 'private' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {challenge.mode}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          {challenge.type === 'collective' && <CollectiveProgress challenge={challenge} />}
          <Leaderboard participants={challenge.participants} />
          <p className="text-xs text-slate-400 mt-3">
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
        <h1 className="text-xl font-bold text-slate-800">Challenges</h1>
        <button className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors">
          <Plus size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['all', 'leaderboard', 'collective', 'streak', 'target'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === t
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenge List */}
      <div className="space-y-3">
        {filtered.map(c => (
          <ChallengeCard key={c.id} challenge={c} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Trophy size={40} className="mx-auto mb-2 opacity-50" />
          <p>No challenges in this category</p>
        </div>
      )}
    </div>
  )
}
