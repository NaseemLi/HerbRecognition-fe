import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'

export interface Herb {
  id: number
  name: string
  scientific: string
  alias: string
  category: string
  description: string
  effects: string
  usage: string
  image_url: string
}

export function getHerbList(page = 1, page_size = 10, category = '') {
  return request.get<any, ApiResponse<PageResult<Herb>>>('/api/herb', {
    params: { page, page_size, category },
  })
}

export function searchHerb(keyword: string, page = 1, page_size = 10) {
  return request.get<any, ApiResponse<PageResult<Herb>>>('/api/herb/search', {
    params: { keyword, page, page_size },
  })
}

export function getHerbDetail(id: number) {
  return request.get<any, ApiResponse<Herb>>(`/api/herb/${id}`)
}
