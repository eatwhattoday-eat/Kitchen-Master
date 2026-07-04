import type { RecipeItem, MatchResult, KitchenIngredient } from '~/types'

export function matchRecipes(
  allRecipes: RecipeItem[],
  ingredients: KitchenIngredient[],
  tools: string[]
): MatchResult[] {
  const ingSet = new Set(ingredients.map(i => i.name))
  const toolSet = new Set(tools)
  const now = new Date()
  const expiringNames = new Set(
    ingredients
      .filter(i => {
        if (!i.expiryDate) return false
        const diff = (new Date(i.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return diff <= 3 && diff >= 0
      })
      .map(i => i.name)
  )

  const results: MatchResult[] = []

  for (const recipe of allRecipes) {
    const stuff = recipe.stuff || []
    const recipeTools = recipe.tools || []
    const matched = stuff.filter(s => ingSet.has(s))
    const missing = stuff.filter(s => !ingSet.has(s))
    const toolOk = recipeTools.length === 0 || recipeTools.some(t => toolSet.has(t))
    const hasExpiring = matched.some(s => expiringNames.has(s))

    let score = 0
    let type: MatchResult['type'] = 'none'

    if (missing.length === 0 && toolOk) {
      score = 100
      type = 'perfect'
    } else if (missing.length <= 2 && toolOk) {
      score = 100 - missing.length * 30
      type = 'loose'
    } else if (missing.length === 0 && !toolOk && recipeTools.length > 0) {
      score = 60
      type = 'tool-missing'
    } else {
      continue
    }

    if (hasExpiring) score += 15

    results.push({ recipe, score, type, matched, missing, hasExpiring, toolOk })
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.recipe.diffNum !== b.recipe.diffNum) return a.recipe.diffNum - b.recipe.diffNum
    return (a.recipe.cookTime || 30) - (b.recipe.cookTime || 30)
  })

  return results
}

export function getExpiringIngredients(ingredients: KitchenIngredient[]): KitchenIngredient[] {
  const now = new Date()
  return ingredients.filter(i => {
    if (!i.expiryDate) return false
    const diff = (new Date(i.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 3 && diff >= 0
  })
}

export function getExpiryDays(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}
