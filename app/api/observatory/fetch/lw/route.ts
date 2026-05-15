import { NextResponse } from 'next/server'
import { fetchLWNews } from '@/lib/observatory/fetchers/lw'
import { withJobLock, JOB_LOCK_IDS } from '@/lib/observatory/jobLock'

export const maxDuration = 300

export async function POST() {
  try {
    const result = await withJobLock(JOB_LOCK_IDS.fetchLW, fetchLWNews)
    if (!result.acquired) {
      return NextResponse.json({ ok: false, error: 'LW fetch already in progress' }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[fetch/lw] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({ ok: false, error: message, stack }, { status: 500 })
  }
}
