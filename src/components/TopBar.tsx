import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, BarChart3, Search, Grid3X3, GitBranch, Layers, Home } from 'lucide-react';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/transcripts', label: 'Media', icon: FileText },
  { to: '/codebook', label: 'Codes', icon: BookOpen },
  { to: '/analysis', label: 'Excerpts', icon: BarChart3 },
  { to: '/matrix', label: 'Matrix', icon: Grid3X3 },
  { to: '/co-occurrence', label: 'Co-Occur', icon: GitBranch },
  { to: '/framework', label: 'Framework', icon: Layers },
  { to: '/search', label: 'Search', icon: Search },
];

interface Props {
  onBackToDashboard?: () => void;
  projectName?: string;
}

export default function TopBar({ onBackToDashboard, projectName }: Props) {
  return (
    <header className="bg-[#0F1419] text-white shrink-0">
      {/* Brand row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Home size={13} />
              Projects
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight">Plenior</span>
            {projectName && (
              <>
                <span className="text-slate-600">|</span>
                <span className="text-sm text-slate-400">{projectName}</span>
              </>
            )}
          </div>
        </div>
        <p className="text-[10px] text-slate-600 italic font-reading">The fuller sense</p>
      </div>

      {/* Tab row */}
      <nav className="flex px-2" aria-label="Main navigation">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-[#C9952B] text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
