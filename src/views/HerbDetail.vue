<template>
  <div class="herb-detail-page">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="herb" class="detail">
      <div class="page-nav">
        <BackButton default-back="/herbs" text="返回药材列表" />
      </div>
      
      <div class="detail-card">
        <div class="detail-header">
          <div class="image-section">
            <img 
              v-if="herb.image_url" 
              :src="apiUrl + herb.image_url" 
              :alt="herb.name" 
              class="herb-image"
            />
            <div v-else class="no-image">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="12" fill="#f3f4f6"/>
                <path d="M32 20V44M20 32H44" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
              </svg>
              <p>暂无图片</p>
            </div>
          </div>
          
          <div class="info-section">
            <h1>{{ herb.name }}</h1>
            <p v-if="herb.scientific" class="scientific-name">
              <span class="label">学名</span>
              {{ herb.scientific }}
            </p>
            <div class="tags">
              <span v-if="herb.alias" class="tag">
                <span class="label">别名</span> {{ herb.alias }}
              </span>
              <span v-if="herb.category" class="tag category">
                {{ herb.category }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <div class="content-section">
            <div class="section-header">
              <h3>简介</h3>
            </div>
            <p class="section-content">{{ herb.description || '暂无描述' }}</p>
          </div>
          
          <div class="content-section">
            <div class="section-header">
              <h3>功效与作用</h3>
            </div>
            <p class="section-content">{{ herb.effects || '暂无' }}</p>
          </div>
          
          <div class="content-section">
            <div class="section-header">
              <h3>用法用量</h3>
            </div>
            <p class="section-content">{{ herb.usage || '暂无' }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty">
      <h3>未找到药材信息</h3>
      <router-link to="/herbs" class="btn-primary">返回列表</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
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
.herb-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-nav {
  margin-bottom: 24px;
}

.back-nav {
  margin-bottom: 24px;
}

.page-nav {
  margin-bottom: 24px;
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

.detail-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.detail-header {
  display: flex;
  gap: 40px;
  padding: 40px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05));
  border-bottom: 1px solid var(--border-color);
}

.image-section {
  flex-shrink: 0;
}

.herb-image {
  width: 280px;
  height: 280px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.no-image {
  width: 280px;
  height: 280px;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  border: 2px dashed var(--border-color);
}

.no-image p {
  margin-top: 12px;
  font-size: 14px;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-section h1 {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 16px;
  letter-spacing: -0.5px;
}

.scientific-name {
  display: flex;
  gap: 12px;
  align-items: center;
  color: var(--text-secondary);
  font-style: italic;
  font-size: 16px;
  margin-bottom: 20px;
}

.scientific-name .label {
  font-style: normal;
  font-weight: 600;
  color: var(--text-light);
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.tag .label {
  font-size: 13px;
}

.tag.category {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
  color: var(--primary-color);
}

.detail-content {
  padding: 40px;
}

.content-section {
  margin-bottom: 32px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.section-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--bg-tertiary);
}

.section-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-content {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 15px;
  margin: 0;
}

.empty {
  text-align: center;
  padding: 80px 20px;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.empty h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
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

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    padding: 24px;
  }
  
  .herb-image, .no-image {
    width: 100%;
    height: 240px;
  }
  
  .info-section h1 {
    font-size: 28px;
  }
  
  .detail-content {
    padding: 24px;
  }
}
</style>
