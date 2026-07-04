import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RecipeItem } from '~/types'
import { db } from '~/utils/db'

export interface HistoryEntry {
  id?: number
  recipeId: number
  cookedAt: string
  recipe?: RecipeItem
}

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryEntry[]>([])

  async function load() {
    const entries = await db.history.orderBy('cookedAt').reverse().limit(50).toArray()
    const recipeIds = entries.map(e => e.recipeId)
    const recipes = await db.recipes.where('id').anyOf(recipeIds).toArray()
    const recipeMap = new Map(recipes.map(r => [r.id!, r]))
    history.value = entries.map(e => ({ ...e, recipe: recipeMap.get(e.recipeId) }))
  }

  async function record(recipeId: number) {
    await db.history.add({ recipeId, cookedAt: new Date().toISOString() })
    await load()
  }

  return { history, load, record }
})
