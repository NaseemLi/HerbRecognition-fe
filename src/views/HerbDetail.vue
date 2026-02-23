<template>
  <div class="herb-detail">
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="herb" class="detail">
      <router-link to="/herbs" class="back">← 返回列表</router-link>
      
      <div class="content">
        <div class="image-section">
          <img 
            v-if="herb.image_url" 
            :src="apiUrl + herb.image_url" 
            :alt="herb.name" 
            class="herb-image"
          />
          <div v-else class="no-image">无图片</div>
        </div>
        
        <div class="info-section">
          <h1>{{ herb.name }}</h1>
          <p v-if="herb.scientific" class="scientific">{{ herb.scientific }}</p>
          <p v-if="herb.alias" class="alias">别名：{{ herb.alias }}</p>
          <p v-if="herb.category" class="category">分类：{{ herb.category }}</p>
          
          <div class="section">
            <h3>简介</h3>
            <p>{{ herb.description || '暂无描述' }}</p>
          </div>
          
          <div class="section">
            <h3>功效</h3>
            <p>{{ herb.effects || '暂无' }}</p>
          </div>
          
          <div class="section">
            <h3>用法用量</h3>
            <p>{{ herb.usage || '暂无' }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty">未找到药材信息</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getHerbDetail } from '@/api/herb'
import type { Herb } from '@/api/herb'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiUrl = computed(() => API_BASE_URL)

const route = useRoute()
const herb = ref<Herb | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getHerbDetail(Number(route.params.id))
    herb.value = res.data
  } catch (e: any) {
    console.error('加载失败', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.herb-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.back {
  display: inline-block;
  margin-bottom: 20px;
  color: #409eff;
  text-decoration: none;
}

.back:hover {
  text-decoration: underline;
}

.content {
  display: flex;
  gap: 32px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 24px;
}

.image-section {
  flex-shrink: 0;
}

.herb-image {
  width: 280px;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
}

.no-image {
  width: 280px;
  height: 280px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.info-section {
  flex: 1;
}

.info-section h1 {
  margin: 0 0 12px;
  color: #333;
  font-size: 28px;
}

.scientific {
  color: #666;
  font-style: italic;
  margin: 0 0 8px;
}

.alias {
  color: #666;
  margin: 0 0 8px;
}

.category {
  color: #409eff;
  font-weight: 500;
  margin: 0 0 20px;
}

.section {
  margin-top: 24px;
}

.section h3 {
  margin: 0 0 8px;
  color: #333;
  font-size: 16px;
  border-left: 3px solid #409eff;
  padding-left: 10px;
}

.section p {
  color: #666;
  line-height: 1.8;
  margin: 0;
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
  
  .herb-image, .no-image {
    width: 100%;
    height: 200px;
  }
}
</style>
