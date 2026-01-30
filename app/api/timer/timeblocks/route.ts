import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  if (!start || !end) return NextResponse.json({ error: 'Missing start or end' }, { status: 400 })
  const timeblocks = await prisma.timeblock.findMany({ where: { datetime: { gte: new Date(start), lt: new Date(end) } }, orderBy: { datetime: 'asc' } })
  return NextResponse.json({ timeblocks })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const datetime = body?.datetime
  if (!datetime) return NextResponse.json({ error: 'Missing datetime' }, { status: 400 })
  const timeblock = await prisma.timeblock.create({ data: { datetime: new Date(datetime), rayNotes: body?.rayNotes ?? null, assistantNotes: body?.assistantNotes ?? null, aiNotes: body?.aiNotes ?? null } })
  return NextResponse.json({ timeblock })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const timeblock = await prisma.timeblock.update({ where: { id: Number(id) }, data: { rayNotes: body?.rayNotes ?? undefined, assistantNotes: body?.assistantNotes ?? undefined, aiNotes: body?.aiNotes ?? undefined } })
  return NextResponse.json({ timeblock })
}
