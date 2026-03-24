import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles, Mountain, Users } from 'lucide-react'
import { CheckIcon, ShoeIcon, ClockIcon, WaveIcon, RouteIcon } from '../components/Icons'
import { challenges, dailyQuests, type Challenge } from '../data/mockData'

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

type Tab = 'browse' | 'mine' | 'invites'

function ChallengeCard({ challenge, onClick }: { challenge: Challenge; onClick: () => void }) {
  const thumb = thumbnailConfig[challenge.type] || { bg: 'bg-forest-600' }
  const yourRank = [...challenge.participants].sort((a, b) => b.steps - a.steps).findIndex(p => p.isYou) + 1
  const pct = challenge.collectiveGoal ? Math.round(((challenge.collectiveProgress || 0) / challenge.collectiveGoal) * 100) : null

  return (
    <button onClick={onClick} className="w-full rounded-2xl overflow-hidden bg-white card-shadow btn-press text-left">
      <div className={`${thumb.bg} px-4 py-3 edge-highlight`}>
        <p className="text-white text-sm font-bold leading-tight">{challenge.name}</p>
        <p className="text-white/50 text-[10px] font-medium mt-0.5">{typeLabels[challenge.type]}</p>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-warm-400" />
            <span className="text-xs text-warm-500 font-medium">{challenge.participants.length} participants</span>
          </div>
          {yourRank > 0 && (
            <span className="text-[10px] font-bold text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full">#{yourRank}</span>
          )}
        </div>
        {pct !== null && (
          <div className="h-1.5 bg-forest-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-forest-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        )}
        <p className="text-[10px] text-warm-300 font-medium mt-2">
          {new Date(challenge.startDate).toLocaleDateString()} — {new Date(challenge.endDate).toLocaleDateString()}
        </p>
      </div>
    </button>
  )
}

export default function Challenges() {
  const [tab, setTab] = useState<Tab>('mine')
  const navigate = useNavigate()

  // Mock: "mine" = challenges where user is participant, "browse" = all, "invites" = empty for now
  const myChallenges = challenges.filter(c => c.participants.some(p => p.isYou))
  const browseChallenges = challenges
  const invites: Challenge[] = []

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'browse', label: 'Browse', count: browseChallenges.length },
    { key: 'mine', label: 'My Challenges', count: myChallenges.length },
    { key: 'invites', label: 'Invites', count: invites.length },
  ]

  const activeChallenges = tab === 'mine' ? myChallenges : tab === 'browse' ? browseChallenges : invites

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warm-800 tracking-tight">Quests</h1>
        <button className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center btn-press shadow-forest">
          <Plus size={18} />
        </button>
      </div>

      {/* Daily Quests */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={14} className="text-gold-400" />
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

      {/* ── TABS: Browse / My Challenges / Invites ── */}
      <div className="-mx-5 px-5 pt-5 pb-6 bg-cream-100">
        <div className="flex bg-cream-200 rounded-xl p-1 mb-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all btn-press ${
                tab === t.key
                  ? 'bg-white text-warm-800 card-shadow'
                  : 'text-warm-400'
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`ml-1 text-[10px] ${tab === t.key ? 'text-forest-500' : 'text-warm-300'}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Challenge cards — full width, stacked */}
        <div className="space-y-3">
          {activeChallenges.map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              onClick={() => navigate(`/challenges/${c.id}`)}
            />
          ))}
        </div>

        {activeChallenges.length === 0 && (
          <div className="text-center py-12">
            <Mountain size={32} className="mx-auto text-warm-200 mb-2" />
            <p className="text-sm font-medium text-warm-400">
              {tab === 'invites' ? 'No pending invites' : 'No challenges yet'}
            </p>
            <p className="text-xs text-warm-300 mt-1">
              {tab === 'invites' ? 'Invite friends to challenge you' : 'Tap + to create one'}
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-forest-600 rounded-2xl p-6 text-center shadow-forest edge-highlight">
        <Mountain size={28} className="text-forest-300 mx-auto mb-2" />
        <p className="text-white text-lg font-bold">Commit to My Quest</p>
        <p className="text-forest-200 text-xs mt-1 font-medium">Walk 7,500+ steps every day this week</p>
        <button className="mt-4 bg-white text-forest-700 font-bold text-sm px-6 py-3 rounded-xl btn-press">
          I'm In
        </button>
      </div>

      <div className="h-8" />
    </div>
  )
}
