'use client'
import { useEffect, useState } from 'react'

const ProxyContentViewer = ({ url }:{ url: string }) => {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    setHtml(null)
    setError(false)
    let cancelled = false
    fetch(`/api/proxy-content?url=${encodeURIComponent(url)}`)
      .then(res => {
        if (!res.ok) throw new Error('fetch failed')
        return res.text()
      })
      .then(text => { if (!cancelled) setHtml(text) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [url])
  if (error) return <div className="flex items-center justify-center h-full text-[#999] text-sm">Failed to load content — <a href={url} target="_blank" rel="noreferrer" className="ml-1 underline">open in new tab</a></div>
  if (html === null) return <div className="flex items-center justify-center h-full text-[#999] text-sm">Loading content…</div>
  return <div className="h-full w-full overflow-y-auto" dangerouslySetInnerHTML={{ __html: html }} />
}

export default ProxyContentViewer
