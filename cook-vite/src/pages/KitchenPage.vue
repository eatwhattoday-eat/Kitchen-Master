<template>
  <div class="page">
    <!-- Tools Drawer -->
    <div class="tools-drawer" :class="{ open: toolsOpen }">
      <div class="tools-header" @click="toolsOpen = !toolsOpen">
        <div style="display:flex;align-items:center;gap:8px">
          <span>🔪</span>
          <span class="tools-label">我的厨具</span>
          <span v-if="toolCount && !toolsOpen" class="tools-count">{{ toolCount }}件</span>
          <span v-if="!toolCount && !toolsOpen" style="font-size:12px;color:var(--text-secondary)">点击选择</span>
        </div>
        <span class="tools-arrow" :class="{ rotated: toolsOpen }">▾</span>
      </div>
      <div v-if="toolsOpen" class="tools-body">
        <div class="tool-grid">
          <span v-for="t in allTools" :key="t" class="tool-tag" :class="{selected:hasTool(t)}" @click="toggleTool(t)">{{hasTool(t)?'✓ ':''}}{{t}}</span>
        </div>
        <button class="btn-sm btn-primary" style="width:100%;margin-top:8px" @click="toolsOpen=false">完成选择</button>
      </div>
      <div v-else-if="toolCount" class="tools-collapsed">
        <span v-for="t in displayTools" :key="t" class="tool-mini">{{ t }}</span>
      </div>
    </div>

    <!-- Quick Add Section - Collapsible -->
    <div class="quick-add-section">
      <div class="section-header" @click="quickAddOpen = !quickAddOpen">
        <div style="display:flex;align-items:center;gap:8px">
          <span>🛒</span>
          <span class="section-label">快速添加食材</span>
        </div>
        <span class="section-arrow" :class="{ rotated: quickAddOpen }">▾</span>
      </div>
      <div v-if="quickAddOpen" class="section-body">
        <!-- Search -->
        <div class="search-card">
          <div class="search-bar-ing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchKw" placeholder="搜索食材..." class="search-input" @focus="showSearchResults=true">
          </div>
          <div v-if="showSearchResults && searchKw" class="search-results">
            <div v-for="ing in filteredIngredients" :key="ing.name" class="search-item" @click="selectIng(ing)">
              <span class="ing-icon">{{ ingredientEmoji(ing.name) }}</span>
              <div><div class="ing-name-text">{{ ing.name }}</div><div class="ing-cat">{{ ing.category }}</div></div>
              <span class="add-icon">+</span>
            </div>
            <div v-if="!filteredIngredients.length" class="search-empty">未找到食材</div>
          </div>
        </div>
        <!-- Category tabs -->
        <div class="cat-tabs">
          <span v-for="cat in catList" :key="cat" class="cat-chip" :class="{active: activeCat===cat}" @click="activeCat=cat;showSearchResults=false">{{ catEmoji[cat] }} {{cat}}</span>
        </div>
        <div class="cat-ingredients">
          <span v-for="ing in categoryIngredients" :key="ing.name" class="ing-chip" @click="selectIng(ing)">{{ ingredientEmoji(ing.name) }} {{ ing.name }}</span>
        </div>
      </div>
    </div>

    <!-- Ingredients Inventory -->
    <div class="card">
      <div class="inv-header">
        <div class="card-header" style="margin-bottom:0">🥬 食材库存 ({{ kitchen.ingredients.length }})</div>
        <div class="inv-actions">
          <button v-if="hasExpired" class="btn-mini btn-warn" @click="clearExpired">清理过期</button>
          <button v-if="kitchen.ingredients.length" class="btn-mini btn-danger" @click="clearAll">全部删除</button>
        </div>
      </div>
      <div v-if="!kitchen.ingredients.length" style="text-align:center;padding:24px;color:var(--text-secondary)">还没有食材，在上方「快速添加食材」中添加</div>
      <div v-for="ing in sorted" :key="ing.name" class="ing-row">
        <span style="font-size:24px">{{icon(ing.name)}}</span>
        <div style="flex:1;min-width:0"><div class="ing-name">{{ing.name}} x{{ing.quantity}}{{ing.unit}}</div><div class="ing-meta">{{ing.storageCondition}}<span v-if="ing.opened"> · 已开封</span></div><div v-if="ing.expiryDate" class="ing-expiry" :class="kitchen.getExpiryClass(ing.expiryDate)">保质期：{{kitchen.getExpiryLabel(ing.expiryDate)}}</div></div>
        <button class="btn-sm btn-danger" @click="kitchen.removeIngredient(ing.name)">删除</button>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd=false"><div class="modal-sheet">
      <div class="modal-title">添加食材</div>
      <label class="label">食材名称</label>
      <div class="name-display">{{ form.name }}</div>
      <label class="label">品类</label>
      <div class="name-display" style="font-size:13px">{{ form.category }}</div>
      <label class="label">数量</label><input v-model.number="form.quantity" type="number" min="1" class="input">
      <label class="label">单位</label><select v-model="form.unit" class="input"><option v-for="u in units" :key="u" :value="u">{{u}}</option></select>
      <label class="label">保存条件</label><select v-model="form.storageCondition" class="input"><option v-for="s in storages" :key="s" :value="s">{{s}}</option></select>
      <label class="label">保质期</label><input v-model="form.expiryDate" type="date" class="input">
      <label style="display:flex;align-items:center;gap:8px;margin:12px 0;cursor:pointer;font-size:13px"><input v-model="form.opened" type="checkbox"> 已开封</label>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline" style="flex:1" @click="showAdd=false">取消</button>
        <button class="btn btn-primary" style="flex:1" @click="save">保存</button>
      </div>
    </div></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { StorageCondition } from '~/types'
import { useKitchenStore } from '~/stores/kitchen'
import { ingredientEmoji } from '~/utils/icons'
const kitchen=useKitchenStore()
const toolsOpen=ref(false)
const quickAddOpen=ref(false)
const allTools=['电饭煲','烤箱','微波炉','空气炸锅','炒锅/大锅','蒸锅']

function realTool(display:string):string{ return display==='炒锅/大锅'?'一口大锅':display }
function hasTool(display:string):boolean{ return kitchen.hasTool(realTool(display)) }
function toggleTool(display:string){ kitchen.toggleTool(realTool(display)) }

const toolCount=computed(()=>kitchen.tools.length)
const displayTools=computed(()=>kitchen.tools.map(t=>t==='一口大锅'?'炒锅/大锅':t))

const searchKw=ref('')
const showSearchResults=ref(false)
const showAdd=ref(false)
const activeCat=ref('蔬菜')

const catEmoji:Record<string,string>={'蔬菜':'🥬','肉类':'🥩','海鲜':'🦐','主食':'🍚','豆制品':'🫘','蛋奶':'🥚','调料':'🧂','干货':'🥜','水果':'🍓','烘焙':'🧁'}
const catList=['蔬菜','肉类','海鲜','主食','豆制品','蛋奶','调料','干货','水果','烘焙']

type IngItem = {name:string, category:string, storageCondition:StorageCondition, unit:string}

const ingredientsDB: IngItem[] = [
  {name:'番茄',category:'蔬菜',storageCondition:'冷藏',unit:'个'},{name:'土豆',category:'蔬菜',storageCondition:'避光干燥',unit:'个'},
  {name:'洋葱',category:'蔬菜',storageCondition:'避光干燥',unit:'个'},{name:'胡萝卜',category:'蔬菜',storageCondition:'冷藏',unit:'根'},
  {name:'青椒',category:'蔬菜',storageCondition:'冷藏',unit:'个'},{name:'黄瓜',category:'蔬菜',storageCondition:'冷藏',unit:'根'},
  {name:'茄子',category:'蔬菜',storageCondition:'冷藏',unit:'个'},{name:'包菜',category:'蔬菜',storageCondition:'冷藏',unit:'个'},
  {name:'白菜',category:'蔬菜',storageCondition:'冷藏',unit:'棵'},{name:'花菜',category:'蔬菜',storageCondition:'冷藏',unit:'个'},
  {name:'西葫芦',category:'蔬菜',storageCondition:'冷藏',unit:'个'},{name:'莴笋',category:'蔬菜',storageCondition:'冷藏',unit:'根'},
  {name:'芹菜',category:'蔬菜',storageCondition:'冷藏',unit:'把'},{name:'白萝卜',category:'蔬菜',storageCondition:'冷藏',unit:'根'},
  {name:'菌菇',category:'蔬菜',storageCondition:'冷藏',unit:'盒'},{name:'西兰花',category:'蔬菜',storageCondition:'冷藏',unit:'个'},
  {name:'红薯',category:'蔬菜',storageCondition:'避光干燥',unit:'个'},{name:'紫薯',category:'蔬菜',storageCondition:'避光干燥',unit:'个'},
  {name:'南瓜',category:'蔬菜',storageCondition:'避光干燥',unit:'个'},{name:'葱',category:'蔬菜',storageCondition:'冷藏',unit:'把'},
  {name:'生姜',category:'蔬菜',storageCondition:'避光干燥',unit:'块'},{name:'大蒜',category:'蔬菜',storageCondition:'避光干燥',unit:'头'},
  {name:'猪肉',category:'肉类',storageCondition:'冷冻',unit:'份'},{name:'牛肉',category:'肉类',storageCondition:'冷冻',unit:'份'},
  {name:'鸡肉',category:'肉类',storageCondition:'冷冻',unit:'份'},{name:'腊肠',category:'肉类',storageCondition:'冷藏',unit:'根'},
  {name:'香肠',category:'肉类',storageCondition:'冷冻',unit:'根'},{name:'午餐肉',category:'肉类',storageCondition:'常温',unit:'盒'},
  {name:'肥牛',category:'肉类',storageCondition:'冷冻',unit:'盒'},{name:'培根',category:'肉类',storageCondition:'冷冻',unit:'包'},
  {name:'排骨',category:'肉类',storageCondition:'冷冻',unit:'份'},{name:'骨头',category:'肉类',storageCondition:'冷冻',unit:'份'},
  {name:'虾',category:'海鲜',storageCondition:'冷冻',unit:'份'},{name:'虾仁',category:'海鲜',storageCondition:'冷冻',unit:'份'},
  {name:'米',category:'主食',storageCondition:'避光干燥',unit:'份'},{name:'面食',category:'主食',storageCondition:'避光干燥',unit:'份'},
  {name:'面粉',category:'主食',storageCondition:'避光干燥',unit:'份'},{name:'方便面',category:'主食',storageCondition:'常温',unit:'包'},
  {name:'豆腐',category:'豆制品',storageCondition:'冷藏',unit:'块'},
  {name:'鸡蛋',category:'蛋奶',storageCondition:'冷藏',unit:'个'},{name:'牛奶',category:'蛋奶',storageCondition:'冷藏',unit:'盒'},
  {name:'淡奶油',category:'蛋奶',storageCondition:'冷藏',unit:'盒'},{name:'酸奶',category:'蛋奶',storageCondition:'冷藏',unit:'盒'},
  {name:'炼乳',category:'蛋奶',storageCondition:'冷藏',unit:'支'},
  {name:'白砂糖',category:'调料',storageCondition:'避光干燥',unit:'份'},{name:'盐',category:'调料',storageCondition:'避光干燥',unit:'份'},
  {name:'植物油',category:'调料',storageCondition:'常温',unit:'份'},{name:'生抽',category:'调料',storageCondition:'常温',unit:'份'},
  {name:'蚝油',category:'调料',storageCondition:'冷藏',unit:'份'},{name:'玉米淀粉',category:'调料',storageCondition:'避光干燥',unit:'份'},
  {name:'酵母',category:'调料',storageCondition:'冷藏',unit:'包'},{name:'泡打粉',category:'调料',storageCondition:'避光干燥',unit:'包'},
  {name:'可可粉',category:'调料',storageCondition:'避光干燥',unit:'份'},{name:'抹茶粉',category:'调料',storageCondition:'避光干燥',unit:'份'},
  {name:'木耳',category:'干货',storageCondition:'避光干燥',unit:'份'},{name:'芝麻',category:'干货',storageCondition:'避光干燥',unit:'份'},
  {name:'花生',category:'干货',storageCondition:'避光干燥',unit:'份'},{name:'核桃',category:'干货',storageCondition:'避光干燥',unit:'份'},
  {name:'蔓越莓干',category:'干货',storageCondition:'避光干燥',unit:'份'},{name:'红枣',category:'干货',storageCondition:'避光干燥',unit:'份'},
  {name:'椰蓉',category:'干货',storageCondition:'避光干燥',unit:'份'},{name:'坚果',category:'干货',storageCondition:'避光干燥',unit:'份'},
  {name:'芒果',category:'水果',storageCondition:'冷藏',unit:'个'},{name:'草莓',category:'水果',storageCondition:'冷藏',unit:'份'},
  {name:'蓝莓',category:'水果',storageCondition:'冷藏',unit:'盒'},{name:'香蕉',category:'水果',storageCondition:'常温',unit:'根'},
  {name:'柠檬',category:'水果',storageCondition:'冷藏',unit:'个'},
  {name:'黄油',category:'烘焙',storageCondition:'冷藏',unit:'块'},{name:'奶油奶酪',category:'烘焙',storageCondition:'冷藏',unit:'块'},
  {name:'吉利丁',category:'烘焙',storageCondition:'避光干燥',unit:'片'},{name:'黑巧克力',category:'烘焙',storageCondition:'避光干燥',unit:'块'},
  {name:'芝士',category:'烘焙',storageCondition:'冷藏',unit:'份'},{name:'红豆沙',category:'烘焙',storageCondition:'冷藏',unit:'份'},
  {name:'桂花',category:'烘焙',storageCondition:'避光干燥',unit:'份'},{name:'棉花糖',category:'烘焙',storageCondition:'避光干燥',unit:'包'},
]

const aliases:Record<string,string>={
  '白糖':'白砂糖','冰糖':'白砂糖','红糖':'白砂糖','糖':'白砂糖',
  '盐巴':'盐','食盐':'盐',
  '色拉油':'植物油','菜油':'植物油','花生油':'植物油',
  '酱油':'生抽','老抽':'生抽',
  '生粉':'玉米淀粉','地瓜粉':'玉米淀粉',
  '奶油':'淡奶油','鲜奶油':'淡奶油',
  '奶酪':'奶油奶酪','马斯卡彭':'奶油奶酪',
  '巧克力':'黑巧克力','可可脂':'黑巧克力',
  '酵母粉':'酵母','发酵粉':'酵母',
  '苏打粉':'泡打粉','小苏打':'泡打粉',
  '面包':'吐司','面包片':'吐司',
  '鸡腿':'鸡肉','鸡翅':'鸡肉','鸡胸':'鸡肉','鸡块':'鸡肉',
  '牛排':'牛肉','牛腩':'牛肉',
  '排骨':'猪肉','肉':'猪肉','五花肉':'猪肉',
  '虾仁':'虾','鲜虾':'虾','大虾':'虾',
  '挂面':'面食','面条':'面食','拉面':'面食',
  '糯米':'米','大米':'米',
}

function resolveName(name:string):string{ return aliases[name] || name }

const filteredIngredients = computed(() => {
  const kw = searchKw.value.trim().toLowerCase()
  if (!kw) return []
  return ingredientsDB.filter(i => i.name.toLowerCase().includes(kw) || resolveName(i.name).toLowerCase().includes(kw))
})

const categoryIngredients = computed(() => ingredientsDB.filter(i => i.category === activeCat.value))

const units=['个','份','斤','把','包','盒','根','瓶','块','头','棵','片','支']
const storages:StorageCondition[]=['常温','冷藏','冷冻','避光干燥']
const d=new Date();d.setDate(d.getDate()+7)
const form=reactive({name:'',category:'蔬菜',quantity:1,unit:'个',storageCondition:'冷藏' as StorageCondition,expiryDate:d.toISOString().split('T')[0],opened:false})

function selectIng(ing: IngItem) {
  form.name = resolveName(ing.name)
  form.category = ing.category
  form.unit = ing.unit
  form.storageCondition = ing.storageCondition
  form.quantity = 1
  form.opened = false
  showAdd.value = true
  showSearchResults.value = false
  searchKw.value = ''
}

async function save(){
  if(!form.name.trim())return
  await kitchen.addIngredient({...form,name:form.name.trim(),expiryDate:form.expiryDate||null})
  form.name='';form.quantity=1;showAdd.value=false
}

const hasExpired = computed(() => kitchen.expiringItems.length > 0)

async function clearExpired() {
  for (const ing of kitchen.expiringItems) {
    await kitchen.removeIngredient(ing.name)
  }
}

async function clearAll() {
  for (const ing of [...kitchen.ingredients]) {
    await kitchen.removeIngredient(ing.name)
  }
}



const icon = ingredientEmoji

const sorted=computed(()=>[...kitchen.ingredients].sort((a,b)=>{if(!a.expiryDate)return 1;if(!b.expiryDate)return -1;return new Date(a.expiryDate).getTime()-new Date(b.expiryDate).getTime()}))

onMounted(async()=>{if(!kitchen.loaded)await kitchen.load()})
</script>

<style scoped>
.tools-drawer {
  background: var(--card); border-radius: 8px;
  box-shadow: var(--shadow); margin-bottom: 10px;
  overflow: hidden; transition: all .25s ease;
}
.tools-header { display: flex; align-items: center; justify-content: space-between; padding: 14px; cursor: pointer; user-select: none; }
.tools-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; }
.tools-count { font-size: 12px; color: var(--accent); background: var(--accent-light); padding: 1px 8px; border-radius: 10px; }
.tools-arrow { font-size: 14px; color: var(--text-secondary); transition: transform .25s; }
.tools-arrow.rotated { transform: rotate(180deg); }
.tools-body { padding: 0 14px 14px; }
.tools-collapsed { padding: 0 14px 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.tool-mini { padding: 3px 10px; border-radius: 12px; font-size: 12px; background: var(--border); color: var(--text); }

/* Quick Add Section */
.quick-add-section {
  background: var(--card); border-radius: 8px;
  box-shadow: var(--shadow); margin-bottom: 10px;
  overflow: hidden; transition: all .25s ease;
}
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 14px; cursor: pointer; user-select: none; }
.section-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; }
.section-arrow { font-size: 14px; color: var(--text-secondary); transition: transform .25s; }
.section-arrow.rotated { transform: rotate(180deg); }
.section-body { padding: 0 14px 14px; }

.search-card { background: var(--bg); border-radius: 6px; margin-bottom: 10px; position: relative; }
.search-bar-ing { display: flex; align-items: center; gap: 8px; padding: 8px 10px; }
.search-bar-ing svg { width: 16px; height: 16px; color: var(--text-secondary); flex-shrink: 0; }
.search-input { flex: 1; border: none; background: transparent; font-size: 14px; color: var(--text); outline: none; font-family: inherit; }
.search-results { border-top: 1px solid var(--border); max-height: 220px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.search-item { display: flex; align-items: center; gap: 10px; padding: 10px 8px; cursor: pointer; border-bottom: 1px solid var(--border); }
.search-item:active { background: var(--accent-light); }
.ing-icon { font-size: 22px; width: 28px; text-align: center; }
.ing-name-text { font-size: 14px; font-weight: 500; }
.ing-cat { font-size: 11px; color: var(--text-secondary); }
.add-icon { margin-left: auto; font-size: 18px; color: var(--accent); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--accent-light); }
.search-empty { padding: 16px; text-align: center; color: var(--text-secondary); font-size: 13px; }

.cat-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
.cat-chip { padding: 5px 12px; border-radius: 14px; font-size: 12px; white-space: nowrap; cursor: pointer; border: 1.5px solid var(--border); transition: all .15s; }
.cat-chip.active { background: var(--accent); border-color: var(--accent); color: #FFF; }

.cat-ingredients { display: flex; flex-wrap: wrap; gap: 6px; }
.ing-chip { padding: 6px 12px; border-radius: 16px; font-size: 13px; background: var(--bg); border: 1.5px solid var(--border); cursor: pointer; transition: all .15s; white-space: nowrap; }
.ing-chip:active { background: var(--accent-light); border-color: var(--accent); }

/* Inventory header */
.inv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.inv-actions { display: flex; gap: 6px; }
.btn-mini { padding: 3px 10px; border-radius: 4px; font-size: 11px; border: none; cursor: pointer; font-family: inherit; }
.btn-warn { background: var(--yellow-bg); color: var(--yellow); }
.btn-danger { background: var(--red-bg); color: var(--red); }

.name-display { padding: 10px 12px; border-radius: 4px; background: var(--bg); color: var(--text); font-size: 15px; font-weight: 500; }
</style>
