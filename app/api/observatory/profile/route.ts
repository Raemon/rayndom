import { NextRequest, NextResponse } from 'next/server'
import { getObservatorySessionUser } from '@/lib/observatory/auth'
import { getProfileAndPrompt } from '@/lib/observatory/feed'
import { kickObservatoryJobs, queueProfileRefresh, queueRecommendationRefresh } from '@/lib/observatory/jobs'

export async function GET(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await getProfileAndPrompt(user.id)
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  void request
  await queueProfileRefresh(user.id)
  await queueRecommendationRefresh(user.id)
  kickObservatoryJobs(user.id, user.email)
  return NextResponse.json({ queued: true })
}
