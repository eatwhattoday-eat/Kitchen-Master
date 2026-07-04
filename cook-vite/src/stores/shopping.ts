import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ShoppingItem } from '~/types'
import { db } from '~/utils/db'

export const useShoppingStore = defineStore('shopping', () => {
  const items = ref<ShoppingItem[]>([])

  async function load() {
    items.value = await db.shoppingList.toArray()
  }

  async function add(name: string, reason: string, fromRecipe: string) {
    const existing = items.value.find(i => i.name === name && i.reason === reason)
    if (existing) return
    const id = await db.shoppingList.add({ name, reason, fromRecipe })
    items.value.push({ name, reason, fromRecipe })
  }

  async function remove(name: string) {
    const item = items.value.find(i => i.name === name)
    if (item) {
      await db.shoppingList.where('name').equals(name).delete()
      items.value = items.value.filter(i => i.name !== name)
    }
  }

  async function clear() {
    await db.shoppingList.clear()
    items.value = []
  }

  return { items, load, add, remove, clear }
})
