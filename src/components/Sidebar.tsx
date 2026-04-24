import { NavLink } from 'react-router-dom';
import { FileText, BookOpen, BarChart3, Search, Grid3X3, GitBranch, Layers, Home } from 'lucide-react';

const links = [
  { to: '/transcripts', label: 'Transcripts', icon: FileText },
  { to: '/codebook', label: 'Codebook', icon: BookOpen },
  { to: '/analysis', label: 'Analysis', icon: BarChart3 },
  { to: '/matrix', label: 'Matrix', icon: Grid3X3 },
  { to: '/co-occurrence', label: 'Co-Occurrence', icon: GitBranch },
  { to: '/framework', label: 'Framework', icon: Layers },
  { to: '/search', label: 'Search', icon: Search },
];

interface Props {
  onBackToDashboard?: () => void;
}

export default function Sidebar({ onBackToDashboard }: Props) {
  return (
    <aside className="w-60 bg-slate-900 text-slate-200 flex flex-col min-h-screen shrink-0">
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">Plenior</h1>
        <p className="text-xs text-slate-500 mt-1 italic font-reading">The fuller sense</p>
      </div>
      {onBackToDashboard && (
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-3 px-6 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800"
        >
          <Home size={18} />
          All Projects
        </button>
      )}
      <nav className="flex-1 py-4" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-[15px] transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-r-2 border-indigo-400'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
