import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

const STORAGE_KEY = 'job-search-auth';

// Hash the password so it's not in plain text in the bundle
async function hashPassword(pw: string): Promise<string> {
  const encoded = new TextEncoder().encode(pw.trim().toLowerCase());
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

interface PasswordGateProps {
  passwordHash: string;
  children: React.ReactNode;
}

export default function PasswordGate({ passwordHash, children }: PasswordGateProps) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === passwordHash) {
      setAuthed(true);
    }
    setChecking(false);
  }, [passwordHash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const hash = await hashPassword(input);
    if (hash === passwordHash) {
      localStorage.setItem(STORAGE_KEY, hash);
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  if (checking) return null;
  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Job Search</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Enter the password to continue</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className={`w-full border rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
          {error && (
            <p className="text-red-500 text-sm">Wrong password, try again</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
