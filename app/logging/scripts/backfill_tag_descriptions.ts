import 'dotenv/config'
import { chunk } from 'lodash'
import { prisma } from '../../../lib/prisma'
import { generateAndSaveTagDescription } from '../../api/timer/tags/generateTagDescription'

const BATCH_SIZE = 10

const backfillTagDescriptions = async () => {
  try {
    const allTags = await prisma.tag.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    console.log(`Found ${allTags.length} tags to process in batches of ${BATCH_SIZE}`)
    const batches = chunk(allTags, BATCH_SIZE)
    for (const [i, batch] of batches.entries()) {
      console.log(`\nBatch ${i + 1}/${batches.length} (${batch.map(t => t.name).join(', ')})`)
      const results = await Promise.allSettled(batch.map(async (tag) => {
        try {
          await generateAndSaveTagDescription({ tagId: tag.id, prisma, doNotRunAgain: true })
          console.log(`✓ Done: "${tag.type}/${tag.name}"`)
        } catch (e) {
          console.error(`✗ Failed: "${tag.type}/${tag.name}":`, e)
        }
      }))
    }
    console.log('\nBackfill completed')
    process.exit(0)
  } catch (error) {
    console.error('Backfill failed:', error)
    process.exit(1)
  }
}

backfillTagDescriptions()
