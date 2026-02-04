'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HeaderTimer from './HeaderTimer'

const navLinks = [
  { href: '/logging', label: 'Timer' },
  { href: '/logging/zen', label: 'Zen' },
  { href: '/logging/tags', label: 'Tags' },
  { href: '/logging/commands', label: 'Commands' },
]

export default function LoggingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black flex items-center justify-between p-2">
        <HeaderTimer />
        <nav className="flex gap-4 text-xs">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={pathname === href ? 'font-bold text-white!' : 'text-gray-500! hover:text-white!'}>
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="pt-12">
        {children}
      </div>
    </div>
  )
}
