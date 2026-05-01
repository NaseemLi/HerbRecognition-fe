import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types/api'

export interface Ticket {
  id: number
  user_id: number
  title: string
  content: string
  image_url: string
  status: 'pending' | 'processing' | 'resolved'
  admin_reply: string
  replied_at: string | null
  created_at: string
  username: string
}

export function getTicketList(page = 1, page_size = 10, status = '') {
  return request.get<any, ApiResponse<PageResult<Ticket>>>('/api/admin/ticket', {
    params: { page, page_size, status },
  })
}

export function getTicketDetail(id: number) {
  return request.get<any, ApiResponse<Ticket>>(`/api/admin/ticket/${id}`)
}

export function replyTicket(id: number, reply: string) {
  return request.post<any, ApiResponse>(`/api/admin/ticket/${id}/reply`, { reply })
}

export function updateTicketStatus(id: number, status: string) {
  return request.post<any, ApiResponse>(`/api/admin/ticket/${id}/status`, { status })
}

export interface CreateTicketData {
  title: string
  content: string
  image_url?: string
}

export function createTicket(data: CreateTicketData) {
  return request.post<any, ApiResponse<Ticket>>('/api/ticket', data)
}

export function getMyTickets(page = 1, page_size = 10, status = '') {
  return request.get<any, ApiResponse<PageResult<Ticket>>>('/api/ticket', {
    params: { page, page_size, status },
  })
}

export function getMyTicketDetail(id: number) {
  return request.get<any, ApiResponse<Ticket>>(`/api/ticket/${id}`)
}

export function uploadImage(formData: FormData) {
  return request.post<any, ApiResponse<{ image_url: string }>>('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
