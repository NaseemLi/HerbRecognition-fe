export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageInfo {
  total: number
  page: number
  page_size: number
}

export interface PageResult<T = any> extends PageInfo {
  list: T[]
}
