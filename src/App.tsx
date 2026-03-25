import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import HomeScreen from './pages/HomeScreen'
import Progress from './pages/Progress'
import Challenges from './pages/Challenges'
import ChallengeDetail from './pages/ChallengeDetail'
import Calculator from './pages/Calculator'
import Profile from './pages/Profile'
import JobSearch from './pages/JobSearch'

export default function App() {
  const location = useLocation()
  const isJobSearch = location.pathname === '/jobs'

  return (
    <div className={`max-w-lg mx-auto min-h-screen ${isJobSearch ? 'bg-gray-50' : 'bg-sand-50 pb-24'}`}>
      <main className={isJobSearch ? '' : 'px-5 pt-6'}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/jobs" element={<JobSearch />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      {!isJobSearch && <BottomNav />}
    </div>
  )
}
