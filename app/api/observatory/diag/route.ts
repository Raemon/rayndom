import { NextResponse } from 'next/server'

export const maxDuration = 60

const errMsg = (err: unknown) => err instanceof Error ? `${err.name}: ${err.message}` : String(err)

export async function GET() {
  const report: Record<string, unknown> = {
    nodeVersion: process.version,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    cwd: process.cwd(),
  }

  let prismaModule: typeof import('@/lib/prisma') | null = null
  try {
    prismaModule = await import('@/lib/prisma')
    report.prismaImport = 'ok'
  } catch (err) {
    report.prismaImport = `FAIL: ${errMsg(err)}`
    return NextResponse.json(report, { status: 500 })
  }

  try {
    const r = await prismaModule.prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`
    report.prismaQuery = r[0]?.ok === 1 ? 'ok' : `unexpected: ${JSON.stringify(r)}`
  } catch (err) {
    report.prismaQuery = `FAIL: ${errMsg(err)}`
  }

  let client
  try {
    client = await prismaModule.pool.connect()
    report.poolConnect = 'ok'
  } catch (err) {
    report.poolConnect = `FAIL: ${errMsg(err)}`
    return NextResponse.json(report, { status: 500 })
  }

  try {
    const r = await client.query<{ x: number }>('SELECT 1 AS x')
    report.basicQuery = r.rows[0]?.x === 1 ? 'ok' : `unexpected: ${JSON.stringify(r.rows)}`
  } catch (err) {
    report.basicQuery = `FAIL: ${errMsg(err)}`
  }

  try {
    const r = await client.query<{ acquired: boolean }>('SELECT pg_try_advisory_lock(99999) AS acquired')
    report.advisoryLockAcquire = r.rows[0]?.acquired
  } catch (err) {
    report.advisoryLockAcquire = `FAIL: ${errMsg(err)}`
  }

  try {
    const r = await client.query<{ released: boolean }>('SELECT pg_advisory_unlock(99999) AS released')
    report.advisoryLockRelease = r.rows[0]?.released
  } catch (err) {
    report.advisoryLockRelease = `FAIL: ${errMsg(err)}`
  }

  try {
    client.release()
    report.clientRelease = 'ok'
  } catch (err) {
    report.clientRelease = `FAIL: ${errMsg(err)}`
  }

  try {
    await import('@/lib/observatory/fetchers/util')
    report.utilImport = 'ok'
  } catch (err) {
    report.utilImport = `FAIL: ${errMsg(err)}`
  }

  try {
    await import('@/lib/observatory/fetchers/hackernews')
    report.hnFetcherImport = 'ok'
  } catch (err) {
    report.hnFetcherImport = `FAIL: ${errMsg(err)}`
  }

  try {
    await import('@/lib/observatory/fetchers/lw')
    report.lwFetcherImport = 'ok'
  } catch (err) {
    report.lwFetcherImport = `FAIL: ${errMsg(err)}`
  }

  try {
    await import('@/lib/observatory/fetchers/arxiv')
    report.arxivFetcherImport = 'ok'
  } catch (err) {
    report.arxivFetcherImport = `FAIL: ${errMsg(err)}`
  }

  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      signal: AbortSignal.timeout(5000),
    })
    report.nativeFetch = res.ok ? `ok (${res.status})` : `FAIL: HTTP ${res.status}`
  } catch (err) {
    report.nativeFetch = `FAIL: ${errMsg(err)}`
  }

  return NextResponse.json(report)
}
