import type { Metadata } from 'next'
import LoggingLayoutClient from './LoggingLayoutClient'

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/logging/icon', sizes: '32x32', type: 'image/png' },
      { url: '/logging-icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcut: [{ url: '/logging-favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
    apple: [{ url: '/logging/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
}

export default function LoggingLayout({ children }: { children: React.ReactNode }) {
  return <LoggingLayoutClient>{children}</LoggingLayoutClient>
}
