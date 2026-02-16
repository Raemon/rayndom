import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { StoryCard } from '../hackerNewsTypes'
import ObservatoryPage from '../ObservatoryPage'
import { Tab, TABS } from '../constants'

const STORIES_TO_RENDER = 100
const DATA_PATHS: Record<Exclude<Tab, 'foryou'>, { path: string, count: number }> = {
  hackernews: { path: path.join(process.cwd(), 'app/observatory/hackerNewsData.json'), count: STORIES_TO_RENDER },
  lw: { path: path.join(process.cwd(), 'app/observatory/lwNewsData.json'), count: 50 },
  arxiv: { path: path.join(process.cwd(), 'app/observatory/arxivData.json'), count: STORIES_TO_RENDER },
}

type ForYouItem = { tab: string, url: string, reason: string }

const loadStories = (dataPath: string, count: number): StoryCard[] => {
  try {
    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as { stories: StoryCard[] }
    return raw.stories.slice(0, count)
  } catch { return [] }
}

const loadForYouStories = (): StoryCard[] => {
  try {
    const forYouPath = path.join(process.cwd(), 'app/foryou/forYouData.json')
    const forYouItems = JSON.parse(fs.readFileSync(forYouPath, 'utf-8')).items as ForYouItem[]
    const sourceStories: Record<string, StoryCard[]> = {}
    const sourceTabs = ['hackernews', 'arxiv', 'lw'] as const
    for (const tab of sourceTabs) {
      const config = DATA_PATHS[tab]
      if (config) sourceStories[tab] = loadStories(config.path, STORIES_TO_RENDER)
    }
    const cards: StoryCard[] = []
    for (const item of forYouItems) {
      const stories = sourceStories[item.tab] || []
      const match = stories.find(s => s.url === item.url)
      if (match) cards.push({ ...match, reason: item.reason })
    }
    return cards
  } catch { return [] }
}

export default async function Page({ params }: { params: Promise<{ tabSlug: string }> }) {
  const { tabSlug } = await params
  const tab = TABS.find(t => t.key === tabSlug)
  if (!tab) return notFound()
  if (tab.key === 'foryou') {
    const cards = loadForYouStories()
    return <ObservatoryPage activeTab={tab.key} cards={cards} />
  }
  const dataConfig = DATA_PATHS[tab.key]
  const cards = loadStories(dataConfig.path, dataConfig.count)
  return <ObservatoryPage activeTab={tab.key} cards={cards} />
}
