import { NextRequest, NextResponse } from 'next/server'
import { loadStoryDay } from '@/app/observatory/storyData'

export const dynamic = 'force-dynamic'

// Day-by-day pagination for the observatory feed. `source` is the tab key
// (hackernews | lw | arxiv); `before` is the cursor returned by the previous
// call (omit it for the most recent day).
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const source = params.get('source')
    if (!source) return NextResponse.json({ error: 'Missing source' }, { status: 400 })

    const beforeParam = params.get('before')
    const before = beforeParam ? new Date(beforeParam) : null
    if (before && Number.isNaN(before.getTime())) {
      return NextResponse.json({ error: 'Invalid before cursor' }, { status: 400 })
    }

    const result = await loadStoryDay(source, before)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
