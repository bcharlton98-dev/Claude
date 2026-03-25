import { Routes, Route } from 'react-router-dom'
import PasswordGate from './components/PasswordGate'
import JobSearch from './pages/JobSearch'

// To change the password, run in browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
//     .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))
// Then replace the hash below.
const PASSWORD_HASH = 'a3ebd9ee973efc656a1ccd64b6b34e314bd1f8a296178de7be04702e0321802a'

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
