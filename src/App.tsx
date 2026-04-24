import { Routes, Route, Navigate } from 'react-router-dom';
import { AppStoreProvider } from './store/AppStore';
import AppShell from './components/AppShell';
import TranscriptsList from './pages/TranscriptsList';
import TranscriptView from './pages/TranscriptView';
import Codebook from './pages/Codebook';
import Analysis from './pages/Analysis';
import Matrix from './pages/Matrix';
import CoOccurrence from './pages/CoOccurrence';
import Framework from './pages/Framework';
import Search from './pages/Search';

export default function App() {
  return (
    <AppStoreProvider>
      <Routes>
        <Route element={<AppShell />}>
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
