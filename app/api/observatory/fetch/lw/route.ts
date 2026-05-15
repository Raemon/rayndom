import { NextResponse } from 'next/server'
import { fetchLWNews } from '@/lib/observatory/fetchers/lw'

export const maxDuration = 300

export async function POST() {
  try {
    await fetchLWNews()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[fetch/lw] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
