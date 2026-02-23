<template>
  <button v-if="show" @click="handleBack" class="back-button" :title="title">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 4L3 10L9 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 10H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface Props {
  defaultBack?: string  // 默认返回路径
  text?: string         // 按钮文字
}

const props = withDefaults(defineProps<Props>(), {
  defaultBack: '/',
  text: '返回'
})

const router = useRouter()
const route = useRoute()

const show = computed(() => {
  // 首页、登录页、注册页不显示返回按钮
  return !['/login', '/register', '/'].includes(route.path)
})

const title = computed(() => {
  return `返回到 ${props.defaultBack === '/' ? '首页' : props.defaultBack}`
})

function handleBack() {
  router.push(props.defaultBack)
}
</script>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.back-button svg {
  flex-shrink: 0;
}
</style>
