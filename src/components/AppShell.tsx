import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface Props {
  onBackToDashboard?: () => void;
}

export default function AppShell({ onBackToDashboard }: Props) {
  return (
    <div className="flex min-h-screen bg-cream-50">
      <Sidebar onBackToDashboard={onBackToDashboard} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
