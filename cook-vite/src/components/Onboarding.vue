<template>
  <div class="onboard-overlay">
    <div class="onboard-card">
      <!-- Step 1: Welcome -->
      <div v-if="step === 0" class="step-content">
        <div class="step-emoji">👋</div>
        <h1 class="step-title">欢迎来到「今天吃什么」</h1>
        <p class="step-desc">告诉我你的厨房里有什么<br>我帮你算出今天能做什么菜</p>
        <div class="step-features">
          <div class="feature-item"><span class="feature-icon">🥬</span>录入食材库存</div>
          <div class="feature-item"><span class="feature-icon">🔪</span>勾选你的厨具</div>
          <div class="feature-item"><span class="feature-icon">✨</span>一键匹配可做菜谱</div>
        </div>
        <button class="onboard-btn" @click="step = 1">开始设置</button>
        <button class="onboard-skip" @click="finish">跳过，自己探索</button>
      </div>

      <!-- Step 2: Select Tools -->
      <div v-else-if="step === 1" class="step-content">
        <div class="step-emoji">🔪</div>
        <h2 class="step-title">你有哪些厨具？</h2>
        <p class="step-desc">勾选你厨房里有的，可多选</p>
        <div class="tool-grid-onboard">
          <button v-for="t in commonTools" :key="t" class="tool-chip-onboard" :class="{ selected: selectedTools.has(t) }"
            @click="toggleTool(t)">
            <span class="tool-emoji">{{ toolEmoji[t] }}</span>
            <span>{{ t }}</span>
          </button>
        </div>
        <div class="step-nav">
          <button class="onboard-btn-secondary" @click="step = 0">上一步</button>
          <button class="onboard-btn" @click="step = 2">下一步</button>
        </div>
      </div>

      <!-- Step 3: Add Basic Ingredients -->
      <div v-else-if="step === 2" class="step-content">
        <div class="step-emoji">🥬</div>
        <h2 class="step-title">你冰箱里有什么？</h2>
        <p class="step-desc">勾选手头有的食材，选几个就行</p>
        <div class="stuff-grid-onboard">
          <button v-for="s in commonStuff" :key="s" class="stuff-chip-onboard" :class="{ selected: selectedStuff.has(s) }"
            @click="toggleStuff(s)">
            <span class="tool-emoji">{{ stuffIngEmoji[s] }}</span>
            <span>{{ s }}</span>
          </button>
        </div>
        <div class="step-nav">
          <button class="onboard-btn-secondary" @click="step = 1">上一步</button>
          <button class="onboard-btn" :disabled="selectedStuff.size === 0" @click="saveAndFinish">
            {{ selectedStuff.size === 0 ? '至少选一样食材' : '完成，开始做饭！' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { StorageCondition } from '~/types'
import { useKitchenStore } from '~/stores/kitchen'

const emit = defineEmits(['done'])
const kitchen = useKitchenStore()
const step = ref(0)

const commonTools = ['炒锅', '电饭煲', '烤箱', '微波炉', '空气炸锅', '蒸锅']
const toolEmoji: Record<string, string> = { '炒锅': '🍳', '电饭煲': '🍚', '烤箱': '🔥', '微波炉': '♨️', '空气炸锅': '💨', '蒸锅': '🧖' }

const commonStuff = ['鸡蛋', '番茄', '土豆', '米', '猪肉', '洋葱', '青椒', '豆腐', '鸡肉', '面食', '胡萝卜', '白菜']
const stuffIngEmoji: Record<string, string> = { '鸡蛋': '🥚', '番茄': '🍅', '土豆': '🥔', '米': '🍚', '猪肉': '🥩', '洋葱': '🧅', '青椒': '🫑', '豆腐': '🫘', '鸡肉': '🍗', '面食': '🍜', '胡萝卜': '🥕', '白菜': '🥬' }

const selectedTools = ref(new Set<string>())
const selectedStuff = ref(new Set<string>())

function toggleTool(t: string) {
  if (selectedTools.value.has(t)) selectedTools.value.delete(t)
  else selectedTools.value.add(t)
  selectedTools.value = new Set(selectedTools.value)
}

function toggleStuff(s: string) {
  if (selectedStuff.value.has(s)) selectedStuff.value.delete(s)
  else selectedStuff.value.add(s)
  selectedStuff.value = new Set(selectedStuff.value)
}

async function saveAndFinish() {
  for (const t of selectedTools.value) {
    if (!kitchen.hasTool(t)) await kitchen.toggleTool(t)
  }
  for (const s of selectedStuff.value) {
    if (!kitchen.hasIngredient(s)) {
      const d = new Date(); d.setDate(d.getDate() + 7)
      await kitchen.addIngredient({
        name: s, category: '其他', quantity: 1, unit: '份',
        storageCondition: '冷藏' as StorageCondition,
        expiryDate: d.toISOString().split('T')[0], opened: false
      })
    }
  }
  finish()
}

function finish() {
  localStorage.setItem('cook_onboarded', '1')
  emit('done')
}
</script>

<style scoped>
.onboard-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.onboard-card {
  width: 100%; max-width: 360px;
  text-align: center;
}
.step-content {
  animation: fadeSlideIn .35s ease-out;
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.step-emoji { font-size: 64px; margin-bottom: 16px; }
.step-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
.step-desc { font-size: 15px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px; }
.step-features { text-align: left; margin-bottom: 28px; }
.feature-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; font-size: 15px; color: var(--text); border-bottom: 1px solid var(--border); }
.feature-icon { font-size: 22px; width: 32px; text-align: center; }
.onboard-btn {
  width: 100%; padding: 14px; border-radius: 10px; border: none;
  background: var(--accent); color: #FFF; font-size: 16px;
  font-weight: 600; cursor: pointer; font-family: inherit;
  transition: opacity .15s;
}
.onboard-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.onboard-btn-secondary {
  padding: 14px 20px; border-radius: 10px; border: none;
  background: var(--border); color: var(--text); font-size: 14px;
  cursor: pointer; font-family: inherit;
}
.onboard-skip {
  margin-top: 12px; background: none; border: none;
  color: var(--text-secondary); font-size: 13px;
  cursor: pointer; font-family: inherit;
}
.tool-grid-onboard, .stuff-grid-onboard {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 24px;
}
.tool-chip-onboard, .stuff-chip-onboard {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 14px 8px; border-radius: 12px; border: 2px solid var(--border);
  background: var(--card); cursor: pointer; font-size: 13px;
  color: var(--text); transition: all .15s; font-family: inherit;
}
.tool-chip-onboard.selected, .stuff-chip-onboard.selected {
  border-color: var(--accent); background: var(--accent-light);
}
.tool-emoji { font-size: 28px; }
.step-nav { display: flex; gap: 10px; justify-content: center; }
</style>
