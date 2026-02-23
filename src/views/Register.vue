<template>
  <div class="register-container">
    <div class="register-card">
      <h1>注册账号</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-item">
          <label>用户名</label>
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
          <label>密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="至少 6 个字符"
            required
            minlength="6"
          />
        </div>
        <div class="form-item">
          <label>确认密码</label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            required
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">注册成功，即将跳转登录</p>
      <div class="links">
        <router-link to="/login">已有账号？去登录</router-link>
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
  background: #f5f5f5;
}

.register-card {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-item input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item input:focus {
  border-color: #409eff;
  outline: none;
}

button {
  width: 100%;
  padding: 12px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #66b1ff;
}

button:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.error {
  color: #f56c6c;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
}

.success {
  color: #67c23a;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
}

.links {
  text-align: center;
  margin-top: 20px;
}

.links a {
  color: #409eff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
