<template>
  <div class="app">
    <Onboarding v-if="showOnboarding" @done="showOnboarding = false" />
    <div class="header">今天吃什么</div>
    <router-view />
    <div class="tab-bar">
      <router-link to="/" class="tab-btn" :class="{ active: route.path === '/' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>今天吃啥</span>
      </router-link>
      <router-link to="/kitchen" class="tab-btn" :class="{ active: route.path === '/kitchen' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>我的厨房</span>
      </router-link>
      <router-link to="/recipes" class="tab-btn" :class="{ active: route.path === '/recipes' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>菜谱库</span>
      </router-link>
      <router-link to="/shopping" class="tab-btn" :class="{ active: route.path === '/shopping' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span>购物清单</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import Onboarding from './components/Onboarding.vue'
const route = useRoute()
const showOnboarding = ref(false)
onMounted(() => {
  showOnboarding.value = localStorage.getItem('cook_onboarded') !== '1'
})
</script>

<style>
:root{--bg:#FAFAFA;--card:#FFF;--text:#2C2C2C;--text-secondary:#8E8E93;--accent:#E8A838;--accent-light:#FFF8EC;--green:#34C759;--green-bg:#EEFAF2;--yellow:#FF9500;--yellow-bg:#FFF6E8;--red:#FF3B30;--red-bg:#FFEEED;--border:#F0F0F0;--shadow:0 1px 3px rgba(0,0,0,.06);--radius:8px}
@media(prefers-color-scheme:dark){:root{--bg:#1C1C1E;--card:#2C2C2E;--text:#E5E5EA;--border:#38383A;--shadow:0 1px 3px rgba(0,0,0,.3);--accent-light:#2C2418;--green-bg:#1A2E20;--yellow-bg:#2E2418;--red-bg:#2E1A1A}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',Roboto,sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
.app{display:flex;flex-direction:column;height:100vh;height:100dvh}
.header{height:48px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:600;letter-spacing:-.2px;background:var(--card);border-bottom:1px solid var(--border);flex-shrink:0}
.tab-bar{height:56px;display:flex;align-items:center;justify-content:space-around;background:var(--card);border-top:1px solid var(--border);flex-shrink:0;padding-bottom:env(safe-area-inset-bottom)}
.tab-btn{display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--text-secondary);font-size:10px;text-decoration:none;padding:4px 12px;transition:color .15s}
.tab-btn svg{width:22px;height:22px;pointer-events:none}
.tab-btn.active{color:var(--accent)}
.page{flex:1;overflow-y:auto;padding:12px 16px 20px;-webkit-overflow-scrolling:touch}
.card{background:var(--card);border-radius:8px;padding:14px;box-shadow:var(--shadow);margin-bottom:10px}
.card-header{font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.recipe-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer}
.recipe-row:last-child{border-bottom:none}
.recipe-row:active{background:var(--accent-light);margin:0 -14px;padding-left:14px;padding-right:14px}
.badge{width:44px;height:44px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;flex-shrink:0}
.badge-perfect{background:var(--green-bg);color:var(--green)}
.badge-loose{background:var(--yellow-bg);color:var(--yellow)}
.recipe-info{flex:1;min-width:0}
.recipe-name{font-size:15px;font-weight:500}
.recipe-meta{font-size:12px;color:var(--text-secondary);margin-top:3px;display:flex;gap:8px;align-items:center}
.dot{width:6px;height:6px;border-radius:50%;background:var(--border);display:inline-block}
.dot.filled{background:var(--accent)}
.tag-expiring{background:var(--red-bg);color:var(--red);padding:1px 6px;border-radius:3px;font-size:11px}
.missing{font-size:12px;color:var(--yellow);margin-top:4px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:100;display:flex;align-items:flex-end}
.modal-sheet{background:var(--card);width:100%;max-width:480px;margin:0 auto;border-radius:16px 16px 0 0;padding:20px 16px calc(20px + env(safe-area-inset-bottom));max-height:70vh;overflow-y:auto}
.modal-title{font-size:18px;font-weight:700;text-align:center;margin-bottom:12px}
.chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.chip{padding:2px 8px;border-radius:4px;font-size:12px;background:var(--border);color:var(--text-secondary)}
.stuff-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.stuff-chip{padding:4px 10px;border-radius:12px;font-size:12px;background:var(--border)}
.stuff-chip.matched{background:var(--green-bg);color:var(--green)}
.stuff-chip.missing{background:var(--red-bg);color:var(--red)}
.btn{padding:10px 16px;border-radius:4px;font-size:14px;font-weight:500;cursor:pointer;border:none;width:100%;font-family:inherit}
.btn-primary{background:var(--accent);color:#FFF}
.btn-outline{background:transparent;border:1.5px solid var(--border);color:var(--text)}
.btn-sm{padding:4px 10px;border-radius:4px;font-size:12px;border:none;cursor:pointer;background:transparent;font-family:inherit}
.btn-sm.btn-primary{background:var(--accent);color:#FFF}
.btn-sm.btn-danger{color:var(--red)}
.alert-card{background:var(--red-bg);border-radius:8px;padding:12px 14px;margin-bottom:10px;display:flex;align-items:center;gap:10px;font-size:13px}
.empty-state{text-align:center;padding:48px 24px;color:var(--text-secondary)}
.empty-state-icon{font-size:48px;margin-bottom:12px}
.tool-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.tool-tag{padding:8px 14px;border-radius:20px;font-size:13px;border:1.5px solid var(--border);cursor:pointer}
.tool-tag.selected{background:var(--accent);border-color:var(--accent);color:#FFF}
.search-bar{display:flex;align-items:center;gap:8px;background:var(--bg);border-radius:8px;padding:8px 12px;margin-bottom:8px}
.search-bar svg{width:16px;height:16px;color:var(--text-secondary);flex-shrink:0}
.search-input{flex:1;border:none;background:transparent;font-size:14px;color:var(--text);outline:none;font-family:inherit}
.input{width:100%;padding:10px 12px;border-radius:4px;border:1.5px solid var(--border);font-size:14px;background:var(--bg);color:var(--text);font-family:inherit}
.input:focus{border-color:var(--accent);outline:none}
.label{display:block;font-size:12px;color:var(--text-secondary);margin:10px 0 4px}
.ing-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.ing-name{font-size:14px;font-weight:500}
.ing-meta{font-size:11px;color:var(--text-secondary);margin-top:2px}
.ing-expiry{font-size:11px}
.ing-expiry.expired{color:#FF3B30}
.ing-expiry.expiring-soon{color:#FF9500;font-weight:500}
.ing-expiry.expiry-ok{color:#34C759}
.actions{display:flex;flex-direction:column;gap:8px}
.shop-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)}
.modal-img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:8px;margin-bottom:12px}
</style>
.recipe-thumb{width:44px;height:44px;border-radius:4px;object-fit:cover;flex-shrink:0}
