import { notFound } from 'next/navigation'
import { StoryCard } from '../hackerNewsTypes'
import ObservatoryPage from '../ObservatoryPage'
import { TABS } from '../constants'
import { prisma } from '@/lib/prisma'
import type { Story } from '@/lib/generated/prisma/client'

const STORY_LIMITS: Record<string, number> = {
  hackernews: 100,
  lw: 50,
  arxiv: 100,
}

const FALLBACK_SNIPPET = 'No readable body text found for this URL.'
const isDisplayable = (card: StoryCard) => card.snippet !== FALLBACK_SNIPPET

const storyToCard = (story: Story): StoryCard => ({
  id: story.externalId,
  title: story.title,
  url: story.url,
  domain: story.domain,
  byline: story.byline,
  snippet: story.snippet,
  snippetHtml: story.snippetHtml ?? undefined,
  iframe: story.iframe ?? undefined,
  postedAt: story.postedAt?.toISOString(),
  importedAt: story.createdAt.toISOString(),
})

export default async function Page({ params }: { params: Promise<{ tabSlug: string }> }) {
  const { tabSlug } = await params
  const tab = TABS.find(t => t.key === tabSlug)
  if (!tab) return notFound()

  if (tab.key === 'foryou') {
    const items = await prisma.forYouItem.findMany({
      where: { story: { source: 'hackernews' } }, // TODO: remove filter once other sources are included in foryou generation
      include: { story: true },
      orderBy: { sortOrder: 'asc' },
    })
    const cards = items.map(item => ({
      ...storyToCard(item.story),
      reason: item.reason,
      relevance: item.relevance,
    })).filter(isDisplayable)
    return <ObservatoryPage activeTab={tab.key} cards={cards} />
  }

  const stories = await prisma.story.findMany({
    where: { source: tab.key },
    orderBy: { rank: 'asc' },
    take: STORY_LIMITS[tab.key] ?? 100,
  })
  const cards = stories.map(storyToCard).filter(isDisplayable)
  return <ObservatoryPage activeTab={tab.key} cards={cards} />
}
