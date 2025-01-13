import type { AxiosError, AxiosResponse } from 'axios'

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

export type ApiInterceptorHandler = (error: AxiosError<ApiError>) => Promise<never>
export type ApiSuccessHandler = (response: AxiosResponse) => AxiosResponse 