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
        <div className="bg-white/90 backdrop-blur-xl rounded-[20px] card-shadow border border-cream-200/50 flex justify-around items-center h-16 px-2">
          {navItems.map(({ to, icon: Icon, label, center }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 transition-all relative btn-press ${
                  center ? '' : isActive
                    ? 'text-forest-500'
                    : 'text-warm-300 hover:text-warm-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {center ? (
                    <div className={`w-12 h-12 -mt-4 rounded-[18px] flex items-center justify-center shadow-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-forest-400 to-forest-600 text-white scale-105'
                        : 'bg-gradient-to-br from-forest-400 to-forest-600 text-white'
                    }`}>
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                  ) : (
                    <>
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
                      {isActive && (
                        <div className="absolute -bottom-1 w-5 h-1 rounded-full bg-forest-500 animate-pill" />
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
