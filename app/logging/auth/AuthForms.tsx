'use client'
import { useState } from 'react'
import { useAuth } from './AuthContext'

export const LoginForm = ({ onClose }: { onClose: () => void }) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) setError(result.error)
    else onClose()
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
        className="px-2 py-1 bg-gray-800 text-white text-sm" required autoFocus />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
        className="px-2 py-1 bg-gray-800 text-white text-sm" required />
      {error && <div className="text-red-400 text-xs">{error}</div>}
      <button type="submit" disabled={loading} className="px-2 py-1 bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50">
        {loading ? '...' : 'Login'}
      </button>
    </form>
  )
}

export const SignupForm = ({ onClose }: { onClose: () => void }) => {
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signup(email, password)
    setLoading(false)
    if (result.error) setError(result.error)
    else onClose()
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
        className="px-2 py-1 bg-gray-800 text-white text-sm" required autoFocus />
      <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)}
        className="px-2 py-1 bg-gray-800 text-white text-sm" required minLength={6} />
      {error && <div className="text-red-400 text-xs">{error}</div>}
      <button type="submit" disabled={loading} className="px-2 py-1 bg-green-600 text-white text-sm hover:bg-green-500 disabled:opacity-50">
        {loading ? '...' : 'Sign Up'}
      </button>
    </form>
  )
}
