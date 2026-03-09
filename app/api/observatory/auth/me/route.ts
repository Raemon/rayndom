import { NextRequest, NextResponse } from 'next/server'
import { clearObservatorySessionCookie, getObservatorySessionUser } from '@/lib/observatory/auth'

export async function GET(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) {
    const response = NextResponse.json({ user: null })
    clearObservatorySessionCookie(response)
    return response
  }
  return NextResponse.json({ user })
}
