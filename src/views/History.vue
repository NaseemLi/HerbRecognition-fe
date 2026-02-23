<template>
  <div class="history">
    <h1>识别历史</h1>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="list.length === 0" class="empty">
      暂无识别记录
    </div>
    
    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="item">
        <img :src="apiUrl + item.image_url" :alt="item.herb_name" class="item-image" />
        <div class="item-info">
          <h3>{{ item.herb_name }}</h3>
          <p class="confidence">置信度：{{ item.confidence }}%</p>
          <p class="date">{{ formatDate(item.created_at) }}</p>
        </div>
        <div class="item-actions">
          <router-link :to="`/herb/${item.herb_id}`" class="btn-detail">
            查看详情
          </router-link>
          <button @click="handleDelete(item.id)" class="btn-delete">
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading && list.length > 0" class="pagination">
      <button :disabled="page <= 1" @click="loadPage(page - 1)">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages" @click="loadPage(page + 1)">下一页</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped>
.history {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.history h1 {
  margin-bottom: 24px;
  color: #333;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item {
  display: flex;
  gap: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  align-items: center;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 8px;
  color: #333;
  font-size: 16px;
}

.confidence {
  color: #67c23a;
  font-size: 14px;
  margin: 0 0 4px;
}

.date {
  color: #999;
  font-size: 12px;
  margin: 0;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.btn-detail {
  padding: 6px 16px;
  background: #409eff;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
}

.btn-detail:hover {
  background: #66b1ff;
}

.btn-delete {
  padding: 6px 16px;
  background: #fff;
  border: 1px solid #f56c6c;
  color: #f56c6c;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-delete:hover {
  background: #f56c6c;
  color: #fff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination button {
  padding: 8px 20px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.error {
  margin-top: 16px;
  padding: 12px;
  background: #fef0f0;
  color: #f56c6c;
  border-radius: 4px;
  text-align: center;
}
</style>
