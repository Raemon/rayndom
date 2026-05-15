import { pool } from '@/lib/prisma'

export const JOB_LOCK_IDS = {
  fetchHackerNews: 8101,
  fetchLW: 8102,
  fetchArxiv: 8103,
  generateForYou: 8104,
} as const

export type JobLockResult<T> = { acquired: true, value: T } | { acquired: false }

export const withJobLock = async <T>(lockId: number, fn: () => Promise<T>): Promise<JobLockResult<T>> => {
  const client = await pool.connect()
  try {
    const { rows } = await client.query<{ acquired: boolean }>('SELECT pg_try_advisory_lock($1) AS acquired', [lockId])
    if (!rows[0]?.acquired) return { acquired: false }
    try {
      const value = await fn()
      return { acquired: true, value }
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [lockId])
    }
  } finally {
    client.release()
  }
}
