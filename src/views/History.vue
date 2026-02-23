<template>
  <div class="history-page">
    <div class="page-nav">
      <BackButton text="返回首页" />
    </div>
    <div class="page-header">
      <h1>识别历史</h1>
      <p>查看您的识别记录</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="list.length === 0" class="empty">
      <div class="empty-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="40" fill="#f3f4f6"/>
          <path d="M30 40L38 48L52 34" stroke="#9ca3af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>暂无识别记录</h3>
      <p>快去上传第一张图片吧</p>
      <router-link to="/recognize" class="btn-primary">去识别</router-link>
    </div>
    
    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="item">
        <div class="item-image-wrapper">
          <img :src="apiUrl + item.image_url" :alt="item.herb_name" class="item-image" />
          <span v-if="item.confidence" class="item-confidence">{{ item.confidence }}%</span>
        </div>
        <div class="item-info">
          <h3>{{ item.herb_name }}</h3>
          <p class="item-date">{{ formatDate(item.created_at) }}</p>
        </div>
        <div class="item-actions">
          <router-link :to="`/herb/${item.herb_id}`" class="btn-detail">详情</router-link>
          <button @click="handleDelete(item.id)" class="btn-delete" title="删除">删除</button>
        </div>
      </div>
    </div>

    <div v-if="!loading && list.length > 0" class="pagination">
      <button :disabled="page <= 1" @click="loadPage(page - 1)">上一页</button>
      <span class="page-info">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages" @click="loadPage(page + 1)">下一页</button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BackButton from '@/components/BackButton.vue'
import { getHistory, deleteHistory } from '@/api/recognize'
import type { HistoryItem } from '@/api/recognize'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiUrl = computed(() => API_BASE_URL)

const list = ref<HistoryItem[]>([])
const loading = ref(true)
const error = ref('')
const page = ref(1)
const page_size = ref(10)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / page_size.value))

async function loadPage(newPage: number) {
  loading.value = true
  error.value = ''

  try {
    const res = await getHistory(newPage, page_size.value)
    list.value = res.data.list
    total.value = res.data.total
    page.value = newPage
  } catch (e: any) {
    error.value = e.response?.data?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除这条记录吗？')) return

  try {
    await deleteHistory(id)
    list.value = list.value.filter(item => item.id !== id)
  } catch (e: any) {
    error.value = e.response?.data?.message || '删除失败'
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  }
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped>
.history-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-nav {
  margin-bottom: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: var(--text-secondary);
}

.loading {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: var(--text-secondary);
}

.empty {
  text-align: center;
  padding: 80px 20px;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.empty-icon {
  margin-bottom: 20px;
}

.empty h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  text-decoration: none;
  border-radius: var(--radius);
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: all 0.3s;
}

.item:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.item-image-wrapper {
  position: relative;
  flex-shrink: 0;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius);
}

.item-confidence {
  position: absolute;
  top: 8px;
  right: 8px;
  left: auto;
  padding: 3px 8px;
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.item-date {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.item-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-detail {
  padding: 8px 18px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  text-decoration: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-detail:hover {
  transform: translateY(-1px);
}

.btn-delete {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #fef2f2;
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 32px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.pagination button {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.pagination button:hover {
  transform: translateY(-1px);
}

.pagination button:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
}

.page-info {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  padding: 16px 24px;
  margin-top: 20px;
  background: #fef2f2;
  color: var(--danger-color);
  border-radius: var(--radius);
  border: 1px solid #fecaca;
  text-align: center;
}

@media (max-width: 768px) {
  .item {
    flex-wrap: wrap;
  }
  
  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
