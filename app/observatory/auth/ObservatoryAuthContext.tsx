'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type ObservatoryUser = { id: number, email: string, createdAt: string } | null

type ObservatoryAuthContextValue = {
  user: ObservatoryUser
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const ObservatoryAuthContext = createContext<ObservatoryAuthContextValue | null>(null)

export const useObservatoryAuth = () => {
  const context = useContext(ObservatoryAuthContext)
  if (!context) throw new Error('useObservatoryAuth must be used within ObservatoryAuthProvider')
  return context
}

export const ObservatoryAuthProvider = ({ children }:{ children: React.ReactNode }) => {
  const [user, setUser] = useState<ObservatoryUser>(null)
  const [loading, setLoading] = useState(true)
  const refresh = async () => {
    try {
      const response = await fetch('/api/observatory/auth/me', { cache: 'no-store' })
      const data = await response.json() as { user: ObservatoryUser }
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void refresh()
  }, [])
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/observatory/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json() as { user?: ObservatoryUser, error?: string }
    if (!response.ok) return { error: data.error || 'Login failed' }
    setUser(data.user || null)
    return {}
  }
  const signup = async (email: string, password: string) => {
    const response = await fetch('/api/observatory/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json() as { user?: ObservatoryUser, error?: string }
    if (!response.ok) return { error: data.error || 'Signup failed' }
    setUser(data.user || null)
    return {}
  }
  const logout = async () => {
    await fetch('/api/observatory/auth/logout', { method: 'POST' })
    setUser(null)
  }
  return <ObservatoryAuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>{children}</ObservatoryAuthContext.Provider>
}
