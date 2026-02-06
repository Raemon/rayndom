'use client'
import { useEffect, useState } from 'react'

const MEMORY_BASE = 'http://localhost:8765'

type MemoryLink = { href: string; description: string }

const MemoryPage = () => {
  const [links, setLinks] = useState<MemoryLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetch(MEMORY_BASE)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const anchors = doc.querySelectorAll('a')
        const parsed: MemoryLink[] = Array.from(anchors).map(a => {
          const li = a.closest('li')
          const fullText = li?.textContent || ''
          const description = fullText.replace(a.textContent || '', '').replace(/^\s*-\s*/, '').trim()
          return { href: a.getAttribute('href') || '', description }
        })
        setLinks(parsed)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])
  return (
    <div className="p-4 text-sm">
      <div className="text-lg text-white mb-2">Memory</div>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-400">Failed to connect to memory server: {error}</div>}
      {links.map(link => (
        <div key={link.href} className="flex items-center gap-2 py-0.5">
          <a href={`${MEMORY_BASE}${link.href}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{link.href}</a>
          {link.description && <span className="text-gray-500">{link.description}</span>}
        </div>
      ))}
    </div>
  )
}

export default MemoryPage
