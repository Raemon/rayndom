'use client'
import { useCallback, useEffect, useState } from 'react'

type SourceDomain = { id: number, domain: string, status: string, notes: string | null }
type SeedUrl = { id: number, url: string, title: string | null, status: string, createdAt: string, sourceDomain: SourceDomain | null }

const ObservatorySourcesPage = () => {
  const [seedUrl, setSeedUrl] = useState('')
  const [seedUrls, setSeedUrls] = useState<SeedUrl[]>([])
  const [sourceDomains, setSourceDomains] = useState<SourceDomain[]>([])
  const [allowedDomains, setAllowedDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const loadSources = useCallback(async () => {
    try {
      const response = await fetch('/api/observatory/sources', { cache: 'no-store' })
      const data = await response.json() as { seedUrls?: SeedUrl[], sourceDomains?: SourceDomain[], allowedDomains?: string[], error?: string }
      if (!response.ok) throw new Error(data.error || 'Failed to load sources')
      setSeedUrls(data.seedUrls || [])
      setSourceDomains(data.sourceDomains || [])
      setAllowedDomains(data.allowedDomains || [])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load sources')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void loadSources()
  }, [loadSources])
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/observatory/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: seedUrl }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Failed to add seed URL')
      setSeedUrl('')
      await loadSources()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to add seed URL')
    } finally {
      setSaving(false)
    }
  }
  return (
    <main className="mx-auto max-w-[1200px] px-3 py-8 font-sans text-[#1f1f1f]">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid content-start gap-5">
          <div>
            <h1 className="m-0 font-[Georgia,serif] text-[34px] font-medium">Sources</h1>
            <p className="m-0 mt-2 max-w-[760px] text-[14px] leading-[1.5] text-[#625c50]">
              Add a seed URL from your own site or blogroll. Observatory will fetch the seed page, extract readable text, follow a handful of same-domain links, and use that corpus to infer your taste profile.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-2 bg-[#f6f2e5] p-4">
            <div className="text-[12px] uppercase tracking-[0.5px]">Add seed URL</div>
            <input type="url" value={seedUrl} onChange={event => setSeedUrl(event.target.value)}
              placeholder="https://your-site.example/blog"
              className="bg-[#fffdf5] px-2 py-2 text-[13px] outline-none" required />
            <button type="submit" disabled={saving} className="justify-self-start cursor-pointer bg-[#1f1f1f] px-3 py-1 text-[12px] uppercase tracking-[0.5px] text-[#fffff8] disabled:opacity-50">
              {saving ? 'Adding…' : 'Add source'}
            </button>
            {error && <div className="text-[12px] text-[#9c3b32]">{error}</div>}
          </form>
          <div className="grid gap-3">
            <div className="text-[12px] uppercase tracking-[0.5px] text-[#7b7466]">Seed URLs</div>
            {loading
              ? <div className="text-[13px] text-[#7b7466]">Loading…</div>
              : seedUrls.length
                ? seedUrls.map(seed => (
                  <div key={seed.id} className="grid gap-1 border-t border-[#ddd6c8] py-3 text-[13px]">
                    <div className="font-medium">{seed.title || seed.url}</div>
                    <div className="break-all text-[#6b665b]">{seed.url}</div>
                    <div className="text-[11px] uppercase tracking-[0.5px] text-[#8b8477]">{seed.status} · {seed.sourceDomain?.domain || 'unknown domain'}</div>
                  </div>
                ))
                : <div className="text-[13px] text-[#7b7466]">No seed URLs yet.</div>}
          </div>
        </section>
        <aside className="grid content-start gap-5">
          <div className="bg-[#f6f2e5] p-4">
            <div className="text-[12px] uppercase tracking-[0.5px]">Allowed domains</div>
            <div className="mt-3 grid gap-1 text-[13px] text-[#5b5548]">
              {allowedDomains.map(domain => <div key={domain}>{domain}</div>)}
            </div>
          </div>
          <div className="bg-[#f6f2e5] p-4">
            <div className="text-[12px] uppercase tracking-[0.5px]">Requested domains</div>
            <div className="mt-3 grid gap-2 text-[13px]">
              {sourceDomains.map(domain => (
                <div key={domain.id} className="grid gap-1">
                  <div>{domain.domain}</div>
                  <div className="text-[11px] uppercase tracking-[0.5px] text-[#8b8477]">{domain.status}</div>
                  {domain.notes && <div className="text-[12px] text-[#6b665b]">{domain.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default ObservatorySourcesPage
