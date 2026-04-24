import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, BarChart3, Search, Grid3X3, GitBranch, Layers, Home } from 'lucide-react';

const mainLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transcripts', label: 'Transcripts', icon: FileText },
  { to: '/codebook', label: 'Codebook', icon: BookOpen },
];

const analysisLinks = [
  { to: '/analysis', label: 'Analysis', icon: BarChart3 },
  { to: '/matrix', label: 'Matrix', icon: Grid3X3 },
  { to: '/co-occurrence', label: 'Co-Occurrence', icon: GitBranch },
  { to: '/framework', label: 'Framework', icon: Layers },
];

const toolLinks = [
  { to: '/search', label: 'Search', icon: Search },
];

interface Props {
  onBackToDashboard?: () => void;
}

function NavSection({ label, links }: { label?: string; links: { to: string; label: string; icon: React.ComponentType<{ size?: number }> }[] }) {
  return (
    <div className="mb-1">
      {label && (
        <p className="px-5 pt-4 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
      )}
      {links.map(({ to, label: linkLabel, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 mx-2 px-4 py-2 text-[13px] rounded-lg transition-colors ${
              isActive
                ? 'bg-navy-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <Icon size={16} />
          {linkLabel}
        </NavLink>
      ))}
    </div>
  );
}

export default function Sidebar({ onBackToDashboard }: Props) {
  return (
    <aside className="w-56 bg-[#0F1419] text-slate-300 flex flex-col min-h-screen shrink-0">
      <div className="px-5 py-4 border-b border-slate-800/50">
        <h1 className="text-lg font-bold tracking-tight text-white">Plenior</h1>
        <p className="text-[10px] text-slate-500 mt-0.5 italic font-reading tracking-wide">The fuller sense</p>
      </div>
      {onBackToDashboard && (
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-3 mx-2 mt-2 px-4 py-2 text-[13px] text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors rounded-lg"
        >
          <Home size={15} />
          All Projects
        </button>
      )}
      <nav className="flex-1 py-2" aria-label="Main navigation">
        <NavSection links={mainLinks} />
        <NavSection label="Analysis" links={analysisLinks} />
        <NavSection label="Tools" links={toolLinks} />
      </nav>
    </aside>
  );
}
