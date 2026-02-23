<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">⚙️</span>
        <span>管理后台</span>
      </div>
      <nav class="menu">
        <router-link to="/admin/herbs" class="menu-item">
          <span class="menu-icon">🌿</span>
          药材管理
        </router-link>
        <router-link to="/admin/users" class="menu-item">
          <span class="menu-icon">👥</span>
          用户管理
        </router-link>
        <div class="menu-divider"></div>
        <router-link to="/" class="menu-item">
          <span class="menu-icon">🏠</span>
          返回前台
        </router-link>
      </nav>
    </aside>
    <main class="content">
      <header class="header">
        <div class="header-left">
          <h2><slot name="title">管理后台</slot></h2>
        </div>
        <div class="header-right">
          <div class="user-info">
            <div class="avatar">{{ userStore.user?.username.charAt(0).toUpperCase() }}</div>
            <span class="username">{{ userStore.user?.username }}</span>
            <span class="role-badge" v-if="userStore.user?.role === 'admin'">管理员</span>
          </div>
          <button @click="handleLogout" class="btn-logout" title="退出登录">
            <span class="icon">🚪</span>
          </button>
        </div>
      </header>
      <div class="page-content">
        <slot />
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
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  font-size: 24px;
}

.menu {
  padding: 16px 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.menu-item.router-link-active {
  background: rgba(16, 185, 129, 0.15);
  color: #fff;
  border-left-color: var(--primary-color);
}

.menu-icon {
  font-size: 20px;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 20px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
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

.role-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.btn-logout {
  padding: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #fef2f2;
  border-color: var(--danger-color);
}

.page-content {
  flex: 1;
  padding: 32px;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .page-content {
    padding: 16px;
  }
}
</style>
