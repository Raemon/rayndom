import { NextRequest, NextResponse } from 'next/server'
import { observatoryPrisma } from '@/lib/observatoryPrisma'
import { compareObservatoryPassword, createObservatorySession, getObservatoryLoginThrottleError, normalizeObservatoryEmail, recordObservatoryLoginAttempt, setObservatorySessionCookie } from '@/lib/observatory/auth'
import { ensureObservatoryDefaultsForUser } from '@/lib/observatory/feed'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  if (!email?.trim() || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  const normalizedEmail = normalizeObservatoryEmail(email)
  const throttleError = await getObservatoryLoginThrottleError(request, normalizedEmail)
  if (throttleError) return NextResponse.json({ error: throttleError }, { status: 429 })
  const user = await observatoryPrisma.observatoryUser.findUnique({ where: { email: normalizedEmail } })
  if (!user) {
    await recordObservatoryLoginAttempt(request, normalizedEmail, false)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  const validPassword = await compareObservatoryPassword(password, user.passwordHash)
  if (!validPassword) {
    await recordObservatoryLoginAttempt(request, normalizedEmail, false, user.id)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  const [, { session, expiresAt }] = await Promise.all([
    ensureObservatoryDefaultsForUser(user.id, user.email),
    createObservatorySession(user.id),
    recordObservatoryLoginAttempt(request, normalizedEmail, true, user.id),
  ])
  const response = NextResponse.json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  })
  setObservatorySessionCookie(response, session.id, expiresAt)
  return response
}
