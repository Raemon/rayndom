'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { LoginForm } from './AuthForms'
import { SignupForm } from './AuthForms'
import ChangePasswordForm from './ChangePasswordForm'

type AuthMode = 'none' | 'login' | 'signup'

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)

const AuthHeader = () => {
  const { user, loading, logout } = useAuth()
  const [mode, setMode] = useState<AuthMode>('none')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])
  if (loading) return <div className="text-gray-500 text-xs">...</div>
  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-white" title={user.email}>
          <PersonIcon />
        </button>
        {menuOpen && (
          <div className="absolute top-6 right-0 bg-gray-900 z-50 min-w-[160px] text-xs py-1">
            <div className="px-3 py-1 text-gray-500">{user.email}</div>
            <button onClick={() => { setShowChangePassword(true); setMenuOpen(false) }} className="w-full text-left px-3 py-1 text-gray-300 hover:bg-gray-800 hover:text-white">Change Password</button>
            <button onClick={() => { logout(); setMenuOpen(false) }} className="w-full text-left px-3 py-1 text-gray-300 hover:bg-gray-800 hover:text-white">Logout</button>
          </div>
        )}
        {showChangePassword && (
          <div className="absolute top-6 right-0 bg-gray-900 p-3 z-50 min-w-[240px] text-xs">
            <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
          </div>
        )}
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
