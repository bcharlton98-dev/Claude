import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import QPBar from '../components/XPBar'
import { userProfile, weeklyLeagues, streakMilestones } from '../data/mockData'

export default function Profile() {
  const [syncing, setSyncing] = useState(false)
  const currentLeagueIdx = weeklyLeagues.findIndex(l => l.name === userProfile.league)
  const { adaptiveGoal } = userProfile

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 text-center card-shadow relative overflow-hidden grain warm-glow">
        <div className="w-20 h-20 bg-gradient-to-br from-sage-400 to-sage-600 rounded-3xl flex items-center justify-center text-white text-2xl font-extrabold mx-auto shadow-lg">
          {userProfile.avatar}
        </div>
        <h1 className="text-xl font-extrabold text-warm-800 mt-3">{userProfile.name}</h1>
        <p className="text-xs text-warm-400 font-medium">{userProfile.username}</p>

        <div className="flex justify-center gap-5 mt-4">
          {[
            { icon: '🔥', value: userProfile.streak, label: 'Streak' },
            { icon: '🧊', value: userProfile.streakFreezes, label: 'Freezes' },
            { icon: '💎', value: userProfile.gems, label: 'Gems' },
            { icon: '🏆', value: `#${userProfile.leagueRank}`, label: userProfile.league },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-base font-extrabold tabular-nums">{s.icon} {s.value}</p>
              <p className="text-[10px] text-warm-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 px-2">
          <QPBar current={userProfile.qp} max={userProfile.qpToNextLevel} level={userProfile.level} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 text-center card-shadow card-hover">
          <p className="text-2xl font-extrabold text-warm-800 tabular-nums">{(userProfile.totalSteps / 1_000_000).toFixed(1)}M</p>
          <p className="text-[10px] text-warm-400 font-semibold">Total Steps</p>
        </div>
        <div className="bg-white rounded-3xl p-4 text-center card-shadow card-hover">
          <p className="text-2xl font-extrabold text-warm-800">🔥 {userProfile.longestStreak}</p>
          <p className="text-[10px] text-warm-400 font-semibold">Best Streak</p>
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
        <h3 className="text-sm font-bold text-warm-700 mb-3">🔥 Streak Milestones</h3>
        <div className="space-y-2">
          {streakMilestones.map(m => (
            <div key={m.days} className={`flex items-center gap-3 p-3 rounded-2xl ${m.reached ? 'bg-sage-50' : 'bg-cream-50'}`}>
              <span className={`text-xl ${m.reached ? '' : 'grayscale opacity-40'}`}>{m.icon}</span>
              <div className="flex-1">
                <p className={`text-xs font-bold ${m.reached ? 'text-sage-700' : 'text-warm-400'}`}>{m.label}</p>
                <p className="text-[10px] text-warm-400 font-medium">{m.days} day streak · {m.reward}</p>
              </div>
              {m.reached && <span className="text-sm text-sage-500">✓</span>}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 bg-sky-50 rounded-2xl px-4 py-3">
          <span className="text-xl">🧊</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-sky-600">Streak Freezes</p>
            <p className="text-[10px] text-sky-400 font-medium">Protects your streak on rest days. {userProfile.streakFreezes} of {userProfile.streakFreezesMax}.</p>
          </div>
        </div>
      </div>

      {/* Adaptive Goal */}
      <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
        <h3 className="text-sm font-bold text-warm-700 mb-3">🎯 Goal Journey</h3>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-warm-400 font-medium">Started at</p>
            <p className="text-base font-extrabold text-warm-600 tabular-nums">{adaptiveGoal.baseline.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-warm-400 font-medium">Current goal</p>
            <p className="text-base font-extrabold text-sage-600 tabular-nums">{adaptiveGoal.currentGoal.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-warm-400 font-medium">Target</p>
            <p className="text-base font-extrabold text-peach-500 tabular-nums">10,000</p>
          </div>
        </div>
        <div className="h-3 bg-cream-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all"
            style={{ width: `${((adaptiveGoal.currentGoal - adaptiveGoal.baseline) / (10000 - adaptiveGoal.baseline)) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-warm-400 mt-2 text-center font-medium">
          Goal adapts weekly based on your actual steps
        </p>
      </div>

      {/* League */}
      <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
        <h3 className="text-sm font-bold text-warm-700 mb-3">🏅 Weekly League</h3>
        <div className="flex gap-1.5">
          {weeklyLeagues.map((league, i) => (
            <div
              key={league.name}
              className={`flex-1 text-center py-2 rounded-2xl text-[10px] font-bold transition-all ${
                i === currentLeagueIdx
                  ? 'ring-2 ring-sage-500 bg-sage-50 text-sage-700'
                  : i < currentLeagueIdx
                  ? 'bg-cream-100 text-warm-500'
                  : 'bg-cream-50 text-warm-300'
              }`}
            >
              <span className="text-base">{league.icon}</span>
              <p className="mt-0.5">{league.name}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-warm-400 mt-3 text-center font-medium">
          #{userProfile.leagueRank} in {userProfile.league} — {userProfile.qp.toLocaleString()} QP
        </p>
      </div>

      {/* Device */}
      <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⌚</span>
            <div>
              <p className="text-sm font-bold text-warm-700">{userProfile.connectedDevice}</p>
              <p className="text-[10px] text-sage-500 font-bold">Connected</p>
            </div>
          </div>
          <button
            onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000) }}
            className="text-xs text-peach-500 font-bold px-4 py-2 rounded-2xl hover:bg-peach-50 transition-colors btn-press"
          >
            {syncing ? '⟳ Syncing...' : 'Sync'}
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {['Apple Watch', 'Fitbit', 'Garmin', 'Phone'].map(d => (
            <span key={d} className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              d === userProfile.connectedDevice ? 'bg-sage-100 text-sage-700' : 'bg-cream-50 text-warm-400'
            }`}>{d}</span>
          ))}
        </div>
      </div>

      {/* Badges — Trophy Case */}
      <div className="bg-white rounded-3xl p-5 card-shadow grain relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-warm-700">🎖️ Trophy Case</h3>
          <span className="text-[10px] text-warm-400 font-bold">
            {userProfile.badges.filter(b => b.earned).length}/{userProfile.badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {userProfile.badges.map(badge => (
            <div
              key={badge.id}
              className={`text-center p-3 rounded-2xl transition-all ${
                badge.earned ? 'bg-gradient-to-br from-mustard-50 to-sage-50 card-hover' : 'bg-cream-50 opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <p className="text-[10px] font-bold text-warm-600 mt-1 leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-3xl overflow-hidden card-shadow">
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
