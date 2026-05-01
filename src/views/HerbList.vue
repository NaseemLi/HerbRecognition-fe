<template>
  <div class="herbs-page">
    <div class="page-nav">
      <BackButton text="返回首页" />
    </div>
    <div class="page-header">
      <h1>药材查询</h1>
    </div>

    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="6" stroke="#9ca3af" stroke-width="2"/>
            <path d="M13 13L17 17" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <input
          v-model="keyword"
          type="text"
          placeholder="输入药材名称或别名搜索..."
          @keyup.enter="handleSearch"
        />
      </div>
      <button @click="handleSearch" class="btn-search">搜索</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="list.length === 0" class="empty">
      <div class="empty-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="40" fill="#f3f4f6"/>
          <circle cx="40" cy="32" r="6" stroke="#9ca3af" stroke-width="2.5"/>
          <path d="M35 37L45 47" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h3>{{ hasSearched ? '未找到相关药材' : '暂无数据' }}</h3>
      <p v-if="hasSearched">试试其他关键词吧</p>
    </div>

    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="item" @click="goToDetail(item.id)">
        <div class="item-image-wrapper">
          <img :src="apiUrl + item.image_url" :alt="item.name" class="item-image" />
        </div>
        <div class="item-info">
          <div class="item-header">
            <h3>{{ item.name }}</h3>
            <span v-if="item.category" class="item-category">{{ item.category }}</span>
          </div>
          <p v-if="item.scientific" class="scientific">{{ item.scientific }}</p>
          <p class="description">{{ item.description || '暂无描述' }}</p>
        </div>
        <div class="item-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <div v-if="!loading && list.length > 0" class="pagination">
      <button :disabled="page <= 1" @click="loadPage(page - 1)">上一页</button>
      <span class="page-info">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages" @click="loadPage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import { getHerbList, searchHerb } from '@/api/herb'
import type { Herb } from '@/api/herb'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiUrl = computed(() => API_BASE_URL)

const router = useRouter()
const route = useRoute()

const list = ref<Herb[]>([])
const loading = ref(true)
const page = ref(1)
const page_size = ref(10)
const total = ref(0)
const keyword = ref('')
const hasSearched = ref(false)

const totalPages = computed(() => Math.ceil(total.value / page_size.value))

async function loadList() {
  loading.value = true
  hasSearched.value = false

  try {
    const res = await getHerbList(page.value, page_size.value)
    list.value = res.data.list
    total.value = res.data.total
  } catch (e: any) {
    console.error('加载失败', e)
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  page.value = 1
  hasSearched.value = true

  if (!keyword.value.trim()) {
    loadList()
    return
  }

  loading.value = true

  try {
    const res = await searchHerb(keyword.value, page.value, page_size.value)
    list.value = res.data.list
    total.value = res.data.total
  } catch (e: any) {
    console.error('搜索失败', e)
  } finally {
    loading.value = false
  }
}

async function loadPage(newPage: number) {
  if (hasSearched && keyword.value.trim()) {
    const res = await searchHerb(keyword.value, newPage, page_size.value)
    list.value = res.data.list
    total.value = res.data.total
  } else {
    const res = await getHerbList(newPage, page_size.value)
    list.value = res.data.list
    total.value = res.data.total
  }
  page.value = newPage
}

function goToDetail(id: number) {
  router.push(`/herb/${id}`)
}

onMounted(() => {
  // 从 URL 参数读取搜索关键词
  const searchKeyword = route.query.search as string
  if (searchKeyword && searchKeyword.trim()) {
    keyword.value = searchKeyword.trim()
    handleSearch()
  } else {
    loadList()
  }
})
</script>

<style scoped>
.herbs-page {
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

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.search-input-wrapper input {
  width: 100%;
  padding: 14px 20px 14px 50px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 15px;
  transition: all 0.2s;
  background: var(--bg-primary);
}

.search-input-wrapper input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.btn-search {
  padding: 14px 28px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.item:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
  border-color: var(--primary-color);
}

.item-image-wrapper {
  flex-shrink: 0;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.item-info h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.item-category {
  padding: 3px 10px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.scientific {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 14px;
  margin: 0 0 8px;
}

.description {
  color: var(--text-light);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-arrow {
  flex-shrink: 0;
  align-self: center;
  transition: all 0.3s;
}

.item:hover .item-arrow svg {
  stroke: var(--primary-color);
  transform: translateX(4px);
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

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }

  .item {
    flex-wrap: wrap;
  }

  .item-image {
    width: 100%;
    height: 180px;
  }

  .item-arrow {
    display: none;
  }
}
</style>
