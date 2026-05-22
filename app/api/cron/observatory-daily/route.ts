import { NextRequest, NextResponse } from 'next/server'
import { fetchHackerNews } from '@/lib/observatory/fetchers/hackernews'
import { fetchLWNews } from '@/lib/observatory/fetchers/lw'
import { fetchArxiv } from '@/lib/observatory/fetchers/arxiv'
import { generateForYou } from '@/lib/observatory/generate-foryou'

export const maxDuration = 800
export const dynamic = 'force-dynamic'

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const auth = request.headers.get('authorization') || ''
  return auth === `Bearer ${secret}`
}

const fetchSteps: [string, () => Promise<unknown>][] = [
  ['hackernews', fetchHackerNews],
  ['lw', fetchLWNews],
  ['arxiv', fetchArxiv],
]

// Fetch every source, then regenerate the For You list from the fresh data.
// Fetchers are isolated so one bad source doesn't block the others or the
// downstream For You generation.
const runDaily = async () => {
  const fetchErrors: string[] = []
  for (const [name, fn] of fetchSteps) {
    try {
      console.log(`[observatory-daily] fetching ${name}...`)
      await fn()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[observatory-daily] ${name} fetch failed:`, error)
      fetchErrors.push(`${name}: ${message}`)
    }
  }
  console.log('[observatory-daily] generating For You...')
  await generateForYou()
  return fetchErrors
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const fetchErrors = await runDaily()
    return NextResponse.json({ ok: true, fetchErrors })
  } catch (error) {
    console.error('[observatory-daily] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
