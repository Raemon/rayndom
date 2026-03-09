import { NextRequest, NextResponse } from 'next/server'
import { clearObservatorySessionCookie, OBSERVATORY_SESSION_COOKIE } from '@/lib/observatory/auth'
import { observatoryPrisma } from '@/lib/observatoryPrisma'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(OBSERVATORY_SESSION_COOKIE)?.value
  if (sessionId) await observatoryPrisma.observatorySession.delete({ where: { id: sessionId } }).catch(() => {})
  const response = NextResponse.json({ success: true })
  clearObservatorySessionCookie(response)
  return response
}
