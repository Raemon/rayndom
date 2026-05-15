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
    console.error(`[jobLock ${lockId}] pool.connect failed; running without lock:`, err)
    const value = await fn()
    return { acquired: true, value }
  }
  let poisoned = false
  try {
    let acquired = false
    try {
      const { rows } = await client.query<{ acquired: boolean }>('SELECT pg_try_advisory_lock($1) AS acquired', [lockId])
      acquired = !!rows[0]?.acquired
      console.log(`[jobLock ${lockId}] acquire => ${acquired}`)
    } catch (err) {
      console.error(`[jobLock ${lockId}] advisory lock query failed; running without lock:`, err)
      poisoned = true
      const value = await fn()
      return { acquired: true, value }
    }
    if (!acquired) return { acquired: false }
    try {
      const value = await fn()
      console.log(`[jobLock ${lockId}] fn completed successfully`)
      return { acquired: true, value }
    } catch (err) {
      console.error(`[jobLock ${lockId}] fn threw:`, err)
      poisoned = true
      throw err
    } finally {
      try {
        const { rows } = await client.query<{ released: boolean }>('SELECT pg_advisory_unlock($1) AS released', [lockId])
        console.log(`[jobLock ${lockId}] unlock query returned released=${rows[0]?.released}`)
      } catch (err) {
        console.error(`[jobLock ${lockId}] advisory unlock failed:`, err)
        poisoned = true
      }
    }
  } finally {
    console.log(`[jobLock ${lockId}] releasing client (poisoned=${poisoned})`)
    client.release(poisoned ? new Error('jobLock work failed; discarding connection to release any held locks') : undefined)
  }
}
