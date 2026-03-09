import { NextRequest, NextResponse } from 'next/server'
import { getObservatorySessionUser } from '@/lib/observatory/auth'
import { queueFullObservatoryRefresh, kickObservatoryJobs } from '@/lib/observatory/jobs'

export async function POST(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await queueFullObservatoryRefresh(user.id)
  kickObservatoryJobs(user.id, user.email)
  return NextResponse.json({ queued: true })
}
