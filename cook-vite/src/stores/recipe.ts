import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { RecipeItem, MatchResult } from '~/types'
import { db } from '~/utils/db'
import { matchRecipes } from '~/utils/matcher'
import { useKitchenStore } from './kitchen'

export const useRecipeStore = defineStore('recipe', () => {
  const allRecipes = ref<RecipeItem[]>([])
  const displayedRecipes = ref<MatchResult[]>([])
  const keyword = ref('')
  const loaded = ref(false)

  async function loadAll() {
    allRecipes.value = await db.recipes.toArray()
    loaded.value = true
  }

  async function searchAndMatch() {
    const kitchen = useKitchenStore()
    if (!kitchen.loaded) await kitchen.load()

    const results = matchRecipes(
      allRecipes.value,
      kitchen.ingredients,
      kitchen.tools
    )

    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      displayedRecipes.value = results.filter(r =>
        r.recipe.name.toLowerCase().includes(kw)
      )
    } else {
      displayedRecipes.value = results
    }
  }

  async function filteAllRecipes(keyword: string, tool: string): Promise<RecipeItem[]> {
    let filtered = allRecipes.value
    if (keyword) {
      const kw = keyword.toLowerCase()
      filtered = filtered.filter(r => r.name.toLowerCase().includes(kw))
    }
    if (tool && tool !== '全部') {
      filtered = filtered.filter(r => r.tools?.includes(tool))
    }
    filtered.sort((a, b) => (a.diffNum || 2) - (b.diffNum || 2))
    return filtered
  }

  return {
    allRecipes, displayedRecipes, keyword, loaded,
    loadAll, searchAndMatch, filteAllRecipes
  }
})
