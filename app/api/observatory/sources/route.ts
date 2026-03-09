import { NextRequest, NextResponse } from 'next/server'
import { getObservatorySessionUser } from '@/lib/observatory/auth'
import { buildSeedUrlData, ensureObservatoryDefaultsForUser, getAllowedDomainList, resolveSourceDomainForUrl } from '@/lib/observatory/feed'
import { observatoryPrisma } from '@/lib/observatoryPrisma'
import { kickObservatoryJobs, queueSeedUrlImport } from '@/lib/observatory/jobs'

export async function GET(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ensureObservatoryDefaultsForUser(user.id, user.email)
  const sourceData = await buildSeedUrlData(user.id)
  return NextResponse.json({ ...sourceData, allowedDomains: getAllowedDomainList() })
}

export async function POST(request: NextRequest) {
  const user = await getObservatorySessionUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { url } = await request.json() as { url?: string }
  if (!url?.trim()) return NextResponse.json({ error: 'Seed URL is required' }, { status: 400 })
  let normalizedUrl = ''
  try {
    normalizedUrl = new URL(url).toString()
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
  const sourceDomain = await resolveSourceDomainForUrl(user.id, normalizedUrl)
  const seedUrl = await observatoryPrisma.observatorySeedUrl.upsert({
    where: { userId_url: { userId: user.id, url: normalizedUrl } },
    update: { sourceDomainId: sourceDomain.id, status: sourceDomain.status === 'approved' ? 'queued' : 'pending' },
    create: {
      userId: user.id,
      url: normalizedUrl,
      sourceDomainId: sourceDomain.id,
      status: sourceDomain.status === 'approved' ? 'queued' : 'pending',
    },
  })
  if (sourceDomain.status === 'approved') {
    await queueSeedUrlImport(user.id, seedUrl.id, normalizedUrl)
    kickObservatoryJobs(user.id, user.email)
  }
  return NextResponse.json({ seedUrl, sourceDomain })
}
