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
            <td>{{ item.id }}</td>
            <td>{{ item.username }}</td>
            <td>
              <select :value="item.role" @change="handleRoleChange(item.id, $event)">
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </td>
            <td>
              <button @click="handleResetPassword(item)" class="btn-link">重置密码</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && list.length > 0" class="pagination">
      <button :disabled="page <= 1" @click="loadPage(page - 1)">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
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
    alert('角色修改成功')
    loadPage(page.value)
  } catch (e: any) {
    alert(e.response?.data?.message || '修改失败')
    loadPage(page.value)
  }
}

function handleResetPassword(_user: User) {
  alert('重置密码功能待实现')
}

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped>
.table-container {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.table th {
  background: #fafafa;
  font-weight: 500;
}

.table tr:hover {
  background: #fafafa;
}

.table select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.btn-link {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  padding: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
}

.pagination button {
  padding: 8px 20px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #91d5ff;
  cursor: not-allowed;
}
</style>
