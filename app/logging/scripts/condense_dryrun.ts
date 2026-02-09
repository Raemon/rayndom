import 'dotenv/config'
import { prisma } from '../../../lib/prisma'
import OpenAI from 'openai'

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
  const sampleNames = ['AI 2030', 'Tired', 'Winging It', 'Talk to Coworker', 'Break', 'Bouncing Off', 'Dubiously Productive Procrastinating', 'Globe Colorspace']
  const allTags = await prisma.tag.findMany({ where: { name: { in: sampleNames } }, orderBy: [{ type: 'asc' }, { name: 'asc' }] })
  console.log(`Dry run: condensing ${allTags.length} sample tags\n`)
  for (const tag of allTags) {
    const condensed = await condenseDescription(client, tag)
    console.log(`=== ${tag.type}/${tag.name} ===`)
    console.log(`BEFORE (${tag.description?.length} chars):`)
    console.log(tag.description?.substring(0, 150) + '...')
    console.log(`AFTER (${condensed?.length} chars):`)
    console.log(condensed)
    console.log()
  }
  process.exit(0)
}

main()
