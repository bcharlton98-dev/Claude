import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';

interface Props {
  onBackToDashboard?: () => void;
  projectName?: string;
}

export default function AppShell({ onBackToDashboard, projectName }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <TopBar onBackToDashboard={onBackToDashboard} projectName={projectName} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
