import 'server-only'
import { prisma } from '@/lib/prisma'
import type { Story } from '@/lib/generated/prisma/client'
import { StoryCard } from './hackerNewsTypes'

const FALLBACK_SNIPPET = 'No readable body text found for this URL.'
export const isDisplayable = (card: StoryCard) => card.snippet !== FALLBACK_SNIPPET

export const storyToCard = (story: Story): StoryCard => ({
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

const utcDayStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))

export type StoryDayResult = { cards: StoryCard[], nextCursor: string | null, hasMore: boolean }

// Loads one import-day of stories at a time (newest first), keyed on createdAt in
// UTC. `before` is the previous page's cursor — the UTC start of the last day
// returned; pass null for the first/most-recent day. The next cursor is the start
// of the day just returned, so the following call fetches the most recent day
// strictly before it. Days whose stories are all non-displayable are skipped
// server-side so the client never receives an empty page while more remains.
export async function loadStoryDay(source: string, before: Date | null): Promise<StoryDayResult> {
  let cursor = before
  for (let guard = 0; guard < 90; guard++) {
    const latest = await prisma.story.findFirst({
      where: { source, ...(cursor ? { createdAt: { lt: cursor } } : {}) },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })
    if (!latest) return { cards: [], nextCursor: null, hasMore: false }

    const dayStart = utcDayStart(latest.createdAt)
    const dayEnd = new Date(dayStart.getTime() + 86_400_000)
    const stories = await prisma.story.findMany({
      where: { source, createdAt: { gte: dayStart, lt: dayEnd } },
      orderBy: [{ rank: 'asc' }, { id: 'asc' }],
    })
    const older = await prisma.story.findFirst({
      where: { source, createdAt: { lt: dayStart } },
      select: { id: true },
    })
    const hasMore = older != null
    const cards = stories.map(storyToCard).filter(isDisplayable)

    if (cards.length > 0) return { cards, nextCursor: dayStart.toISOString(), hasMore }
    if (!hasMore) return { cards: [], nextCursor: null, hasMore: false }
    cursor = dayStart // whole day was non-displayable; skip to the next-older day
  }
  return { cards: [], nextCursor: cursor ? cursor.toISOString() : null, hasMore: true }
}
