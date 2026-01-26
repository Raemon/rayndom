import 'dotenv/config'
import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

type AirtableRecord = {
  id: string
  createdTime: string
  fields: Record<string, unknown>
}

const TAG_TYPE_FIELDS: Record<string, string> = {
  'Project': 'Projects',
  '???': '???',
  'Name (from Techniques)': 'Techniques',
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string')

async function main() {
  const jsonPath = path.join(__dirname, '..', 'airtable_data.json')
  const rawData = fs.readFileSync(jsonPath, 'utf-8')
  const records: AirtableRecord[] = JSON.parse(rawData)

  console.log(`Loaded ${records.length} records from airtable_data.json`)

  let createdTimeblocks = 0
  let createdTags = 0
  let createdInstances = 0
  let skippedRecords = 0

  for (const record of records) {
    const fields = record.fields || {}
    const datetimeValue = fields['Datetime']
    if (!datetimeValue || typeof datetimeValue !== 'string') {
      skippedRecords += 1
      continue
    }
    const dt = new Date(datetimeValue)
    if (isNaN(dt.getTime())) {
      skippedRecords += 1
      continue
    }

    // Extract notes
    const rayNotes = typeof fields['Ray Notes'] === 'string' ? fields['Ray Notes'] : null
    const assistantNotes = typeof fields['Mabel Notes'] === 'string' ? fields['Mabel Notes'] : null

    // Create timeblock if there are notes
    if ((rayNotes && rayNotes.length > 0) || (assistantNotes && assistantNotes.length > 0)) {
      await prisma.timeblock.create({
        data: { datetime: dt, rayNotes, assistantNotes }
      })
      createdTimeblocks += 1
    }

    // Process tag fields
    const tagFieldEntries = Object.entries(TAG_TYPE_FIELDS)
    for (const [fieldName, tagType] of tagFieldEntries) {
      const value = fields[fieldName]
      if (!value) continue
      const tagNames: string[] = isStringArray(value) ? value : (typeof value === 'string' ? [value] : [])
      for (const tagName of tagNames) {
        const name = tagName.trim()
        if (!name) continue
        // Upsert tag (create if doesn't exist)
        const tag = await prisma.tag.upsert({
          where: { name_type: { name, type: tagType } },
          create: { name, type: tagType },
          update: {}
        })
        createdTags += 1
        // Create tag instance for this datetime
        await prisma.tagInstance.create({
          data: { tagId: tag.id, datetime: dt }
        })
        createdInstances += 1
      }
    }
  }

  console.log('\n=== Import Summary ===')
  console.log(`Total records processed: ${records.length}`)
  console.log(`Skipped (no valid datetime): ${skippedRecords}`)
  console.log(`Timeblocks created: ${createdTimeblocks}`)
  console.log(`Tags upserted: ${createdTags}`)
  console.log(`Tag instances created: ${createdInstances}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
