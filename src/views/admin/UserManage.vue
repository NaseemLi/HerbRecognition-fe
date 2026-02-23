<template>
  <div class="admin-page">
    <div class="page-nav">
      <BackButton default-back="/" text="返回前台" />
    </div>

    <div class="page-header">
      <div>
        <h1>用户管理</h1>
        <p class="subtitle">管理系统用户和权限</p>
      </div>
      <div class="header-actions">
        <div class="admin-tabs">
          <router-link to="/admin/herbs" class="admin-tab">药材管理</router-link>
          <router-link to="/admin/users" class="admin-tab">用户管理</router-link>
        </div>
        <div class="user-info">
          <div class="avatar">{{ userStore.user?.username.charAt(0).toUpperCase() }}</div>
          <span class="username">{{ userStore.user?.username }}</span>
          <span class="role-badge" v-if="userStore.user?.role === 'admin'">管理员</span>
        </div>
        <button @click="handleLogout" class="btn-logout">退出</button>
      </div>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th class="image-col">用户</th>
            <th>用户名</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>
              <div class="user-avatar-small">{{ item.username.charAt(0).toUpperCase() }}</div>
            </td>
            <td>
              <span class="user-name">{{ item.username }}</span>
            </td>
            <td>
              <select :value="item.role" @change="handleRoleChange(item.id, $event)" class="role-select">
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </td>
            <td>
              <button @click="handleResetPassword(item)" class="btn-text">重置密码</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && list.length === 0" class="empty-table">
        <p>暂无用户数据</p>
      </div>
    </div>

    <div v-if="!loading && list.length > 0" class="pagination">
      <button :disabled="page <= 1" @click="loadPage(page - 1)">上一页</button>
      <span class="page-info">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages" @click="loadPage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BackButton from '@/components/BackButton.vue'
import { getUserList, updateUserRole } from '@/api/user'
import type { User } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const list = ref<User[]>([])
const loading = ref(true)
const page = ref(1)
const page_size = ref(10)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / page_size.value))

async function loadPage(newPage: number) {
  loading.value = true
  try {
    const res = await getUserList(newPage, page_size.value)
    list.value = res.data.list
    total.value = res.data.total
    page.value = newPage
  } catch (e: any) {
    alert(e.response?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function handleRoleChange(userId: number, event: Event) {
  const role = (event.target as HTMLSelectElement).value
  try {
    await updateUserRole(userId, role)
  } catch (e: any) {
    alert(e.response?.data?.message || '修改失败')
    const select = event.target as HTMLSelectElement
    select.value = list.value.find(u => u.id === userId)?.role || 'user'
  }
}

function handleResetPassword(_user: User) {
  alert('重置密码功能请联系系统管理员')
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
}

.page-nav {
  margin-bottom: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  background: var(--bg-tertiary);
  padding: 4px;
  border-radius: var(--radius);
}

.admin-tab {
  padding: 8px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: calc(var(--radius) - 2px);
  transition: all 0.2s;
}

.admin-tab:hover {
  color: var(--text-primary);
}

.admin-tab.router-link-exact-active {
  background: var(--bg-primary);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
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

.table-container {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.table th {
  background: var(--bg-tertiary);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tr:hover {
  background: var(--bg-secondary);
}

.table .image-col {
  width: 80px;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.text-muted {
  color: var(--text-light);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.role-select {
  padding: 8px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.role-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.btn-text {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-text:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.empty-table {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.pagination button {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.pagination button:hover {
  transform: translateY(-1px);
}

.pagination button:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
}

.page-info {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}
</style>
