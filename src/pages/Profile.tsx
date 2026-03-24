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
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="-mx-5 -mt-6 px-5 pt-6 bg-gradient-to-b from-forest-500 to-forest-400 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-30px] w-[120px] h-[120px] rounded-full bg-forest-400/30" />
        <div className="text-center pb-5 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-forest-200 to-cream-100 rounded-[24px] flex items-center justify-center text-forest-700 text-2xl font-extrabold mx-auto shadow-lg border-4 border-white/30">
            {userProfile.avatar}
          </div>
          <h1 className="text-xl font-extrabold text-white mt-3">{userProfile.name}</h1>
          <p className="text-xs text-forest-200 font-medium">{userProfile.username}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-3 -mt-2">
        <div className="text-center px-3 py-2.5 rounded-[16px] bg-peach-50 flex-1">
          <p className="text-base font-extrabold tabular-nums flex items-center justify-center gap-1">
            <FlameIcon size={16} /> {userProfile.streak}
          </p>
          <p className="text-[9px] text-warm-400 font-medium">Streak</p>
        </div>
        <div className="text-center px-3 py-2.5 rounded-[16px] bg-sky-50 flex-1">
          <p className="text-base font-extrabold tabular-nums flex items-center justify-center gap-1">
            <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
              <g stroke="#2E6F86" strokeWidth="3" strokeLinecap="round">
                <path d="M32 19V45" /><path d="M20.7 25.5L43.3 38.5" /><path d="M20.7 38.5L43.3 25.5" />
              </g>
            </svg>
            {userProfile.streakFreezes}
          </p>
          <p className="text-[9px] text-warm-400 font-medium">Freezes</p>
        </div>
        <div className="text-center px-3 py-2.5 rounded-[16px] bg-mustard-50 flex-1">
          <p className="text-base font-extrabold tabular-nums flex items-center justify-center gap-1">
            <GemIcon size={16} /> {userProfile.gems}
          </p>
          <p className="text-[9px] text-warm-400 font-medium">Gems</p>
        </div>
        <div className="text-center px-3 py-2.5 rounded-[16px] bg-forest-50 flex-1">
          <p className="text-base font-extrabold tabular-nums flex items-center justify-center gap-1">
            <TrophyIcon size={16} /> #{userProfile.leagueRank}
          </p>
          <p className="text-[9px] text-warm-400 font-medium">{userProfile.league}</p>
        </div>
      </div>

      {/* Walking Title */}
      <div className="bg-white rounded-[22px] p-4 card-shadow grain relative overflow-hidden">
        <QPBar lifetimeMiles={userProfile.lifetimeMiles} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-forest-50 to-sage-50 rounded-[20px] p-4 text-center card-shadow card-hover color-block">
          <p className="text-3xl font-extrabold text-forest-600 tabular-nums">{userProfile.lifetimeMiles.toLocaleString()}</p>
          <p className="text-[10px] text-forest-400 font-semibold">Lifetime Miles</p>
        </div>
        <div className="bg-gradient-to-br from-peach-50 to-mustard-50 rounded-[20px] p-4 text-center card-shadow card-hover color-block">
          <p className="text-3xl font-extrabold text-peach-600 flex items-center justify-center gap-1.5">
            <FlameIcon size={24} /> {userProfile.longestStreak}
          </p>
          <p className="text-[10px] text-peach-400 font-semibold">Best Streak</p>
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="bg-white rounded-[22px] p-5 card-shadow grain relative overflow-hidden">
        <h3 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5">
          <FlameIcon size={16} /> Streak Milestones
        </h3>
        <div className="space-y-2">
          {streakMilestones.map(m => (
            <div key={m.days} className={`flex items-center gap-3 p-3 rounded-[16px] ${m.reached ? 'bg-forest-50' : 'bg-cream-50'}`}>
              <span className={m.reached ? '' : 'opacity-40'}>
                <BadgeIcon icon={m.icon} size={24} color={m.reached ? '#4A6741' : '#a39890'} />
              </span>
              <div className="flex-1">
                <p className={`text-xs font-bold ${m.reached ? 'text-forest-700' : 'text-warm-400'}`}>{m.label}</p>
                <p className="text-[10px] text-warm-400 font-medium">{m.days} day streak · {m.reward}</p>
              </div>
              {m.reached && <CheckIcon size={16} />}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 bg-sky-50 rounded-[16px] px-4 py-3">
          <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="26" fill="#DCEFF5" />
            <g stroke="#2E6F86" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 19V45" /><path d="M20.7 25.5L43.3 38.5" /><path d="M20.7 38.5L43.3 25.5" />
              <path d="M32 19L28.8 22.2" /><path d="M32 19L35.2 22.2" />
              <path d="M32 45L28.8 41.8" /><path d="M32 45L35.2 41.8" />
            </g>
          </svg>
          <div className="flex-1">
            <p className="text-xs font-bold text-sky-600">Streak Freezes</p>
            <p className="text-[10px] text-sky-400 font-medium">Protects your streak on rest days. {userProfile.streakFreezes} of {userProfile.streakFreezesMax}.</p>
          </div>
        </div>
      </div>

      {/* Adaptive Goal */}
      <div className="bg-white rounded-[22px] p-5 card-shadow grain relative overflow-hidden">
        <h3 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5">
          <TargetIcon size={16} /> Goal Journey
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-warm-400 font-medium">Started at</p>
            <p className="text-lg font-extrabold text-warm-600 tabular-nums">{adaptiveGoal.baseline.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-warm-400 font-medium">Current goal</p>
            <p className="text-lg font-extrabold text-forest-600 tabular-nums">{adaptiveGoal.currentGoal.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-warm-400 font-medium">Target</p>
            <p className="text-lg font-extrabold text-peach-500 tabular-nums">10,000</p>
          </div>
        </div>
        <div className="h-3 bg-cream-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forest-400 to-forest-500 rounded-full transition-all"
            style={{ width: `${((adaptiveGoal.currentGoal - adaptiveGoal.baseline) / (10000 - adaptiveGoal.baseline)) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-warm-400 mt-2 text-center font-medium">
          Goal adapts weekly based on your actual steps
        </p>
      </div>

      {/* League */}
      <div className="bg-white rounded-[22px] p-5 card-shadow grain relative overflow-hidden">
        <h3 className="text-sm font-bold text-warm-700 mb-3 flex items-center gap-1.5">
          <TrophyIcon size={16} /> Weekly League
        </h3>
        <div className="flex gap-1.5">
          {weeklyLeagues.map((league, i) => (
            <div
              key={league.name}
              className={`flex-1 text-center py-2 rounded-[14px] text-[10px] font-bold transition-all ${
                i === currentLeagueIdx
                  ? 'ring-2 ring-forest-500 bg-forest-50 text-forest-700'
                  : i < currentLeagueIdx
                  ? 'bg-cream-100 text-warm-500'
                  : 'bg-cream-50 text-warm-300'
              }`}
            >
              <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-extrabold text-white" style={{ backgroundColor: league.color }}>
                {league.icon}
              </div>
              <p className="mt-0.5">{league.name}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-warm-400 mt-3 text-center font-medium">
          #{userProfile.leagueRank} in {userProfile.league} — {userProfile.qp.toLocaleString()} QP
        </p>
      </div>

      {/* Device */}
      <div className="bg-white rounded-[22px] p-5 card-shadow grain relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A6741" strokeWidth="1.8" strokeLinecap="round">
              <rect x="6" y="2" width="12" height="20" rx="6" />
              <rect x="9" y="6" width="6" height="8" rx="1" fill="#e4ebe0" stroke="none" />
              <line x1="12" y1="16" x2="12" y2="18" />
            </svg>
            <div>
              <p className="text-sm font-bold text-warm-700">{userProfile.connectedDevice}</p>
              <p className="text-[10px] text-forest-500 font-bold">Connected</p>
            </div>
          </div>
          <button
            onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000) }}
            className="text-xs text-forest-600 font-bold px-4 py-2 rounded-[14px] bg-forest-50 hover:bg-forest-100 transition-colors btn-press"
          >
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {['Apple Watch', 'Fitbit', 'Garmin', 'Phone'].map(d => (
            <span key={d} className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              d === userProfile.connectedDevice ? 'bg-forest-100 text-forest-700' : 'bg-cream-50 text-warm-400'
            }`}>{d}</span>
          ))}
        </div>
      </div>

      {/* Badges — Trophy Case */}
      <div className="bg-white rounded-[22px] p-5 card-shadow grain relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-warm-700 flex items-center gap-1.5">
            <TrophyIcon size={16} /> Trophy Case
          </h3>
          <span className="text-[10px] text-warm-400 font-bold">
            {userProfile.badges.filter(b => b.earned).length}/{userProfile.badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {userProfile.badges.map(badge => (
            <div
              key={badge.id}
              className={`text-center p-3 rounded-[16px] transition-all flex flex-col items-center ${
                badge.earned ? 'bg-gradient-to-br from-mustard-50 to-forest-50 card-hover' : 'bg-cream-50 opacity-40'
              }`}
            >
              <BadgeIcon icon={badge.icon} size={28} color={badge.earned ? '#4A6741' : '#a39890'} />
              <p className="text-[10px] font-bold text-warm-600 mt-1 leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-[22px] overflow-hidden card-shadow">
        {['Account Settings', 'Notifications', 'Privacy', 'Help'].map((item, i) => (
          <button
            key={item}
            className={`w-full flex items-center justify-between p-4 text-sm font-semibold text-warm-600 hover:bg-cream-50 transition-colors btn-press ${
              i > 0 ? 'border-t border-cream-100' : ''
            }`}
          >
            {item}
            <ChevronRight size={16} className="text-warm-300" />
          </button>
        ))}
      </div>
    </div>
  )
}
