import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] })
  return NextResponse.json({ tags })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const name = body?.name
  const type = body?.type
  if (!name || !type) return NextResponse.json({ error: 'Missing name or type' }, { status: 400 })
  const tag = await prisma.tag.upsert({ where: { name_type: { name, type } }, create: { name, type }, update: {} })
  return NextResponse.json({ tag })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const tag = await prisma.tag.update({ where: { id: Number(id) }, data: { name: body?.name ?? undefined, type: body?.type ?? undefined } })
  return NextResponse.json({ tag })
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.tag.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
