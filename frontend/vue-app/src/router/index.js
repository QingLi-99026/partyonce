import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'
import { featureFlags } from '@/config/featureFlags'

const party3DComponent = () => featureFlags.threeDExperienceEnabled
  ? import('@/views/Party3DPreview.vue')
  : import('@/views/FeatureUnavailable3D.vue')

const designer3DComponent = () => featureFlags.threeDExperienceEnabled
  ? import('@/views/Designer3D.vue')
  : import('@/views/FeatureUnavailable3D.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/home-simple',
    name: 'HomeSimple',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页简版' }
  },
  {
    path: '/local-demo',
    name: 'LocalDemoHub',
    component: () => import('@/views/LocalDemoHub.vue'),
    meta: { title: '本地演示流程' }
  },
  {
    path: '/investor-demo',
    name: 'InvestorDemoMode',
    component: () => import('@/views/InvestorDemoMode.vue'),
    meta: { title: '投资人引导演示' }
  },
  {
    path: '/themes',
    name: 'Themes',
    component: () => import('@/views/Themes.vue'),
    meta: { title: '选择主题' }
  },
  {
    path: '/themes/:slug',
    name: 'ThemeDetail',
    component: () => import('@/views/ThemeDetail.vue'),
    meta: { title: '主题详情' }
  },
  {
    path: '/venues',
    name: 'Venues',
    component: () => import('@/views/Venues.vue'),
    meta: { title: '场地列表' }
  },
  {
    path: '/venue-finder',
    name: 'VenueFinder',
    component: () => import('@/views/VenueFinder.vue'),
    meta: { title: 'Venue Finder' }
  },
  {
    path: '/venue-finder/:id',
    name: 'VenueFinderDetail',
    component: () => import('@/views/VenueFinder.vue'),
    meta: { title: 'Venue Finder Detail' }
  },
  {
    path: '/packages',
    name: 'PackageGuide',
    component: () => import('@/views/PackageGuide.vue'),
    meta: { title: 'Package Guide' }
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
    path: '/ai-voice-intake',
    name: 'AIVoiceIntake',
    component: () => import('@/views/AIVoiceIntake.vue'),
    meta: { title: 'AI 语音式引导' }
  },
  {
    path: '/experimental/party-3d',
    alias: ['/party-3d', '/3d-preview'],
    name: 'Party3DPreview',
    component: party3DComponent,
    meta: { title: '3D Preview status' }
  },
  {
    path: '/designer',
    alias: '/3d-designer',
    name: 'Designer3D',
    component: designer3DComponent,
    meta: { title: '3D Design status' }
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
  {
    path: '/payment/deposit',
    name: 'PaymentDeposit',
    component: () => import('@/views/PaymentDeposit.vue'),
    meta: { title: 'Test-mode payment readiness' }
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import('@/views/PaymentSuccess.vue'),
    meta: { title: 'Test payment success placeholder' }
  },
  {
    path: '/payment/failed',
    name: 'PaymentFailed',
    component: () => import('@/views/PaymentFailed.vue'),
    meta: { title: 'Test payment failed placeholder' }
  },
  {
    path: '/payment/cancelled',
    name: 'PaymentCancelled',
    component: () => import('@/views/PaymentCancelled.vue'),
    meta: { title: 'Payment cancelled placeholder' }
  },
  {
    path: '/quotes',
    redirect: '/my/quotes'
  },
  {
    path: '/quote',
    name: 'QuotePage',
    component: () => import('@/views/QuotePage.vue'),
    meta: { title: '报价汇总' }
  },
  {
    path: '/my/inquiries',
    name: 'InquiryList',
    component: () => import('@/views/InquiryList.vue'),
    meta: { title: '我的咨询记录' }
  },
  {
    path: '/my/quotes',
    name: 'MyQuotes',
    component: () => import('@/views/MyQuotes.vue'),
    meta: { title: '我的报价', customerFixture: true }
  },
  {
    path: '/my/quotes/:id',
    name: 'MyQuoteDetail',
    component: () => import('@/views/MyQuoteDetail.vue'),
    meta: { title: '报价详情', customerFixture: true }
  },
  {
    path: '/my/orders',
    name: 'MyOrders',
    component: () => import('@/views/MyOrders.vue'),
    meta: { title: '我的订单', customerFixture: true }
  },
  {
    path: '/my/orders/:id',
    name: 'MyOrderDetail',
    component: () => import('@/views/MyOrderDetail.vue'),
    meta: { title: '订单详情', customerFixture: true }
  },
  {
    path: '/my/rewards',
    name: 'MyRewards',
    component: () => import('@/views/MyRewards.vue'),
    meta: { title: '我的分享奖励', customerFixture: true }
  },
  {
    path: '/share',
    name: 'ShareRewards',
    component: () => import('@/views/MyRewards.vue'),
    meta: { title: '有奖分享', customerFixture: true }
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
    path: '/admin/local-leads',
    name: 'LocalLeadReview',
    component: () => import('@/views/LocalLeadReview.vue'),
    meta: { title: '本地留资跟进中心' }
  },
  {
    path: '/admin/quotes',
    name: 'AdminQuotes',
    component: () => import('@/views/AdminQuotes.vue'),
    meta: { title: 'Quote Review', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/quotes/:quoteId',
    name: 'AdminQuoteDetail',
    component: () => import('@/views/AdminQuoteDetail.vue'),
    meta: { title: 'Quote Detail', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: () => import('@/views/AdminOrders.vue'),
    meta: { title: 'Order Review', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders/:orderId',
    name: 'AdminOrderDetail',
    component: () => import('@/views/AdminOrderDetail.vue'),
    meta: { title: 'Order Detail', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/notifications/dry-run',
    name: 'AdminNotificationDryRun',
    component: () => import('@/views/AdminNotificationDryRun.vue'),
    meta: { title: 'Notification dry-run', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/social-rewards',
    name: 'AdminSocialRewards',
    component: () => import('@/views/AdminSocialRewards.vue'),
    meta: { title: 'Social Rewards Review', requiresAuth: true, requiresAdmin: true }
  },
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

  if (!featureFlags.aiExperienceEnabled && ['AIPlanner', 'AIVoiceIntake'].includes(to.name)) {
    next('/quote')
    return
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Party Event`
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
