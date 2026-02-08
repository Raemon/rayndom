'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

function toTitleCase(slug: string) {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const TitleFromUrl = () => {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname === '/') { document.title = 'Home'; return }
    const segments = pathname.split('/').filter(Boolean)
    document.title = segments.map(toTitleCase).join(' / ')
  }, [pathname])
  return null
}

export default TitleFromUrl
