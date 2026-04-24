import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, BarChart3, Search, Grid3X3, GitBranch, Layers, ChevronLeft } from 'lucide-react';

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
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-5">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ChevronLeft size={16} />
              Projects
            </button>
          )}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">Plenior</span>
            {projectName && (
              <>
                <span className="text-slate-700 text-lg">|</span>
                <span className="text-base text-slate-400 font-medium">{projectName}</span>
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-600 italic font-reading">The fuller sense</p>
      </div>

      {/* Tab row */}
      <nav className="flex px-4 gap-1" aria-label="Main navigation">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-5 py-3 text-sm font-medium transition-colors border-b-[3px] ${
                isActive
                  ? 'border-[#C9952B] text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
