import { NavLink } from 'react-router-dom'
import { Home, Swords, Calculator, User, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/challenges', icon: Swords, label: 'Quests', center: true },
  { to: '/calculator', icon: Calculator, label: 'Calc' },
  { to: '/profile', icon: User, label: 'Me' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto px-4 pb-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl card-shadow border border-cream-200/50 flex justify-around items-center h-14 px-2">
          {navItems.map(({ to, icon: Icon, label, center }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 transition-all relative btn-press ${
                  center ? '' : isActive ? 'text-forest-600' : 'text-warm-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {center ? (
                    <div className={`w-10 h-10 -mt-3 rounded-xl flex items-center justify-center transition-all bg-forest-600 text-white ${
                      isActive ? 'scale-105' : ''
                    }`} style={{ boxShadow: '0 2px 8px rgba(74,103,65,0.25)' }}>
                      <Icon size={20} strokeWidth={2} fill={isActive ? 'currentColor' : 'none'} />
                    </div>
                  ) : (
                    <>
                      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} fill={isActive ? 'currentColor' : 'none'} />
                      <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                      {isActive && <div className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-forest-600 animate-pill" />}
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
