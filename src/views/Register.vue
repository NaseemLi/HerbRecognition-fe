<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-icon">🌿</div>
        <h1>创建账号</h1>
        <p class="subtitle">加入我们，开始识别中草药</p>
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-item">
          <label>
            <span class="icon">👤</span>
            用户名
          </label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="3-32 个字符"
            required
            minlength="3"
            maxlength="32"
          />
        </div>
        <div class="form-item">
          <label>
            <span class="icon">🔒</span>
            密码
          </label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="至少 6 个字符"
            required
            minlength="6"
          />
        </div>
        <div class="form-item">
          <label>
            <span class="icon">🔐</span>
            确认密码
          </label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            required
          />
        </div>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? '注册中...' : '注 册' }}
        </button>
      </form>
      
      <p v-if="error" class="error">
        <span class="icon">⚠️</span>
        {{ error }}
      </p>
      
      <p v-if="success" class="success">
        <span class="icon">✅</span>
        注册成功，即将跳转登录
      </p>
      
      <div class="links">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
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
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #10b981 100%);
  padding: 20px;
}

.register-card {
  background: rgba(255, 255, 255, 0.98);
  padding: 48px 40px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg), 0 0 40px rgba(16, 185, 129, 0.2);
  width: 100%;
  max-width: 440px;
  backdrop-filter: blur(10px);
}

.register-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  font-size: 56px;
  margin-bottom: 12px;
  display: block;
}

.register-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.form-item {
  margin-bottom: 24px;
}

.form-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-item .icon {
  font-size: 16px;
}

.form-item input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 15px;
  transition: all 0.2s;
  background: var(--bg-primary);
}

.form-item input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.form-item input::placeholder {
  color: var(--text-light);
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  color: var(--danger-color);
  border-radius: var(--radius);
  font-size: 14px;
  margin-top: 20px;
  border: 1px solid #fecaca;
}

.success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f0fdf4;
  color: var(--success-color);
  border-radius: var(--radius);
  font-size: 14px;
  margin-top: 20px;
  border: 1px solid #bbf7d0;
}

.links {
  text-align: center;
  margin-top: 28px;
  color: var(--text-secondary);
  font-size: 14px;
}

.links a {
  color: var(--primary-color);
  font-weight: 600;
  margin-left: 4px;
}

.links a:hover {
  text-decoration: underline;
}
</style>
