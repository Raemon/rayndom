'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import HackerNewsStoryGrid from './HackerNewsStoryGrid'
import StoryTable from './StoryTable'
import StoryList from './StoryList'
import { StoryCard } from './hackerNewsTypes'
import { Tab, TABS } from './constants'

type ViewMode = 'grid' | 'table' | 'list'
const VIEW_LABELS: Record<ViewMode, string> = { grid: 'Grid', table: 'Table', list: 'List' }
const isViewMode = (v: string | null): v is ViewMode => v === 'grid' || v === 'table' || v === 'list'

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

const ObservatoryPage = ({ activeTab, cards }:{ activeTab: Tab, cards: StoryCard[] }) => {
  const currentTab = TABS.find(t => t.key === activeTab)!
  const searchParams = useSearchParams()
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const v = searchParams.get('view')
    return isViewMode(v) ? v : 'list'
  })
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
    const params = new URLSearchParams(window.location.search)
    if (mode === 'list') params.delete('view')
    else params.set('view', mode)
    const query = params.toString()
    window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname)
  }
  const availableViews: ViewMode[] = ['grid', 'table', 'list']
  const effectiveView: ViewMode = availableViews.includes(viewMode) ? viewMode : 'list'
  const tabHref = (key: string) => viewMode === 'list' ? `/observatory/${key}` : `/observatory/${key}?view=${viewMode}`
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
          <div className="flex gap-3 items-baseline">
            {availableViews.map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="text-[12px] bg-transparent border-0 cursor-pointer whitespace-nowrap p-0"
                style={{ color: effectiveView === mode ? '#1f1f1f' : '#999', textDecoration: effectiveView === mode ? 'underline' : 'none', textUnderlineOffset: '4px' }}
              >{VIEW_LABELS[mode]}</button>
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
      {effectiveView === 'table'
        ? <div className="max-w-[1500px] mx-auto"><StoryTable key={activeTab} cards={cards} showRelevance={activeTab === 'foryou'} /></div>
        : effectiveView === 'list'
        ? <StoryList key={activeTab} cards={cards} showScore={activeTab === 'foryou'} />
        : <HackerNewsStoryGrid key={activeTab} initialCards={cards} />}
    </main>
  )
}

export default ObservatoryPage
