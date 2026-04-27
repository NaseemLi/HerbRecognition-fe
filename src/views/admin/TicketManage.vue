<template>
  <div class="admin-page">
    <div class="page-nav">
      <BackButton default-back="/" text="返回前台" />
    </div>

    <div class="page-header">
      <div>
        <h1>工单管理</h1>
        <p class="subtitle">处理用户反馈和问题工单</p>
      </div>
      <div class="header-actions">
        <div class="admin-tabs">
          <router-link to="/admin/herbs" class="admin-tab">药材管理</router-link>
          <router-link to="/admin/users" class="admin-tab">用户管理</router-link>
          <router-link to="/admin/tickets" class="admin-tab">工单管理</router-link>
        </div>
        <div class="user-info">
          <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" alt="头像" class="avatar" />
          <div v-else class="avatar">{{ userStore.user?.username.charAt(0).toUpperCase() }}</div>
          <span class="username">{{ userStore.user?.username }}</span>
          <span class="role-badge" v-if="userStore.user?.role === 'admin'">管理员</span>
        </div>
        <button @click="handleLogout" class="btn-logout">退出</button>
      </div>
    </div>

    <div class="toolbar">
      <select v-model="statusFilter" @change="loadPage(1)" class="status-select">
        <option value="">全部状态</option>
        <option value="pending">待处理</option>
        <option value="processing">处理中</option>
        <option value="resolved">已解决</option>
      </select>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th class="id-col">ID</th>
            <th class="user-col">用户</th>
            <th>标题</th>
            <th class="content-col">内容</th>
            <th class="image-col">图片</th>
            <th class="status-col">状态</th>
            <th class="time-col">创建时间</th>
            <th class="action-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <span class="name">{{ item.username }}</span>
            </td>
            <td>
              <span class="title-text">{{ item.title }}</span>
            </td>
            <td>
              <span class="content-text">{{ truncate(item.content, 40) }}</span>
            </td>
            <td>
              <div class="thumbnail" v-if="item.image_url">
                <img :src="apiUrl + item.image_url" alt="工单图片" />
              </div>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <span class="status-badge" :class="item.status">{{ statusLabel(item.status) }}</span>
            </td>
            <td class="text-muted">{{ formatTime(item.created_at) }}</td>
            <td>
              <button @click="handleView(item)" class="btn-icon btn-view" title="查看详情">详情</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && list.length === 0" class="empty-table">
        <p>暂无工单数据</p>
      </div>
    </div>

    <div v-if="!loading && list.length > 0" class="pagination">
      <button :disabled="page <= 1" @click="loadPage(page - 1)">上一页</button>
      <span class="page-info">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages" @click="loadPage(page + 1)">下一页</button>
    </div>

    <!-- 工单详情弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>工单详情</h3>
          <button @click="showModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="currentTicket" class="ticket-detail">
            <div class="detail-row">
              <span class="detail-label">工单ID</span>
              <span class="detail-value">{{ currentTicket.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">用户</span>
              <span class="detail-value">{{ currentTicket.username }} (ID: {{ currentTicket.user_id }})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">标题</span>
              <span class="detail-value">{{ currentTicket.title }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">状态</span>
              <span class="detail-value">
                <select :value="currentTicket.status" @change="handleStatusChange($event)" class="status-select-inline">
                  <option value="pending">待处理</option>
                  <option value="processing">处理中</option>
                  <option value="resolved">已解决</option>
                </select>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">创建时间</span>
              <span class="detail-value">{{ formatTime(currentTicket.created_at) }}</span>
            </div>
            <div class="detail-row block">
              <span class="detail-label">内容</span>
              <p class="detail-content">{{ currentTicket.content }}</p>
            </div>
            <div v-if="currentTicket.image_url" class="detail-row block">
              <span class="detail-label">图片</span>
              <img :src="apiUrl + currentTicket.image_url" alt="工单图片" class="detail-image" />
            </div>
            <div v-if="currentTicket.admin_reply" class="detail-row block">
              <span class="detail-label">回复内容</span>
              <p class="detail-reply">{{ currentTicket.admin_reply }}</p>
              <p v-if="currentTicket.replied_at" class="reply-time">回复于 {{ formatTime(currentTicket.replied_at) }}</p>
            </div>
            <div class="detail-row block">
              <span class="detail-label">回复工单</span>
              <textarea v-model="replyContent" rows="4" placeholder="请输入回复内容..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" @click="showModal = false" class="btn-secondary">关闭</button>
          <button type="button" @click="handleReply" :disabled="replying || !replyContent.trim()" class="btn-primary">
            {{ replying ? '发送中...' : '回复' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BackButton from '@/components/BackButton.vue'
import { getTicketList, getTicketDetail, replyTicket, updateTicketStatus } from '@/api/ticket'
import type { Ticket } from '@/api/ticket'

const router = useRouter()
const userStore = useUserStore()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiUrl = ref(API_BASE_URL)

const list = ref<Ticket[]>([])
const loading = ref(true)
const page = ref(1)
const page_size = ref(10)
const total = ref(0)
const statusFilter = ref('')

const showModal = ref(false)
const currentTicket = ref<Ticket | null>(null)
const replyContent = ref('')
const replying = ref(false)

const totalPages = computed(() => Math.ceil(total.value / page_size.value))

function truncate(text: string, maxLen: number) {
  if (!text) return '-'
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
  }
  return map[status] || status
}

function formatTime(time: string | null) {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadPage(newPage: number) {
  loading.value = true
  try {
    const res = await getTicketList(newPage, page_size.value, statusFilter.value)
    list.value = res.data.list
    total.value = res.data.total
    page.value = newPage
  } catch (e: any) {
    alert(e.response?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function handleView(item: Ticket) {
  try {
    const res = await getTicketDetail(item.id)
    currentTicket.value = res.data
    replyContent.value = ''
    showModal.value = true
  } catch (e: any) {
    alert(e.response?.data?.message || '加载详情失败')
  }
}

async function handleStatusChange(event: Event) {
  const status = (event.target as HTMLSelectElement).value
  if (!currentTicket.value) return
  try {
    await updateTicketStatus(currentTicket.value.id, status)
    currentTicket.value.status = status as Ticket['status']
    const item = list.value.find(t => t.id === currentTicket.value!.id)
    if (item) item.status = status as Ticket['status']
  } catch (e: any) {
    alert(e.response?.data?.message || '状态更新失败')
    const select = event.target as HTMLSelectElement
    select.value = currentTicket.value.status
  }
}

async function handleReply() {
  if (!currentTicket.value || !replyContent.value.trim()) return
  replying.value = true
  try {
    await replyTicket(currentTicket.value.id, replyContent.value.trim())
    const res = await getTicketDetail(currentTicket.value.id)
    currentTicket.value = res.data
    const item = list.value.find(t => t.id === currentTicket.value!.id)
    if (item) {
      item.status = res.data.status
      item.admin_reply = res.data.admin_reply
      item.replied_at = res.data.replied_at
    }
    replyContent.value = ''
  } catch (e: any) {
    alert(e.response?.data?.message || '回复失败')
  } finally {
    replying.value = false
  }
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
  object-fit: cover;
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

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.status-select {
  padding: 10px 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 14px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.status-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

.table .id-col {
  width: 60px;
}

.table .user-col {
  width: 120px;
}

.table .content-col {
  width: 200px;
}

.table .image-col {
  width: 80px;
}

.table .status-col {
  width: 100px;
}

.table .time-col {
  width: 140px;
}

.table .action-col {
  width: 80px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-muted {
  color: var(--text-light);
}

.name {
  font-weight: 600;
  color: var(--text-primary);
}

.title-text {
  font-weight: 500;
  color: var(--text-primary);
}

.content-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.status-badge.processing {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.resolved {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
}

.btn-icon {
  display: inline-block;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: var(--text-secondary);
}

.btn-icon:hover {
  background: var(--bg-primary);
}

.btn-view:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}

.btn-close {
  width: 36px;
  height: 36px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 18px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-close:hover {
  background: #fef2f2;
  color: var(--danger-color);
  border-color: var(--danger-color);
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.ticket-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.detail-row.block {
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  width: 80px;
  flex-shrink: 0;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: var(--text-primary);
  font-size: 14px;
}

.detail-content {
  margin: 0;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
}

.detail-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--radius);
  object-fit: contain;
}

.detail-reply {
  margin: 0;
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
}

.reply-time {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-light);
}

.status-select-inline {
  padding: 6px 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 14px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.status-select-inline:focus {
  border-color: var(--primary-color);
  outline: none;
}

textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 14px;
  transition: all 0.2s;
  background: var(--bg-primary);
  resize: vertical;
  font-family: inherit;
}

textarea:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn-secondary {
  padding: 10px 24px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--text-secondary);
}

.btn-primary {
  padding: 10px 32px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .table {
    font-size: 13px;
  }

  .table th, .table td {
    padding: 12px 8px;
  }

  .content-col, .time-col {
    display: none;
  }
}
</style>
