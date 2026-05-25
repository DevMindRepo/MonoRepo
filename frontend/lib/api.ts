import axios, { AxiosError, type AxiosRequestConfig } from "axios"
import { env } from "./env"
import { getAuthToken, useAuthStore } from "./store/auth"

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiFailure {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailure>) => {
    if (error.response?.status === 401) {
      // Token expired/invalid — clear session
      useAuthStore.getState().clear()
    }
    const body = error.response?.data
    const message =
      (body && "error" in body && body.error) ||
      error.message ||
      "Network error"
    return Promise.reject(
      new ApiError(error.response?.status ?? 0, message, body?.code),
    )
  },
)

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise
  if (!res.data.success) {
    throw new ApiError(0, res.data.error, res.data.code)
  }
  return res.data.data
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(api.get(url, config)),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(api.post(url, body, config)),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(api.patch(url, body, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(api.delete(url, config)),
}
