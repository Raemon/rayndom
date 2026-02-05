'use client'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

type AuthMode = 'login' | 'signup'

const LoginPage = () => {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = mode === 'login' ? await login(email, password) : await signup(email, password)
    setLoading(false)
    if (result.error) setError(result.error)
  }
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-[300px]">
        <div className="flex gap-4 mb-4 text-sm">
          <button onClick={() => setMode('login')} className={`cursor-pointer ${mode === 'login' ? 'text-white font-bold' : 'text-gray-500 hover:text-white'}`}>Login</button>
          <button onClick={() => setMode('signup')} className={`cursor-pointer ${mode === 'signup' ? 'text-white font-bold' : 'text-gray-500 hover:text-white'}`}>Sign Up</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="px-2 py-1 bg-gray-800 text-white text-sm" required autoFocus />
          <input type="password" placeholder={mode === 'signup' ? 'Password (min 6 chars)' : 'Password'} value={password} onChange={e => setPassword(e.target.value)}
            className="px-2 py-1 bg-gray-800 text-white text-sm" required minLength={mode === 'signup' ? 6 : undefined} />
          {error && <div className="text-red-400 text-xs">{error}</div>}
          <button type="submit" disabled={loading} className={`px-2 py-1 text-white text-sm cursor-pointer disabled:opacity-50 ${mode === 'login' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}>
            {loading ? '...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
