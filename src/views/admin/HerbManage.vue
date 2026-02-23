<template>
  <AdminLayout>
    <template #title>药材管理</template>
    
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
            <th><input type="checkbox" @change="toggleAll" :checked="isAllSelected" /></th>
            <th>ID</th>
            <th>名称</th>
            <th>学名</th>
            <th>分类</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td><input type="checkbox" :value="item.id" v-model="selectedIds" /></td>
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.scientific || '-' }}</td>
            <td>{{ item.category || '-' }}</td>
            <td>
              <button @click="handleEdit(item)" class="btn-link">编辑</button>
              <button @click="handleDelete(item.id)" class="btn-link danger">删除</button>
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

    <!-- 编辑/新增 弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>{{ editingItem ? '编辑药材' : '新增药材' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-item">
            <label>名称 *</label>
            <input v-model="formData.name" required maxlength="64" />
          </div>
          <div class="form-item">
            <label>学名</label>
            <input v-model="formData.scientific" />
          </div>
          <div class="form-item">
            <label>别名</label>
            <input v-model="formData.alias" />
          </div>
          <div class="form-item">
            <label>分类</label>
            <input v-model="formData.category" />
          </div>
          <div class="form-item">
            <label>简介</label>
            <textarea v-model="formData.description" rows="3"></textarea>
          </div>
          <div class="form-item">
            <label>功效</label>
            <textarea v-model="formData.effects" rows="3"></textarea>
          </div>
          <div class="form-item">
            <label>用法用量</label>
            <textarea v-model="formData.usage" rows="2"></textarea>
          </div>
          <div class="form-item">
            <label>图片</label>
            <input type="file" @change="handleImageChange" accept="image/*" />
            <img v-if="previewImage" :src="previewImage" class="preview" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showModal = false">取消</button>
            <button type="submit" :disabled="submitting">{{ submitting ? '保存中...' : '保存' }}</button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getHerbList, createHerb, updateHerb, deleteHerb, batchDeleteHerb, uploadHerbImage } from '@/api/admin'
import type { Herb } from '@/api/herb'
import type { AdminHerbCreate, AdminHerbUpdate } from '@/api/admin'

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
    let image_url = ''
    if (selectedImage.value) {
      const res = await uploadHerbImage(selectedImage.value)
      image_url = res.data.image_url
    }

    const data: AdminHerbCreate & { id?: number } = { ...formData.value }
    if (image_url) {
      // @ts-ignore
      data.image_url = image_url
    }

    if (editingItem.value) {
      await updateHerb(data as AdminHerbUpdate)
    } else {
      await createHerb(data as AdminHerbCreate)
    }
    showModal.value = false
    loadPage(page.value)
  } catch (e: any) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-primary {
  padding: 8px 20px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #91d5ff;
  cursor: not-allowed;
}

.btn-danger {
  padding: 8px 20px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:disabled {
  background: #ffa39e;
  cursor: not-allowed;
}

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

.btn-link {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  padding: 0;
  margin-right: 12px;
}

.btn-link.danger {
  color: #ff4d4f;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 20px;
  color: #333;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item input:focus,
.form-item textarea:focus {
  border-color: #1890ff;
  outline: none;
}

.form-item .preview {
  margin-top: 8px;
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background: #fff;
  border: 1px solid #d9d9d9;
}

.modal-actions button:last-child {
  background: #1890ff;
  color: #fff;
  border: none;
}

.modal-actions button:last-child:disabled {
  background: #91d5ff;
  cursor: not-allowed;
}
</style>
