import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import QPBar from '../components/XPBar'
import { FlameIcon, GemIcon, TrophyIcon, BadgeIcon, TargetIcon, CheckIcon } from '../components/Icons'
import { userProfile, weeklyLeagues, streakMilestones } from '../data/mockData'

export default function Profile() {
  const [syncing, setSyncing] = useState(false)
  const currentLeagueIdx = weeklyLeagues.findIndex(l => l.name === userProfile.league)
  const { adaptiveGoal } = userProfile

  return (
    <div className="space-y-0">
      {/* Header — taller, more presence */}
      <div className="-mx-5 -mt-6 px-5 pt-8 pb-16 bg-forest-600 edge-highlight">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-forest-600 text-2xl font-bold mx-auto" style={{ boxShadow: '0 4px 16px rgba(45,94,59,0.3)' }}>
            {userProfile.avatar}
          </div>
          <h1 className="text-xl font-bold text-white mt-3">{userProfile.name}</h1>
          <p className="text-xs text-white/50 font-medium">{userProfile.username}</p>
        </div>
      </div>

      {/* Stats — overlap the header */}
      <div className="grid grid-cols-2 gap-3 -mt-8">
        <div className="bg-white rounded-2xl p-4 text-center card-elevated">
          <p className="text-2xl font-bold text-warm-800 tabular-nums">{userProfile.lifetimeMiles.toLocaleString()}</p>
          <p className="text-xs text-warm-400 font-medium mt-1 leading-tight">Lifetime Miles</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center card-elevated">
          <p className="text-2xl font-bold text-warm-800 tabular-nums flex items-center justify-center gap-1">
            <FlameIcon size={20} /> {userProfile.longestStreak}
          </p>
          <p className="text-xs text-warm-400 font-medium mt-1 leading-tight">Best Streak</p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="flex gap-3 mt-3">
        <div className="flex-1 bg-cream-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <FlameIcon size={14} /><span className="text-xs font-bold text-warm-700 tabular-nums">{userProfile.streak}d</span>
          <span className="text-xs text-warm-500 font-medium leading-tight">streak</span>
        </div>
        <div className="flex-1 bg-cream-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <GemIcon size={14} /><span className="text-xs font-bold text-warm-700 tabular-nums">{userProfile.gems}</span>
          <span className="text-xs text-warm-500 font-medium leading-tight">gems</span>
        </div>
        <div className="flex-1 bg-cream-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <TrophyIcon size={14} /><span className="text-xs font-bold text-warm-700 tabular-nums">#{userProfile.leagueRank}</span>
          <span className="text-xs text-warm-500 font-medium leading-tight">{userProfile.league}</span>
        </div>
      </div>

      {/* Walking Title — cream band */}
      <div className="-mx-5 px-5 py-5 mt-6 bg-cream-100">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Title</p>
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <QPBar lifetimeMiles={userProfile.lifetimeMiles} />
        </div>
      </div>

      {/* Milestones — dark card for contrast */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Milestones</p>
        <div className="bg-forest-600 rounded-2xl p-4 shadow-forest edge-highlight">
          <div className="flex items-center gap-1.5 mb-3">
            <FlameIcon size={14} />
            <h3 className="text-sm font-bold text-white">Streak Milestones</h3>
          </div>
          <div className="space-y-1.5">
            {streakMilestones.map(m => (
              <div key={m.days} className={`flex items-center gap-3 p-3 rounded-xl ${m.reached ? 'bg-white/10' : 'bg-white/5'}`}>
                <BadgeIcon icon={m.icon} size={20} color={m.reached ? '#a4b47a' : '#ffffff40'} />
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${m.reached ? 'text-white' : 'text-white/30'}`}>{m.label}</p>
                  <p className="text-xs text-white/30 font-medium leading-normal">{m.days}d · {m.reward}</p>
                </div>
                {m.reached && <CheckIcon size={14} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Journey */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Goal</p>
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center gap-1.5 mb-3">
            <TargetIcon size={14} />
            <h3 className="text-sm font-bold text-warm-700">Goal Journey</h3>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-warm-400 font-medium leading-tight">Started at</p>
              <p className="text-base font-bold text-warm-700 tabular-nums">{adaptiveGoal.baseline.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-warm-400 font-medium leading-tight">Current</p>
              <p className="text-base font-bold text-forest-600 tabular-nums">{adaptiveGoal.currentGoal.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-warm-400 font-medium leading-tight">Target</p>
              <p className="text-base font-bold text-warm-700 tabular-nums">10,000</p>
            </div>
          </div>
          <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
            <div className="h-full bg-forest-500 rounded-full transition-all"
              style={{ width: `${((adaptiveGoal.currentGoal - adaptiveGoal.baseline) / (10000 - adaptiveGoal.baseline)) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* League — cream band */}
      <div className="-mx-5 px-5 py-5 mt-6 bg-cream-100">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">League</p>
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex gap-1.5">
            {weeklyLeagues.map((league, i) => (
              <div key={league.name} className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold ${
                i === currentLeagueIdx ? 'ring-2 ring-forest-500 bg-forest-50 text-forest-700'
                  : i < currentLeagueIdx ? 'bg-cream-200 text-warm-600' : 'bg-cream-100 text-warm-300'
              }`}>
                <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: league.color }}>
                  {league.icon}
                </div>
                <p className="mt-0.5">{league.name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-warm-400 mt-3 text-center font-medium leading-normal">
            #{userProfile.leagueRank} in {userProfile.league} · {userProfile.qp.toLocaleString()} QP
          </p>
        </div>
      </div>

      {/* Trophy Case — dark for drama */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-3">Trophies</p>
        <div className="bg-warm-800 rounded-2xl p-4 edge-highlight" style={{ boxShadow: '0 2px 8px rgba(53,45,36,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrophyIcon size={14} /> Trophy Case
            </h3>
            <span className="text-xs text-white/40 font-medium leading-tight">
              {userProfile.badges.filter(b => b.earned).length}/{userProfile.badges.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {userProfile.badges.map(badge => (
              <div key={badge.id} className={`text-center p-3 rounded-xl flex flex-col items-center ${
                badge.earned ? 'bg-white/10' : 'bg-white/5 opacity-40'
              }`}>
                <BadgeIcon icon={badge.icon} size={24} color={badge.earned ? '#D4A050' : '#ffffff30'} />
                <p className={`text-xs font-semibold mt-1 leading-tight ${badge.earned ? 'text-white/80' : 'text-white/20'}`}>{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device + Settings */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D5E3B" strokeWidth="1.8" strokeLinecap="round">
                <rect x="6" y="2" width="12" height="20" rx="6" />
                <rect x="9" y="6" width="6" height="8" rx="1" fill="#eef3ef" stroke="none" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-warm-700">{userProfile.connectedDevice}</p>
                <p className="text-xs text-forest-500 font-medium leading-tight">Connected</p>
              </div>
            </div>
            <button onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000) }}
              className="text-xs text-forest-600 font-bold px-4 py-2 rounded-xl bg-forest-50 btn-press">
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 bg-white rounded-2xl overflow-hidden card-shadow">
        {['Account Settings', 'Notifications', 'Privacy', 'Help'].map((item, i) => (
          <button key={item} className={`w-full flex items-center justify-between p-4 text-sm font-medium text-warm-600 hover:bg-cream-50 transition-colors btn-press ${
            i > 0 ? 'border-t border-cream-100' : ''
          }`}>
            {item}
            <ChevronRight size={16} className="text-warm-300" />
          </button>
        ))}
      </div>

      <div className="h-8" />
    </div>
  )
}
