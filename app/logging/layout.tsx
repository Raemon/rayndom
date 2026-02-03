'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
      <nav className="flex gap-4 p-2 text-sm">
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} className={pathname === href ? 'font-bold' : 'text-gray-500 hover:text-gray-700'}>
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
