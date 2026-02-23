<template>
  <div class="recognize">
    <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
      <input 
        ref="fileInput" 
        type="file" 
        accept="image/*" 
        @change="handleFileChange"
        style="display: none"
      />
      
      <div v-if="!previewUrl" class="upload-placeholder" @click="triggerUpload">
        <div class="upload-icon">📷</div>
        <p>点击或拖拽上传图片</p>
        <p class="hint">支持 JPG, PNG, GIF, WEBP，最大 5MB</p>
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

    <div v-if="result" class="result">
      <h2>识别结果</h2>
      <div class="result-card">
        <div class="result-image">
          <img :src="apiUrl + result.image_url" :alt="result.herb_name" />
        </div>
        <div class="result-info">
          <h3>{{ result.herb_name }}</h3>
          <p class="confidence">置信度：{{ result.confidence }}%</p>
          <router-link :to="`/herb/${result.herb_id}`" class="btn-detail">
            查看详情
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
  } catch (e: any) {
    error.value = e.response?.data?.message || '识别失败'
  } finally {
    recognizing.value = false
  }
}
</script>

<style scoped>
.recognize {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background: #fafafa;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-placeholder {
  text-align: center;
  cursor: pointer;
  padding: 40px;
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.upload-placeholder p {
  margin: 8px 0;
  color: #666;
}

.hint {
  font-size: 12px;
  color: #999;
}

.preview-container {
  width: 100%;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  display: block;
  margin: 0 auto 20px;
}

.preview-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-secondary {
  padding: 10px 24px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.btn-secondary:hover {
  border-color: #409eff;
  color: #409eff;
}

.btn-primary {
  padding: 10px 24px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #66b1ff;
}

.btn-primary:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.result {
  margin-top: 32px;
}

.result h2 {
  margin-bottom: 16px;
  color: #333;
}

.result-card {
  display: flex;
  gap: 24px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.result-image img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-info h3 {
  margin: 0 0 12px;
  color: #333;
  font-size: 20px;
}

.confidence {
  color: #67c23a;
  font-weight: 500;
  margin-bottom: 16px;
}

.btn-detail {
  display: inline-block;
  padding: 8px 20px;
  background: #409eff;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  width: fit-content;
}

.btn-detail:hover {
  background: #66b1ff;
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
