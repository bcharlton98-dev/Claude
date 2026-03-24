import { NavLink } from 'react-router-dom'
import { Home, Swords, Calculator, User, Bell } from 'lucide-react'
import { notifications } from '../data/mockData'

const unreadCount = notifications.filter(n => !n.read).length

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/challenges', icon: Swords, label: 'Quests' },
  { to: '/calculator', icon: Calculator, label: 'Calc', center: true },
  { to: '/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
  { to: '/profile', icon: User, label: 'Me' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto px-4 pb-2">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl card-shadow border border-sand-200/50 flex justify-around items-center h-16 px-2">
          {navItems.map(({ to, icon: Icon, label, badge, center }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 transition-all relative btn-press ${
                  center ? '' : isActive
                    ? 'text-brand-600'
                    : 'text-slate-300 hover:text-slate-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {center ? (
                    <div className={`w-12 h-12 -mt-4 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white scale-105'
                        : 'bg-gradient-to-br from-accent-400 to-accent-600 text-white'
                    }`}>
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        {badge ? (
                          <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                            {badge}
                          </span>
                        ) : null}
                      </div>
                      <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
                      {isActive && (
                        <div className="absolute -bottom-1 w-5 h-1 rounded-full bg-brand-500 animate-pill" />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
