<template>
  <div class="page">
    <div v-if="kitchen.expiringItems.length" class="alert-card">
      <span style="font-size:20px">⏰</span>
      <span>食材快过期了：{{ expiringNames }}。优先做掉！</span>
    </div>

    <!-- Perfect Matches -->
    <div v-if="perfects.length" class="card">
      <div class="card-header">✅ 你现在就能做 ({{ perfects.length }})</div>

      <template v-if="!showPerfect">
        <div v-for="m in perfects.slice(0, 5)" :key="m.recipe.id" class="recipe-row" @click="showDetail(m)">
          
          <img :src="imgUrl(m.recipe)" style="width:44px;height:44px;border-radius:4px;object-fit:cover;flex-shrink:0" @error="onImgError($event, (m.recipe||r)?.name)"><div class="recipe-info">
            <div class="recipe-name">{{ m.recipe.name }}</div>
            <div class="recipe-meta"><span class="stars">{{ stars(m.recipe.diffNum) }}</span><span>{{ m.recipe.cookTime }}分钟</span></div>
            <span v-if="m.hasExpiring" class="tag-expiring">优先消耗</span>
          </div>
          <span style="font-size:18px;cursor:pointer;flex-shrink:0" @click.stop="fav.toggle(m.recipe)">{{fav.isFavorite(m.recipe.id)?'❤️':'🤍'}}</span>
        </div>
        <button v-if="perfects.length > 5" class="expand-btn" @click="showPerfect = true">
          展开全部 ({{ perfects.length - 5 }}道)
        </button>
      </template>

      <template v-else>
        <div class="sort-bar">
          <span class="sort-label">排序：</span>
          <span class="sort-chip" :class="{active:perfectSort==='default'}" @click="perfectSort='default'">智能</span>
          <span class="sort-chip" :class="{active:perfectSort.startsWith('time')}" @click="toggleSort('perfect','time')">
            ⏱ 时间 {{ perfectSort==='time-asc' ? '↑' : perfectSort==='time-desc' ? '↓' : '' }}
          </span>
          <span class="sort-chip" :class="{active:perfectSort.startsWith('diff')}" @click="toggleSort('perfect','diff')">
            ★ 难度 {{ perfectSort==='diff-asc' ? '↑' : perfectSort==='diff-desc' ? '↓' : '' }}
          </span>
        </div>
        <div class="overflow-list">
          <div v-for="m in sortedPerfects" :key="m.recipe.id" class="recipe-row" @click="showDetail(m)">
            
            <img :src="imgUrl(m.recipe)" style="width:44px;height:44px;border-radius:4px;object-fit:cover;flex-shrink:0" @error="onImgError($event, (m.recipe||r)?.name)"><div class="recipe-info">
              <div class="recipe-name">{{ m.recipe.name }}</div>
              <div class="recipe-meta"><span class="stars">{{ stars(m.recipe.diffNum) }}</span><span>{{ m.recipe.cookTime }}分钟</span></div>
              <span v-if="m.hasExpiring" class="tag-expiring">优先消耗</span>
            </div>
            <span style="font-size:18px;cursor:pointer;flex-shrink:0" @click.stop="fav.toggle(m.recipe)">{{fav.isFavorite(m.recipe.id)?'❤️':'🤍'}}</span>
          </div>
        </div>
        <button class="expand-btn" @click="showPerfect = false">收起 ▲</button>
      </template>
    </div>

    <!-- Loose Matches -->
    <div v-if="looses.length" class="card">
      <div class="card-header">🟡 差一点就能做 ({{ looses.length }})</div>

      <template v-if="!showLoose">
        <div v-for="m in looses.slice(0, 5)" :key="m.recipe.id" class="recipe-row" @click="showDetail(m)">
          
          <img :src="imgUrl(m.recipe)" style="width:44px;height:44px;border-radius:4px;object-fit:cover;flex-shrink:0" @error="onImgError($event, (m.recipe||r)?.name)"><div class="recipe-info">
            <div class="recipe-name">{{ m.recipe.name }}</div>
            <div class="recipe-meta"><span class="stars">{{ stars(m.recipe.diffNum) }}</span><span>{{ m.recipe.cookTime }}分钟</span></div>
            <div v-if="m.missing.length" class="missing">缺：{{ m.missing.join('、') }}</div>
          </div>
          <span style="font-size:18px;cursor:pointer;flex-shrink:0" @click.stop="fav.toggle(m.recipe)">{{fav.isFavorite(m.recipe.id)?'❤️':'🤍'}}</span>
        </div>
        <button v-if="looses.length > 5" class="expand-btn" @click="showLoose = true">
          展开全部 ({{ looses.length - 5 }}道)
        </button>
      </template>

      <template v-else>
        <div class="sort-bar">
          <span class="sort-label">排序：</span>
          <span class="sort-chip" :class="{active:looseSort==='default'}" @click="looseSort='default'">智能</span>
          <span class="sort-chip" :class="{active:looseSort.startsWith('time')}" @click="toggleSort('loose','time')">
            ⏱ 时间 {{ looseSort==='time-asc' ? '↑' : looseSort==='time-desc' ? '↓' : '' }}
          </span>
          <span class="sort-chip" :class="{active:looseSort.startsWith('diff')}" @click="toggleSort('loose','diff')">
            ★ 难度 {{ looseSort==='diff-asc' ? '↑' : looseSort==='diff-desc' ? '↓' : '' }}
          </span>
        </div>
        <div class="overflow-list">
          <div v-for="m in sortedLooses" :key="m.recipe.id" class="recipe-row" @click="showDetail(m)">
            
            <img :src="imgUrl(m.recipe)" style="width:44px;height:44px;border-radius:4px;object-fit:cover;flex-shrink:0" @error="onImgError($event, (m.recipe||r)?.name)"><div class="recipe-info">
              <div class="recipe-name">{{ m.recipe.name }}</div>
              <div class="recipe-meta"><span class="stars">{{ stars(m.recipe.diffNum) }}</span><span>{{ m.recipe.cookTime }}分钟</span></div>
              <div v-if="m.missing.length" class="missing">缺：{{ m.missing.join('、') }}</div>
            </div>
            <span style="font-size:18px;cursor:pointer;flex-shrink:0" @click.stop="fav.toggle(m.recipe)">{{fav.isFavorite(m.recipe.id)?'❤️':'🤍'}}</span>
          </div>
        </div>
        <button class="expand-btn" @click="showLoose = false">收起 ▲</button>
      </template>
    </div>

        <!-- Desserts -->
    <div v-if="desserts.length" class="card">
      <div class="card-header">🍰 今天放纵一下 ({{ desserts.length }})</div>

      <template v-if="!showDesserts">
        <div v-for="r in desserts.slice(0, 5)" :key="r.id" class="recipe-row" @click="showDessertDetail(r)">
          <img :src="imgUrl(r)" style="width:44px;height:44px;border-radius:4px;object-fit:cover;flex-shrink:0" @error="onImgError($event, (m.recipe||r)?.name)">
          <div class="recipe-info">
            <div class="recipe-name">{{ r.name }}</div>
            <div class="recipe-meta"><span class="stars">{{ stars(r.diffNum) }}</span><span>{{ r.cookTime }}分钟</span></div>
          </div>
          <span style="font-size:18px;cursor:pointer;flex-shrink:0" @click.stop="fav.toggle(r)">{{fav.isFavorite(r.id)?'❤️':'🤍'}}</span>
        </div>
        <button v-if="desserts.length > 5" class="expand-btn" @click="showDesserts = true">
          展开全部 ({{ desserts.length - 5 }}道)
        </button>
      </template>

      <template v-else>
        <div class="overflow-list">
          <div v-for="r in desserts" :key="r.id" class="recipe-row" @click="showDessertDetail(r)">
            <img :src="imgUrl(r)" style="width:44px;height:44px;border-radius:4px;object-fit:cover;flex-shrink:0" @error="onImgError($event, (m.recipe||r)?.name)">
            <div class="recipe-info">
              <div class="recipe-name">{{ r.name }}</div>
              <div class="recipe-meta"><span class="stars">{{ stars(r.diffNum) }}</span><span>{{ r.cookTime }}分钟</span></div>
            </div>
            <span style="font-size:18px;cursor:pointer;flex-shrink:0" @click.stop="fav.toggle(r)">{{fav.isFavorite(r.id)?'❤️':'🤍'}}</span>
          </div>
        </div>
        <button class="expand-btn" @click="showDesserts = false">收起 ▲</button>
      </template>
    </div>


    <div v-if="!recipeStore.displayedRecipes.length && recipeStore.loaded" class="empty-state">
      <div class="empty-state-icon">🥬</div><div>厨房还是空的<br>去「我的厨房」添加食材和厨具吧</div>
    </div>

    <div v-if="match" class="modal-overlay" @click.self="match=null"><div class="modal-sheet">
      <div class="modal-title">{{ match.recipe.name }}</div>
      <img :src="imgUrl(match.recipe)" class="modal-img" @error="onImgError($event, (m.recipe||r)?.name)">
      <div class="chip-row">
        <span class="chip" v-if="match.recipe.difficulty">{{ match.recipe.difficulty }}</span><span class="chip">{{ match.recipe.cookTime }}分钟</span>
        <span class="chip" v-for="t in match.recipe.tools" :key="t">{{ t }}</span>
        <span style="font-size:20px;cursor:pointer;margin-left:auto" @click="fav.toggle(match.recipe)">{{fav.isFavorite(match.recipe.id)?'❤️':'🤍'}}</span>
      </div>
      <div class="stuff-row"><span v-for="s in match.recipe.stuff" :key="s" class="stuff-chip" :class="kitchen.hasIngredient(s)?'matched':'missing'">{{ s }} {{ kitchen.hasIngredient(s)?'✓':'缺' }}</span></div>
      <div class="actions">
        <button v-if="match.missing.length" class="btn btn-primary" @click="addToShopping">🛒 缺失食材加入购物清单</button>
        <button class="btn btn-outline" @click="onCook">🍳 我做完了这道菜</button>
        <button v-if="match.recipe.bv" class="btn btn-outline" @click="openBv">📺 视频教程</button>
      </div>
    </div></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { MatchResult, RecipeItem } from '~/types'
import { recipeEmoji } from '~/utils/icons'
import { useKitchenStore } from '~/stores/kitchen'
import { useRecipeStore } from '~/stores/recipe'
import { useShoppingStore } from '~/stores/shopping'
import { useFavoritesStore } from '~/stores/favorites'
import { useHistoryStore } from '~/stores/history'
const kitchen = useKitchenStore(); const recipeStore = useRecipeStore(); const shopping = useShoppingStore()
const fav = useFavoritesStore()
const historyStore = useHistoryStore()
function imgUrl(r:any):string{ const id = (r.id||1)-1; return '/images/'+String(id).padStart(4,'0')+'.jpg' }
function onImgError(e:any, name?:string){
  const el = e.target
  el.style.display = 'none'
  // Show emoji fallback if a sibling placeholder exists
  const placeholder = el.nextElementSibling
  if (placeholder && placeholder.classList.contains('img-fallback')) {
    placeholder.style.display = 'flex'
  }
}
const defaultIcon = (n:string)=>({'番茄':'🍅','土豆':'🥔','洋葱':'🧅','猪肉':'🥩','牛肉':'🥩','鸡肉':'🍗','腊肠':'🥓','鸡蛋':'🥚','米':'🍚','面食':'🍜','豆腐':'🫘','虾':'🦐','菌菇':'🍄','胡萝卜':'🥕','茄子':'🍆','包菜':'🥬','青椒':'🫑','黄瓜':'🥒','花菜':'🥦'}[n]||'🥬')
const match = ref<MatchResult | null>(null)
const showPerfect = ref(false)
const showLoose = ref(false)
const perfectSort = ref('default')
const looseSort = ref('default')

function stars(n:number):string{ return '★'.repeat(n)+'☆'.repeat(4-n) }

function toggleSort(section:'perfect'|'loose', mode:'time'|'diff'){
  const ref = section==='perfect' ? perfectSort : looseSort
  const cur = ref.value
  if(cur===`${mode}-asc`) ref.value = `${mode}-desc`
  else if(cur===`${mode}-desc`) ref.value = `${mode}-asc`
  else ref.value = `${mode}-asc`
}

const expiringNames = computed(() => kitchen.expiringItems.map(i=>i.name).join('、'))
const perfects = computed(() => recipeStore.displayedRecipes.filter(r=>r.type==='perfect'))
const looses = computed(() => recipeStore.displayedRecipes.filter(r=>r.type==='loose'))
const desserts = computed(() => recipeStore.allRecipes.filter(r=>r.tags?.includes('甜品')))
const showDesserts = ref(false)
const dessertMatch = ref<MatchResult | null>(null)

function sortRecipes(list:MatchResult[], mode:string):MatchResult[]{
  const arr = [...list]
  switch(mode){
    case 'time-asc': return arr.sort((a,b)=>(a.recipe.cookTime||30)-(b.recipe.cookTime||30))
    case 'time-desc': return arr.sort((a,b)=>(b.recipe.cookTime||30)-(a.recipe.cookTime||30))
    case 'diff-asc': return arr.sort((a,b)=>(a.recipe.diffNum||2)-(b.recipe.diffNum||2))
    case 'diff-desc': return arr.sort((a,b)=>(b.recipe.diffNum||2)-(a.recipe.diffNum||2))
    default: return arr
  }
}

const sortedPerfects = computed(()=>sortRecipes(perfects.value, perfectSort.value))
const sortedLooses = computed(()=>sortRecipes(looses.value, looseSort.value))

function showDetail(m:MatchResult){match.value=m}
function showDessertDetail(r:RecipeItem){
  const stuff = r.stuff || []
  const matched = stuff.filter(s => kitchen.hasIngredient(s))
  const missing = stuff.filter(s => !kitchen.hasIngredient(s))
  const hasExpiring = matched.some(s => kitchen.expiringItems.find(i => i.name === s))
  match.value = {recipe: r, score: matched.length, type: missing.length ? 'loose' : 'perfect', matched, missing, hasExpiring, toolOk: true}
}
function addToShopping(){if(!match.value)return;match.value.missing.forEach(s=>shopping.add(s,'缺失食材',match.value!.recipe.name));match.value=null}
async function onCook(){if(!match.value)return;const rid=match.value.recipe.id!;await kitchen.consumeIngredients(match.value.recipe.stuff);await historyStore.record(rid);match.value=null;await recipeStore.searchAndMatch()}
function openBv(){if(match.value?.recipe.bv)window.open('https://www.bilibili.com/video/'+match.value.recipe.bv,'_blank')}
onMounted(async()=>{if(!kitchen.loaded)await kitchen.load();if(!recipeStore.loaded)await recipeStore.loadAll();await recipeStore.searchAndMatch();await fav.load()})
</script>

<style scoped>
.expand-btn {
  display: block; width: 100%; padding: 10px;
  background: none; border: none; color: var(--accent);
  font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit;
  border-top: 1px solid var(--border);
}
.overflow-list {
  max-height: 380px; overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.overflow-list .recipe-row:last-child { border-bottom: none; }
.sort-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 0 8px; overflow-x: auto;
  border-bottom: 1px solid var(--border);
}
.sort-label { font-size: 12px; color: var(--text-secondary); flex-shrink: 0; }
.sort-chip {
  padding: 3px 10px; border-radius: 12px; font-size: 11px;
  border: 1.5px solid var(--border); cursor: pointer;
  white-space: nowrap; transition: all .15s;
}
.sort-chip.active {
  background: var(--accent); border-color: var(--accent); color: white;
}
.stars { color: var(--accent); letter-spacing: 1px; font-size: 12px; }
</style>

