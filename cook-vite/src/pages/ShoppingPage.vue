<template>
  <div class="page">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div class="card-header" style="margin-bottom:0">🛒 购物清单 ({{shopping.items.length}})</div><button v-if="shopping.items.length" class="btn-sm btn-danger" @click="shopping.clear()">清空</button></div>
      <div v-if="!shopping.items.length" class="empty-state"><div class="empty-state-icon">🛒</div><div>购物清单是空的</div></div>
      <div v-else>
        <div v-if="missing.length" style="font-size:12px;color:var(--text-secondary);margin:8px 0 4px">缺的食材</div>
        <div v-for="item in missing" :key="item.name" class="shop-row">
          <div style="flex:1;min-width:0"><div style="font-size:14px">{{item.name}}</div><div style="font-size:11px;color:var(--text-secondary)">来自：{{item.fromRecipe}}</div></div>
          <button class="btn-sm btn-done" @click="addToKitchen(item)">已买好 ✓</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useShoppingStore } from '~/stores/shopping'
import { useKitchenStore } from '~/stores/kitchen'
const shopping=useShoppingStore()
const kitchen=useKitchenStore()
const missing=computed(()=>shopping.items.filter(i=>i.reason==='缺失食材'))
async function addToKitchen(item:{name:string,reason:string,fromRecipe:string}){
  const d=new Date();d.setDate(d.getDate()+7)
  await kitchen.addIngredient({name:item.name,category:'其他',quantity:1,unit:'份',storageCondition:'冷藏',expiryDate:d.toISOString().split('T')[0],opened:false})
  await shopping.remove(item.name)
}
onMounted(async()=>{await shopping.load()})
</script>
<style scoped>
.btn-done {
  background: var(--green); color: #FFF;
  padding: 5px 12px; border-radius: 4px; font-size: 12px;
  font-weight: 500; border: none; cursor: pointer; font-family: inherit;
  white-space: nowrap;
}
</style>
