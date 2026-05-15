import { NextResponse } from 'next/server'
import { fetchArxiv } from '@/lib/observatory/fetchers/arxiv'

export const maxDuration = 300

export async function POST() {
  try {
    await fetchArxiv()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[fetch/arxiv] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
