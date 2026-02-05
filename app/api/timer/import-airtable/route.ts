import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'

type AirtableRecord = { id: string, fields: Record<string, unknown> }

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

const fetchAllAirtableRecords = async ({ baseId, tableId, viewId, apiKey }:{ baseId: string, tableId: string, viewId?: string, apiKey: string }) => {
  const records: AirtableRecord[] = []
  let offset: string | undefined = undefined
  while (true) {
    const url = new URL(`${AIRTABLE_API_BASE}/${baseId}/${tableId}`)
    if (viewId) url.searchParams.set('view', viewId)
    if (offset) url.searchParams.set('offset', offset)
    url.searchParams.set('pageSize', '100')
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${apiKey}` } })
    if (!res.ok) throw new Error(`Airtable fetch failed: ${res.status}`)
    const json = await res.json()
    records.push(...(json.records || []))
    offset = json.offset
    if (!offset) break
  }
  return records
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string')

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json().catch(() => ({}))
  const baseId = body?.baseId || 'appMDZoMR5OR3ugxH'
  const tableId = body?.tableId || 'tblFuIbKR4Zfhgxsw'
  const viewId = body?.viewId || 'viwGQKQFdYKiwtfi0'
  const datetimeField = body?.datetimeField || 'datetime'
  const rayNotesField = body?.rayNotesField || 'rayNotes'
  const assistantNotesField = body?.assistantNotesField || 'assistantNotes'

  const apiKey = body?.apiKey || process.env.AIRTABLE_API_KEY || getRequiredEnv('AIRTABLE_API_KEY')

  const records = await fetchAllAirtableRecords({ baseId, tableId, viewId, apiKey })

  let createdTags = 0
  let createdInstances = 0
  let createdTimeblocks = 0

  for (const record of records) {
    const fields = record.fields || {}
    const datetimeValue = fields[datetimeField]
    if (!datetimeValue) continue
    if (typeof datetimeValue !== 'string' && typeof datetimeValue !== 'number' && !(datetimeValue instanceof Date)) continue
    const dt = new Date(datetimeValue)
    if (isNaN(dt.getTime())) continue

    const rayNotes = typeof fields[rayNotesField] === 'string' ? fields[rayNotesField] : null
    const assistantNotes = typeof fields[assistantNotesField] === 'string' ? fields[assistantNotesField] : null
    if ((rayNotes && rayNotes.length) || (assistantNotes && assistantNotes.length)) {
      await prisma.timeblock.create({ data: { datetime: dt, rayNotes, assistantNotes } })
      createdTimeblocks += 1
    }

    const fieldNames = Object.keys(fields)
    for (const fieldName of fieldNames) {
      if (fieldName === datetimeField || fieldName === rayNotesField || fieldName === assistantNotesField) continue
      const value = fields[fieldName]
      const type = fieldName
      const pills: string[] = isStringArray(value) ? value : (typeof value === 'string' ? [value] : [])
      for (const pill of pills) {
        const name = String(pill).trim()
        if (!name) continue
        const tag = await prisma.tag.upsert({ where: { name_type: { name, type } }, create: { name, type }, update: {} })
        if (tag) createdTags += 0
        await prisma.tagInstance.create({ data: { tagId: tag.id, datetime: dt } })
        createdInstances += 1
      }
    }
  }

  return NextResponse.json({ ok: true, imported: { records: records.length, createdTimeblocks, createdInstances, createdTags } })
}

