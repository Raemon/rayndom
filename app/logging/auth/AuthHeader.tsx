'use client'
import { useState } from 'react'
import { useAuth } from './AuthContext'
import { LoginForm } from './AuthForms'
import { SignupForm } from './AuthForms'

type AuthMode = 'none' | 'login' | 'signup'

const AuthHeader = () => {
  const { user, loading, logout } = useAuth()
  const [mode, setMode] = useState<AuthMode>('none')
  if (loading) return <div className="text-gray-500 text-xs">...</div>
  if (user) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-400">{user.email}</span>
        <button onClick={logout} className="text-gray-500 hover:text-white">Logout</button>
      </div>
    )
  }
  return (
    <div className="relative text-xs">
      <div className="flex items-center gap-2 text-xs">
        <button onClick={() => setMode(mode === 'login' ? 'none' : 'login')} className="text-gray-500 hover:text-white">Login</button>
        <button onClick={() => setMode(mode === 'signup' ? 'none' : 'signup')} className="text-gray-500 hover:text-white">Sign Up</button>
      </div>
      {mode !== 'none' && (
        <div className="absolute top-6 right-0 bg-gray-900 p-3 z-50 min-w-[200px] text-xs">
          {mode === 'login' && <LoginForm onClose={() => setMode('none')} />}
          {mode === 'signup' && <SignupForm onClose={() => setMode('none')} />}
        </div>
      )}
    </div>
  )
}

export default AuthHeader
