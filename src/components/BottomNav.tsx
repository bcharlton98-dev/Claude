import { NavLink } from 'react-router-dom'
import { Home, Swords, Calculator, User, Bell } from 'lucide-react'
import { notifications } from '../data/mockData'

const unreadCount = notifications.filter(n => !n.read).length

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/challenges', icon: Swords, label: 'Quests' },
  { to: '/calculator', icon: Calculator, label: 'Calc' },
  { to: '/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
  { to: '/profile', icon: User, label: 'Me' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-14">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors relative ${
                isActive ? 'text-brand-600' : 'text-slate-300 hover:text-slate-500'
              }`
            }
          >
            <div className="relative">
              <Icon size={20} strokeWidth={2.2} />
              {badge ? (
                <span className="absolute -top-1 -right-2.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
