import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { StoryCard } from '../../hackernews/hackerNewsTypes'
import ObservatoryPage, { Tab, TABS } from '../ObservatoryPage'

const STORIES_TO_RENDER = 100
const DATA_PATHS: Record<Tab, { path: string, count: number }> = {
  hackernews: { path: path.join(process.cwd(), 'app/hackernews/hackerNewsData.json'), count: STORIES_TO_RENDER },
  lw: { path: path.join(process.cwd(), 'app/lwnews/lwNewsData.json'), count: 50 },
  arxiv: { path: path.join(process.cwd(), 'app/arxiv/arxivData.json'), count: STORIES_TO_RENDER },
}

const loadStories = (dataPath: string, count: number): StoryCard[] => {
  try {
    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as { stories: StoryCard[] }
    return raw.stories.slice(0, count)
  } catch { return [] }
}

export default async function Page({ params }: { params: Promise<{ tabSlug: string }> }) {
  const { tabSlug } = await params
  const tab = TABS.find(t => t.key === tabSlug)
  if (!tab) return notFound()
  const dataConfig = DATA_PATHS[tab.key]
  const cards = loadStories(dataConfig.path, dataConfig.count)
  return <ObservatoryPage activeTab={tab.key} cards={cards} />
}
