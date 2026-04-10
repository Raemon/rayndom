import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const searchParams = request.nextUrl.searchParams
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  if (!start || !end) return NextResponse.json({ error: 'Missing start or end' }, { status: 400 })
  const where = { datetime: { gte: new Date(start), lt: new Date(end) } }
  const take = searchParams.get('take') ? Number(searchParams.get('take')) : undefined
  const skip = searchParams.get('skip') ? Number(searchParams.get('skip')) : undefined
  const [tagInstances, total] = await Promise.all([
    prisma.tagInstance.findMany({ where, include: { tag: { include: { parentTag: true } } }, orderBy: { datetime: 'asc' }, ...(take !== undefined && { take }), ...(skip !== undefined && { skip }) }),
    take !== undefined ? prisma.tagInstance.count({ where }) : Promise.resolve(undefined),
  ])
  return NextResponse.json({ tagInstances, ...(total !== undefined && { total }) })
}

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const tagId = body?.tagId
  const datetime = body?.datetime
  const llmPredicted = body?.llmPredicted ?? false
  const approved = body?.approved ?? true
  if (!tagId || !datetime) return NextResponse.json({ error: 'Missing tagId or datetime' }, { status: 400 })
  const tagInstance = await prisma.tagInstance.create({ data: { tagId: Number(tagId), datetime: new Date(datetime), llmPredicted, approved }, include: { tag: { include: { parentTag: true } } } })
  return NextResponse.json({ tagInstance })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const tagInstance = await prisma.tagInstance.update({ where: { id: Number(id) }, data: { approved: body?.approved ?? undefined, useful: body?.useful ?? undefined, antiUseful: body?.antiUseful ?? undefined }, include: { tag: { include: { parentTag: true } } } })
  return NextResponse.json({ tagInstance })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.tagInstance.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
