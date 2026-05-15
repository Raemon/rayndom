import { NextResponse } from 'next/server'
import { fetchArxiv } from '@/lib/observatory/fetchers/arxiv'
import { withJobLock, JOB_LOCK_IDS } from '@/lib/observatory/jobLock'

export const maxDuration = 300

export async function POST() {
  try {
    const result = await withJobLock(JOB_LOCK_IDS.fetchArxiv, fetchArxiv)
    if (!result.acquired) {
      return NextResponse.json({ ok: false, error: 'arXiv fetch already in progress' }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[fetch/arxiv] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({ ok: false, error: message, stack }, { status: 500 })
  }
}
