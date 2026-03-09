'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ObservatoryAuthGate from './auth/ObservatoryAuthGate'
import { ObservatoryAuthProvider, useObservatoryAuth } from './auth/ObservatoryAuthContext'

const observatoryLinks = [
  { href: '/observatory/foryou', label: 'For You' },
  { href: '/observatory/hackernews', label: 'Hacker News' },
  { href: '/observatory/lw', label: 'LW' },
  { href: '/observatory/arxiv', label: 'arXiv' },
  { href: '/observatory/sources', label: 'Sources' },
  { href: '/observatory/profile', label: 'Profile' },
  { href: '/observatory/filter-prompt', label: 'Prompt' },
]

const ObservatoryChrome = ({ children }:{ children: React.ReactNode }) => {
  const pathname = usePathname()
  const { user, logout } = useObservatoryAuth()
  const isLoginPage = pathname === '/observatory/login'
  if (isLoginPage) return <>{children}</>
  return (
    <div className="light-page min-h-screen bg-[#fffff8] text-[#1f1f1f]">
      <header className="sticky top-0 z-40 border-b border-[#d6d1bf] bg-[#fffff8]">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2">
          <nav className="flex flex-1 flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.5px]">
            {observatoryLinks.map(link => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? 'text-[#1f1f1f] underline underline-offset-4' : 'text-[#7b7466] no-underline hover:text-[#1f1f1f]'}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-[11px] font-sans">
            <span className="text-[#6b665b]">{user?.email}</span>
            <button onClick={() => { void logout() }} className="cursor-pointer bg-transparent p-0 text-[#6b665b] hover:text-[#1f1f1f]">Logout</button>
          </div>
        </div>
      </header>
      <ObservatoryAuthGate>{children}</ObservatoryAuthGate>
    </div>
  )
}

const ObservatoryLayoutClient = ({ children }:{ children: React.ReactNode }) => {
  return (
    <ObservatoryAuthProvider>
      <ObservatoryChrome>{children}</ObservatoryChrome>
    </ObservatoryAuthProvider>
  )
}

export default ObservatoryLayoutClient
