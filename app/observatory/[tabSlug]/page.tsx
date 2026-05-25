import { notFound } from 'next/navigation'
import ObservatoryPage from '../ObservatoryPage'
import { TABS } from '../constants'
import { prisma } from '@/lib/prisma'
import { storyToCard, isDisplayable, loadStoryDay } from '../storyData'

export default async function Page({ params }: { params: Promise<{ tabSlug: string }> }) {
  const { tabSlug } = await params
  const tab = TABS.find(t => t.key === tabSlug)
  if (!tab) return notFound()

  // For You is regenerated each run and capped, so it loads as a single flat list
  // rather than paginating by day.
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
    return <ObservatoryPage key={tab.key} activeTab={tab.key} initialCards={cards} initialCursor={null} initialHasMore={false} />
  }

  const { cards, nextCursor, hasMore } = await loadStoryDay(tab.key, null)
  return <ObservatoryPage key={tab.key} activeTab={tab.key} initialCards={cards} initialCursor={nextCursor} initialHasMore={hasMore} />
}
