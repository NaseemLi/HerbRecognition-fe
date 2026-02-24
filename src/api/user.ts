import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'

export interface User {
  id: number
  username: string
  role: string
  avatar: string
  created_at: string
}

export interface UserProfile {
  user: User
}

export interface UploadAvatarResponse {
  avatar_url: string
}

export function getUserProfile() {
  return request.get<any, ApiResponse<UserProfile>>('/api/user/profile')
}

export function updateUserProfile(data: { username?: string; avatar?: string }) {
  return request.put<any, ApiResponse<UserProfile>>('/api/user/profile', data)
}

export function uploadAvatar(formData: FormData) {
  return request.post<any, ApiResponse<UploadAvatarResponse>>('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
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
