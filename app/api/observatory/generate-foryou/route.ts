import { NextResponse } from 'next/server'
import { generateForYou } from '@/lib/observatory/generate-foryou'

export const maxDuration = 300

export async function POST() {
  try {
    await generateForYou()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[generate-foryou] failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
