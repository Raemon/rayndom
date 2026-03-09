import { NextRequest, NextResponse } from 'next/server'
import { getObservatorySessionUser } from '@/lib/observatory/auth'
import { ensureObservatoryDefaultsForUser, getFeedCards } from '@/lib/observatory/feed'
import { kickObservatoryJobs, queueFullObservatoryRefresh } from '@/lib/observatory/jobs'

const VALID_TABS = new Set(['foryou', 'hackernews', 'lw', 'arxiv'])

export async function GET(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tab = request.nextUrl.searchParams.get('tab') || 'foryou'
  if (!VALID_TABS.has(tab)) return NextResponse.json({ error: 'Invalid tab' }, { status: 400 })
  await ensureObservatoryDefaultsForUser(user.id, user.email)
  let cards = await getFeedCards(user.id, tab as 'foryou' | 'hackernews' | 'lw' | 'arxiv')
  if (!cards.length && tab === 'foryou') {
    await queueFullObservatoryRefresh(user.id)
    kickObservatoryJobs(user.id, user.email)
    cards = await getFeedCards(user.id, tab as 'foryou' | 'hackernews' | 'lw' | 'arxiv')
  }
  return NextResponse.json({ cards })
}
