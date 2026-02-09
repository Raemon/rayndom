import 'dotenv/config'
import { chunk } from 'lodash'
import { prisma } from '../../../lib/prisma'
import OpenAI from 'openai'

const BATCH_SIZE = 10

const getOpenRouterClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

const condenseDescription = async (client: OpenAI, tag: { type: string, name: string, description: string | null }) => {
  if (!tag.description) return null
  const prompt = `Condense this tag description to 1-3 sentences. Maximum information density. No preamble, no "this tag is", just state what it means and key distinguishers from similar tags. Write as if briefing an AI classifier.

Tag: ${tag.type}/${tag.name}
Current description:
${tag.description}

Return ONLY the condensed description text, nothing else.`
  const completion = await client.chat.completions.create({
    model: 'anthropic/claude-haiku-4.5',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  })
  return completion.choices[0]?.message?.content?.trim() || null
}

const main = async () => {
  const client = getOpenRouterClient()
  const allTags = await prisma.tag.findMany({ where: { description: { not: null } }, orderBy: [{ type: 'asc' }, { name: 'asc' }] })
  const tagsWithDescriptions = allTags.filter(t => t.description && t.description.length > 300)
  console.log(`Found ${tagsWithDescriptions.length} tags with descriptions > 300 chars to condense`)
  const batches = chunk(tagsWithDescriptions, BATCH_SIZE)
  let totalSaved = 0
  for (const [i, batch] of batches.entries()) {
    console.log(`\nBatch ${i + 1}/${batches.length} (${batch.map(t => t.name).join(', ')})`)
    const results = await Promise.allSettled(batch.map(async (tag) => {
      try {
        const condensed = await condenseDescription(client, tag)
        if (!condensed) { console.log(`  ✗ No result: "${tag.type}/${tag.name}"`); return }
        const charsSaved = (tag.description?.length || 0) - condensed.length
        totalSaved += charsSaved
        await prisma.tag.update({ where: { id: tag.id }, data: { description: condensed } })
        console.log(`  ✓ ${tag.type}/${tag.name}: ${tag.description?.length} → ${condensed.length} chars (saved ${charsSaved})`)
      } catch (e) {
        console.error(`  ✗ Failed: "${tag.type}/${tag.name}":`, e)
      }
    }))
  }
  console.log(`\nDone. Total chars saved: ${totalSaved}`)
  process.exit(0)
}

main()
