import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RecipeItem } from '~/types'
import { db } from '~/utils/db'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<RecipeItem[]>([])

  async function load() {
    const ids = await db.favorites.toArray()
    const recipeIds = ids.map(f => f.recipeId)
    if (recipeIds.length) {
      favorites.value = await db.recipes.where('id').anyOf(recipeIds).toArray()
    }
  }

  async function toggle(recipe: RecipeItem) {
    const exists = await db.favorites.get({ recipeId: recipe.id! })
    if (exists) {
      await db.favorites.where('recipeId').equals(recipe.id!).delete()
      favorites.value = favorites.value.filter(f => f.id !== recipe.id)
    } else {
      await db.favorites.put({ recipeId: recipe.id! })
      favorites.value.push(recipe)
    }
  }

  function isFavorite(id: number): boolean {
    return favorites.value.some(f => f.id === id)
  }

  return { favorites, load, toggle, isFavorite }
})
