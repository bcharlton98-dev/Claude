import { notifications } from '../data/mockData'
import { ChallengeIcon, TrophyIcon, ShoeIcon, RouteIcon } from '../components/Icons'

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'competitive': return <ChallengeIcon size={18} />
    case 'achievement': return <TrophyIcon size={18} />
    case 'reminder': return <ShoeIcon size={18} color="#6e655e" />
    case 'social': return <RouteIcon size={18} />
    default: return <div className="w-[18px] h-[18px] rounded-full bg-warm-200" />
  }
}

const notifBg: Record<string, string> = {
  competitive: 'bg-peach-50',
  achievement: 'bg-mustard-50',
  reminder: 'bg-cream-100',
  social: 'bg-forest-50',
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notifBg[n.type] || 'bg-cream-100'}`}>
              <NotifIcon type={n.type} />
            </div>
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
