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
