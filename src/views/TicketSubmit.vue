<template>
  <div class="ticket-submit-page">
    <div class="page-nav">
      <BackButton text="返回个人中心" default-back="/profile" />
    </div>

    <div class="page-header">
      <h1>提交工单</h1>
      <p>遇到问题？请填写下方表单，我们会尽快处理</p>
    </div>

    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">工单标题 <span class="required">*</span></label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="请简要描述问题（如：识别结果不准确）"
            maxlength="128"
            required
          />
          <span class="char-count">{{ form.title.length }}/128</span>
        </div>

        <div class="form-group">
          <label for="content">问题描述 <span class="required">*</span></label>
          <textarea
            id="content"
            v-model="form.content"
            rows="6"
            placeholder="请详细描述您遇到的问题，包括操作步骤、期望结果和实际结果..."
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>相关图片（可选）</label>
          <div class="upload-area" @click="triggerFileUpload">
            <div v-if="imagePreview" class="image-preview-wrapper">
              <img :src="imagePreview" alt="预览" class="image-preview" />
              <button type="button" class="remove-image" @click.stop="removeImage" title="移除图片">✕</button>
            </div>
            <div v-else class="upload-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>点击上传图片</p>
              <span class="upload-hint">支持 JPG、PNG、GIF，最大 5MB</span>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            style="display: none"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>

        <div class="form-actions">
          <router-link to="/tickets" class="btn-secondary">查看我的工单</router-link>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交工单' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import { createTicket, uploadImage } from '@/api/ticket'

const router = useRouter()

const form = reactive({
  title: '',
  content: '',
})

const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imageUrl = ref('')

const submitting = ref(false)
const error = ref('')
const success = ref('')

function triggerFileUpload() {
  if (imagePreview.value) return
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    error.value = '仅支持 JPG, PNG, GIF, WEBP 格式的图片'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过 5MB'
    return
  }

  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  error.value = ''
}

function removeImage() {
  imageFile.value = null
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = null
  imageUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!form.title.trim() || !form.content.trim()) {
    error.value = '请填写标题和问题描述'
    return
  }

  if (form.title.trim().length > 128) {
    error.value = '标题不能超过 128 个字符'
    return
  }

  submitting.value = true

  try {
    let uploadedImageUrl = ''
    if (imageFile.value) {
      const formData = new FormData()
      formData.append('image', imageFile.value)
      const res = await uploadImage(formData)
      uploadedImageUrl = res.data.image_url
    }

    await createTicket({
      title: form.title.trim(),
      content: form.content.trim(),
      image_url: uploadedImageUrl || undefined,
    })

    success.value = '工单提交成功！我们会尽快处理您的问题'
    form.title = ''
    form.content = ''
    removeImage()

    setTimeout(() => {
      router.push('/tickets')
    }, 1500)
  } catch (e: any) {
    error.value = e.response?.data?.message || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ticket-submit-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
}

.page-nav {
  margin-bottom: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.page-header p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

.form-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.required {
  color: var(--danger-color);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 15px;
  color: var(--text-primary);
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.char-count {
  position: absolute;
  right: 12px;
  top: 38px;
  font-size: 12px;
  color: var(--text-light);
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius);
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary);
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: rgba(16, 185, 129, 0.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.upload-placeholder p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-light);
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--radius);
  object-fit: contain;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  background: var(--danger-color);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-image:hover {
  transform: scale(1.1);
}

.error-message {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius);
  color: var(--danger-color);
  font-size: 14px;
  margin-bottom: 16px;
}

.success-message {
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius);
  color: var(--primary-color);
  font-size: 14px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-secondary {
  padding: 12px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-secondary:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.btn-primary {
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .form-card {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
