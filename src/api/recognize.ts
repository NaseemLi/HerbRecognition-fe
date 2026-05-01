import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'

export interface RecognizeResult {
  record_id: number
  herb_id: number
  herb_name: string
  confidence: number
  image_url: string
}

export interface HistoryItem {
  id: number
  image_url: string
  herb_id: number
  herb_name: string
  confidence: number
  created_at: string
}

export function uploadAndRecognize(image: File) {
  const formData = new FormData()
  formData.append('image', image)
  return request.post<any, ApiResponse<RecognizeResult>>(
    '/api/recognize/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: [(data) => data]
    }
  )
}

export function getHistory(page = 1, page_size = 10) {
  return request.get<any, ApiResponse<PageResult<HistoryItem>>>(
    '/api/recognize/history',
    {
      params: { page, page_size },
    }
  )
}

export function recognizeBase64(image_base64: string, save_history: boolean = true) {
  return request.post<any, ApiResponse<RecognizeResult>>(
    '/api/recognize/base64',
    { image_base64, save_history }
  )
}

export function deleteHistory(id: number) {
  return request.delete<any, ApiResponse>('/api/recognize/history', {
    data: { id },
  })
}
