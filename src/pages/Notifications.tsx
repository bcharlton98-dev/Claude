import { Bell, Trophy, Flame, Users, Footprints } from 'lucide-react'
import { notifications } from '../data/mockData'

const typeIcons: Record<string, any> = {
  competitive: Trophy,
  achievement: Flame,
  reminder: Footprints,
  social: Users,
}

const typeColors: Record<string, string> = {
  competitive: 'bg-amber-100 text-amber-600',
  achievement: 'bg-emerald-100 text-emerald-600',
  reminder: 'bg-blue-100 text-blue-600',
  social: 'bg-purple-100 text-purple-600',
}

export default function Notifications() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
        <button className="text-xs text-emerald-600 font-medium hover:underline">Mark all read</button>
      </div>

      <div className="space-y-2">
        {notifications.map(n => {
          const Icon = typeIcons[n.type] || Bell
          return (
            <div
              key={n.id}
              className={`bg-white rounded-xl p-3.5 shadow-sm border flex items-start gap-3 ${
                n.read ? 'border-slate-100' : 'border-emerald-200 bg-emerald-50/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColors[n.type]}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
