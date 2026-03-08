import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/venues',
    name: 'Venues',
    component: () => import('@/views/Venues.vue'),
    meta: { title: '场地列表' }
  },
  {
    path: '/venues/:id',
    name: 'VenueDetail',
    component: () => import('@/views/VenueDetail.vue'),
    meta: { title: '场地详情' }
  },
  {
    path: '/ai-planner',
    name: 'AIPlanner',
    component: () => import('@/views/AIPlanner.vue'),
    meta: { title: 'AI策划', requiresAuth: true }
  },
  {
    path: '/designer',
    name: 'Designer3D',
    component: () => import('@/views/Designer3D.vue'),
    meta: { title: '3D设计器', requiresAuth: true }
  },
  {
    path: '/quotation',
    name: 'Quotation',
    component: () => import('@/views/Quotation.vue'),
    meta: { title: '报价单', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { title: '用户中心', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  
  // ========== Partner Portal 供应商端 ==========
  {
    path: '/partner/apply',
    name: 'PartnerApply',
    component: () => import('@/views/partner/Apply.vue'),
    meta: { title: '供应商申请' }
  },
  {
    path: '/partner/status',
    name: 'PartnerStatus',
    component: () => import('@/views/partner/Status.vue'),
    meta: { title: '申请状态查询' }
  },
  {
    path: '/partner/dashboard',
    name: 'PartnerDashboard',
    component: () => import('@/views/partner/Dashboard.vue'),
    meta: { title: '合作伙伴门户', requiresAuth: true, requiresPartner: true }
  },
  {
    path: '/partner/contracts',
    name: 'PartnerContracts',
    component: () => import('@/views/partner/Contracts.vue'),
    meta: { title: '合同中心', requiresAuth: true, requiresPartner: true }
  },
  {
    path: '/partner/contracts/:id',
    name: 'PartnerContractDetail',
    component: () => import('@/views/partner/ContractDetail.vue'),
    meta: { title: '合同详情', requiresAuth: true, requiresPartner: true }
  },
  {
    path: '/partner/media',
    name: 'PartnerMedia',
    component: () => import('@/views/partner/Media.vue'),
    meta: { title: '素材库', requiresAuth: true, requiresPartner: true }
  },
  
  // ========== Suppliers 供应商库 ==========
  {
    path: '/suppliers',
    name: 'SuppliersMap',
    component: () => import('@/views/SuppliersMap.vue'),
    meta: { title: '供应商地图' }
  },
  {
    path: '/suppliers/:id',
    name: 'SupplierDetail',
    component: () => import('@/views/SupplierDetail.vue'),
    meta: { title: '供应商详情' }
  },
  
  // ========== Admin 管理后台 ==========
  {
    path: '/admin/suppliers',
    name: 'AdminSuppliers',
    component: () => import('@/views/AdminSuppliers.vue'),
    meta: { title: '供应商管理', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/partners',
    name: 'AdminPartners',
    component: () => import('@/views/admin/Partners.vue'),
    meta: { title: '供应商审核', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/partners/:id',
    name: 'AdminPartnerDetail',
    component: () => import('@/views/admin/PartnerDetail.vue'),
    meta: { title: '供应商详情', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/templates',
    name: 'AdminTemplates',
    component: () => import('@/views/admin/Templates.vue'),
    meta: { title: '模板管理', requiresAuth: true, requiresAdmin: true }
  },
  
  // ========== Templates 模板库 ==========
  {
    path: '/templates',
    name: 'Templates',
    component: () => import('@/views/templates/Templates.vue'),
    meta: { title: '模板库' }
  },
  {
    path: '/templates/:id',
    name: 'TemplateDetail',
    component: () => import('@/views/templates/TemplateDetail.vue'),
    meta: { title: '模板详情' }
  },
  
  // ========== Events 活动管理 ==========
  {
    path: '/my/events',
    name: 'Events',
    component: () => import('@/views/events/Events.vue'),
    meta: { title: '我的活动', requiresAuth: true }
  },
  {
    path: '/my/events/:id',
    name: 'EventDetail',
    component: () => import('@/views/events/EventDetail.vue'),
    meta: { title: '活动详情', requiresAuth: true }
  },
  
  // ========== Share 分享落地页 ==========
  {
    path: '/s/:share_code',
    name: 'Share',
    component: () => import('@/views/share/Share.vue'),
    meta: { title: '精彩派对分享', hideHeader: true, hideFooter: true }
  },
  
  // ========== Me 个人中心 ==========
  {
    path: '/me/wallet',
    name: 'Wallet',
    component: () => import('@/views/me/Wallet.vue'),
    meta: { title: '我的钱包', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - PartyOnce`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.token) {
    next('/')
    // 触发登录弹窗
    const event = new CustomEvent('show-login')
    window.dispatchEvent(event)
    return
  }
  
  // 检查是否需要合作伙伴权限
  if (to.meta.requiresPartner && !userStore.isPartner) {
    next('/partner/apply')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
    ElMessage.error('没有权限访问此页面')
    return
  }
  
  next()
})

export default router
