import { useState } from 'react'
import { Gem, Flame, Trophy, Watch, Award, ChevronRight } from 'lucide-react'
import XPBar from '../components/XPBar'
import { userProfile, weeklyLeagues } from '../data/mockData'

function DeviceSyncCard() {
  const [syncing, setSyncing] = useState(false)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
        <Watch size={18} className="text-blue-500" /> Connected Device
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Watch size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{userProfile.connectedDevice}</p>
            <p className="text-xs text-emerald-500">Connected & syncing</p>
          </div>
        </div>
        <button
          onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000) }}
          className="text-sm text-emerald-600 font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        {['Apple Watch', 'Fitbit', 'Garmin', 'Phone'].map(d => (
          <span
            key={d}
            className={`text-xs px-2 py-1 rounded-full ${
              d === userProfile.connectedDevice
                ? 'bg-emerald-100 text-emerald-700 font-medium'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Profile() {
  const currentLeagueIdx = weeklyLeagues.findIndex(l => l.name === userProfile.league)

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
          {userProfile.avatar}
        </div>
        <h1 className="text-lg font-bold text-slate-800 mt-3">{userProfile.name}</h1>
        <p className="text-sm text-slate-500">{userProfile.username}</p>

        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Flame size={16} />
              <span className="font-bold">{userProfile.streak}</span>
            </div>
            <p className="text-xs text-slate-400">Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-500">
              <Gem size={16} />
              <span className="font-bold">{userProfile.gems}</span>
            </div>
            <p className="text-xs text-slate-400">Gems</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-500">
              <Trophy size={16} />
              <span className="font-bold">#{userProfile.leagueRank}</span>
            </div>
            <p className="text-xs text-slate-400">{userProfile.league}</p>
          </div>
        </div>

        <div className="mt-4 px-2">
          <XPBar current={userProfile.xp} max={userProfile.xpToNextLevel} level={userProfile.level} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-slate-800">{(userProfile.totalSteps / 1_000_000).toFixed(1)}M</p>
          <p className="text-xs text-slate-500">Total Steps</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-slate-800">{userProfile.longestStreak}</p>
          <p className="text-xs text-slate-500">Best Streak</p>
        </div>
      </div>

      {/* League Progress */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
          <Award size={18} className="text-amber-500" /> Weekly League
        </h3>
        <div className="flex gap-1.5">
          {weeklyLeagues.map((league, i) => (
            <div
              key={league.name}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${
                i === currentLeagueIdx
                  ? 'ring-2 ring-emerald-500 bg-emerald-50 text-emerald-700'
                  : i < currentLeagueIdx
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-slate-50 text-slate-300'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: league.color }}
              />
              {league.name}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Rank #{userProfile.leagueRank} in {userProfile.league} — {userProfile.xp.toLocaleString()} XP this week
        </p>
      </div>

      {/* Device Sync */}
      <DeviceSyncCard />

      {/* Badges */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 flex items-center justify-between mb-3">
          <span className="flex items-center gap-2">
            <Award size={18} className="text-purple-500" /> Badges
          </span>
          <span className="text-xs text-slate-400">
            {userProfile.badges.filter(b => b.earned).length}/{userProfile.badges.length}
          </span>
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {userProfile.badges.map(badge => (
            <div
              key={badge.id}
              className={`text-center p-2.5 rounded-xl ${
                badge.earned ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 opacity-50'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <p className="text-xs font-medium text-slate-700 mt-1 leading-tight">{badge.name}</p>
              {badge.earned && badge.earnedDate && (
                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(badge.earnedDate).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings Links */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {['Account Settings', 'Notification Preferences', 'Privacy', 'Help & Support'].map((item, i) => (
          <button
            key={item}
            className={`w-full flex items-center justify-between p-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors ${
              i > 0 ? 'border-t border-slate-100' : ''
            }`}
          >
            {item}
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  )
}
