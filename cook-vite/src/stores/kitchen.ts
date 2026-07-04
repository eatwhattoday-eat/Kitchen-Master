import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { KitchenIngredient, StorageCondition } from '~/types'
import { db } from '~/utils/db'
import { getExpiringIngredients, getExpiryDays } from '~/utils/matcher'

export const useKitchenStore = defineStore('kitchen', () => {
  const ingredients = ref<KitchenIngredient[]>([])
  const tools = ref<string[]>([])
  const loaded = ref(false)

  const ingredientNames = computed(() => new Set(ingredients.value.map(i => i.name)))
  const expiringItems = computed(() => getExpiringIngredients(ingredients.value))

  async function load() {
    ingredients.value = await db.ingredients.toArray()
    const toolRows = await db.tools.toArray()
    tools.value = toolRows.map(t => t.name)
    loaded.value = true
  }

  async function addIngredient(ing: Omit<KitchenIngredient, 'id' | 'addedAt'>) {
    const existing = ingredients.value.find(i => i.name === ing.name)
    if (existing) {
      existing.quantity += ing.quantity
      await db.ingredients.update(existing.id!, { quantity: existing.quantity })
    } else {
      const id = await db.ingredients.add({
        ...ing,
        addedAt: new Date().toISOString()
      })
      ingredients.value.push({ ...ing, id: id as number, addedAt: new Date().toISOString() })
      if (ing.expiryDate) {
      }
    }
  }

  async function removeIngredient(name: string) {
    const ing = ingredients.value.find(i => i.name === name)
    if (ing) {
      await db.ingredients.delete(ing.id!)
      ingredients.value = ingredients.value.filter(i => i.name !== name)
    }
  }

  async function consumeIngredients(recipeStuff: string[]) {
    for (const stuffName of recipeStuff) {
      const ing = ingredients.value.find(i => i.name === stuffName)
      if (ing) {
        ing.quantity--
        if (ing.quantity <= 0) {
          await db.ingredients.delete(ing.id!)
          ingredients.value = ingredients.value.filter(i => i.name !== stuffName)
        } else {
          await db.ingredients.update(ing.id!, { quantity: ing.quantity })
        }
      }
    }
  }

  async function toggleTool(tool: string) {
    const idx = tools.value.indexOf(tool)
    if (idx >= 0) {
      tools.value.splice(idx, 1)
      await db.tools.delete(tool)
    } else {
      tools.value.push(tool)
      await db.tools.put({ name: tool })
    }
  }

  function hasTool(tool: string): boolean {
    return tools.value.includes(tool)
  }

  function hasIngredient(name: string): boolean {
    return ingredientNames.value.has(name)
  }

  function getExpiryLabel(expiryDate: string | null): string {
    const days = getExpiryDays(expiryDate)
    if (days === null) return ''
    if (days < 0) return `${Math.abs(days)}天前已过期`
    if (days <= 3) return `还有${days}天过期`
    return `还有${days}天`
  }

  function getExpiryClass(expiryDate: string | null): string {
    const days = getExpiryDays(expiryDate)
    if (days === null) return ''
    if (days < 0) return 'expired'
    if (days <= 3) return 'expiring-soon'
    return 'expiry-ok'
  }

  return {
    ingredients, tools, loaded, ingredientNames, expiringItems,
    load, addIngredient, removeIngredient, consumeIngredients,
    toggleTool, hasTool, hasIngredient,
    getExpiryLabel, getExpiryClass
  }
})
