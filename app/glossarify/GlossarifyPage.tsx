'use client'
import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

const GlossarifyPage = () => {
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const convert = async (body: BodyInit | string, headers?: HeadersInit, label?: string) => {
    setSource(label || null)
    setLoading(true)
    setError(null)
    setMarkdown(null)
    try {
      const res = await fetch('/api/glossarify/convert', { method: 'POST', body, headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Conversion failed')
      setMarkdown(data.markdown)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('pdf', file)
    convert(formData, undefined, file.name)
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    convert(JSON.stringify({ url: url.trim() }), { 'Content-Type': 'application/json' }, url.trim())
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', color: '#ddd', fontFamily: 'var(--font-lora)' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '12px', fontFamily: 'var(--font-cormorant-garamond)' }}>Glossarify</h1>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} />
        <span style={{ color: '#666' }}>or</span>
        <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '6px', flex: 1 }}>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste PDF URL" style={{ flex: 1, padding: '4px 8px', background: '#444', color: '#ddd', border: '1px solid #555', fontFamily: 'var(--font-geist-sans)' }} />
        <button type="submit" disabled={loading || !url.trim()} style={{ padding: '4px 12px', background: '#555', color: '#ddd', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-geist-sans)' }}>Go</button>
        </form>
      </div>
      {loading && <div style={{ color: '#aaa' }}>Converting {source}...</div>}
      {error && <div style={{ color: '#f66' }}>{error}</div>}
      {markdown && (
        <div className="glossarify-content" style={{ marginTop: '16px' }}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

export default GlossarifyPage
