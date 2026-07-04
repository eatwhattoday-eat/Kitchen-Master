import Dexie from 'dexie'
import type { RecipeItem, KitchenIngredient, ShoppingItem } from '~/types'

class CookDatabase extends Dexie {
  recipes!: Dexie.Table<RecipeItem, number>
  ingredients!: Dexie.Table<KitchenIngredient, number>
  tools!: Dexie.Table<{ name: string }, string>
  favorites!: Dexie.Table<{ recipeId: number }, number>
  history!: Dexie.Table<{ recipeId: number, cookedAt: string }, number>
  shoppingList!: Dexie.Table<ShoppingItem & { id?: number }, number>

  constructor() {
    super('cook-kitchen')
    this.version(1).stores({
      recipes: '++id, name, stuff, difficulty, tags, methods, tools',
      ingredients: '++id, name, category, expiryDate',
      tools: 'name',
      favorites: 'recipeId',
      history: '++id, recipeId, cookedAt',
      shoppingList: '++id, name'
    })
  }
}

export const db = new CookDatabase()

// Initialize recipes from bundled data
export async function initRecipes(recipes: RecipeItem[]) {
  const count = await db.recipes.count()
  if (count < recipes.length) {
    await db.recipes.bulkPut(recipes.map((r, i) => ({ ...r, id: i + 1 })))
  }
}
