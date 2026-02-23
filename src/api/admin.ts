import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { Herb } from './herb'

export interface AdminHerbCreate {
  name: string
  scientific?: string
  alias?: string
  category?: string
  description?: string
  effects?: string
  usage?: string
  image_url?: string
}

export interface AdminHerbUpdate extends AdminHerbCreate {
  id: number
}

export function getHerbList(page = 1, page_size = 10, category = '') {
  return request.get<any, ApiResponse<PageResult<Herb>>>('/api/admin/herb', {
    params: { page, page_size, category },
  })
}

export function createHerb(data: AdminHerbCreate) {
  return request.post<any, ApiResponse<Herb>>('/api/admin/herb', data)
}

export function updateHerb(data: AdminHerbUpdate) {
  return request.put<any, ApiResponse<Herb>>('/api/admin/herb', data)
}

export function deleteHerb(id: number) {
  return request.delete<any, ApiResponse>('/api/admin/herb', {
    data: { id },
  })
}

export function batchDeleteHerb(ids: number[]) {
  return request.delete<any, ApiResponse>('/api/admin/herb/batch', {
    data: { ids },
  })
}

export function uploadHerbImage(image: File) {
  const formData = new FormData()
  formData.append('image', image)
  return request.post<any, ApiResponse<{ image_url: string }>>(
    '/api/admin/herb/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: [(data) => data]
    }
  )
}
