import { NextResponse } from 'next/server'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

let running = false

export async function POST() {
  if (running) {
    return NextResponse.json({ ok: false, error: 'Generation already in progress' }, { status: 409 })
  }
  running = true
  try {
    const { stdout, stderr } = await execFileAsync('npx', ['tsx', 'scripts/generateForYou.ts'], {
      cwd: process.cwd(),
      timeout: 5 * 60 * 1000,
      maxBuffer: 1024 * 1024 * 10,
    })
    return NextResponse.json({ ok: true, stdout, stderr })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  } finally {
    running = false
  }
}
