export interface RecipeItem {
  id?: number
  name: string
  stuff: string[]
  tools: string[]
  methods: string[]
  tags: string[]
  difficulty: string
  diffNum: number
  cookTime: number
  bv?: string
  image?: string
  link?: string
  description?: string
}

export interface KitchenIngredient {
  id?: number
  name: string
  category: string
  quantity: number
  unit: string
  storageCondition: '常温' | '冷藏' | '冷冻' | '避光干燥'
  expiryDate: string | null
  opened: boolean
  addedAt: string
}

export interface MatchResult {
  recipe: RecipeItem
  score: number
  type: 'perfect' | 'loose' | 'tool-missing' | 'none'
  matched: string[]
  missing: string[]
  hasExpiring: boolean
  toolOk: boolean
}

export interface ShoppingItem {
  name: string
  reason: string
  fromRecipe: string
}

export type SearchMode = 'survival' | 'loose' | 'strict'
export type StorageCondition = '常温' | '冷藏' | '冷冻' | '避光干燥'
