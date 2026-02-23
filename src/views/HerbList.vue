<template>
  <div class="herbs">
    <h1>药材查询</h1>
    
    <div class="search-bar">
      <input 
        v-model="keyword"
        type="text" 
        placeholder="输入药材名称或别名搜索"
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">搜索</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="list.length === 0" class="empty">
      {{ hasSearched ? '未找到相关药材' : '暂无数据' }}
    </div>
    
    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="item" @click="goToDetail(item.id)">
        <img :src="apiUrl + item.image_url" :alt="item.name" class="item-image" />
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p v-if="item.scientific" class="scientific">{{ item.scientific }}</p>
          <p v-if="item.category" class="category">{{ item.category }}</p>
          <p class="description">{{ item.description || '暂无描述' }}</p>
        </div>
      </div>
    </div>

    <div v-if="!loading && list.length > 0" class="pagination">
      <button :disabled="page <= 1" @click="loadPage(page - 1)">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages" @click="loadPage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHerbList, searchHerb } from '@/api/herb'
import type { Herb } from '@/api/herb'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiUrl = computed(() => API_BASE_URL)

const router = useRouter()

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
  loadList()
})
</script>

<style scoped>
.herbs {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.herbs h1 {
  margin-bottom: 24px;
  color: #333;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-bar input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.search-bar input:focus {
  border-color: #409eff;
  outline: none;
}

.search-bar button {
  padding: 10px 24px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-bar button:hover {
  background: #66b1ff;
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
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 8px;
  color: #333;
  font-size: 18px;
}

.scientific {
  color: #666;
  font-style: italic;
  font-size: 13px;
  margin: 0 0 6px;
}

.category {
  color: #409eff;
  font-size: 13px;
  margin: 0 0 6px;
}

.description {
  color: #999;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
</style>
