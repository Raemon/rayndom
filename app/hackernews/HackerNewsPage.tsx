import HackerNewsStoryGrid from './HackerNewsStoryGrid'
import { StoryCard } from './hackerNewsTypes'

type HackerNewsItem = {
  id: number
  title?: string
  url?: string
  by?: string
  score?: number
  descendants?: number
}

const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0'
const STORIES_TO_RENDER = 18
const LOADING_SNIPPET = 'Loading article text...'

export const runtime = 'nodejs'
export const revalidate = 900

const getStoryUrlDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'unknown'
  }
}

const fetchTopStoryIds = async () => {
  const response = await fetch(`${HN_BASE_URL}/topstories.json`, { next: { revalidate } })
  if (!response.ok) return []
  const ids = (await response.json()) as number[]
  return ids.slice(0, STORIES_TO_RENDER)
}

const fetchStory = async (id: number) => {
  const response = await fetch(`${HN_BASE_URL}/item/${id}.json`, { next: { revalidate } })
  if (!response.ok) return null
  const item = (await response.json()) as HackerNewsItem | null
  if (!item?.url || !item.title) return null
  if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) return null
  return item
}

const buildInitialStoryCard = (item: HackerNewsItem): StoryCard | null => {
  if (!item.url || !item.title) return null
  const commentsCount = item.descendants ?? 0
  const score = item.score ?? 0
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    domain: getStoryUrlDomain(item.url),
    byline: `${score} points, ${commentsCount} comments`,
    snippet: LOADING_SNIPPET,
  }
}

const loadStories = async () => {
  const topStoryIds = await fetchTopStoryIds()
  const storyItems = await Promise.all(topStoryIds.map(fetchStory))
  const validStoryItems = storyItems.filter((item): item is HackerNewsItem => Boolean(item))
  const cards = validStoryItems.map(item => buildInitialStoryCard(item))
  return cards.filter((card): card is StoryCard => Boolean(card))
}

const HackerNewsPage = async () => {
  const cards = await loadStories()
  return (
    <main className="min-h-screen bg-[#fffff8] px-3 pt-[10px] pb-3 font-[Georgia,serif] text-[#1f1f1f]">
      <div className="mb-3  pb-[5px] text-center">
        <h1 className="m-0 text-[64px] my-[48px] leading-[0.95] font-[Georgia,serif] font-medium tracking-[0.5px] border-b-2 pb-4 w-[400px] mx-auto border-b-[#3f3f3f]">Hacker News</h1>
      </div>
      <HackerNewsStoryGrid initialCards={cards} />
    </main>
  )
}

export default HackerNewsPage
