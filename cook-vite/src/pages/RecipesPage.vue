<template>
  <div class="page">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <div class="search-bar" style="flex:1;margin-bottom:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input v-model="kw" placeholder="搜索菜谱..." class="search-input"></div>
      <button class="btn-sm" style="background:var(--card);border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;font-size:20px;flex-shrink:0" @click="openHistory" title="烹饪历史">📋</button>
    </div>
    <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px"><span v-for="t in filterTools" :key="t" class="tool-tag" :class="{selected:sel===t}" @click="sel=t" style="padding:6px 12px;font-size:12px;white-space:nowrap">{{t}}</span></div>
    <div class="card"><div class="card-header">📖 共 {{filtered.length}} 道菜谱</div>
      <div v-for="r in paged" :key="r.id" class="recipe-row" @click="detail=r">
        <img :src="imgUrl(r)" style="width:44px;height:44px;border-radius:4px;object-fit:cover;flex-shrink:0" @error="onImgError($event)">
        <div class="recipe-info"><div class="recipe-name">{{r.name}}</div><div class="recipe-meta"><span class="stars">{{stars(r.diffNum)}}</span><span>{{r.cookTime}}分钟</span><span v-if="r.tags?.length">{{r.tags.slice(0,2).join('·')}}</span></div></div>
      </div>
    </div>
    <button v-if="filtered.length>limit" class="btn btn-outline" style="width:100%" @click="limit+=50">加载更多 ({{filtered.length-limit}})</button>
    <div v-if="detail" class="modal-overlay" @click.self="detail=null"><div class="modal-sheet">
      <div class="modal-title">{{detail.name}}</div>
      <img :src="imgUrl(detail)" class="modal-img" @error="onImgError($event)">
      <div class="chip-row"><span class="chip" v-if="detail.difficulty">{{detail.difficulty}}</span><span class="chip">{{detail.cookTime}}分钟</span><span class="chip" v-for="t in detail.tools" :key="t">{{t}}</span><span style="font-size:20px;cursor:pointer;margin-left:auto" @click="fav.toggle(detail)">{{fav.isFavorite(detail.id)?'❤️':'🤍'}}</span></div>
      <div class="stuff-row"><span v-for="s in detail.stuff" :key="s" class="stuff-chip" :class="kitchen.hasIngredient(s)?'matched':'missing'">{{s}} {{kitchen.hasIngredient(s)?'✓':'缺'}}</span></div>
      <div class="actions"><button v-if="detail.bv" class="btn btn-outline" @click="window.open('https://www.bilibili.com/video/'+detail.bv,'_blank')">📺 视频教程</button></div>
    </div></div>
    <div v-if="showHistory" class="modal-overlay" @click.self="showHistory=false"><div class="modal-sheet" style="max-height:60vh">
      <div class="modal-title">📋 烹饪历史</div>
      <div v-if="!history.length" class="empty-state" style="padding:24px"><div>还没有烹饪记录</div><div style="font-size:12px;color:var(--text-secondary);margin-top:4px">在首页做完菜后会自动记录</div></div>
      <div v-for="h in history" :key="h.id" class="recipe-row" style="padding:8px 0" @click="detail=h.recipe;showHistory=false">
        <img :src="imgUrl(h.recipe)" style="width:36px;height:36px;border-radius:4px;object-fit:cover;flex-shrink:0" @error="onImgError($event)">
        <div class="recipe-info">
          <div class="recipe-name">{{h.recipe?.name||'(已删除)'}}</div>
          <div class="recipe-meta">{{formatTime(h.cookedAt)}}</div>
        </div>
      </div>
    </div></div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { RecipeItem } from '~/types'
import { useRecipeStore } from '~/stores/recipe'
import { useKitchenStore } from '~/stores/kitchen'
import { useHistoryStore } from '~/stores/history'
import { useFavoritesStore } from '~/stores/favorites'
import { recipeEmoji } from '~/utils/icons'
const recipeStore=useRecipeStore();const kitchen=useKitchenStore();const historyStore=useHistoryStore()
const fav = useFavoritesStore()
function imgUrl(r:any):string{ const id = (r.id||1)-1; return '/images/'+String(id).padStart(4,'0')+'.jpg' }
function onImgError(e:any){
  const img = e.target
  const row = img.closest('.recipe-row')
  const nameEl = row?.querySelector('.recipe-name')
  const name = nameEl?.textContent || ''
  const span = document.createElement('span')
  span.style.cssText = 'display:inline-flex;width:44px;height:44px;border-radius:4px;background:var(--border);align-items:center;justify-content:center;font-size:22px;flex-shrink:0'
  span.textContent = recipeEmoji(name)
  img.replaceWith(span)
}
const kw=ref('');const sel=ref('全部');const limit=ref(50);const detail=ref<RecipeItem|null>(null);const showHistory=ref(false)
const filterTools=['全部','❤️ 收藏','🍰 甜品','电饭煲','烤箱','微波炉','空气炸锅','炒锅/大锅','蒸锅']
function stars(n:number):string{return '★'.repeat(n)+'☆'.repeat(4-n)}
const filtered=computed(()=>{
  let r=recipeStore.allRecipes
  if(kw.value)r=r.filter(x=>x.name.toLowerCase().includes(kw.value.toLowerCase()))
  if(sel.value==='🍰 甜品') r=r.filter(x=>x.tags?.includes('甜品'))
  else if(sel.value==='❤️ 收藏') r=r.filter(x=>fav.isFavorite(x.id))
  else if(sel.value==='炒锅/大锅') r=r.filter(x=>x.tools?.includes('一口大锅')||x.tools?.includes('炒锅'))
  else if(sel.value!=='全部') r=r.filter(x=>x.tools?.includes(sel.value))
  return[...r].sort((a,b)=>(a.diffNum||2)-(b.diffNum||2))
})
const paged=computed(()=>filtered.value.slice(0,limit.value))
const history=computed(()=>historyStore.history)
watch([kw,sel],()=>{limit.value=50})
function openHistory(){showHistory.value=true;historyStore.load()}
function formatTime(t:string){const d=new Date(t);return `${d.getMonth()+1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`}
const icon=(n:string)=>({'番茄':'🍅','土豆':'🥔','洋葱':'🧅','猪肉':'🥩','牛肉':'🥩','鸡肉':'🍗','腊肠':'🥓','鸡蛋':'🥚','米':'🍚','面食':'🍜','豆腐':'🫘','虾':'🦐','菌菇':'🍄','胡萝卜':'🥕','茄子':'🍆','包菜':'🥬','青椒':'🫑','黄瓜':'🥒','花菜':'🥦'}[n]||'🥬')
onMounted(async()=>{if(!recipeStore.loaded)await recipeStore.loadAll();await historyStore.load();await fav.load()})
</script>
