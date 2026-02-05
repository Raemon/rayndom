import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set('session', '', { httpOnly: true, expires: new Date(0), path: '/' })
  return response
}
