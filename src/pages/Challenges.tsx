import { useState } from 'react'
import { Plus, ChevronRight, Crown, Heart } from 'lucide-react'
import QuestMap from '../components/QuestMap'
import { challenges, type Challenge, type Participant } from '../data/mockData'

const typeConfig: Record<string, { icon: string; color: string }> = {
  leaderboard: { icon: '🏆', color: 'bg-mustard-400' },
  team_leaderboard: { icon: '⚔️', color: 'bg-peach-400' },
  virtual_race: { icon: '🗺️', color: 'bg-sage-400' },
  group_target: { icon: '🎯', color: 'bg-lavender-400' },
  streak: { icon: '🔥', color: 'bg-peach-500' },
}

const typeLabels: Record<string, string> = {
  leaderboard: 'Leaderboard',
  team_leaderboard: 'Team Battle',
  virtual_race: 'Virtual Race',
  group_target: 'Group Target',
  streak: 'Streak',
}

function KudosButton({ participant, onKudos }: { participant: Participant; onKudos: () => void }) {
  const [justGave, setJustGave] = useState(false)
  const hasGiven = participant.kudosFromYou || justGave

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (!hasGiven && !participant.isYou) {
          setJustGave(true)
          onKudos()
        }
      }}
      disabled={participant.isYou}
      className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all btn-press ${
        participant.isYou
          ? 'bg-cream-100 text-warm-300'
          : hasGiven
          ? 'bg-rose-50 text-rose-500'
          : 'bg-cream-100 text-warm-400 hover:bg-rose-50 hover:text-rose-400'
      }`}
    >
      <Heart size={10} fill={hasGiven ? 'currentColor' : 'none'} />
      <span>{participant.kudos + (justGave && !participant.kudosFromYou ? 1 : 0)}</span>
    </button>
  )
}

function ProgressBar({ current, total, color = 'bg-sage-500' }: { current: number; total: number; color?: string }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div>
      <div className="flex justify-between text-[11px] text-warm-400 mb-1.5 font-semibold">
        <span>{pct}% complete</span>
        <span className="tabular-nums">{current.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-cream-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
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
    <div className="mt-4 space-y-3">
      {sorted.map(([name, data], i) => (
        <div key={name} className="bg-cream-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-bold text-sm text-warm-700">
              {i === 0 ? '👑 ' : ''}{name}
            </span>
            <span className="text-sm font-extrabold text-warm-600 tabular-nums">{data.steps.toLocaleString()}</span>
          </div>
          <div className="space-y-1.5">
            {data.members.sort((a, b) => b.steps - a.steps).map(p => (
              <div key={p.name} className={`flex items-center gap-2.5 text-xs ${p.isYou ? 'text-sage-700 font-bold' : 'text-warm-500'}`}>
                <span className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center text-[10px] font-bold text-warm-500">{p.avatar}</span>
                <span className="flex-1">{p.name} {p.isYou && '(You)'}</span>
                <KudosButton participant={p} onKudos={() => {}} />
                <span className="tabular-nums font-semibold">{p.steps.toLocaleString()}</span>
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
    <div className="mt-4 space-y-1.5">
      {sorted.map((p, i) => (
        <div
          key={p.name}
          className={`flex items-center gap-2.5 p-3 rounded-2xl text-sm transition-all ${
            p.isYou ? 'bg-sage-50 ring-1 ring-sage-200' : i < 3 ? 'bg-cream-50' : ''
          }`}
        >
          <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-[10px] font-extrabold ${
            i === 0 ? 'bg-mustard-400 text-white' : i === 1 ? 'bg-warm-300 text-white' : i === 2 ? 'bg-peach-400 text-white' : 'bg-cream-100 text-warm-500'
          }`}>
            {i === 0 ? <Crown size={11} /> : i + 1}
          </span>
          <span className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center text-xs font-bold text-warm-500">
            {p.avatar}
          </span>
          <span className={`flex-1 text-xs font-semibold ${p.isYou ? 'text-sage-700' : 'text-warm-600'}`}>
            {p.name} {p.isYou && <span className="text-sage-400 font-bold">(You)</span>}
          </span>
          <KudosButton participant={p} onKudos={() => {}} />
          <span className="text-xs font-extrabold text-warm-600 tabular-nums">
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
    <div className="bg-white rounded-3xl card-shadow overflow-hidden card-hover">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start gap-3.5 text-left btn-press"
      >
        <span className="text-2xl w-9 text-center shrink-0">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-warm-800">{challenge.name}</h3>
            <ChevronRight size={16} className={`text-warm-300 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </div>
          <p className="text-xs text-warm-400 mt-0.5 font-medium">{challenge.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] text-warm-400 font-semibold">👥 {challenge.participants.length}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              challenge.mode === 'private' ? 'bg-cream-100 text-warm-400' : 'bg-sage-50 text-sage-600'
            }`}>
              {challenge.mode}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream-100 text-warm-400 font-semibold">
              {typeLabels[challenge.type]}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-cream-100 pt-4">
          {challenge.type === 'virtual_race' && (
            <>
              <QuestMap challenge={challenge} />
              <p className="text-xs font-bold text-warm-500 mt-4 mb-1">Individual Contributions</p>
              <Leaderboard participants={challenge.participants} />
            </>
          )}
          {challenge.type === 'group_target' && challenge.collectiveGoal && (
            <>
              <ProgressBar current={challenge.collectiveProgress || 0} total={challenge.collectiveGoal} color="bg-sage-500" />
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
          <p className="text-[10px] text-warm-300 mt-4 font-medium">
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-warm-800 tracking-tight">Quests</h1>
        <button className="w-10 h-10 rounded-2xl bg-gradient-to-br from-peach-400 to-peach-600 text-white flex items-center justify-center shadow-lg btn-press hover:shadow-xl transition-shadow">
          <Plus size={20} />
        </button>
      </div>

      {/* Pill Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all btn-press ${
              filter === t.key
                ? 'bg-gradient-to-r from-peach-400 to-peach-500 text-white shadow-md animate-pill'
                : 'bg-white text-warm-400 hover:text-warm-600 card-shadow'
            }`}
          >
            {t.icon} {t.label}
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
        <div className="text-center py-16 text-warm-300">
          <p className="text-4xl mb-3">🏜️</p>
          <p className="text-sm font-semibold">No challenges here yet</p>
          <p className="text-xs text-warm-300 mt-1">Tap + to create one</p>
        </div>
      )}
    </div>
  )
}
