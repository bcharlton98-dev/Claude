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
    <aside className="w-56 bg-warm-800 text-cream-100 flex flex-col min-h-screen shrink-0">
      <div className="px-5 py-5 border-b border-warm-700">
        <h1 className="text-lg font-bold tracking-tight">QualCode</h1>
        <p className="text-xs text-warm-400 mt-0.5">Qualitative Coding</p>
      </div>
      {onBackToDashboard && (
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-3 px-5 py-2.5 text-sm text-warm-300 hover:bg-warm-700/50 hover:text-cream-100 transition-colors border-b border-warm-700"
        >
          <Home size={18} />
          All Projects
        </button>
      )}
      <nav className="flex-1 py-3" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-warm-700 text-cream-50 font-medium'
                  : 'text-warm-300 hover:bg-warm-700/50 hover:text-cream-100'
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
