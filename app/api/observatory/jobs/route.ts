import { NextRequest, NextResponse } from 'next/server'
import { getObservatorySessionUser } from '@/lib/observatory/auth'
import { getObservatoryJobSummary, kickObservatoryJobs } from '@/lib/observatory/jobs'

export async function GET(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  kickObservatoryJobs(user.id, user.email)
  const summary = await getObservatoryJobSummary(user.id)
  return NextResponse.json(summary)
}
