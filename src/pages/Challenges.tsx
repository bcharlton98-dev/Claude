import { useState } from 'react'
import { Plus, ChevronRight, Crown, Heart, Sparkles, Mountain, Swords, Map, Target, Flame, Trophy, Users } from 'lucide-react'
import QuestMap from '../components/QuestMap'
import { challenges, dailyQuests, type Challenge, type Participant } from '../data/mockData'

/* ── Thumbnail config per challenge type ── */
const thumbnailConfig: Record<string, { gradient: string; Icon: React.FC<{ size?: number; className?: string }>; iconColor: string }> = {
  leaderboard: { gradient: 'from-mustard-400 to-mustard-500', Icon: Trophy, iconColor: 'text-white' },
  team_leaderboard: { gradient: 'from-peach-400 to-peach-600', Icon: Swords, iconColor: 'text-white' },
  virtual_race: { gradient: 'from-forest-400 to-forest-600', Icon: Map, iconColor: 'text-white' },
  group_target: { gradient: 'from-lavender-400 to-lavender-600', Icon: Target, iconColor: 'text-white' },
  streak: { gradient: 'from-peach-500 to-rose-500', Icon: Flame, iconColor: 'text-white' },
}

const typeLabels: Record<string, string> = {
  leaderboard: 'Leaderboard',
  team_leaderboard: 'Team Battle',
  virtual_race: 'Virtual Race',
  group_target: 'Group Target',
  streak: 'Streak',
}

/* ── Filter pill colors — each a different soft color ── */
const filterPillColors: Record<string, { active: string; icon: React.FC<{ size?: number; className?: string }> | null; emoji?: string }> = {
  all: { active: 'bg-forest-500 text-white shadow-md', icon: null, emoji: '✨' },
  leaderboard: { active: 'bg-mustard-400 text-white shadow-md', icon: Trophy },
  team_leaderboard: { active: 'bg-peach-400 text-white shadow-md', icon: Swords },
  virtual_race: { active: 'bg-forest-400 text-white shadow-md', icon: Map },
  group_target: { active: 'bg-lavender-400 text-white shadow-md', icon: Target },
  streak: { active: 'bg-peach-500 text-white shadow-md', icon: Flame },
}

const filterPillInactiveColors: Record<string, string> = {
  all: 'bg-cream-100 text-warm-500',
  leaderboard: 'bg-mustard-50 text-mustard-600',
  team_leaderboard: 'bg-peach-50 text-peach-600',
  virtual_race: 'bg-forest-50 text-forest-600',
  group_target: 'bg-lavender-50 text-lavender-600',
  streak: 'bg-peach-50 text-peach-600',
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

function ProgressBar({ current, total, color = 'bg-forest-500' }: { current: number; total: number; color?: string }) {
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
        <div key={name} className={`rounded-[20px] p-4 ${i === 0 ? 'bg-gradient-to-br from-mustard-50 to-cream-50' : 'bg-cream-50'}`}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-bold text-sm text-warm-700">
              {i === 0 ? '👑 ' : ''}{name}
            </span>
            <span className="text-sm font-extrabold text-forest-600 tabular-nums">{data.steps.toLocaleString()}</span>
          </div>
          <div className="space-y-1.5">
            {data.members.sort((a, b) => b.steps - a.steps).map(p => (
              <div key={p.name} className={`flex items-center gap-2.5 text-xs rounded-[14px] px-2.5 py-2 ${
                p.isYou ? 'bg-forest-50/60' : ''
              }`}>
                {/* Avatar circle with initials */}
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                  p.isYou ? 'bg-forest-500' : 'bg-warm-400'
                }`}>{p.avatar}</span>
                <span className={`flex-1 font-semibold ${p.isYou ? 'text-forest-700' : 'text-warm-600'}`}>
                  {p.name} {p.isYou && <span className="text-forest-400 font-bold">(You)</span>}
                </span>
                <KudosButton participant={p} onKudos={() => {}} />
                <span className="tabular-nums font-extrabold text-forest-600">{p.steps.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Competitive Leaderboard — the big upgrade ── */
function Leaderboard({ participants, sortBy = 'steps' }: { participants: Participant[]; sortBy?: 'steps' | 'streak' }) {
  const sorted = [...participants].sort((a, b) => sortBy === 'streak' ? b.streak - a.streak : b.steps - a.steps)

  const rankColors = [
    'bg-gradient-to-br from-mustard-300 to-mustard-500 text-white shadow-md', // Gold
    'bg-gradient-to-br from-warm-300 to-warm-400 text-white shadow-sm', // Silver
    'bg-gradient-to-br from-peach-300 to-peach-500 text-white shadow-sm', // Bronze
  ]

  const avatarColors = [
    'bg-mustard-400 text-white',
    'bg-warm-400 text-white',
    'bg-peach-400 text-white',
    'bg-sage-400 text-white',
    'bg-lavender-400 text-white',
    'bg-forest-400 text-white',
  ]

  return (
    <div className="mt-4 space-y-1">
      {sorted.map((p, i) => (
        <div
          key={p.name}
          className={`flex items-center gap-3 px-3 py-3 rounded-[18px] text-sm transition-all animate-rank ${
            p.isYou
              ? 'bg-gradient-to-r from-forest-50 to-sage-50 ring-1 ring-forest-200'
              : i < 3 ? 'bg-cream-50/70' : ''
          }`}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {/* Rank circle — gold/silver/bronze/grey */}
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
            i < 3 ? rankColors[i] : 'bg-cream-200 text-warm-500'
          }`}>
            {i === 0 ? <Crown size={13} /> : i + 1}
          </span>

          {/* Avatar circle with colored initials */}
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            p.isYou ? 'bg-forest-500 text-white ring-2 ring-forest-300' : avatarColors[i % avatarColors.length]
          }`}>
            {p.avatar}
          </span>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-semibold block ${p.isYou ? 'text-forest-700' : 'text-warm-700'}`}>
              {p.name} {p.isYou && <span className="text-forest-400 font-bold">(You)</span>}
            </span>
            {p.streak > 0 && (
              <span className="text-[10px] text-warm-400 font-medium">🔥 {p.streak}d streak</span>
            )}
          </div>

          <KudosButton participant={p} onKudos={() => {}} />

          {/* Step count in bold brand color */}
          <span className="text-sm font-extrabold text-forest-600 tabular-nums min-w-[70px] text-right">
            {sortBy === 'streak' ? `🔥 ${p.streak}d` : p.steps.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Challenge Card with Illustrated Thumbnail ── */
function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [expanded, setExpanded] = useState(false)
  const thumb = thumbnailConfig[challenge.type]

  return (
    <div className="bg-white rounded-[22px] card-shadow overflow-hidden card-hover">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3.5 text-left btn-press"
      >
        {/* Illustrated Thumbnail — gradient block with icon */}
        <div className={`w-14 h-14 rounded-[16px] bg-gradient-to-br ${thumb.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
          <thumb.Icon size={26} className={thumb.iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-warm-800 leading-tight">{challenge.name}</h3>
            <ChevronRight size={16} className={`text-warm-300 transition-transform duration-200 shrink-0 ml-1 ${expanded ? 'rotate-90' : ''}`} />
          </div>
          <p className="text-xs text-warm-400 mt-0.5 font-medium line-clamp-1">{challenge.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] text-warm-400 font-semibold flex items-center gap-0.5">
              <Users size={10} /> {challenge.participants.length}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              challenge.mode === 'private' ? 'bg-cream-100 text-warm-400' : 'bg-forest-50 text-forest-600'
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
        <div className="px-4 pb-5 border-t border-cream-100 pt-4">
          {challenge.type === 'virtual_race' && (
            <>
              <QuestMap challenge={challenge} />
              <p className="text-xs font-bold text-warm-500 mt-4 mb-1">Individual Contributions</p>
              <Leaderboard participants={challenge.participants} />
            </>
          )}
          {challenge.type === 'group_target' && challenge.collectiveGoal && (
            <>
              <ProgressBar current={challenge.collectiveProgress || 0} total={challenge.collectiveGoal} color="bg-forest-500" />
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
        {/* Quest center floating button — forest green */}
        <button className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-forest-400 to-forest-600 text-white flex items-center justify-center shadow-lg btn-press hover:shadow-xl transition-shadow">
          <Plus size={20} />
        </button>
      </div>

      {/* ── Colored Filter Pills — each a different soft color ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'all', label: 'All' },
          { key: 'leaderboard', label: 'Board' },
          { key: 'team_leaderboard', label: 'Teams' },
          { key: 'virtual_race', label: 'Race' },
          { key: 'group_target', label: 'Target' },
          { key: 'streak', label: 'Streak' },
        ].map(t => {
          const pillCfg = filterPillColors[t.key]
          const PillIcon = pillCfg.icon
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3.5 py-2 rounded-[14px] text-xs font-bold whitespace-nowrap transition-all btn-press flex items-center gap-1.5 ${
                filter === t.key
                  ? `${pillCfg.active} animate-pill`
                  : filterPillInactiveColors[t.key]
              }`}
            >
              {PillIcon ? <PillIcon size={12} /> : pillCfg.emoji}{' '}{t.label}
            </button>
          )
        })}
      </div>

      {/* ── Challenge List ── */}
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

      {/* ── Daily Quests ── */}
      <div>
        <h2 className="text-base font-bold text-warm-700 mb-3 flex items-center gap-1.5">
          <Sparkles size={16} className="text-mustard-400" /> Daily Quests
        </h2>
        <div className="space-y-2">
          {dailyQuests.map(q => (
            <div
              key={q.id}
              className={`bg-white rounded-[20px] p-4 flex items-center gap-3.5 card-shadow card-hover ${
                q.completed ? 'opacity-60' : ''
              }`}
            >
              <span className="text-2xl w-10 text-center">
                {q.completed ? '✅' : q.type === 'steps' ? '👟' : q.type === 'distance' ? '🗺️' : q.type === 'active_minutes' ? '⏱️' : '👋'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className={`font-bold text-sm ${q.completed ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                    {q.title}
                  </p>
                  <span className="text-[11px] text-forest-600 font-extrabold bg-forest-50 px-2 py-0.5 rounded-full">+{q.qpReward} QP</span>
                </div>
                {!q.completed && (
                  <div className="mt-2 h-2.5 bg-cream-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-forest-400 to-forest-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((q.current / q.target) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Commit to Quest CTA — deep forest green with cream text ── */}
      <div className="bg-gradient-to-br from-forest-600 via-forest-500 to-forest-700 rounded-[24px] p-7 text-center relative overflow-hidden color-block">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#d4a843,transparent_50%)]" />
        <div className="absolute top-[-30px] right-[-20px] w-[100px] h-[100px] rounded-full bg-forest-400/20" />
        <Mountain size={32} className="text-forest-300/40 mx-auto mb-2 relative" />
        <p className="text-cream-50 text-xl font-extrabold relative">Commit to My Quest</p>
        <p className="text-forest-200 text-xs mt-1.5 relative font-medium">Walk 7,500+ steps every day this week</p>
        <button className="mt-5 bg-cream-50 text-forest-700 font-extrabold text-sm px-8 py-3.5 rounded-[18px] shadow-lg btn-press relative hover:shadow-xl transition-shadow">
          I'm In
        </button>
      </div>
    </div>
  )
}
