import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'

export interface User {
  id: number
  username: string
  role: string
  avatar: string
}

export function getUserList(page = 1, page_size = 10, role = '') {
  return request.get<any, ApiResponse<PageResult<User>>>('/api/admin/user', {
    params: { page, page_size, role },
  })
}

export function updateUserRole(user_id: number, role: string) {
  return request.post<any, ApiResponse>('/api/admin/user/role', {
    user_id,
    role,
  })
}
