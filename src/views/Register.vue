<template>
  <div class="auth-page">
    <!-- 简洁的植物装饰背景 -->
    <div class="bg-decoration">
      <svg class="plant-bg plant-1" viewBox="0 0 200 300" fill="none">
        <path d="M100 280 Q95 200 100 150" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
        <path d="M100 200 Q70 180 65 200 Q75 220 100 205" fill="currentColor" opacity="0.15"/>
        <path d="M100 170 Q130 150 140 170 Q130 190 100 175" fill="currentColor" opacity="0.15"/>
        <circle cx="100" cy="140" r="6" fill="currentColor" opacity="0.2"/>
      </svg>
      <svg class="plant-bg plant-2" viewBox="0 0 200 300" fill="none">
        <path d="M100 280 Q105 200 100 150" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
        <path d="M100 220 Q130 200 145 220 Q135 240 100 225" fill="currentColor" opacity="0.1"/>
        <ellipse cx="100" cy="135" rx="8" ry="10" fill="currentColor" opacity="0.15"/>
      </svg>
    </div>

    <div class="auth-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <img src="/logo.png" alt="Logo" class="logo-img" />
          <div class="logo-ring"></div>
        </div>
        <h1 class="app-title">中草药识别</h1>
      </div>

      <!-- 注册卡片 -->
      <div class="auth-card">
        <h2 class="card-title">创建账号</h2>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="input-group">
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <input
              v-model="form.username"
              type="text"
              placeholder="用户名"
              required
              minlength="3"
              maxlength="32"
              class="form-input"
            />
          </div>

          <div class="input-group">
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              v-model="form.password"
              type="password"
              placeholder="密码（至少6位）"
              required
              minlength="6"
              class="form-input"
            />
          </div>

          <div class="input-group">
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认密码"
              required
              class="form-input"
            />
          </div>

          <button type="submit" :disabled="loading" class="submit-btn">
            <span v-if="loading" class="btn-spinner"></span>
            <span v-else>{{ loading ? '注册中...' : '注册' }}</span>
          </button>

          <transition name="slide">
            <p v-if="error" class="error-msg">{{ error }}</p>
          </transition>

          <transition name="scale">
            <p v-if="success" class="success-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              注册成功，即将跳转
            </p>
          </transition>
        </form>

        <div class="card-footer">
          <span class="footer-text">已有账号？</span>
          <router-link to="/login" class="link-btn">去登录</router-link>
        </div>
      </div>

      <!-- 版权信息 -->
      <p class="copyright"></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleRegister() {
  if (form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await register({
      username: form.username,
      password: form.password
    })
    success.value = true
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (e: any) {
    error.value = e.response?.data?.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  color: var(--primary-color);
  z-index: 0;
}

.plant-bg {
  position: absolute;
  width: 200px;
  height: 300px;
}

.plant-1 {
  top: 10%;
  left: 5%;
  animation: sway 8s ease-in-out infinite;
}

.plant-2 {
  bottom: 10%;
  right: 5%;
  animation: swayReverse 8s ease-in-out infinite;
}

@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

@keyframes swayReverse {
  0%, 100% { transform: scaleX(-1) rotate(-2deg); }
  50% { transform: scaleX(-1) rotate(2deg); }
}

/* 主容器 */
.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Logo 区域 */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  position: relative;
  display: inline-flex;
  margin-bottom: 16px;
}

.logo-img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  position: relative;
  z-index: 1;
}

.logo-ring {
  position: absolute;
  inset: -8px;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.05); opacity: 0.1; }
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  letter-spacing: 0.05em;
}

.app-tagline {
  font-size: 13px;
  color: var(--text-light);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.1em;
}

/* 注册卡片 */
.auth-card {
  width: 100%;
  background: #ffffff;
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 20px -5px rgba(16, 185, 129, 0.1),
    0 0 0 1px rgba(16, 185, 129, 0.05);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  text-align: center;
}

/* 表单 */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  transition: all 0.2s;
}

.input-group:focus-within {
  border-color: var(--primary-color);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  color: var(--text-light);
  transition: color 0.2s;
}

.input-group:focus-within .input-icon {
  color: var(--primary-color);
}

.form-input {
  flex: 1;
  padding: 14px 14px 14px 0;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
}

.form-input::placeholder {
  color: var(--text-light);
}

/* 提交按钮 */
.submit-btn {
  margin-top: 8px;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: #ffffff;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误消息 */
.error-msg {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius);
  color: var(--danger-color);
  font-size: 14px;
  text-align: center;
  margin: 0;
}

/* 成功消息 */
.success-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius);
  color: var(--primary-color);
  font-size: 14px;
  margin: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 卡片底部 */
.card-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.footer-text {
  margin-right: 4px;
}

.link-btn {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.link-btn:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* 版权 */
.copyright {
  margin-top: 24px;
  font-size: 12px;
  color: var(--text-light);
}

/* 响应式 */
@media (max-width: 480px) {
  .auth-page {
    padding: 16px;
    background: #ffffff;
  }

  .auth-card {
    box-shadow: none;
    padding: 24px;
    border: 1px solid var(--border-color);
  }

  .plant-bg {
    display: none;
  }
}
</style>
