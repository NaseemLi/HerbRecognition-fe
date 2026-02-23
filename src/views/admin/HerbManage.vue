<template>
  <div class="admin-page">
    <div class="page-nav">
      <BackButton default-back="/" text="返回前台" />
    </div>
    
    <div class="page-header">
      <div>
        <h1>药材管理</h1>
        <p class="subtitle">管理系统中的所有药材数据</p>
      </div>
      <div class="header-actions">
        <div class="user-info">
          <div class="avatar">{{ userStore.user?.username.charAt(0).toUpperCase() }}</div>
          <span class="username">{{ userStore.user?.username }}</span>
          <span class="role-badge" v-if="userStore.user?.role === 'admin'">管理员</span>
        </div>
        <button @click="handleLogout" class="btn-logout">退出</button>
      </div>
    </div>
    
    <div class="toolbar">
      <button @click="handleCreate" class="btn-primary">新增药材</button>
      <button @click="handleBatchDelete" :disabled="selectedIds.length === 0" class="btn-danger">
        批量删除 ({{ selectedIds.length }})
      </button>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th class="checkbox-col"><input type="checkbox" @change="toggleAll" :checked="isAllSelected" /></th>
            <th class="image-col">图片</th>
            <th>名称</th>
            <th>学名</th>
            <th>分类</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td><input type="checkbox" :value="item.id" v-model="selectedIds" /></td>
            <td>
              <div class="thumbnail">
                <img v-if="item.image_url" :src="apiUrl + item.image_url" :alt="item.name" />
                <span v-else class="no-image">无图</span>
              </div>
            </td>
            <td>
              <span class="name">{{ item.name }}</span>
            </td>
            <td class="text-muted">{{ item.scientific || '-' }}</td>
            <td><span v-if="item.category" class="badge">{{ item.category }}</span><span v-else class="text-muted">-</span></td>
            <td>
              <button @click="handleEdit(item)" class="btn-icon btn-edit" title="编辑">编辑</button>
              <button @click="handleDelete(item.id)" class="btn-icon btn-delete" title="删除">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="!loading && list.length === 0" class="empty-table">
        <p>暂无数据</p>
      </div>
    </div>

    <div v-if="!loading && list.length > 0" class="pagination">
      <button :disabled="page <= 1" @click="loadPage(page - 1)">上一页</button>
      <span class="page-info">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages" @click="loadPage(page + 1)">下一页</button>
    </div>

    <!-- 编辑/新增 弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingItem ? '编辑药材' : '新增药材' }}</h3>
          <button @click="showModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-grid">
              <div class="form-item required">
                <label>名称</label>
                <input v-model="formData.name" required maxlength="64" placeholder="请输入药材名称" />
              </div>
              <div class="form-item">
                <label>学名</label>
                <input v-model="formData.scientific" placeholder="拉丁学名" />
              </div>
            </div>
            <div class="form-grid">
              <div class="form-item">
                <label>别名</label>
                <input v-model="formData.alias" placeholder="常见别名" />
              </div>
              <div class="form-item">
                <label>分类</label>
                <input v-model="formData.category" placeholder="如：消食药" />
              </div>
            </div>
            <div class="form-item">
              <label>简介</label>
              <textarea v-model="formData.description" rows="3" placeholder="药材简介"></textarea>
            </div>
            <div class="form-item">
              <label>功效</label>
              <textarea v-model="formData.effects" rows="3" placeholder="功效与作用"></textarea>
            </div>
            <div class="form-item">
              <label>用法用量</label>
              <textarea v-model="formData.usage" rows="2" placeholder="用法用量说明"></textarea>
            </div>
            <div class="form-item">
              <label>图片</label>
              <input type="file" @change="handleImageChange" accept="image/*" class="file-input" />
              <img v-if="previewImage" :src="previewImage" class="preview" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="showModal = false" class="btn-secondary">取消</button>
          <button type="button" @click="handleSubmit" :disabled="submitting" class="btn-primary">
            {{ submitting ? '保存中...' : '保存' }}
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
import { getHerbList, createHerb, updateHerb, deleteHerb, batchDeleteHerb, uploadHerbImage } from '@/api/admin'
import type { Herb } from '@/api/herb'
import type { AdminHerbCreate, AdminHerbUpdate } from '@/api/admin'

const router = useRouter()
const userStore = useUserStore()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiUrl = ref(API_BASE_URL)

const list = ref<Herb[]>([])
const loading = ref(true)
const page = ref(1)
const page_size = ref(10)
const total = ref(0)
const selectedIds = ref<number[]>([])
const showModal = ref(false)
const editingItem = ref<Herb | null>(null)
const submitting = ref(false)
const previewImage = ref('')
const selectedImage = ref<File | null>(null)

const totalPages = computed(() => Math.ceil(total.value / page_size.value))
const isAllSelected = computed(() => list.value.length > 0 && selectedIds.value.length === list.value.length)

const formData = ref<AdminHerbCreate & { id?: number }>({
  name: '',
  scientific: '',
  alias: '',
  category: '',
  description: '',
  effects: '',
  usage: '',
})

async function loadPage(newPage: number) {
  loading.value = true
  try {
    const res = await getHerbList(newPage, page_size.value)
    list.value = res.data.list
    total.value = res.data.total
    page.value = newPage
  } catch (e: any) {
    alert(e.response?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  selectedIds.value = checked ? list.value.map(item => item.id) : []
}

function handleCreate() {
  editingItem.value = null
  formData.value = {
    name: '',
    scientific: '',
    alias: '',
    category: '',
    description: '',
    effects: '',
    usage: '',
  }
  previewImage.value = ''
  selectedImage.value = null
  showModal.value = true
}

function handleEdit(item: Herb) {
  editingItem.value = item
  formData.value = {
    id: item.id,
    name: item.name,
    scientific: item.scientific || '',
    alias: item.alias || '',
    category: item.category || '',
    description: item.description || '',
    effects: item.effects || '',
    usage: item.usage || '',
  }
  previewImage.value = item.image_url ? `http://localhost:8080${item.image_url}` : ''
  selectedImage.value = null
  showModal.value = true
}

async function handleDelete(id: number) {
  if (!confirm('确定删除吗？')) return
  try {
    await deleteHerb(id)
    list.value = list.value.filter(item => item.id !== id)
  } catch (e: any) {
    alert(e.response?.data?.message || '删除失败')
  }
}

async function handleBatchDelete() {
  if (!confirm(`确定删除选中的 ${selectedIds.value.length} 条记录吗？`)) return
  try {
    await batchDeleteHerb(selectedIds.value)
    list.value = list.value.filter(item => !selectedIds.value.includes(item.id))
    selectedIds.value = []
  } catch (e: any) {
    alert(e.response?.data?.message || '批量删除失败')
  }
}

function handleImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedImage.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    let imageUrl: string | undefined

    if (selectedImage.value) {
      const uploadRes = await uploadHerbImage(selectedImage.value)
      imageUrl = uploadRes.data.image_url
    }

    const submitData: AdminHerbCreate & { id?: number } = { ...formData.value }
    if (imageUrl) {
      submitData.image_url = imageUrl
    }

    if (editingItem.value) {
      await updateHerb({ ...submitData, id: editingItem.value.id } as AdminHerbUpdate)
    } else {
      await createHerb(submitData as AdminHerbCreate)
    }

    showModal.value = false
    loadPage(page.value)
  } catch (e: any) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    submitting.value = false
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

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
}

.btn-danger {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--danger-color), #dc2626);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-danger:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
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

.table .checkbox-col {
  width: 50px;
  text-align: center;
}

.table .image-col {
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

.thumbnail .no-image {
  color: var(--text-light);
  font-size: 12px;
}

.text-muted {
  color: var(--text-light);
}

.name {
  font-weight: 600;
  color: var(--text-primary);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
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
  margin-right: 8px;
}

.btn-icon:hover {
  background: var(--bg-primary);
}

.btn-edit:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-delete:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
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
  max-width: 700px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-item.required label::after {
  content: ' *';
  color: var(--danger-color);
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 14px;
  transition: all 0.2s;
  background: var(--bg-primary);
}

.form-item input:focus,
.form-item textarea:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.form-item .file-input {
  padding: 8px;
  background: var(--bg-secondary);
}

.form-item .preview {
  margin-top: 12px;
  max-width: 200px;
  max-height: 200px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
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

.modal-footer .btn-primary {
  padding: 10px 32px;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .table {
    font-size: 13px;
  }
  
  .table th, .table td {
    padding: 12px 8px;
  }
}
</style>
