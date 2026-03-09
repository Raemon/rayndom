import { NextRequest, NextResponse } from 'next/server'
import { getObservatorySessionUser } from '@/lib/observatory/auth'
import { observatoryPrisma } from '@/lib/observatoryPrisma'
import { kickObservatoryJobs, queueRecommendationRefresh } from '@/lib/observatory/jobs'

export async function POST(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { eventType, url, documentId, recommendationItemId, note } = await request.json() as {
    eventType?: 'saved' | 'dismissed' | 'liked'
    url?: string
    documentId?: number
    recommendationItemId?: number
    note?: string
  }
  if (!eventType || !url) return NextResponse.json({ error: 'eventType and url are required' }, { status: 400 })
  await observatoryPrisma.observatoryFeedbackEvent.create({
    data: {
      userId: user.id,
      eventType,
      documentId: documentId || null,
      recommendationItemId: recommendationItemId || null,
      note: note || null,
    },
  })
  if (eventType === 'saved') {
    const existingSavedItem = recommendationItemId
      ? await observatoryPrisma.observatorySavedItem.findUnique({ where: { recommendationItemId } })
      : await observatoryPrisma.observatorySavedItem.findFirst({ where: { userId: user.id, url } })
    if (existingSavedItem) {
      await observatoryPrisma.observatorySavedItem.update({
        where: { id: existingSavedItem.id },
        data: { documentId: documentId || null, url, recommendationItemId: recommendationItemId || existingSavedItem.recommendationItemId },
      })
    } else {
      await observatoryPrisma.observatorySavedItem.create({ data: { userId: user.id, recommendationItemId: recommendationItemId || null, documentId: documentId || null, url } })
    }
  }
  if (eventType === 'dismissed') {
    await observatoryPrisma.observatoryDismissedItem.upsert({
      where: { userId_url: { userId: user.id, url } },
      update: { documentId: documentId || null },
      create: { userId: user.id, documentId: documentId || null, url },
    })
  }
  await queueRecommendationRefresh(user.id)
  kickObservatoryJobs(user.id, user.email)
  return NextResponse.json({ success: true })
}
