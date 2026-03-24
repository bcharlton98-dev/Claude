import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'
import Challenges from './pages/Challenges'
import Calculator from './pages/Calculator'
import Profile from './pages/Profile'

export default function App() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-sand-50 pb-24">
      <main className="px-5 pt-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
