<template>
  <div class="home">
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#10b981"/>
            <path d="M16 8C16 8 12 12 12 16C12 20 16 24 16 24C16 24 20 20 20 16C20 12 16 8 16 8Z" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <h1>中草药识别系统</h1>
      </div>
      <nav class="nav">
        <router-link to="/recognize" class="nav-item">识别</router-link>
        <router-link to="/herbs" class="nav-item">药材查询</router-link>
        <router-link to="/history" class="nav-item">历史记录</router-link>
        <router-link v-if="userStore.user?.role === 'admin'" to="/admin/herbs" class="nav-item admin">管理后台</router-link>
      </nav>
      <div class="user-info">
        <div class="avatar">{{ userStore.user?.username.charAt(0).toUpperCase() }}</div>
        <span class="username">{{ userStore.user?.username }}</span>
        <button @click="handleLogout" class="btn-logout" title="退出登录">退出</button>
      </div>
    </header>
    
    <main class="main">
      <div class="welcome-card">
        <div class="welcome-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="#10b981" opacity="0.1"/>
            <circle cx="40" cy="40" r="24" fill="#10b981" opacity="0.2"/>
            <circle cx="40" cy="40" r="12" fill="#10b981"/>
          </svg>
        </div>
        <h2>欢迎使用中草药识别系统</h2>
        <p>智能识别中草药，传承千年中医文化</p>
        
        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="#10b981" opacity="0.1"/>
                <rect x="14" y="14" width="20" height="20" rx="4" stroke="#10b981" stroke-width="2"/>
                <circle cx="24" cy="24" r="4" fill="#10b981"/>
              </svg>
            </div>
            <h3>拍照识别</h3>
            <p>上传药材照片，AI 智能识别</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="#06b6d4" opacity="0.1"/>
                <path d="M16 18H32M16 24H32M16 30H26" stroke="#06b6d4" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>药材百科</h3>
            <p>详细了解每种药材的功效</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="#f59e0b" opacity="0.1"/>
                <path d="M18 16H30M18 24H30M18 32H26" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>历史记录</h3>
            <p>随时查看识别历史</p>
          </div>
        </div>
        
        <router-link to="/recognize" class="btn-start">开始识别</router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home {
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
  position: sticky;
  top: 0;
  z-index: 100;
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
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.nav-item.router-link-active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
}

.nav-item.admin {
  color: var(--warning-color);
}

.nav-item.admin.router-link-active {
  background: rgba(245, 158, 11, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.username {
  color: var(--text-primary);
  font-weight: 500;
}

.btn-logout {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #fef2f2;
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.main {
  padding: 48px 24px;
  display: flex;
  justify-content: center;
}

.welcome-card {
  max-width: 900px;
  width: 100%;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 60px 40px;
  text-align: center;
  box-shadow: var(--shadow-md);
}

.welcome-icon {
  margin-bottom: 24px;
}

.welcome-card h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.welcome-card > p {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 48px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.feature-card {
  padding: 32px 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14px;
  color: var(--text-secondary);
}

.btn-start {
  display: inline-flex;
  align-items: center;
  padding: 16px 40px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: #fff;
  border-radius: var(--radius-lg);
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }
  
  .nav {
    display: none;
  }
  
  .welcome-card {
    padding: 40px 20px;
  }
  
  .welcome-card h2 {
    font-size: 24px;
  }
}
</style>
