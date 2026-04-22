// AU -> derived-state mappings based on the affective-computing literature
// (D'Mello on confusion: AU4 + AU7; FACS frustration heuristic: AU4 + AU17 + AU23;
// general tension: AU4 + AU7 + AU24). These are weighted averages of AU
// probabilities (0-1) and intentionally simple. They are a best guess, not a
// scientific measurement -- per Barrett et al. 2019 the AU->emotion mapping
// is probabilistic and context-dependent. Calibrate to your own face.

export type AuValues = Record<string, number>

export type StateRecipe = {
  name: string
  components: { au: string, weight: number }[]
}

export const stateRecipes: StateRecipe[] = [
  { name: 'confusion',   components: [{ au: 'AU04', weight: 0.6 }, { au: 'AU07', weight: 0.3 }, { au: 'AU01', weight: 0.1 }] },
  { name: 'frustration', components: [{ au: 'AU04', weight: 0.4 }, { au: 'AU17', weight: 0.3 }, { au: 'AU23', weight: 0.3 }] },
  { name: 'tension',     components: [{ au: 'AU04', weight: 0.4 }, { au: 'AU07', weight: 0.3 }, { au: 'AU24', weight: 0.3 }] },
]

export const computeStateScore = (recipe: StateRecipe, aus: AuValues): number => {
  let total = 0
  let weightUsed = 0
  for (const { au, weight } of recipe.components) {
    const value = aus[au]
    if (typeof value === 'number') {
      total += value * weight
      weightUsed += weight
    }
  }
  if (weightUsed === 0) return 0
  return total / weightUsed
}

export const computeAllStates = (aus: AuValues): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const recipe of stateRecipes) {
    out[recipe.name] = computeStateScore(recipe, aus)
  }
  return out
}
