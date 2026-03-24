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
    <div className="space-y-6">
      {/* Header — clean, no blob */}
      <div className="-mx-5 -mt-6 px-5 pt-6 bg-forest-600 edge-highlight">
        <div className="text-center pb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-forest-600 text-xl font-bold mx-auto">
            {userProfile.avatar}
          </div>
          <h1 className="text-lg font-bold text-white mt-3">{userProfile.name}</h1>
          <p className="text-xs text-forest-200 font-medium">{userProfile.username}</p>
        </div>
      </div>

      {/* Key stats — 2 columns, not 4 */}
      <div className="grid grid-cols-2 gap-3 -mt-3">
        <div className="bg-white rounded-2xl p-4 text-center card-elevated">
          <p className="text-2xl font-bold text-warm-800 tabular-nums">{userProfile.lifetimeMiles.toLocaleString()}</p>
          <p className="text-[10px] text-warm-400 font-medium mt-1">Lifetime Miles</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center card-elevated">
          <p className="text-2xl font-bold text-warm-800 tabular-nums flex items-center justify-center gap-1">
            <FlameIcon size={20} /> {userProfile.longestStreak}
          </p>
          <p className="text-[10px] text-warm-400 font-medium mt-1">Best Streak</p>
        </div>
      </div>

      {/* Secondary stats row */}
      <div className="flex gap-3">
        <div className="flex-1 bg-cream-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <FlameIcon size={14} /><span className="text-xs font-bold text-warm-700 tabular-nums">{userProfile.streak}d</span>
          <span className="text-[10px] text-warm-400 font-medium">streak</span>
        </div>
        <div className="flex-1 bg-cream-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <GemIcon size={14} /><span className="text-xs font-bold text-warm-700 tabular-nums">{userProfile.gems}</span>
          <span className="text-[10px] text-warm-400 font-medium">gems</span>
        </div>
        <div className="flex-1 bg-cream-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <TrophyIcon size={14} /><span className="text-xs font-bold text-warm-700 tabular-nums">#{userProfile.leagueRank}</span>
          <span className="text-[10px] text-warm-400 font-medium">{userProfile.league}</span>
        </div>
      </div>

      {/* Walking Title */}
      <div className="bg-white rounded-2xl p-4 card-shadow">
        <QPBar lifetimeMiles={userProfile.lifetimeMiles} />
      </div>

      {/* Streak Milestones */}
      <div className="bg-white rounded-2xl p-4 card-shadow">
        <h3 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5">
          <FlameIcon size={14} /> Streak Milestones
        </h3>
        <div className="space-y-1.5">
          {streakMilestones.map(m => (
            <div key={m.days} className={`flex items-center gap-3 p-3 rounded-xl ${m.reached ? 'bg-forest-50' : 'bg-cream-50'}`}>
              <BadgeIcon icon={m.icon} size={20} color={m.reached ? '#2D5E3B' : '#c4bbb0'} />
              <div className="flex-1">
                <p className={`text-xs font-semibold ${m.reached ? 'text-forest-700' : 'text-warm-400'}`}>{m.label}</p>
                <p className="text-[10px] text-warm-400 font-medium">{m.days}d · {m.reward}</p>
              </div>
              {m.reached && <CheckIcon size={14} />}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 bg-sky-50 rounded-xl px-4 py-3">
          <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
            <g stroke="#3b82f6" strokeWidth="3" strokeLinecap="round">
              <path d="M32 19V45" /><path d="M20.7 25.5L43.3 38.5" /><path d="M20.7 38.5L43.3 25.5" />
            </g>
          </svg>
          <div className="flex-1">
            <p className="text-xs font-bold text-warm-700">Streak Freezes</p>
            <p className="text-[10px] text-warm-400 font-medium">{userProfile.streakFreezes} of {userProfile.streakFreezesMax} remaining</p>
          </div>
        </div>
      </div>

      {/* Adaptive Goal */}
      <div className="bg-white rounded-2xl p-4 card-shadow">
        <h3 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5">
          <TargetIcon size={14} /> Goal Journey
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-warm-400 font-medium">Started at</p>
            <p className="text-base font-bold text-warm-700 tabular-nums">{adaptiveGoal.baseline.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-warm-400 font-medium">Current</p>
            <p className="text-base font-bold text-forest-600 tabular-nums">{adaptiveGoal.currentGoal.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-warm-400 font-medium">Target</p>
            <p className="text-base font-bold text-warm-700 tabular-nums">10,000</p>
          </div>
        </div>
        <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
          <div className="h-full bg-forest-500 rounded-full transition-all"
            style={{ width: `${((adaptiveGoal.currentGoal - adaptiveGoal.baseline) / (10000 - adaptiveGoal.baseline)) * 100}%` }} />
        </div>
        <p className="text-[10px] text-warm-400 mt-2 text-center font-medium">Goal adapts weekly based on your steps</p>
      </div>

      {/* League */}
      <div className="bg-white rounded-2xl p-4 card-shadow">
        <h3 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5">
          <TrophyIcon size={14} /> Weekly League
        </h3>
        <div className="flex gap-1.5">
          {weeklyLeagues.map((league, i) => (
            <div key={league.name} className={`flex-1 text-center py-2 rounded-xl text-[10px] font-semibold transition-all ${
              i === currentLeagueIdx ? 'ring-2 ring-forest-500 bg-forest-50 text-forest-700'
                : i < currentLeagueIdx ? 'bg-cream-100 text-warm-500' : 'bg-cream-50 text-warm-300'
            }`}>
              <div className="w-4 h-4 rounded-full mx-auto flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: league.color }}>
                {league.icon}
              </div>
              <p className="mt-0.5">{league.name}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-warm-400 mt-3 text-center font-medium">
          #{userProfile.leagueRank} in {userProfile.league} · {userProfile.qp.toLocaleString()} QP
        </p>
      </div>

      {/* Device */}
      <div className="bg-white rounded-2xl p-4 card-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D5E3B" strokeWidth="1.8" strokeLinecap="round">
              <rect x="6" y="2" width="12" height="20" rx="6" />
              <rect x="9" y="6" width="6" height="8" rx="1" fill="#e4ebe0" stroke="none" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-warm-700">{userProfile.connectedDevice}</p>
              <p className="text-[10px] text-forest-500 font-medium">Connected</p>
            </div>
          </div>
          <button onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000) }}
            className="text-xs text-forest-600 font-bold px-4 py-2 rounded-xl bg-forest-50 btn-press">
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl p-4 card-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-warm-700 flex items-center gap-1.5">
            <TrophyIcon size={14} /> Trophy Case
          </h3>
          <span className="text-[10px] text-warm-400 font-medium">
            {userProfile.badges.filter(b => b.earned).length}/{userProfile.badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {userProfile.badges.map(badge => (
            <div key={badge.id} className={`text-center p-3 rounded-xl flex flex-col items-center ${
              badge.earned ? 'bg-cream-50' : 'bg-cream-50 opacity-30'
            }`}>
              <BadgeIcon icon={badge.icon} size={24} color={badge.earned ? '#2D5E3B' : '#c4bbb0'} />
              <p className="text-[10px] font-semibold text-warm-600 mt-1 leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl overflow-hidden card-shadow">
        {['Account Settings', 'Notifications', 'Privacy', 'Help'].map((item, i) => (
          <button key={item} className={`w-full flex items-center justify-between p-4 text-sm font-medium text-warm-600 hover:bg-cream-50 transition-colors btn-press ${
            i > 0 ? 'border-t border-cream-100' : ''
          }`}>
            {item}
            <ChevronRight size={16} className="text-warm-300" />
          </button>
        ))}
      </div>
    </div>
  )
}
