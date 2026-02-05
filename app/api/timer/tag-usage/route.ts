import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const tagInstances = await prisma.tagInstance.findMany({
    select: {
      tagId: true,
      datetime: true
    },
    orderBy: {
      datetime: 'desc'
    }
  })
  const usageTimestamps: Record<number, number> = {}
  for (const instance of tagInstances) {
    const existingTime = usageTimestamps[instance.tagId]
    if (!existingTime || instance.datetime.getTime() > existingTime) {
      usageTimestamps[instance.tagId] = instance.datetime.getTime()
    }
  }
  return NextResponse.json({ usageTimestamps })
}
