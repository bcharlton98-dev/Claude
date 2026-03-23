import { notifications } from '../data/mockData'

const typeEmoji: Record<string, string> = {
  competitive: '⚔️',
  achievement: '🏆',
  reminder: '👟',
  social: '🗺️',
}

export default function Notifications() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Notifications</h1>
        <button className="text-[11px] text-brand-600 font-semibold">Mark all read</button>
      </div>

      <div className="space-y-1.5">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`bg-white rounded-xl p-3 flex items-start gap-2.5 ${
              !n.read ? 'border-l-3 border-brand-400' : ''
            }`}
          >
            <span className="text-lg shrink-0">{typeEmoji[n.type]}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${n.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{n.message}</p>
              <p className="text-[10px] text-slate-300 mt-1 font-medium">{n.time}</p>
            </div>
            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-2" />}
          </div>
        ))}
      </div>
    </div>
  )
}
