<template>
  <div class="home">
    <header class="header">
      <h1>中草药识别系统</h1>
      <nav class="nav">
        <router-link to="/recognize">识别</router-link>
        <router-link to="/herbs">药材查询</router-link>
        <router-link to="/history">历史记录</router-link>
        <router-link v-if="userStore.user?.role === 'admin'" to="/admin/herbs" class="admin-link">管理后台</router-link>
      </nav>
      <div class="user-info">
        <span>欢迎，{{ userStore.user?.username }}</span>
        <button @click="handleLogout">退出</button>
      </div>
    </header>
    <main class="main">
      <p>功能开发中...</p>
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #409eff;
  color: #fff;
}

.header h1 {
  font-size: 20px;
  margin: 0;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
}

.nav a:hover {
  text-decoration: underline;
}

.admin-link {
  color: #ffec3d;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info button {
  padding: 6px 16px;
  background: #fff;
  color: #409eff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-info button:hover {
  background: #ecf5ff;
}

.main {
  padding: 40px 24px;
  text-align: center;
  color: #666;
}
</style>
