<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <img src="@public/logo.png" alt="Logo" />
        </div>
        <h1>中草药识别系统</h1>
        <p class="subtitle">智能识别，传承中医文化</p>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>用户名</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <p v-show="error" class="error">{{ error }}</p>
      </form>
      
      <div class="links">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const res = await login(form)
    userStore.setAuth(res.data.token, res.data.user)
    router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #10b981 100%);
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  padding: 48px 40px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg), 0 0 40px rgba(16, 185, 129, 0.2);
  width: 100%;
  max-width: 440px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  margin-bottom: 20px;
}

.logo-icon img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.login-header h1 {
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
  display: block;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
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
  padding: 12px 16px;
  background: #fef2f2;
  color: var(--danger-color);
  border-radius: var(--radius);
  font-size: 14px;
  margin-top: 16px;
  border: 1px solid #fecaca;
  text-align: center;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
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
