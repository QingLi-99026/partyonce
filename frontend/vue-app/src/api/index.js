import axios from 'axios'
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'

// API 基础URL配置
const getBaseURL = () => {
  const isProduction = import.meta.env.PROD
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  if (import.meta.env.VITE_API_URL) {
    const configuredUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '')
    if (isProduction && /localhost|127\.0\.0\.1|trycloudflare\.com/i.test(configuredUrl)) {
      throw new Error('Production API URL is not allowed to use localhost, 127.0.0.1, or temporary tunnel hosts.')
    }
    return configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`
  }

  if (isProduction) {
    throw new Error('Production API URL is missing. Set VITE_API_URL to the approved production backend origin.')
  }

  // 如果在本地开发环境
  if (isLocalHost) {
    return '/api'
  }

  // Non-production preview fallback only. Production must be configured explicitly above.
  return 'http://127.0.0.1:8000'
}

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          // 触发登录弹窗
          const event = new CustomEvent('show-login')
          window.dispatchEvent(event)
          break
        case 403:
          ElMessage.error('没有权限执行此操作')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 422:
          ElMessage.error(response.data?.detail || '请求参数错误')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(response.data?.detail || '网络错误')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
