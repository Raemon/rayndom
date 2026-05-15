import 'dotenv/config'
import { Pool } from 'pg'
import { JOB_LOCK_IDS } from '../lib/observatory/jobLock'

const LOCK_IDS = Object.values(JOB_LOCK_IDS)

const main = async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const { rows } = await pool.query<{ pid: number, objid: number }>(
      `SELECT pid, objid FROM pg_locks
       WHERE locktype = 'advisory'
         AND objid = ANY($1::int[])
         AND pid <> pg_backend_pid()`,
      [LOCK_IDS],
    )
    if (rows.length === 0) {
      console.log('No stuck advisory locks on observatory job IDs.')
      return
    }
    console.log(`Found ${rows.length} stuck lock(s):`)
    for (const row of rows) {
      const { rows: termRows } = await pool.query<{ terminated: boolean }>('SELECT pg_terminate_backend($1) AS terminated', [row.pid])
      console.log(`  pid ${row.pid} (lock ${row.objid}): ${termRows[0]?.terminated ? 'terminated' : 'failed (insufficient privilege?)'}`)
    }
  } finally {
    await pool.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
