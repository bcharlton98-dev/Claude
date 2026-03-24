import { useState, useRef } from 'react'
import { Plus, ChevronDown, Heart, Sparkles, Mountain, Swords, Map, Target, Flame, Trophy, Users } from 'lucide-react'
import QuestMap from '../components/QuestMap'
import { RankCircle, AvatarCircle, FlameIcon, CheckIcon, ShoeIcon, ClockIcon, WaveIcon, RouteIcon } from '../components/Icons'
import { challenges, dailyQuests, type Challenge, type Participant } from '../data/mockData'

const thumbnailConfig: Record<string, { bg: string; Icon: React.FC<{ size?: number; className?: string }> }> = {
  leaderboard: { bg: 'bg-mustard-400', Icon: Trophy },
  team_leaderboard: { bg: 'bg-peach-500', Icon: Swords },
  virtual_race: { bg: 'bg-forest-600', Icon: Map },
  group_target: { bg: 'bg-lavender-400', Icon: Target },
  streak: { bg: 'bg-peach-500', Icon: Flame },
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
      onClick={(e) => { e.stopPropagation(); if (!hasGiven && !participant.isYou) { setJustGave(true); onKudos() } }}
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

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs text-warm-400 mb-1 font-medium">
        <span>{pct}% complete</span>
        <span className="tabular-nums">{current.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
        <div className="h-full bg-forest-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
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
    <div className="mt-4 space-y-3">
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

function Leaderboard({ participants, sortBy = 'steps' }: { participants: Participant[]; sortBy?: 'steps' | 'streak' }) {
  const sorted = [...participants].sort((a, b) => sortBy === 'streak' ? b.streak - a.streak : b.steps - a.steps)
  return (
    <div className="mt-4 space-y-1">
      {sorted.map((p, i) => (
        <div key={p.name}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all animate-rank ${
            p.isYou ? 'bg-forest-50 ring-1 ring-forest-200' : ''
          }`}
          style={{ animationDelay: `${i * 50}ms` }}
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

function CarouselCard({ challenge, isActive, onClick }: { challenge: Challenge; isActive: boolean; onClick: () => void }) {
  const thumb = thumbnailConfig[challenge.type]
  const yourRank = [...challenge.participants].sort((a, b) => b.steps - a.steps).findIndex(p => p.isYou) + 1

  return (
    <button onClick={onClick}
      className={`flex-shrink-0 w-[260px] rounded-2xl overflow-hidden transition-all btn-press bg-white card-shadow ${
        isActive ? 'ring-2 ring-forest-500' : ''
      }`}
    >
      <div className={`${thumb.bg} px-4 py-3 edge-highlight`}>
        <thumb.Icon size={16} className="text-white/40 absolute top-3 right-3" />
        <p className="text-white text-sm font-bold leading-tight">{challenge.name}</p>
        <p className="text-white/60 text-[10px] font-medium mt-0.5">{typeLabels[challenge.type]}</p>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users size={11} className="text-warm-400" />
            <span className="text-[10px] text-warm-500 font-medium">{challenge.participants.length}</span>
          </div>
          {yourRank > 0 && (
            <span className="text-[10px] font-bold text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full">#{yourRank}</span>
          )}
        </div>
        {challenge.type === 'group_target' && challenge.collectiveGoal && (
          <div className="h-1.5 bg-forest-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-forest-500 rounded-full"
              style={{ width: `${Math.round(((challenge.collectiveProgress || 0) / challenge.collectiveGoal) * 100)}%` }} />
          </div>
        )}
      </div>
    </button>
  )
}

function ChallengeDetail({ challenge }: { challenge: Challenge }) {
  const thumb = thumbnailConfig[challenge.type]
  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className={`${thumb.bg} px-4 py-3 flex items-center gap-3 edge-highlight`}>
        <thumb.Icon size={18} className="text-white" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-white">{challenge.name}</h3>
          <p className="text-white/60 text-[10px] font-medium">{challenge.description}</p>
        </div>
        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
          <Users size={10} className="text-white" />
          <span className="text-[10px] text-white font-medium">{challenge.participants.length}</span>
        </div>
      </div>
      <div className="px-4 pb-4 pt-4">
        {challenge.type === 'virtual_race' && (
          <>
            <QuestMap challenge={challenge} />
            <p className="text-xs font-semibold text-warm-500 mt-4 mb-1">Individual Contributions</p>
            <Leaderboard participants={challenge.participants} />
          </>
        )}
        {challenge.type === 'group_target' && challenge.collectiveGoal && (
          <>
            <ProgressBar current={challenge.collectiveProgress || 0} total={challenge.collectiveGoal} />
            <Leaderboard participants={challenge.participants} />
          </>
        )}
        {challenge.type === 'team_leaderboard' && <TeamLeaderboard participants={challenge.participants} />}
        {challenge.type === 'leaderboard' && <Leaderboard participants={challenge.participants} />}
        {challenge.type === 'streak' && <Leaderboard participants={challenge.participants} sortBy="streak" />}
        <p className="text-[10px] text-warm-300 mt-4 font-medium">
          {new Date(challenge.startDate).toLocaleDateString()} — {new Date(challenge.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

export default function Challenges() {
  const [filter, setFilter] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const filtered = filter === 'all' ? challenges : challenges.filter(c => c.type === filter)
  const selectedChallenge = challenges.find(c => c.id === selectedId)

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'leaderboard', label: 'Board' },
    { key: 'team_leaderboard', label: 'Teams' },
    { key: 'virtual_race', label: 'Race' },
    { key: 'group_target', label: 'Target' },
    { key: 'streak', label: 'Streak' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warm-800 tracking-tight">Quests</h1>
        <button className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center btn-press">
          <Plus size={18} />
        </button>
      </div>

      {/* Daily Quests FIRST — immediate action items */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Daily</p>
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={14} className="text-mustard-400" />
          <h2 className="text-sm font-bold text-warm-700">Daily Quests</h2>
        </div>
        <div className="space-y-2">
          {dailyQuests.map(q => (
            <div key={q.id} className={`bg-white rounded-2xl p-4 flex items-center gap-3 card-shadow ${q.completed ? 'opacity-50' : ''}`}>
              <span className="w-8 flex items-center justify-center shrink-0">
                {q.completed ? <CheckIcon size={20} /> : q.type === 'steps' ? <ShoeIcon size={20} /> : q.type === 'distance' ? <RouteIcon size={20} /> : q.type === 'active_minutes' ? <ClockIcon size={20} /> : <WaveIcon size={20} />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className={`font-semibold text-sm ${q.completed ? 'line-through text-warm-400' : 'text-warm-700'}`}>{q.title}</p>
                  <span className="text-[10px] text-forest-600 font-bold bg-forest-50 px-2 py-0.5 rounded-full">+{q.qpReward}</span>
                </div>
                {!q.completed && (
                  <div className="mt-2 h-1.5 bg-forest-100 rounded-full overflow-hidden">
                    <div className="h-full bg-forest-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((q.current / q.target) * 100, 100)}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-warm-400 mb-4">Challenges</p>

        {/* Neutral filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filterOptions.map(t => (
            <button key={t.key} onClick={() => { setFilter(t.key); setSelectedId(null) }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all btn-press ${
                filter === t.key ? 'bg-forest-600 text-white' : 'bg-cream-100 text-warm-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div ref={carouselRef} className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5 snap-x snap-mandatory mt-2">
          {filtered.map(c => (
            <div key={c.id} className="snap-start">
              <CarouselCard challenge={c} isActive={selectedId === c.id}
                onClick={() => setSelectedId(selectedId === c.id ? null : c.id)} />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-1.5 mt-1">
          {filtered.map(c => (
            <div key={c.id} className={`h-1 rounded-full transition-all ${
              selectedId === c.id ? 'w-4 bg-forest-500' : 'w-1.5 bg-warm-200'
            }`} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-warm-300">
            <Mountain size={32} className="mx-auto text-warm-200 mb-2" />
            <p className="text-sm font-medium">No challenges here yet</p>
            <p className="text-xs text-warm-300 mt-1">Tap + to create one</p>
          </div>
        )}
      </div>

      {/* Detail */}
      {selectedChallenge && (
        <div className="animate-rank">
          <div className="flex items-center gap-2 mb-2">
            <ChevronDown size={14} className="text-warm-400" />
            <p className="text-xs font-semibold text-warm-500">Challenge Details</p>
          </div>
          <ChallengeDetail challenge={selectedChallenge} />
        </div>
      )}

      {/* CTA — solid color, no blobs, no radial gradients */}
      <div className="bg-forest-600 rounded-2xl p-6 text-center shadow-forest edge-highlight">
        <Mountain size={28} className="text-forest-300 mx-auto mb-2" />
        <p className="text-white text-lg font-bold">Commit to My Quest</p>
        <p className="text-forest-200 text-xs mt-1 font-medium">Walk 7,500+ steps every day this week</p>
        <button className="mt-4 bg-white text-forest-700 font-bold text-sm px-6 py-3 rounded-xl btn-press">
          I'm In
        </button>
      </div>
    </div>
  )
}
