'use client'
import { useState } from 'react'
import Link from 'next/link'
import HackerNewsStoryGrid from './HackerNewsStoryGrid'
import { StoryCard } from './hackerNewsTypes'
import { Tab, TABS } from './constants'

const ActionButton = ({ endpoint, label, loadingLabel }: { endpoint: string, label: string, loadingLabel: string }) => {
  const [busy, setBusy] = useState(false)
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          const res = await fetch(endpoint, { method: 'POST' })
          if (!res.ok) {
            const body = await res.json().catch(() => null)
            alert(body?.error ?? `${label} failed (${res.status})`)
            setBusy(false)
            return
          }
          window.location.reload()
        } catch {
          alert(`Network error during ${label.toLowerCase()}`)
          setBusy(false)
        }
      }}
      className="text-[12px] text-[#333] hover:text-[#1f1f1f] bg-transparent border-0 cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-wait"
    >{busy ? loadingLabel : label}</button>
  )
}

const ObservatoryPage = ({ activeTab, cards }:{ activeTab: Tab, cards: StoryCard[] }) => {
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
          <ActionButton endpoint="/api/observatory/fetch" label="Fetch Latest" loadingLabel="Fetching..." />
          <ActionButton endpoint="/api/observatory/generate-foryou" label="Generate For You" loadingLabel="Generating..." />
          <Link href="/observatory/filter-prompt" className="text-[12px] text-[#333] hover:text-[#1f1f1f] no-underline whitespace-nowrap">Filter Prompt</Link>
        </div>
        <div className="text-center">
          <h1 className="m-0 uppercase text-[42px] mb-3 leading-[0.95] font-medium tracking-[0.5px]">{currentTab.title}</h1>
          <h3 className="m-0 text-[14px] uppercase leading-[1.25] font-medium tracking-[0.5px]">{currentTab.subtitle}</h3>
        </div>
      </div>
      <HackerNewsStoryGrid key={activeTab} initialCards={cards} />
    </main>
  )
}

export default ObservatoryPage
