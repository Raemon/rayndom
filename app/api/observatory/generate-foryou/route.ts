import { NextResponse } from 'next/server'
import { generateForYou } from '@/lib/observatory/generate-foryou'
import { withJobLock, JOB_LOCK_IDS } from '@/lib/observatory/jobLock'

export const maxDuration = 300

export async function POST() {
  try {
    const result = await withJobLock(JOB_LOCK_IDS.generateForYou, generateForYou)
    if (!result.acquired) {
      return NextResponse.json({ ok: false, error: 'Generation already in progress' }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[generate-foryou] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({ ok: false, error: message, stack }, { status: 500 })
  }
}
