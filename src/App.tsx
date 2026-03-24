import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Challenges from './pages/Challenges'
import Calculator from './pages/Calculator'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

export default function App() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-brand-50 pb-20">
      <main className="px-4 pt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
