import Link from 'next/link'
import HackerNewsStoryGrid from '../hackernews/HackerNewsStoryGrid'
import { StoryCard } from '../hackernews/hackerNewsTypes'

export type Tab = 'hackernews' | 'lw' | 'arxiv' | 'foryou'
export const TABS: { key: Tab, label: string, title: string, subtitle: string }[] = [
  { key: 'foryou', label: 'For You', title: 'For You', subtitle: 'Curated stories matching your interests.' },
  { key: 'hackernews', label: 'Hacker News', title: 'Hacker News', subtitle: 'News for nerds. Stuff that matters.' },
  { key: 'lw', label: 'LW', title: 'LessWrong', subtitle: 'Refining the art of human rationality.' },
  { key: 'arxiv', label: 'arXiv', title: 'arXiv', subtitle: 'CS: AI · ML · Computation & Language' },
]

const ObservatoryPage = ({ activeTab, cards }:{ activeTab: Tab, cards: StoryCard[] }) => {
  const currentTab = TABS.find(t => t.key === activeTab)!
  return (
    <main className="light-page min-h-screen bg-[#fffff8] px-3 pt-[10px] pb-3 font-[Georgia,serif] text-[#1f1f1f]">
      <div className="max-w-[1500px] mt-[36px] pb-[36px] mb-[36px] mx-auto border-b-2 border-b-[#3f3f3f]">
        <div className="flex gap-4 mb-4">
          {TABS.map(tab => (
            <Link key={tab.key} href={`/observatory/${tab.key}`}
              className="px-2 py-1 text-[13px] uppercase tracking-[0.5px] font-medium cursor-pointer bg-transparent border-0 no-underline"
              style={{ color: activeTab === tab.key ? '#1f1f1f' : '#999', textDecoration: activeTab === tab.key ? 'underline' : 'none', textUnderlineOffset: '4px' }}
            >{tab.label}</Link>
          ))}
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
