import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const auth = request.headers.get('authorization') || ''
  return auth === `Bearer ${secret}`
}

const resetOrienting = async () => {
  const result = await prisma.checklistItem.updateMany({ where: { orientingBlock: true }, data: { completed: false } })
  return result
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await resetOrienting()
  return NextResponse.json({ updated: result.count })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await resetOrienting()
  return NextResponse.json({ updated: result.count })
}
