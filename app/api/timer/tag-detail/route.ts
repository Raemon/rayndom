import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const tagId = request.nextUrl.searchParams.get('tagId')
  if (!tagId) return NextResponse.json({ error: 'Missing tagId' }, { status: 400 })
  const tag = await prisma.tag.findUnique({ where: { id: Number(tagId) }, include: { parentTag: true } })
  if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
  const tagInstances = await prisma.tagInstance.findMany({ where: { tagId: Number(tagId) }, include: { tag: { include: { parentTag: true } } }, orderBy: { datetime: 'desc' } })
  const datetimes = [...new Set(tagInstances.map(ti => ti.datetime.toISOString()))]
  const timeblocks = datetimes.length > 0
    ? await prisma.timeblock.findMany({ where: { datetime: { in: datetimes.map(d => new Date(d)) } }, orderBy: { datetime: 'desc' } })
    : []
  const allTagInstances = datetimes.length > 0
    ? await prisma.tagInstance.findMany({ where: { datetime: { in: datetimes.map(d => new Date(d)) } }, include: { tag: { include: { parentTag: true } } }, orderBy: { datetime: 'desc' } })
    : []
  return NextResponse.json({ tag, tagInstances, timeblocks, allTagInstances })
}
