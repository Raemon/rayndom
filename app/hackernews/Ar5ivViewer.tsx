'use client'
import { useEffect, useState } from 'react'

const Ar5ivViewer = ({ url }:{ url: string }) => {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    setHtml(null)
    setError(false)
    let cancelled = false
    fetch(`/api/ar5iv?url=${encodeURIComponent(url)}`)
      .then(res => {
        if (!res.ok) throw new Error('fetch failed')
        return res.text()
      })
      .then(text => { if (!cancelled) setHtml(text) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [url])
  if (error) return <div className="flex items-center justify-center h-full text-[#999] text-sm">Failed to load ar5iv content</div>
  if (html === null) return <div className="flex items-center justify-center h-full text-[#999] text-sm">Loading paper…</div>
  return <iframe srcDoc={html} className="h-full w-full border-none" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
}

export default Ar5ivViewer
