import { Routes, Route } from 'react-router-dom'
import JobSearch from './pages/JobSearch'

export default function App() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
      <main>
        <Routes>
          <Route path="*" element={<JobSearch />} />
        </Routes>
      </main>
    </div>
  )
}
