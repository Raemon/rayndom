'use client'
import { useState, useEffect } from 'react'
import { marked } from 'marked'
import MarkdownContent from '../common/MarkdownContent'

const ObservatoryPage = () => {
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [subdocuments, setSubdocuments] = useState<string[]>([])

  const fetchDocument = async () => {
    try {
      const res = await fetch('/api/observatory')
      const data = await res.json()
      if (data.document) setDocument(data.document)
      if (data.subdocuments) setSubdocuments(data.subdocuments)
    } catch (e) {
      // silent — no document yet
    }
  }

  useEffect(() => { fetchDocument() }, [])

  const handleUpdate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/observatory', { method: 'POST' })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      if (data.document) setDocument(data.document)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const html = document ? (marked.parse(document) as string) : null

  return (
    <div className="p-4 text-sm text-white max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-lg">Observatory — Life Goals</h1>
        <button onClick={handleUpdate} disabled={loading}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-sm cursor-pointer">
          {loading ? 'Updating...' : document ? 'Update from activity' : 'Generate from activity'}
        </button>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {html && <MarkdownContent html={html} />}
      {!document && !loading && <div className="text-white/50">No goals document yet. Click the button to generate one from your activity data.</div>}
    </div>
  )
}

export default ObservatoryPage
