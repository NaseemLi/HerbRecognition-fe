<template>
  <AdminLayout>
    <template #title>用户管理</template>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td class="text-muted">#{{ item.id }}</td>
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ item.username.charAt(0).toUpperCase() }}</div>
                <span class="user-name">{{ item.username }}</span>
              </div>
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
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getUserList, updateUserRole } from '@/api/user'
import type { User } from '@/api/user'

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

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped>
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
