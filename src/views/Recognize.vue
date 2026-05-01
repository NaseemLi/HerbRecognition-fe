<template>
  <div class="recognize-page">
    <div class="page-nav">
      <BackButton text="返回首页" />
    </div>
    <div class="page-header">
      <h1>药材识别</h1>
      <p>选择识别方式，AI 智能识别中草药</p>
    </div>

    <div class="mode-tabs">
      <button
        v-for="m in modes"
        :key="m.key"
        :class="['mode-tab', { active: mode === m.key }]"
        @click="switchMode(m.key)"
      >
        {{ m.label }}
      </button>
    </div>

    <div class="recognize-container">
      <!-- 上传模式 -->
      <div v-if="mode === 'upload'" class="upload-section">
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

      <!-- 拍照 / 实时模式 -->
      <div v-else class="camera-section">
        <div class="camera-area">
          <video
            v-show="showVideo"
            ref="videoRef"
            autoplay
            playsinline
            muted
            class="camera-video"
          />
          <img
            v-if="mode === 'photo' && previewUrl"
            :src="previewUrl"
            alt="拍照预览"
            class="preview-image"
          />

          <div v-if="!isCameraReady && !previewUrl" class="camera-placeholder">
            <div class="camera-placeholder-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="#10b981" opacity="0.1"/>
                <rect x="16" y="20" width="32" height="24" rx="4" stroke="#10b981" stroke-width="2.5"/>
                <circle cx="32" cy="32" r="6" stroke="#10b981" stroke-width="2.5"/>
              </svg>
            </div>
            <p>正在启动相机...</p>
          </div>

          <div class="camera-actions">
            <!-- 拍照模式 -->
            <template v-if="mode === 'photo'">
              <button
                v-if="!previewUrl"
                @click="handleCapture"
                :disabled="!isCameraReady || recognizing"
                class="btn-primary"
              >
                {{ recognizing ? '识别中...' : '拍照识别' }}
              </button>
              <template v-else>
                <button @click="retakePhoto" class="btn-secondary">重新拍照</button>
              </template>
            </template>

            <!-- 实时模式 -->
            <template v-if="mode === 'realtime'">
              <span class="realtime-status" :class="{ recognizing }">
                <span class="status-dot"></span>
                {{ recognizing ? '识别中...' : '实时识别中' }}
              </span>
            </template>
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
import { ref, computed, onUnmounted } from 'vue'
import BackButton from '@/components/BackButton.vue'
import { uploadAndRecognize, recognizeBase64 } from '@/api/recognize'
import type { RecognizeResult } from '@/api/recognize'

type Mode = 'upload' | 'photo' | 'realtime'

const modes = [
  { key: 'upload' as Mode, label: '上传图片' },
  { key: 'photo' as Mode, label: '拍照识别' },
  { key: 'realtime' as Mode, label: '实时识别' },
]

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiUrl = computed(() => API_BASE_URL)

const mode = ref<Mode>('upload')
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string>('')
const selectedFile = ref<File | null>(null)
const recognizing = ref(false)
const result = ref<RecognizeResult | null>(null)
const error = ref('')

// Camera related
const videoRef = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const isCameraReady = ref(false)
const realtimeTimer = ref<ReturnType<typeof setInterval> | null>(null)
const isRecognizingInProgress = ref(false)

const showVideo = computed(() => {
  if (mode.value === 'upload') return false
  if (mode.value === 'photo' && previewUrl.value) return false
  return true
})

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

function revokePreviewUrl() {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
}

function handleFile(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过 5MB'
    return
  }
  error.value = ''
  selectedFile.value = file
  revokePreviewUrl()
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

// Camera logic
async function startCamera() {
  stopCamera()
  error.value = ''
  isCameraReady.value = false

  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      await videoRef.value.play()
      isCameraReady.value = true
      if (mode.value === 'realtime') {
        startRealtime()
      }
    }
  } catch (e: any) {
    isCameraReady.value = false
    error.value = '无法访问摄像头，请检查浏览器权限设置，或使用上传方式识别'
  }
}

function stopCamera() {
  if (realtimeTimer.value) {
    clearInterval(realtimeTimer.value)
    realtimeTimer.value = null
  }
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }
  isCameraReady.value = false
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

function captureFrame(): string {
  const video = videoRef.value
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) return ''

  const canvas = document.createElement('canvas')
  const maxWidth = 640
  const scale = Math.min(1, maxWidth / video.videoWidth)
  canvas.width = video.videoWidth * scale
  canvas.height = video.videoHeight * scale

  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/jpeg', 0.9)
}

async function recognizeFrame(base64Data: string) {
  if (isRecognizingInProgress.value) return
  isRecognizingInProgress.value = true
  recognizing.value = true
  error.value = ''

  try {
    const res = await recognizeBase64(base64Data)
    result.value = res.data
  } catch (e: any) {
    error.value = e.response?.data?.message || '识别失败'
  } finally {
    recognizing.value = false
    isRecognizingInProgress.value = false
  }
}

// Photo mode
async function handleCapture() {
  if (!isCameraReady.value) return
  const base64 = captureFrame()
  if (!base64) {
    error.value = '拍照失败，请重试'
    return
  }
  previewUrl.value = base64
  await recognizeFrame(base64)
}

function retakePhoto() {
  previewUrl.value = ''
  result.value = null
  error.value = ''
  startCamera()
}

// Realtime mode
function startRealtime() {
  if (!isCameraReady.value) return
  // 立即执行一次
  const base64 = captureFrame()
  if (base64) {
    recognizeFrame(base64)
  }
  // 每 1 秒执行一次
  realtimeTimer.value = setInterval(() => {
    if (!isCameraReady.value) return
    const b64 = captureFrame()
    if (b64) {
      recognizeFrame(b64)
    }
  }, 1000)
}

function stopRealtime() {
  if (realtimeTimer.value) {
    clearInterval(realtimeTimer.value)
    realtimeTimer.value = null
  }
}

// Mode switch
function switchMode(newMode: Mode) {
  if (mode.value === newMode) return

  // 清理当前状态
  stopCamera()
  stopRealtime()
  result.value = null
  error.value = ''
  revokePreviewUrl()
  previewUrl.value = ''
  selectedFile.value = null
  isRecognizingInProgress.value = false

  mode.value = newMode

  if (newMode !== 'upload') {
    startCamera()
  }
}

onUnmounted(() => {
  stopCamera()
  stopRealtime()
  revokePreviewUrl()
})
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
  margin-bottom: 24px;
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

/* Mode tabs */
.mode-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 24px;
}

.mode-tab {
  padding: 10px 24px;
  border-radius: var(--radius);
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.mode-tab:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.mode-tab.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(16, 185, 129, 0.05);
}

.recognize-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Upload section */
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

/* Camera section */
.camera-section {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-md);
}

.camera-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.camera-video {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius-lg);
  background: #000;
  display: block;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: var(--text-secondary);
}

.camera-placeholder-icon {
  opacity: 0.6;
}

.camera-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.realtime-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: var(--bg-secondary);
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.3s;
}

.realtime-status.recognizing {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-color);
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* Buttons */
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
  box-shadow: none;
}

/* Result section */
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
  .mode-tabs {
    flex-wrap: wrap;
  }

  .mode-tab {
    flex: 1;
    min-width: 80px;
    padding: 10px 16px;
    font-size: 14px;
  }

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

  .camera-video,
  .preview-image {
    max-height: 280px;
  }
}
</style>
