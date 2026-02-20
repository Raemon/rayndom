import OpenAI from 'openai'
import { IGNORE_NSFW_CONTENT } from '../predict-tags/aiNotesPrompt'

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

const getOpenRouterClient = () => {
  const apiKey = getRequiredEnv('OPENROUTER_API_KEY')
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

type TagInfo = { id: number, name: string, type: string, description?: string | null }

type GenerateResult = {
  reasoning: string
  confidence: 'low' | 'medium' | 'high'
  similarTags: string[]
}

export async function generateTagDescription(
  { tag, allTags }:
  { tag: TagInfo, allTags: TagInfo[] }
): Promise<GenerateResult> {
  const client = getOpenRouterClient()
  const tagsByType: Record<string, TagInfo[]> = {}
  for (const t of allTags) {
    if (!tagsByType[t.type]) tagsByType[t.type] = []
    tagsByType[t.type].push(t)
  }
  const allTagsText = Object.entries(tagsByType).map(([type, tags]) => {
    const tagLines = tags.map(t => `  - ${t.name}`).join('\n')
    return `Type "${type}":\n${tagLines}`
  }).join('\n\n')
  const prompt = `Here are all the tags in the system, grouped by type:

${allTagsText}

Now focus on this specific tag:
- Name: "${tag.name}"
- Type: "${tag.type}"

Write your guess for what this specific tag means. How would you distinguish whether this tag applies, compared to all the other tags of the same type?

Respond with JSON only, no other text:
{
  "reasoning": "your explanation of what this tag means and how to distinguish it (broken into multiple paragraphs for readability)",
  "confidence": "low" | "medium" | "high",
  "similarTags": ["name1", "name2"]
}

For similarTags, list the names of other tags (of any type) that are most similar or easily confused with this one. Return an empty array if none are particularly similar.

${IGNORE_NSFW_CONTENT}`

  const completion = await client.chat.completions.create({
    model: 'anthropic/claude-sonnet-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  })
  const responseText = completion.choices[0]?.message?.content || '{}'
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in response')
  const result: GenerateResult = JSON.parse(jsonMatch[0])
  console.log(`[generate-tag-description] Tag "${tag.type}/${tag.name}": confidence=${result.confidence}, similarTags=${result.similarTags.join(', ')}`)
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaLike = { tag: { findMany: (args: any) => Promise<any[]>, update: (args: any) => Promise<any> } }

export async function generateAndSaveTagDescription(
  { tagId, prisma, doNotRunAgain = false }:
  { tagId: number, prisma: PrismaLike, doNotRunAgain?: boolean }
) {
  const allTags = await prisma.tag.findMany({ orderBy: [{ type: 'asc' }] })
  const tag = allTags.find(t => t.id === tagId)
  if (!tag) throw new Error(`Tag ${tagId} not found`)
  const result = await generateTagDescription({ tag, allTags })
  const description = `${result.reasoning}\n\nConfidence: ${result.confidence}`
  await prisma.tag.update({ where: { id: tag.id }, data: { description } })
  console.log(`[generate-tag-description] Updated description for "${tag.type}/${tag.name}"`)
  // Run again for similar tags (unless doNotRunAgain)
  if (!doNotRunAgain && result.similarTags.length > 0) {
    const similarTagObjects = allTags.filter(t => result.similarTags.includes(t.name))
    for (const similarTag of similarTagObjects) {
      console.log(`[generate-tag-description] Re-running for similar tag "${similarTag.type}/${similarTag.name}"`)
      try {
        await generateAndSaveTagDescription({ tagId: similarTag.id, prisma, doNotRunAgain: true })
      } catch (e) {
        console.error(`[generate-tag-description] Failed for similar tag "${similarTag.type}/${similarTag.name}":`, e)
      }
    }
  }
  return result
}
