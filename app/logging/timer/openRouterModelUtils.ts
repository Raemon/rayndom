import type { OpenRouterModel } from '../hooks/useOpenRouterModels'

// Heuristic ordering: rank "frontier" models highest. The OpenRouter /models endpoint
// doesn't expose a quality score, so we approximate it from a few signals:
//   1. Hand-picked priority weights for known top-tier model families/IDs.
//   2. Per-million completion price (frontier models are typically more expensive).
//   3. Context length as a tiebreaker.
// This is intentionally just a sort heuristic — anyone can still type to find a model.

const FRONTIER_FAMILY_BOOSTS: { pattern: RegExp, score: number }[] = [
  { pattern: /^anthropic\/claude-(opus|sonnet)-?[45]/i, score: 1000 },
  { pattern: /^openai\/gpt-?5/i, score: 1000 },
  { pattern: /^openai\/o[1-9]/i, score: 950 },
  { pattern: /^google\/gemini-2\.5-pro/i, score: 950 },
  { pattern: /^x-ai\/grok-[34]/i, score: 900 },
  { pattern: /^anthropic\/claude-(haiku)-?[45]/i, score: 800 },
  { pattern: /^openai\/gpt-?4\.[1-9]/i, score: 800 },
  { pattern: /^google\/gemini-2\.5-flash/i, score: 750 },
  { pattern: /^deepseek\/deepseek-(r1|v3)/i, score: 700 },
  { pattern: /^meta-llama\/llama-[34]/i, score: 600 },
  { pattern: /^qwen\/qwen-?[23]/i, score: 550 },
  { pattern: /^mistralai\/(mistral-large|magistral|codestral)/i, score: 500 },
]

const NEGATIVE_PATTERNS: { pattern: RegExp, score: number }[] = [
  { pattern: /:free$/i, score: -50 }, // free tier variants
  { pattern: /(self-moderated|extended)$/i, score: -10 },
  { pattern: /(0?[12]b|small|tiny|nano|mini|3b|7b)/i, score: -100 },
]

const parsePricePerMillion = (priceStr: string | undefined): number => {
  if (!priceStr) return 0
  const n = Number(priceStr)
  if (!Number.isFinite(n)) return 0
  return n * 1_000_000
}

export const getModelFrontierScore = (model: OpenRouterModel): number => {
  let score = 0
  const familyBoost = FRONTIER_FAMILY_BOOSTS.find(boost => boost.pattern.test(model.id))
  if (familyBoost) score += familyBoost.score
  for (const negativePattern of NEGATIVE_PATTERNS) {
    if (negativePattern.pattern.test(model.id)) score += negativePattern.score
  }
  const completionPriceM = parsePricePerMillion(model.pricing?.completion)
  // Frontier output is typically $5-$100 / MTok; cap influence so that priced-but-niche
  // models don't outrank known frontier families on weight alone.
  score += Math.min(completionPriceM * 5, 400)
  const ctx = model.context_length || 0
  // Log scale on context (200k -> +12, 1M -> +14, 32k -> +10)
  if (ctx > 0) score += Math.log2(ctx)
  return score
}

export const sortModelsByFrontier = (models: OpenRouterModel[]): OpenRouterModel[] => {
  const scored = models.map(m => ({ model: m, score: getModelFrontierScore(m) }))
  scored.sort((a, b) => b.score - a.score || a.model.id.localeCompare(b.model.id))
  return scored.map(s => s.model)
}

export const formatModelLabel = (model: OpenRouterModel): string => {
  if (model.name && model.name.trim()) return model.name
  return model.id
}

export const formatModelPriceHint = (model: OpenRouterModel): string => {
  const completionPriceM = parsePricePerMillion(model.pricing?.completion)
  if (!completionPriceM) return ''
  if (completionPriceM >= 1) return `$${completionPriceM.toFixed(0)}/M out`
  return `$${completionPriceM.toFixed(2)}/M out`
}
