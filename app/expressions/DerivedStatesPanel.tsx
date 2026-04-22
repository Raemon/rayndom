'use client'
import { stateRecipes, computeAllStates, type AuValues } from './derivedStates'

const DerivedStatesPanel = ({ aus }:{ aus: AuValues }) => {
  const scores = computeAllStates(aus)
  return (
    <div className="font-mono text-sm">
      {stateRecipes.map(recipe => {
        const score = scores[recipe.name] ?? 0
        const pct = Math.round(score * 100)
        const componentSummary = recipe.components.map(c => `${c.au}\u00d7${c.weight}`).join(' + ')
        return (
          <div key={recipe.name} className="flex items-center gap-3 leading-6">
            <span className="w-24 capitalize">{recipe.name}</span>
            <div className="flex-1 h-3 bg-neutral-200 dark:bg-neutral-800 relative">
              <div className="absolute inset-y-0 left-0 bg-neutral-800 dark:bg-neutral-200" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 text-right tabular-nums">{pct}</span>
            <span className="w-64 text-xs text-neutral-500 truncate">{componentSummary}</span>
          </div>
        )
      })}
    </div>
  )
}

export default DerivedStatesPanel
