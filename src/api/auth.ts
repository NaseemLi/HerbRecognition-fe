import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
}

export interface ChangePasswordParams {
  old_password: string
  new_password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    role: string
    avatar: string
  }
}

export function login(data: LoginParams) {
  return request.post<any, ApiResponse<LoginResponse>>('/api/auth/login', data)
}

export function register(data: RegisterParams) {
  return request.post<any, ApiResponse>('/api/auth/register', data)
}

export function changePassword(data: ChangePasswordParams) {
  return request.post<any, ApiResponse>('/api/auth/change-password', data)
}
