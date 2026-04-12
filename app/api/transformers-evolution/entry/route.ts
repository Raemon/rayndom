import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'app', 'transformers-evolution', 'data')

const normalizeEntry = (entry: Record<string, unknown>) => {
  const normalizedYear = typeof entry.year === 'string' && /^\d+$/.test(entry.year.trim()) ? Number(entry.year.trim()) : entry.year
  return {
    year: normalizedYear,
    name: typeof entry.name === 'string' ? entry.name : '',
    diag: typeof entry.diag === 'string' ? entry.diag : '',
    oneLiner: typeof entry.oneLiner === 'string' ? entry.oneLiner : '',
    problem: typeof entry.problem === 'string' ? entry.problem : '',
    whyNotSooner: typeof entry.whyNotSooner === 'string' ? entry.whyNotSooner : '',
    howInvented: typeof entry.howInvented === 'string' ? entry.howInvented : '',
    examples: typeof entry.examples === 'string' ? entry.examples : '',
  }
}

const escapeQuotedString = (value: string) => JSON.stringify(value)

const escapeTemplateLiteral = (value: string) => `\`${value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\``

const serializeYear = (year: unknown) => {
  if (typeof year === 'number') return String(year)
  if (typeof year === 'string') return escapeQuotedString(year)
  return '""'
}

const serializeEntry = (entry: ReturnType<typeof normalizeEntry>) => `export const entry = {
  year: ${serializeYear(entry.year)},
  name: ${escapeQuotedString(entry.name)},
  diag: ${escapeQuotedString(entry.diag)},
  oneLiner: ${escapeQuotedString(entry.oneLiner)},
  problem: ${escapeTemplateLiteral(entry.problem)},
  whyNotSooner: ${escapeTemplateLiteral(entry.whyNotSooner)},
  howInvented: ${escapeTemplateLiteral(entry.howInvented)},
  examples: ${escapeQuotedString(entry.examples)},
};
`

export async function PATCH(request: NextRequest) {
  try {
    const { entry } = await request.json()
    if (!entry || typeof entry !== 'object') {
      return NextResponse.json({ error: 'Entry is required' }, { status: 400 })
    }
    const normalizedEntry = normalizeEntry(entry)
    if (!normalizedEntry.diag || !/^[a-z0-9-]+$/i.test(normalizedEntry.diag)) {
      return NextResponse.json({ error: 'A valid diag is required' }, { status: 400 })
    }
    const filePath = path.join(DATA_DIR, `${normalizedEntry.diag}.js`)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Entry file not found' }, { status: 404 })
    }
    fs.writeFileSync(filePath, serializeEntry(normalizedEntry), 'utf-8')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save transformer entry' }, { status: 500 })
  }
}
