'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HeaderTimer from './HeaderTimer'
import { AuthProvider } from './auth/AuthContext'
import AuthHeader from './auth/AuthHeader'
import AuthGate from './auth/AuthGate'

const navLinks = [
  { href: '/logging', label: 'Timer' },
  { href: '/logging/zen', label: 'Zen' },
  { href: '/logging/sidebar', label: 'Sidebar' },
  { href: '/logging/tags', label: 'Tags' },
  { href: '/logging/commands', label: 'Commands' },
  { href: '/logging/memory', label: 'Memory' },
]

const LoggingLayoutClient = ({ children }:{ children: React.ReactNode }) => {
  const pathname = usePathname()
  const showHeaderTimer = pathname === '/logging' || pathname === '/logging/zen' || pathname === '/logging/sidebar'
  return (
    <AuthProvider>
      <div>
        <header className="fixed top-0 left-0 right-0 z-50 bg-black flex items-center justify-between p-2">
          {showHeaderTimer && <HeaderTimer />}
          <div className="flex items-center gap-4">
            <nav className="flex gap-4 text-xs">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={pathname === href ? 'font-bold text-white!' : 'text-gray-500! hover:text-white!'}>
                  {label}
                </Link>
              ))}
            </nav>
            <AuthHeader />
          </div>
        </header>
        <AuthGate>
          <div className="pt-12">
            {children}
          </div>
        </AuthGate>
      </div>
    </AuthProvider>
  )
}

export default LoggingLayoutClient
