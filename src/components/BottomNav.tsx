import { NavLink } from 'react-router-dom'
import { Home, Trophy, Calculator, User, Bell } from 'lucide-react'
import { notifications } from '../data/mockData'

const unreadCount = notifications.filter(n => !n.read).length

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors relative ${
                isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <div className="relative">
              <Icon size={22} />
              {badge ? (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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
