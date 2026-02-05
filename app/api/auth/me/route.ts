import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value
  if (!sessionId) {
    return NextResponse.json({ user: null })
  }
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, email: true, createdAt: true } } }
  })
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
    }
    const response = NextResponse.json({ user: null })
    response.cookies.set('session', '', { httpOnly: true, expires: new Date(0), path: '/' })
    return response
  }
  return NextResponse.json({ user: session.user })
}
