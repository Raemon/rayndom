import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  if (!start || !end) return NextResponse.json({ error: 'Missing start or end' }, { status: 400 })
  const tagInstances = await prisma.tagInstance.findMany({ where: { datetime: { gte: new Date(start), lt: new Date(end) } }, include: { tag: { include: { parentTag: true } } }, orderBy: { datetime: 'asc' } })
  return NextResponse.json({ tagInstances })
}

export async function POST(request: NextRequest) {
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
  const body = await request.json()
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const tagInstance = await prisma.tagInstance.update({ where: { id: Number(id) }, data: { approved: body?.approved ?? undefined }, include: { tag: { include: { parentTag: true } } } })
  return NextResponse.json({ tagInstance })
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.tagInstance.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
