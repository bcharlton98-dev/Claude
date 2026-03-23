import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import QPBar from '../components/XPBar'
import { userProfile, weeklyLeagues, streakMilestones } from '../data/mockData'

export default function Profile() {
  const [syncing, setSyncing] = useState(false)
  const currentLeagueIdx = weeklyLeagues.findIndex(l => l.name === userProfile.league)
  const { adaptiveGoal } = userProfile

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-5 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto shadow-md">
          {userProfile.avatar}
        </div>
        <h1 className="text-lg font-bold text-slate-800 mt-2">{userProfile.name}</h1>
        <p className="text-xs text-slate-400">{userProfile.username}</p>

        <div className="flex justify-center gap-4 mt-3">
          <div className="text-center">
            <p className="text-sm font-bold">🔥 {userProfile.streak}</p>
            <p className="text-[10px] text-slate-400">Streak</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">🧊 {userProfile.streakFreezes}</p>
            <p className="text-[10px] text-slate-400">Freezes</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">💎 {userProfile.gems}</p>
            <p className="text-[10px] text-slate-400">Gems</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">🏆 #{userProfile.leagueRank}</p>
            <p className="text-[10px] text-slate-400">{userProfile.league}</p>
          </div>
        </div>

        <div className="mt-3 px-2">
          <QPBar current={userProfile.qp} max={userProfile.qpToNextLevel} level={userProfile.level} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{(userProfile.totalSteps / 1_000_000).toFixed(1)}M</p>
          <p className="text-[10px] text-slate-400 font-medium">Total Steps</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-slate-800">🔥 {userProfile.longestStreak}</p>
          <p className="text-[10px] text-slate-400 font-medium">Best Streak</p>
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="bg-white rounded-xl p-3.5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">🔥 Streak Milestones</h3>
        <div className="space-y-1.5">
          {streakMilestones.map(m => (
            <div key={m.days} className={`flex items-center gap-2.5 p-2 rounded-lg ${m.reached ? 'bg-brand-50' : 'bg-slate-50'}`}>
              <span className={`text-lg ${m.reached ? '' : 'grayscale opacity-40'}`}>{m.icon}</span>
              <div className="flex-1">
                <p className={`text-xs font-semibold ${m.reached ? 'text-brand-700' : 'text-slate-400'}`}>{m.label}</p>
                <p className="text-[10px] text-slate-400">{m.days} day streak · {m.reward}</p>
              </div>
              {m.reached && <span className="text-xs text-brand-500">✓</span>}
            </div>
          ))}
        </div>

        {/* Streak Freeze Info */}
        <div className="mt-3 flex items-center gap-2 bg-sky-50 rounded-lg px-3 py-2">
          <span className="text-lg">🧊</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-sky-700">Streak Freezes</p>
            <p className="text-[10px] text-sky-500">Protects your streak on rest days. You have {userProfile.streakFreezes} of {userProfile.streakFreezesMax}.</p>
          </div>
        </div>
      </div>

      {/* Adaptive Goal Progress */}
      <div className="bg-white rounded-xl p-3.5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">🎯 Goal Journey</h3>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] text-slate-400">Started at</p>
            <p className="text-sm font-bold text-slate-600">{adaptiveGoal.baseline.toLocaleString()} steps</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400">Current goal</p>
            <p className="text-sm font-bold text-brand-600">{adaptiveGoal.currentGoal.toLocaleString()} steps</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Target</p>
            <p className="text-sm font-bold text-gold-500">10,000 steps</p>
          </div>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all"
            style={{ width: `${((adaptiveGoal.currentGoal - adaptiveGoal.baseline) / (10000 - adaptiveGoal.baseline)) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">
          Your goal adapts each week based on your actual steps
        </p>
      </div>

      {/* League */}
      <div className="bg-white rounded-xl p-3.5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">🏅 Weekly League</h3>
        <div className="flex gap-1">
          {weeklyLeagues.map((league, i) => (
            <div
              key={league.name}
              className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-semibold ${
                i === currentLeagueIdx
                  ? 'ring-2 ring-brand-500 bg-brand-50 text-brand-700'
                  : i < currentLeagueIdx
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-slate-50 text-slate-300'
              }`}
            >
              <span className="text-sm">{league.icon}</span>
              <p className="mt-0.5">{league.name}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          #{userProfile.leagueRank} in {userProfile.league} — {userProfile.qp.toLocaleString()} QP
        </p>
      </div>

      {/* Device */}
      <div className="bg-white rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⌚</span>
            <div>
              <p className="text-sm font-semibold text-slate-700">{userProfile.connectedDevice}</p>
              <p className="text-[10px] text-brand-500 font-medium">Connected</p>
            </div>
          </div>
          <button
            onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000) }}
            className="text-xs text-brand-600 font-semibold px-3 py-1 rounded-lg hover:bg-brand-50 transition-colors"
          >
            {syncing ? '⟳ Syncing...' : 'Sync'}
          </button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {['Apple Watch', 'Fitbit', 'Garmin', 'Phone'].map(d => (
            <span key={d} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              d === userProfile.connectedDevice ? 'bg-brand-100 text-brand-700' : 'bg-slate-50 text-slate-400'
            }`}>{d}</span>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700">🎖️ Badges</h3>
          <span className="text-[10px] text-slate-400 font-medium">
            {userProfile.badges.filter(b => b.earned).length}/{userProfile.badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {userProfile.badges.map(badge => (
            <div
              key={badge.id}
              className={`text-center p-2 rounded-xl ${
                badge.earned ? 'bg-brand-50' : 'bg-slate-50 opacity-40'
              }`}
            >
              <span className="text-xl">{badge.icon}</span>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5 leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl overflow-hidden">
        {['Account Settings', 'Notifications', 'Privacy', 'Help'].map((item, i) => (
          <button
            key={item}
            className={`w-full flex items-center justify-between p-3 text-sm text-slate-600 hover:bg-slate-50 ${
              i > 0 ? 'border-t border-slate-50' : ''
            }`}
          >
            {item}
            <ChevronRight size={14} className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  )
}
