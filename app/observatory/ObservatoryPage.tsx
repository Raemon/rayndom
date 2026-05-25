'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import StoryList from './StoryList'
import { StoryCard } from './hackerNewsTypes'
import { Tab, TABS } from './constants'

const labelForEndpoint = (endpoint: string) => endpoint.split('/').pop() ?? endpoint

const ActionButton = ({ endpoints, label, loadingLabel }: { endpoints: string[], label: string, loadingLabel: string }) => {
  const [busy, setBusy] = useState(false)
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const failures: string[] = []
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint, { method: 'POST' })
            if (!res.ok) {
              const body = await res.json().catch(() => null)
              failures.push(`${labelForEndpoint(endpoint)}: ${body?.error ?? `HTTP ${res.status}`}`)
            }
          } catch {
            failures.push(`${labelForEndpoint(endpoint)}: network error`)
          }
        }
        if (failures.length === endpoints.length) {
          alert(`${label} failed:\n\n${failures.join('\n')}`)
          setBusy(false)
          return
        }
        if (failures.length > 0) {
          alert(`${label} partially succeeded.\nFailed:\n\n${failures.join('\n')}`)
        }
        window.location.reload()
      }}
      className="text-[12px] text-[#333] hover:text-[#1f1f1f] bg-transparent border-0 cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-wait"
    >{busy ? loadingLabel : label}</button>
  )
}

const ObservatoryPage = ({ activeTab, initialCards, initialCursor, initialHasMore }: {
  activeTab: Tab
  initialCards: StoryCard[]
  initialCursor: string | null
  initialHasMore: boolean
}) => {
  const currentTab = TABS.find(t => t.key === activeTab)!
  const tabHref = (key: string) => `/observatory/${key}`

  // Day-by-day infinite scroll: the server renders the most recent import-day,
  // and each subsequent day is fetched as the sentinel near the bottom comes into
  // view. State resets on tab change because the page keys this component by tab.
  const [cards, setCards] = useState(initialCards)
  const [cursor, setCursor] = useState(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // Synchronous in-flight guard: state updates are async, so two IntersectionObserver
  // callbacks firing before `loading` commits would otherwise fetch the same day twice
  // and append duplicates (duplicate React keys). The ref flips immediately.
  const loadingRef = useRef(false)

  // `auto` is true for scroll-triggered loads and false for an explicit retry click.
  // Auto loads back off while an error is showing so a failing request can't be
  // retried in a tight loop by the observer; the retry button passes auto=false to
  // clear the error and try again.
  const loadDay = useCallback(async (auto: boolean) => {
    if (loadingRef.current || !hasMore || !cursor) return
    if (auto && error) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/observatory/stories?source=${encodeURIComponent(activeTab)}&before=${encodeURIComponent(cursor)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { cards: StoryCard[], nextCursor: string | null, hasMore: boolean }
      setCards(prev => [...prev, ...data.cards])
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load earlier days')
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [hasMore, cursor, activeTab, error])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0]?.isIntersecting) loadDay(true) },
      { rootMargin: '600px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadDay])

  return (
    <main className="light-page min-h-screen bg-[#fffff8] px-3 pt-[10px] pb-3 font-[Georgia,serif] text-[#1f1f1f]">
      <div className="max-w-[1500px] mt-[36px] pb-[36px] mb-[36px] mx-auto border-b-2 border-b-[#3f3f3f]">
        <div className="flex gap-4 mb-4">
          <div className="flex gap-4 flex-1">
            {TABS.map(tab => (
            <Link key={tab.key} href={tabHref(tab.key)}
              className="px-2 py-1 text-[13px] uppercase tracking-[0.5px] font-medium cursor-pointer bg-transparent border-0 no-underline"
              style={{ color: activeTab === tab.key ? '#1f1f1f' : '#999', textDecoration: activeTab === tab.key ? 'underline' : 'none', textUnderlineOffset: '4px' }}
            >{tab.label}</Link>
            ))}
          </div>
          <ActionButton endpoints={['/api/observatory/fetch/hackernews', '/api/observatory/fetch/lw', '/api/observatory/fetch/arxiv']} label="Fetch Latest" loadingLabel="Fetching..." />
          <ActionButton endpoints={['/api/observatory/generate-foryou']} label="Generate For You" loadingLabel="Generating..." />
          <Link href="/observatory/filter-prompt" className="text-[12px] text-[#333] hover:text-[#1f1f1f] no-underline whitespace-nowrap">Filter Prompt</Link>
        </div>
        <div className="text-center">
          <h1 className="m-0 uppercase text-[42px] mb-3 leading-[0.95] font-medium tracking-[0.5px]">{currentTab.title}</h1>
          <h3 className="m-0 text-[14px] uppercase leading-[1.25] font-medium tracking-[0.5px]">{currentTab.subtitle}</h3>
        </div>
      </div>
      <StoryList key={activeTab} cards={cards} showScore={activeTab === 'foryou'} />
      {hasMore && <div ref={sentinelRef} className="h-px" />}
      {loading && <p className="text-center text-[12px] text-[#999] font-sans py-4 m-0">Loading earlier days…</p>}
      {error && (
        <p className="text-center text-[12px] text-[#a33] font-sans py-4 m-0">
          {error} ·{' '}
          <button onClick={() => loadDay(false)} className="underline bg-transparent border-0 cursor-pointer text-[#a33] p-0">retry</button>
        </p>
      )}
    </main>
  )
}

export default ObservatoryPage
