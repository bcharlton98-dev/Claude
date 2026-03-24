import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Users } from 'lucide-react'
import QuestMap from '../components/QuestMap'
import { RankCircle, AvatarCircle, FlameIcon } from '../components/Icons'
import { challenges, type Participant } from '../data/mockData'

const thumbnailConfig: Record<string, { bg: string }> = {
  leaderboard: { bg: 'bg-gold-400' },
  team_leaderboard: { bg: 'bg-ember-500' },
  virtual_race: { bg: 'bg-forest-600' },
  group_target: { bg: 'bg-olive-500' },
  streak: { bg: 'bg-ember-400' },
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
      onClick={() => { if (!hasGiven && !participant.isYou) { setJustGave(true); onKudos() } }}
      disabled={participant.isYou}
      className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all btn-press ${
        participant.isYou ? 'bg-cream-100 text-warm-300'
          : hasGiven ? 'bg-rose-50 text-rose-500'
          : 'bg-cream-100 text-warm-400 hover:bg-rose-50 hover:text-rose-500'
      }`}
    >
      <Heart size={10} fill={hasGiven ? 'currentColor' : 'none'} />
      <span>{participant.kudos + (justGave && !participant.kudosFromYou ? 1 : 0)}</span>
    </button>
  )
}

function Leaderboard({ participants, sortBy = 'steps' }: { participants: Participant[]; sortBy?: 'steps' | 'streak' }) {
  const sorted = [...participants].sort((a, b) => sortBy === 'streak' ? b.streak - a.streak : b.steps - a.steps)
  return (
    <div className="space-y-1">
      {sorted.map((p, i) => (
        <div key={p.name}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm ${
            p.isYou ? 'bg-forest-50 ring-1 ring-forest-200' : ''
          }`}
        >
          <RankCircle rank={i + 1} size={24} />
          <AvatarCircle name={p.name} size={28} className={p.isYou ? 'ring-1 ring-forest-300' : ''} />
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-medium block ${p.isYou ? 'text-forest-700' : 'text-warm-700'}`}>
              {p.name} {p.isYou && <span className="text-warm-400">(You)</span>}
            </span>
            {p.streak > 0 && (
              <span className="text-[10px] text-warm-400 font-medium flex items-center gap-0.5">
                <FlameIcon size={9} /> {p.streak}d
              </span>
            )}
          </div>
          <KudosButton participant={p} onKudos={() => {}} />
          <span className="text-sm font-bold text-forest-600 tabular-nums min-w-[65px] text-right flex items-center justify-end gap-1">
            {sortBy === 'streak' ? <><FlameIcon size={11} /> {p.streak}d</> : p.steps.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

function TeamLeaderboard({ participants }: { participants: Participant[] }) {
  const teams: Record<string, { steps: number; members: Participant[] }> = {}
  participants.forEach(p => {
    const team = p.team || 'Unknown'
    if (!teams[team]) teams[team] = { steps: 0, members: [] }
    teams[team].steps += p.steps
    teams[team].members.push(p)
  })
  const sorted = Object.entries(teams).sort((a, b) => b[1].steps - a[1].steps)

  return (
    <div className="space-y-3">
      {sorted.map(([name, data], i) => (
        <div key={name} className={`rounded-xl p-4 ${i === 0 ? 'bg-forest-50' : 'bg-cream-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-warm-700">{name}</span>
            <span className="text-sm font-bold text-forest-600 tabular-nums">{data.steps.toLocaleString()}</span>
          </div>
          <div className="space-y-1">
            {data.members.sort((a, b) => b.steps - a.steps).map(p => (
              <div key={p.name} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-2 ${p.isYou ? 'bg-white' : ''}`}>
                <AvatarCircle name={p.name} size={24} className={p.isYou ? 'ring-1 ring-forest-300' : ''} />
                <span className={`flex-1 font-medium ${p.isYou ? 'text-forest-700' : 'text-warm-600'}`}>
                  {p.name} {p.isYou && <span className="text-warm-400">(You)</span>}
                </span>
                <KudosButton participant={p} onKudos={() => {}} />
                <span className="tabular-nums font-bold text-forest-600">{p.steps.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const challenge = challenges.find(c => c.id === id)

  if (!challenge) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-warm-400">Challenge not found</p>
        <button onClick={() => navigate('/challenges')} className="text-sm font-bold text-forest-500 mt-2 btn-press">Back to Challenges</button>
      </div>
    )
  }

  const thumb = thumbnailConfig[challenge.type] || { bg: 'bg-forest-600' }
  const pct = challenge.collectiveGoal ? Math.round(((challenge.collectiveProgress || 0) / challenge.collectiveGoal) * 100) : null

  return (
    <div className="-mx-5 -mt-6 min-h-screen bg-cream-50">
      {/* Header */}
      <div className={`${thumb.bg} px-5 pt-5 pb-6 edge-highlight`}>
        <button onClick={() => navigate('/challenges')} className="flex items-center gap-2 text-white/70 mb-4 btn-press">
          <ArrowLeft size={18} />
          <span className="text-xs font-medium">Challenges</span>
        </button>
        <h1 className="text-xl font-bold text-white">{challenge.name}</h1>
        <p className="text-xs text-white/50 font-medium mt-1">{challenge.description}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full">
            <Users size={12} className="text-white" />
            <span className="text-xs text-white font-medium">{challenge.participants.length}</span>
          </div>
          <span className="text-xs text-white/40 font-medium">{typeLabels[challenge.type]}</span>
          <span className="text-xs text-white/40 font-medium">
            {new Date(challenge.startDate).toLocaleDateString()} — {new Date(challenge.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5 space-y-5">
        {/* Progress bar for group targets */}
        {challenge.type === 'group_target' && challenge.collectiveGoal && (
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="flex justify-between text-xs text-warm-400 mb-1 font-medium">
              <span>{pct}% complete</span>
              <span className="tabular-nums">{(challenge.collectiveProgress || 0).toLocaleString()} / {challenge.collectiveGoal.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-forest-100 rounded-full overflow-hidden">
              <div className="h-full bg-forest-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Map for virtual races */}
        {challenge.type === 'virtual_race' && (
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <QuestMap challenge={challenge} />
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h2 className="text-sm font-bold text-warm-700 mb-3">
            {challenge.type === 'team_leaderboard' ? 'Teams' : 'Leaderboard'}
          </h2>
          {challenge.type === 'team_leaderboard' ? (
            <TeamLeaderboard participants={challenge.participants} />
          ) : (
            <Leaderboard participants={challenge.participants} sortBy={challenge.type === 'streak' ? 'streak' : 'steps'} />
          )}
        </div>
      </div>

      <div className="h-24" />
    </div>
  )
}
