'use client'
import Link from 'next/link'
import HackerNewsStoryGrid from './HackerNewsStoryGrid'
import { StoryCard } from './hackerNewsTypes'
import { Tab, TABS } from './constants'

const ObservatoryPage = ({
  activeTab,
  cards,
  loading,
  refreshing,
  onRefresh,
  jobSummary,
  error,
}:{
  activeTab: Tab
  cards: StoryCard[]
  loading: boolean
  refreshing: boolean
  onRefresh: () => void
  jobSummary: { queuedCount: number, runningCount: number } | null
  error: string
}) => {
  const currentTab = TABS.find(t => t.key === activeTab)!
  return (
    <main className="light-page min-h-screen bg-[#fffff8] px-3 pt-[10px] pb-3 font-[Georgia,serif] text-[#1f1f1f]">
      <div className="max-w-[1500px] mt-[36px] pb-[36px] mb-[36px] mx-auto border-b-2 border-b-[#3f3f3f]">
        <div className="flex gap-4 mb-4">
          <div className="flex gap-4 flex-1">
            {TABS.map(tab => (
            <Link key={tab.key} href={`/observatory/${tab.key}`}
              className="px-2 py-1 text-[13px] uppercase tracking-[0.5px] font-medium cursor-pointer bg-transparent border-0 no-underline"
              style={{ color: activeTab === tab.key ? '#1f1f1f' : '#999', textDecoration: activeTab === tab.key ? 'underline' : 'none', textUnderlineOffset: '4px' }}
            >{tab.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Link href="/observatory/sources" className="text-[12px] text-[#333] hover:text-[#1f1f1f] no-underline">Sources</Link>
            <Link href="/observatory/profile" className="text-[12px] text-[#333] hover:text-[#1f1f1f] no-underline">Profile</Link>
            <Link href="/observatory/filter-prompt" className="text-[12px] text-[#333] hover:text-[#1f1f1f] no-underline">Filter Prompt</Link>
            <button onClick={onRefresh} disabled={refreshing} className="cursor-pointer bg-transparent p-0 text-[12px] text-[#333] hover:text-[#1f1f1f] disabled:opacity-50">{refreshing ? 'Refreshing…' : 'Refresh feed'}</button>
          </div>
        </div>
        <div className="text-center">
          <h1 className="m-0 uppercase text-[42px] mb-3 leading-[0.95] font-medium tracking-[0.5px]">{currentTab.title}</h1>
          <h3 className="m-0 text-[14px] uppercase leading-[1.25] font-medium tracking-[0.5px]">{currentTab.subtitle}</h3>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[11px] font-sans text-[#6d665c]">
          <span>{cards.length} stories loaded</span>
          {jobSummary && <span>{jobSummary.runningCount ? `${jobSummary.runningCount} running` : `${jobSummary.queuedCount} queued`}</span>}
          {activeTab === 'foryou' && <span>Personalized from your seed URLs, prompt, and feedback.</span>}
        </div>
        {error && <div className="mt-3 text-center text-[12px] font-sans text-[#9c3b32]">{error}</div>}
      </div>
      {loading
        ? <div className="py-14 text-center text-[13px] font-sans text-[#88806f]">Loading Observatory…</div>
        : cards.length
          ? <HackerNewsStoryGrid key={activeTab} initialCards={cards} />
          : (
            <div className="mx-auto max-w-[760px] py-14 text-center font-sans">
              <div className="text-[18px] text-[#1f1f1f]">No stories yet.</div>
              <p className="m-0 mt-3 text-[14px] leading-[1.5] text-[#6b665b]">
                Add approved seed URLs in Sources, then refresh Observatory so it can ingest your writing, rebuild your profile, and generate a new recommendation batch.
              </p>
            </div>
          )}
    </main>
  )
}

export default ObservatoryPage
