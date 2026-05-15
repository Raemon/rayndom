import { pool } from '@/lib/prisma'

export const JOB_LOCK_IDS = {
  fetchHackerNews: 8101,
  fetchLW: 8102,
  fetchArxiv: 8103,
  generateForYou: 8104,
} as const

export type JobLockResult<T> = { acquired: true, value: T } | { acquired: false }

export const withJobLock = async <T>(lockId: number, fn: () => Promise<T>): Promise<JobLockResult<T>> => {
  let client
  try {
    client = await pool.connect()
  } catch (err) {
    console.error('[jobLock] pool.connect failed; running without lock:', err)
    const value = await fn()
    return { acquired: true, value }
  }
  try {
    let acquired = false
    try {
      const { rows } = await client.query<{ acquired: boolean }>('SELECT pg_try_advisory_lock($1) AS acquired', [lockId])
      acquired = !!rows[0]?.acquired
    } catch (err) {
      console.error('[jobLock] advisory lock query failed; running without lock:', err)
      const value = await fn()
      return { acquired: true, value }
    }
    if (!acquired) return { acquired: false }
    try {
      const value = await fn()
      return { acquired: true, value }
    } finally {
      try {
        await client.query('SELECT pg_advisory_unlock($1)', [lockId])
      } catch (err) {
        console.error('[jobLock] advisory unlock failed:', err)
      }
    }
  } finally {
    client.release()
  }
}
