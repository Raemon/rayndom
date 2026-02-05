'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthContext'

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/logging/login'
  useEffect(() => {
    if (loading) return
    if (!user && !isLoginPage) router.replace('/logging/login')
    if (user && isLoginPage) router.replace('/logging')
  }, [user, loading, isLoginPage, router])
  if (loading) return null
  if (!user && !isLoginPage) return null
  return <>{children}</>
}

export default AuthGate
