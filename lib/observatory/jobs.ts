import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { observatoryPrisma } from '@/lib/observatoryPrisma'
import { buildObservatoryProfile, refreshRecommendationBatch, upsertFetchedDocument } from '@/lib/observatory/feed'

const execFileAsync = promisify(execFile)
const activeObservatoryJobRunners = new Set<number>()

const fetchWithCurl = async (url: string) => {
  try {
    const { stdout } = await execFileAsync('curl', [
      '-L', '--compressed', '--silent', '--show-error',
      '--max-time', '20', '--connect-timeout', '8',
      '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      url,
    ], { maxBuffer: 1024 * 1024 * 12 })
    return stdout
  } catch {
    return ''
  }
}

const queueJob = async (userId: number, jobType: string, targetUrl?: string, seedUrlId?: number) => {
  const existingJob = await observatoryPrisma.observatoryIngestJob.findFirst({
    where: {
      userId,
      jobType,
      seedUrlId: seedUrlId || null,
      status: { in: ['queued', 'running'] },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (existingJob) return existingJob
  return observatoryPrisma.observatoryIngestJob.create({
    data: {
      userId,
      jobType,
      targetUrl: targetUrl || null,
      seedUrlId: seedUrlId || null,
    },
  })
}

const updateJobStatus = async (jobId: number, status: string, error?: string | null) => {
  await observatoryPrisma.observatoryIngestJob.update({
    where: { id: jobId },
    data: {
      status,
      error: error || null,
      startedAt: status === 'running' ? new Date() : undefined,
      completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
    },
  })
}

const runSeedUrlImportJob = async (jobId: number, userId: number, email: string, seedUrlId: number) => {
  const seedUrl = await observatoryPrisma.observatorySeedUrl.findUnique({
    where: { id: seedUrlId },
    include: { sourceDomain: true },
  })
  if (!seedUrl || seedUrl.userId !== userId) throw new Error('Seed URL not found')
  if (!seedUrl.sourceDomain || seedUrl.sourceDomain.status !== 'approved') {
    await observatoryPrisma.observatorySeedUrl.update({ where: { id: seedUrl.id }, data: { status: 'blocked' } })
    throw new Error('Seed URL domain is not approved yet')
  }
  const seedRawHtml = await fetchWithCurl(seedUrl.url)
  if (!seedRawHtml.trim()) throw new Error('Failed to fetch seed URL')
  const seedResult = await upsertFetchedDocument({ sourceDomainId: seedUrl.sourceDomainId, url: seedUrl.url, rawHtml: seedRawHtml })
  const relatedLinks = seedResult.sameDomainLinks.slice(0, 6)
  for (const relatedLink of relatedLinks) {
    const relatedRawHtml = await fetchWithCurl(relatedLink.url)
    if (!relatedRawHtml.trim()) continue
    await upsertFetchedDocument({ sourceDomainId: seedUrl.sourceDomainId, url: relatedLink.url, rawHtml: relatedRawHtml })
  }
  await observatoryPrisma.observatorySeedUrl.update({
    where: { id: seedUrl.id },
    data: { status: 'processed', title: seedResult.document.title },
  })
  await queueProfileRefresh(userId)
  await queueRecommendationRefresh(userId)
  void email
  void jobId
}

const runProfileRefreshJob = async (userId: number, email: string) => {
  await buildObservatoryProfile({ userId, email })
}

const runRecommendationRefreshJob = async (userId: number, email: string) => {
  await refreshRecommendationBatch({ userId, email })
}

export const queueSeedUrlImport = async (userId: number, seedUrlId: number, targetUrl: string) => queueJob(userId, 'seed_url_import', targetUrl, seedUrlId)
export const queueProfileRefresh = async (userId: number) => queueJob(userId, 'profile_refresh')
export const queueRecommendationRefresh = async (userId: number) => queueJob(userId, 'recommendation_refresh')

export const queueFullObservatoryRefresh = async (userId: number) => {
  const pendingSeedUrls = await observatoryPrisma.observatorySeedUrl.findMany({
    where: { userId, status: 'pending' },
  })
  for (const pendingSeedUrl of pendingSeedUrls) {
    await observatoryPrisma.observatorySeedUrl.update({ where: { id: pendingSeedUrl.id }, data: { status: 'queued' } })
    await queueSeedUrlImport(userId, pendingSeedUrl.id, pendingSeedUrl.url)
  }
  await queueProfileRefresh(userId)
  await queueRecommendationRefresh(userId)
}

export const getObservatoryJobSummary = async (userId: number) => {
  const jobs = await observatoryPrisma.observatoryIngestJob.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  const queuedCount = jobs.filter(job => job.status === 'queued').length
  const runningCount = jobs.filter(job => job.status === 'running').length
  const failedJobs = jobs.filter(job => job.status === 'failed')
  return {
    queuedCount,
    runningCount,
    latestJobs: jobs,
    failedJobs,
  }
}

const processSingleJob = async (jobId: number, userId: number, email: string) => {
  const job = await observatoryPrisma.observatoryIngestJob.findUnique({ where: { id: jobId } })
  if (!job || job.userId !== userId) return
  await updateJobStatus(job.id, 'running')
  try {
    if (job.jobType === 'seed_url_import' && job.seedUrlId) {
      await runSeedUrlImportJob(job.id, userId, email, job.seedUrlId)
    } else if (job.jobType === 'profile_refresh') {
      await runProfileRefreshJob(userId, email)
    } else if (job.jobType === 'recommendation_refresh') {
      await runRecommendationRefreshJob(userId, email)
    }
    await updateJobStatus(job.id, 'completed')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown job failure'
    await updateJobStatus(job.id, 'failed', message)
  }
}

export const runObservatoryJobs = async (userId: number, email: string) => {
  if (activeObservatoryJobRunners.has(userId)) return
  activeObservatoryJobRunners.add(userId)
  try {
    for (;;) {
      const nextJob = await observatoryPrisma.observatoryIngestJob.findFirst({
        where: { userId, status: 'queued' },
        orderBy: { createdAt: 'asc' },
      })
      if (!nextJob) break
      await processSingleJob(nextJob.id, userId, email)
    }
  } finally {
    activeObservatoryJobRunners.delete(userId)
  }
}

export const kickObservatoryJobs = (userId: number, email: string) => {
  void runObservatoryJobs(userId, email)
}
