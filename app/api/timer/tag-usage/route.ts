import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
