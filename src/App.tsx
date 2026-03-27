import { Routes, Route } from 'react-router-dom'
import PasswordGate from './components/PasswordGate'
import JobSearch from './pages/JobSearch'

// To change the password, run in browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
//     .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))
// Then replace the hash below.
const PASSWORD_HASH = '5e737f891db1175442a39fde73e51d781a545506d71c95477a6deb5988bd7f9a'

export default function App() {
  return (
    <PasswordGate passwordHash={PASSWORD_HASH}>
      <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
        <main>
          <Routes>
            <Route path="*" element={<JobSearch />} />
          </Routes>
        </main>
      </div>
    </PasswordGate>
  )
}
