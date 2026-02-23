<template>
  <div class="profile">
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <img src="/logo.png" alt="中草药识别系统" />
        </div>
        <h1>中草药识别系统</h1>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/recognize" class="nav-item">开始识别</router-link>
        <router-link to="/herbs" class="nav-item">药材查询</router-link>
        <router-link to="/history" class="nav-item">历史记录</router-link>
      </nav>
    </header>

    <main class="main">
      <div class="content-wrapper">
        <BackButton />
        
        <div class="profile-container">
          <h2>个人中心</h2>
          
          <div class="profile-card">
            <div class="user-section">
              <div class="avatar-large">{{ userStore.user?.username.charAt(0).toUpperCase() }}</div>
              <div class="user-details">
                <h3>{{ userStore.user?.username }}</h3>
                <span class="role-badge" :class="userStore.user?.role">{{ userStore.user?.role === 'admin' ? '管理员' : '普通用户' }}</span>
              </div>
            </div>

            <form @submit.prevent="handleChangePassword" class="password-form">
              <h4>修改密码</h4>
              
              <div class="form-group">
                <label for="old_password">当前密码</label>
                <input
                  id="old_password"
                  v-model="form.old_password"
                  type="password"
                  placeholder="请输入当前密码"
                  required
                  minlength="6"
                />
              </div>

              <div class="form-group">
                <label for="new_password">新密码</label>
                <input
                  id="new_password"
                  v-model="form.new_password"
                  type="password"
                  placeholder="请输入新密码（最少 6 位）"
                  required
                  minlength="6"
                />
              </div>

              <div class="form-group">
                <label for="confirm_password">确认新密码</label>
                <input
                  id="confirm_password"
                  v-model="form.confirm_password"
                  type="password"
                  placeholder="请再次输入新密码"
                  required
                  minlength="6"
                />
              </div>

              <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
              <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

              <button type="submit" class="btn-submit" :disabled="loading">
                {{ loading ? '修改中...' : '确认修改' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'
import BackButton from '@/components/BackButton.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

async function handleChangePassword() {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.new_password !== form.confirm_password) {
    errorMessage.value = '两次输入的新密码不一致'
    return
  }

  if (form.new_password.length < 6) {
    errorMessage.value = '新密码长度不能少于 6 位'
    return
  }

  loading.value = true

  try {
    await changePassword({
      old_password: form.old_password,
      new_password: form.new_password
    })
    
    successMessage.value = '密码修改成功'
    form.old_password = ''
    form.new_password = ''
    form.confirm_password = ''
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '密码修改失败，请检查当前密码是否正确'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.header h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  padding: 10px 18px;
  color: var(--text-secondary);
  border-radius: var(--radius);
  transition: all 0.2s;
  font-weight: 500;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.nav-item.router-link-active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
}

.main {
  padding: 24px;
}

.content-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.profile-container {
  margin-top: 24px;
}

.profile-container h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  text-align: center;
}

.profile-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-md);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.avatar-large {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 28px;
  flex-shrink: 0;
}

.user-details h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.role-badge.admin {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.role-badge.user {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
}

.password-form h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 15px;
  color: var(--text-primary);
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }

  .nav {
    display: none;
  }

  .main {
    padding: 16px;
  }

  .profile-card {
    padding: 24px;
  }
}
</style>
