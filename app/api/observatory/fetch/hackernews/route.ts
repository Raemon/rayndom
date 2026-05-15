import { NextResponse } from 'next/server'
import { fetchHackerNews } from '@/lib/observatory/fetchers/hackernews'
import { withJobLock, JOB_LOCK_IDS } from '@/lib/observatory/jobLock'

export const maxDuration = 300

export async function POST() {
  try {
    const result = await withJobLock(JOB_LOCK_IDS.fetchHackerNews, fetchHackerNews)
    if (!result.acquired) {
      return NextResponse.json({ ok: false, error: 'HN fetch already in progress' }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[fetch/hackernews] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
