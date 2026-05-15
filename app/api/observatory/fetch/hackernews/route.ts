import { NextResponse } from 'next/server'
import { fetchHackerNews } from '@/lib/observatory/fetchers/hackernews'

export const maxDuration = 300

export async function POST() {
  try {
    await fetchHackerNews()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[fetch/hackernews] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
