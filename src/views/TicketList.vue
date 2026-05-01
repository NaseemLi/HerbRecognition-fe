<template>
  <div class="ticket-list-page">
    <div class="page-nav">
      <BackButton text="返回个人中心" default-back="/profile" />
    </div>

    <div class="page-header">
      <div>
        <h1>我的工单</h1>
        <p class="subtitle">查看您提交的工单及处理进度</p>
      </div>
      <router-link to="/ticket/submit" class="btn-primary">提交新工单</router-link>
    </div>

    <div class="toolbar">
      <select v-model="statusFilter" @change="loadPage(1)" class="status-select">
        <option value="">全部状态</option>
        <option value="pending">待处理</option>
        <option value="processing">处理中</option>
        <option value="resolved">已解决</option>
      </select>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="list.length === 0" class="empty">
      <div class="empty-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="40" fill="#f3f4f6"/>
          <path d="M28 36H52M28 44H44" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      <h3>暂无工单</h3>
      <p>您还没有提交过工单</p>
      <router-link to="/ticket/submit" class="btn-primary">提交工单</router-link>
    </div>

    <div v-else class="ticket-list">
      <div v-for="item in list" :key="item.id" class="ticket-card" @click="handleView(item)">
        <div class="ticket-header">
          <span class="ticket-id">#{{ item.id }}</span>
          <span class="status-badge" :class="item.status">{{ statusLabel(item.status) }}</span>
        </div>
        <h3 class="ticket-title">{{ item.title }}</h3>
        <p class="ticket-content">{{ truncate(item.content, 80) }}</p>
        <div v-if="item.image_url" class="ticket-image">
          <img :src="apiUrl + item.image_url" alt="工单图片" />
        </div>
        <div class="ticket-footer">
          <span class="ticket-time">{{ formatTime(item.created_at) }}</span>
          <span v-if="item.admin_reply" class="has-reply">有回复</span>
        </div>
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
        <div v-if="currentTicket" class="modal-body">
          <div class="detail-row">
            <span class="detail-label">状态</span>
            <span class="status-badge" :class="currentTicket.status">{{ statusLabel(currentTicket.status) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">标题</span>
            <span class="detail-value">{{ currentTicket.title }}</span>
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
            <span class="detail-label">管理员回复</span>
            <p class="detail-reply">{{ currentTicket.admin_reply }}</p>
            <p v-if="currentTicket.replied_at" class="reply-time">回复于 {{ formatTime(currentTicket.replied_at) }}</p>
          </div>
          <div class="detail-row">
            <span class="detail-label">提交时间</span>
            <span class="detail-value">{{ formatTime(currentTicket.created_at) }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showModal = false" class="btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BackButton from '@/components/BackButton.vue'
import { getMyTickets, getMyTicketDetail } from '@/api/ticket'
import type { Ticket } from '@/api/ticket'

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
    const res = await getMyTickets(newPage, page_size.value, statusFilter.value)
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
    const res = await getMyTicketDetail(item.id)
    currentTicket.value = res.data
    showModal.value = true
  } catch (e: any) {
    alert(e.response?.data?.message || '加载详情失败')
  }
}

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped>
.ticket-list-page {
  max-width: 800px;
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
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

.toolbar {
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
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: 16px;
}

.empty h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.empty p {
  margin: 0 0 16px;
}

.btn-primary {
  display: inline-flex;
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  align-items: center;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.ticket-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-color);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ticket-id {
  font-size: 13px;
  color: var(--text-light);
  font-weight: 500;
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

.ticket-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.ticket-content {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px;
  line-height: 1.5;
}

.ticket-image {
  margin-bottom: 12px;
}

.ticket-image img {
  max-width: 100%;
  max-height: 160px;
  border-radius: var(--radius);
  object-fit: cover;
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-time {
  font-size: 13px;
  color: var(--text-light);
}

.has-reply {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
  border-radius: 8px;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
  padding: 20px;
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
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  margin: 24px;
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

.detail-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-row.block {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.detail-label {
  width: 70px;
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
  width: 100%;
  box-sizing: border-box;
}

.detail-image {
  max-width: 100%;
  max-height: 250px;
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
  width: 100%;
  box-sizing: border-box;
}

.reply-time {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-light);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
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
  font-size: 14px;
}

.btn-secondary:hover {
  border-color: var(--text-secondary);
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .ticket-card {
    padding: 16px;
  }
}
</style>
