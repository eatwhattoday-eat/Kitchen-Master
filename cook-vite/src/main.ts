import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { db, initRecipes } from '~/utils/db'
import { rawRecipes } from '~/data/recipes'

const HomePage = () => import('./pages/HomePage.vue')
const KitchenPage = () => import('./pages/KitchenPage.vue')
const RecipesPage = () => import('./pages/RecipesPage.vue')
const ShoppingPage = () => import('./pages/ShoppingPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/kitchen', component: KitchenPage },
    { path: '/recipes', component: RecipesPage },
    { path: '/shopping', component: ShoppingPage }
  ]
})

async function bootstrap() {
  await initRecipes(rawRecipes)
  console.log(`Loaded ${rawRecipes.length} recipes`)

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

bootstrap()
