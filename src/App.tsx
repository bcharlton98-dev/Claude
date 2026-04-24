import { useState, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppStoreProvider } from './store/AppStore';
import AppShell from './components/AppShell';
import Dashboard, { setLastProjectId } from './pages/Dashboard';
import TranscriptsList from './pages/TranscriptsList';
import TranscriptView from './pages/TranscriptView';
import Codebook from './pages/Codebook';
import Analysis from './pages/Analysis';
import Matrix from './pages/Matrix';
import CoOccurrence from './pages/CoOccurrence';
import Framework from './pages/Framework';
import Search from './pages/Search';
import { setCurrentProjectId } from './lib/storage';

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const hasBeenInProject = useRef(false);

  const handleOpenProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
    setLastProjectId(projectId);
    setActiveProjectId(projectId);
    hasBeenInProject.current = true;
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setCurrentProjectId(null);
    setActiveProjectId(null);
  }, []);

  if (!activeProjectId) {
    return <Dashboard onOpenProject={handleOpenProject} skipAutoOpen={hasBeenInProject.current} />;
  }

  return (
    <AppStoreProvider key={activeProjectId} onBackToDashboard={handleBackToDashboard}>
      <Routes>
        <Route element={<AppShell onBackToDashboard={handleBackToDashboard} />}>
          <Route path="/" element={<Navigate to="/transcripts" replace />} />
          <Route path="/transcripts" element={<TranscriptsList />} />
          <Route path="/transcripts/:id" element={<TranscriptView />} />
          <Route path="/codebook" element={<Codebook />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/matrix" element={<Matrix />} />
          <Route path="/co-occurrence" element={<CoOccurrence />} />
          <Route path="/framework" element={<Framework />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<Navigate to="/transcripts" replace />} />
        </Route>
      </Routes>
    </AppStoreProvider>
  );
}
