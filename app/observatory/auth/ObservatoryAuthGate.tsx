'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useObservatoryAuth } from './ObservatoryAuthContext'

const ObservatoryAuthGate = ({ children }:{ children: React.ReactNode }) => {
  const { user, loading } = useObservatoryAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/observatory/login'
  useEffect(() => {
    if (loading) return
    if (!user && !isLoginPage) router.replace('/observatory/login')
    if (user && isLoginPage) router.replace('/observatory/foryou')
  }, [isLoginPage, loading, router, user])
  if (loading) return null
  if (!user && !isLoginPage) return null
  return <>{children}</>
}

export default ObservatoryAuthGate
