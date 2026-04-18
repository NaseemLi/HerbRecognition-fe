<template>
  <div class="recognize-page">
    <div class="page-nav">
      <BackButton text="返回首页" />
    </div>
    <div class="page-header">
      <h1>药材识别</h1>
      <p>上传图片，AI 智能识别中草药</p>
    </div>

    <div class="recognize-container">
      <div class="upload-section">
        <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleFileChange"
            style="display: none"
          />
          
          <div v-if="!previewUrl" class="upload-placeholder" @click="triggerUpload">
            <div class="upload-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="#10b981" opacity="0.1"/>
                <circle cx="32" cy="26" r="8" stroke="#10b981" stroke-width="2.5"/>
                <path d="M22 44L28 36L34 40L40 34L46 44" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>点击或拖拽上传图片</h3>
            <p class="hint">支持 JPG, PNG, GIF, WEBP 格式，最大 5MB</p>
          </div>
          
          <div v-else class="preview-container">
            <img :src="previewUrl" alt="预览" class="preview-image" />
            <div class="preview-actions">
              <button @click="triggerUpload" class="btn-secondary">重新选择</button>
              <button @click="handleRecognize" :disabled="recognizing" class="btn-primary">
                {{ recognizing ? '识别中...' : '开始识别' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="result" class="result-section">
        <div class="result-header">
          <h2>识别结果</h2>
          <span class="confidence-badge">{{ result.confidence }}% 置信度</span>
        </div>
        
        <div class="result-card">
          <div class="result-image">
            <img :src="apiUrl + result.image_url" :alt="result.herb_name" />
          </div>
          <div class="result-info">
            <h3>{{ result.herb_name }}</h3>
            <p class="confidence">置信度：<strong>{{ result.confidence }}%</strong></p>
            <p v-if="result.herb_id && result.herb_id > 0" class="herb-id-info">药材ID: {{ result.herb_id }}</p>
            <div class="detail-actions">
              <router-link
                v-if="result.herb_id && result.herb_id > 0"
                :to="`/herb/${result.herb_id}`"
                class="btn-detail"
              >查看详情</router-link>
              <router-link
                :to="`/herbs?search=${encodeURIComponent(result.herb_name)}`"
                class="btn-search-herb"
              >搜索药材</router-link>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BackButton from '@/components/BackButton.vue'
import { uploadAndRecognize } from '@/api/recognize'
import type { RecognizeResult } from '@/api/recognize'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiUrl = computed(() => API_BASE_URL)

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string>('')
const selectedFile = ref<File | null>(null)
const recognizing = ref(false)
const result = ref<RecognizeResult | null>(null)
const error = ref('')

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFile(file)
  }
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    handleFile(file)
  }
}

function handleFile(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过 5MB'
    return
  }
  error.value = ''
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  result.value = null
}

async function handleRecognize() {
  if (!selectedFile.value) return

  recognizing.value = true
  error.value = ''

  try {
    const res = await uploadAndRecognize(selectedFile.value)
    result.value = res.data
    console.log('识别结果:', res.data)
  } catch (e: any) {
    error.value = e.response?.data?.message || '识别失败'
  } finally {
    recognizing.value = false
  }
}
</script>

<style scoped>
.recognize-page {
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

.recognize-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.upload-section {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-md);
}

.upload-area {
  border: 3px dashed var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: rgba(16, 185, 129, 0.02);
}

.upload-placeholder {
  text-align: center;
  cursor: pointer;
  padding: 40px;
}

.upload-icon {
  margin-bottom: 20px;
}

.upload-placeholder h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.hint {
  font-size: 14px;
  color: var(--text-light);
}

.preview-container {
  width: 100%;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius-lg);
  display: block;
  margin: 0 auto 24px;
  box-shadow: var(--shadow-md);
}

.preview-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-secondary {
  padding: 12px 28px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--text-primary);
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-primary {
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
}

.result-section {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-md);
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.result-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.confidence-badge {
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.result-card {
  display: flex;
  gap: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.result-image {
  flex-shrink: 0;
}

.result-image img {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-info h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.confidence {
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 20px;
}

.confidence strong {
  color: var(--primary-color);
  font-size: 18px;
}

.btn-detail {
  display: inline-flex;
  align-items: center;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  text-decoration: none;
  border-radius: var(--radius);
  text-align: center;
  width: fit-content;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-detail:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-search-herb {
  display: inline-flex;
  align-items: center;
  padding: 12px 28px;
  background: var(--bg-primary);
  color: var(--primary-color);
  text-decoration: none;
  border: 2px solid var(--primary-color);
  border-radius: var(--radius);
  text-align: center;
  width: fit-content;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-search-herb:hover {
  background: rgba(16, 185, 129, 0.1);
}

.herb-id-info {
  color: var(--text-light);
  font-size: 13px;
  margin-bottom: 16px;
}

.error-message {
  padding: 16px 24px;
  background: #fef2f2;
  color: var(--danger-color);
  border-radius: var(--radius);
  font-size: 15px;
  border: 1px solid #fecaca;
  text-align: center;
}

@media (max-width: 768px) {
  .result-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .result-info h3 {
    font-size: 20px;
  }
  
  .btn-detail {
    width: 100%;
    justify-content: center;
  }
}
</style>
