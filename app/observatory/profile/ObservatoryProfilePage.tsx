'use client'
import { useCallback, useEffect, useState } from 'react'

type ObservatoryProfileResponse = {
  profile?: { summary: string, sourceCount: number, documentCount: number, lastGeneratedAt: string | null } | null
  prompt?: { prompt: string } | null
  latestRevision?: { createdAt: string, keywordsJson: unknown } | null
  savedCount?: number
  dismissedCount?: number
  error?: string
}

const ObservatoryProfilePage = () => {
  const [data, setData] = useState<ObservatoryProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/observatory/profile', { cache: 'no-store' })
      const payload = await response.json() as ObservatoryProfileResponse
      if (!response.ok) throw new Error(payload.error || 'Failed to load profile')
      setData(payload)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void loadProfile()
  }, [loadProfile])
  const handleRefreshProfile = async () => {
    setRefreshing(true)
    setError('')
    try {
      const response = await fetch('/api/observatory/profile', { method: 'POST' })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'Failed to refresh profile')
      await loadProfile()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to refresh profile')
    } finally {
      setRefreshing(false)
    }
  }
  const keywords = Array.isArray(data?.latestRevision?.keywordsJson) ? data?.latestRevision?.keywordsJson.filter(keyword => typeof keyword === 'string') as string[] : []
  return (
    <main className="mx-auto max-w-[1100px] px-3 py-8 font-sans text-[#1f1f1f]">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid content-start gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="m-0 font-[Georgia,serif] text-[34px] font-medium">Profile</h1>
              <p className="m-0 mt-2 max-w-[720px] text-[14px] leading-[1.5] text-[#625c50]">
                This is the AI-derived profile Observatory is currently using to steer your feed. It is regenerated from your seed URLs, extracted writing, tuning prompt, and direct feedback.
              </p>
            </div>
            <button onClick={() => { void handleRefreshProfile() }} disabled={refreshing} className="cursor-pointer bg-[#1f1f1f] px-3 py-1 text-[12px] uppercase tracking-[0.5px] text-[#fffff8] disabled:opacity-50">
              {refreshing ? 'Refreshing…' : 'Refresh profile'}
            </button>
          </div>
          {loading
            ? <div className="text-[13px] text-[#7b7466]">Loading…</div>
            : (
              <div className="grid gap-5">
                <div className="bg-[#f6f2e5] p-5">
                  <div className="text-[12px] uppercase tracking-[0.5px] text-[#7b7466]">Current summary</div>
                  <div className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.6]">{data?.profile?.summary || 'No profile generated yet. Add seed URLs and refresh Observatory.'}</div>
                </div>
                <div className="grid gap-3">
                  <div className="text-[12px] uppercase tracking-[0.5px] text-[#7b7466]">Detected keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.length
                      ? keywords.map(keyword => <span key={keyword} className="bg-[#f6f2e5] px-2 py-1 text-[12px]">{keyword}</span>)
                      : <span className="text-[13px] text-[#7b7466]">No keywords yet.</span>}
                  </div>
                </div>
              </div>
            )}
          {error && <div className="text-[12px] text-[#9c3b32]">{error}</div>}
        </section>
        <aside className="grid content-start gap-5">
          <div className="bg-[#f6f2e5] p-4">
            <div className="text-[12px] uppercase tracking-[0.5px]">Stats</div>
            <div className="mt-3 grid gap-2 text-[13px] text-[#5b5548]">
              <div>{data?.profile?.sourceCount || 0} source domains</div>
              <div>{data?.profile?.documentCount || 0} imported documents</div>
              <div>{data?.savedCount || 0} saved items</div>
              <div>{data?.dismissedCount || 0} dismissed items</div>
            </div>
          </div>
          <div className="bg-[#f6f2e5] p-4">
            <div className="text-[12px] uppercase tracking-[0.5px]">Prompt excerpt</div>
            <div className="mt-3 whitespace-pre-wrap text-[13px] leading-[1.5] text-[#5b5548]">{data?.prompt?.prompt || 'No prompt yet.'}</div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default ObservatoryProfilePage
