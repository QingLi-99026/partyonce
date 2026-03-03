import apiClient from './index'

// ========== 用户相关 API ==========
export const userAPI = {
  // 用户注册
  register(data) {
    return apiClient.post('/users/register', data)
  },
  
  // 用户登录
  login(credentials) {
    const formData = new URLSearchParams()
    formData.append('username', credentials.email)
    formData.append('password', credentials.password)
    
    return apiClient.post('/users/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  
  // 获取当前用户信息
  getMe() {
    return apiClient.get('/users/me')
  },
  
  // 更新用户信息
  updateProfile(data) {
    return apiClient.patch('/users/me', data)
  }
}

// ========== 场地相关 API ==========
export const venueAPI = {
  // 获取场地列表
  getVenues(params = {}) {
    return apiClient.get('/venues', { params })
  },
  
  // 获取场地详情
  getVenue(id) {
    return apiClient.get(`/venues/${id}`)
  },
  
  // 创建场地预订
  createBooking(venueId, data) {
    return apiClient.post(`/venues/${venueId}/book`, data)
  }
}

// ========== AI 策划 API ==========
export const aiAPI = {
  // 生成AI策划方案
  generatePlan(data) {
    return apiClient.post('/ai-planner/generate', data)
  },
  
  // 获取用户的策划方案列表
  getPlans() {
    return apiClient.get('/ai-planner/plans')
  },
  
  // 获取方案详情
  getPlan(id) {
    return apiClient.get(`/ai-planner/plans/${id}`)
  },
  
  // 选择方案
  selectPlan(id, planIndex) {
    return apiClient.post(`/ai-planner/plans/${id}/select`, { plan_index: planIndex })
  }
}

// ========== 订单相关 API ==========
export const orderAPI = {
  // 获取订单列表
  getOrders() {
    return apiClient.get('/orders')
  },
  
  // 获取订单详情
  getOrder(id) {
    return apiClient.get(`/orders/${id}`)
  },
  
  // 创建订单
  createOrder(data) {
    return apiClient.post('/orders', data)
  },
  
  // 取消订单
  cancelOrder(id) {
    return apiClient.post(`/orders/${id}/cancel`)
  }
}

// ========== 报价单相关 API ==========
export const quotationAPI = {
  // 生成报价单
  generateQuotation(data) {
    return apiClient.post('/quotations', data)
  },
  
  // 获取报价单列表
  getQuotations() {
    return apiClient.get('/quotations')
  },
  
  // 获取报价单详情
  getQuotation(id) {
    return apiClient.get(`/quotations/${id}`)
  }
}

// ========== 合作伙伴 (Partner) API ==========
export const partnerAPI = {
  // 提交供应商申请
  apply(data) {
    return apiClient.post('/partners/apply', data)
  },
  
  // 查询申请状态
  checkStatus(email) {
    return apiClient.get('/partners/status', { params: { email } })
  },
  
  // 获取仪表板数据
  getDashboard() {
    return apiClient.get('/partners/dashboard')
  },
  
  // 获取合同列表
  getContracts() {
    return apiClient.get('/partners/contracts')
  },
  
  // 获取合同详情
  getContract(id) {
    return apiClient.get(`/partners/contracts/${id}`)
  },
  
  // 签署合同
  signContract(id) {
    return apiClient.post(`/partners/contracts/${id}/sign`)
  },
  
  // 获取素材列表
  getMediaList(params = {}) {
    return apiClient.get('/partners/media', { params })
  },
  
  // 添加素材
  addMedia(data) {
    return apiClient.post('/partners/media', data)
  },
  
  // 更新素材
  updateMedia(id, data) {
    return apiClient.patch(`/partners/media/${id}`, data)
  },
  
  // 删除素材
  deleteMedia(id) {
    return apiClient.delete(`/partners/media/${id}`)
  }
}

// ========== 管理员 (Admin) API ==========
export const adminAPI = {
  // 获取供应商列表
  getPartners(params = {}) {
    return apiClient.get('/admin/partners', { params })
  },
  
  // 获取供应商详情
  getPartnerDetail(id) {
    return apiClient.get(`/admin/partners/${id}`)
  },
  
  // 通过供应商申请
  approvePartner(id) {
    return apiClient.post(`/admin/partners/${id}/approve`)
  },
  
  // 拒绝供应商申请
  rejectPartner(id, data) {
    return apiClient.post(`/admin/partners/${id}/reject`, data)
  },
  
  // 获取模板列表
  getTemplates(params = {}) {
    return apiClient.get('/admin/templates', { params })
  },
  
  // 创建模板
  createTemplate(data) {
    return apiClient.post('/admin/templates', data)
  },
  
  // 更新模板
  updateTemplate(id, data) {
    return apiClient.patch(`/admin/templates/${id}`, data)
  },
  
  // 删除模板
  deleteTemplate(id) {
    return apiClient.delete(`/admin/templates/${id}`)
  }
}

// ========== 模板 (Template) API ==========
export const templateAPI = {
  // 获取模板列表
  getTemplates(params = {}) {
    return apiClient.get('/templates', { params })
  },
  
  // 获取模板详情
  getTemplate(id) {
    return apiClient.get(`/templates/${id}`)
  }
}

// ========== 活动 (Event) API ==========
export const eventAPI = {
  // 获取活动列表
  getEvents(params = {}) {
    return apiClient.get('/events', { params })
  },
  
  // 获取活动详情
  getEvent(id) {
    return apiClient.get(`/events/${id}`)
  },
  
  // 创建活动
  createEvent(data) {
    return apiClient.post('/events', data)
  },
  
  // 更新活动
  updateEvent(id, data) {
    return apiClient.patch(`/events/${id}`, data)
  },
  
  // 取消活动
  cancelEvent(id) {
    return apiClient.post(`/events/${id}/cancel`)
  },
  
  // 添加活动媒体
  addMedia(eventId, data) {
    return apiClient.post(`/events/${eventId}/media`, data)
  },
  
  // 生成分享包
  generateSharePack(eventId) {
    return apiClient.post(`/events/${eventId}/share`)
  }
}

// ========== 分享 (Share) API ==========
export const shareAPI = {
  // 获取分享数据
  getShareData(shareCode) {
    return apiClient.get(`/share/${shareCode}`)
  },
  
  // 记录点击事件
  recordClick(shareCode, data) {
    return apiClient.post(`/share/${shareCode}/click`, data)
  }
}

// ========== 钱包 (Wallet) API ==========
export const walletAPI = {
  // 获取钱包信息
  getWallet() {
    return apiClient.get('/wallet')
  },
  
  // 获取交易记录
  getTransactions(params = {}) {
    return apiClient.get('/wallet/transactions', { params })
  },
  
  // 提现
  withdraw(data) {
    return apiClient.post('/wallet/withdraw', data)
  }
}

// ========== 上传 (Upload) API ==========
export const uploadAPI = {
  // 获取预签名URL
  getPresignUrl(params) {
    return apiClient.get('/upload/presign', { params })
  }
}
