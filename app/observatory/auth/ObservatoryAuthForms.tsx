'use client'
import { useState } from 'react'
import { useObservatoryAuth } from './ObservatoryAuthContext'

const ObservatoryAuthForm = ({ mode, onSuccess }:{ mode: 'login' | 'signup', onSuccess?: () => void }) => {
  const { login, signup } = useObservatoryAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isSignup = mode === 'signup'
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const result = isSignup ? await signup(email, password) : await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onSuccess?.()
  }
  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <input type="email" placeholder="Email" value={email} onChange={event => setEmail(event.target.value)}
        className="bg-[#fffdf5] px-2 py-1 text-[13px] outline-none" required autoFocus />
      <input type="password" placeholder={isSignup ? 'Password (10+ chars)' : 'Password'} value={password} onChange={event => setPassword(event.target.value)}
        className="bg-[#fffdf5] px-2 py-1 text-[13px] outline-none" required minLength={isSignup ? 10 : 1} />
      {error && <div className="text-[12px] text-[#9c3b32]">{error}</div>}
      <button type="submit" disabled={loading} className="cursor-pointer bg-[#1f1f1f] px-2 py-1 text-[12px] uppercase tracking-[0.5px] text-[#fffff8] disabled:opacity-50">
        {loading ? 'Working...' : isSignup ? 'Create account' : 'Login'}
      </button>
    </form>
  )
}

export const ObservatoryLoginForm = ({ onSuccess }:{ onSuccess?: () => void }) => <ObservatoryAuthForm mode="login" onSuccess={onSuccess} />
export const ObservatorySignupForm = ({ onSuccess }:{ onSuccess?: () => void }) => <ObservatoryAuthForm mode="signup" onSuccess={onSuccess} />
