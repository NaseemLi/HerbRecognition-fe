<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">管理后台</div>
      <nav class="menu">
        <router-link to="/admin/herbs" class="menu-item">药材管理</router-link>
        <router-link to="/admin/users" class="menu-item">用户管理</router-link>
        <router-link to="/" class="menu-item">返回前台</router-link>
      </nav>
    </aside>
    <main class="content">
      <header class="header">
        <h2><slot name="title">管理后台</slot></h2>
        <div class="user-info">
          <span>{{ userStore.user?.username }}</span>
          <button @click="handleLogout">退出</button>
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
}

.sidebar {
  width: 220px;
  background: #001529;
  color: #fff;
  flex-shrink: 0;
}

.logo {
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #002140;
}

.menu {
  padding: 10px 0;
}

.menu-item {
  display: block;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.3s;
}

.menu-item:hover {
  color: #fff;
  background: #002140;
}

.menu-item.router-link-active {
  color: #fff;
  background: #1890ff;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info button {
  padding: 6px 16px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-info button:hover {
  background: #ff7875;
}

.page-content {
  flex: 1;
  padding: 24px;
}
</style>
