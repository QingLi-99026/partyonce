const READINESS_STORAGE_KEY = 'partyonce_payment_readiness_v1'

const maskKey = (value = '') => {
  if (!value) return ''
  if (value.length <= 12) return `${value.slice(0, 4)}...`
  return `${value.slice(0, 7)}...${value.slice(-4)}`
}

export const getPaymentReadiness = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  const testModeFlag = String(import.meta.env.VITE_STRIPE_TEST_MODE || '').toLowerCase()
  const hasTestPublishableKey = publishableKey.startsWith('pk_test_')
  const hasLivePublishableKey = publishableKey.startsWith('pk_live_')
  const testModeEnabled = ['1', 'true', 'yes', 'test'].includes(testModeFlag)
  const blockers = []

  if (!testModeEnabled) blockers.push('当前仅显示支付流程说明，订金支付尚未开放。')
  if (!publishableKey) blockers.push('支付输入尚未配置给客户使用。')
  if (hasLivePublishableKey) blockers.push('已阻止真实支付配置进入当前预览。')
  if (publishableKey && !hasTestPublishableKey) blockers.push('当前支付配置不符合预览要求。')

  return {
    mode: testModeEnabled ? 'preview_overview' : 'blocked',
    ready: blockers.length === 0 && hasTestPublishableKey,
    testModeEnabled,
    hasTestPublishableKey,
    hasLivePublishableKey,
    publishableKeyMasked: maskKey(publishableKey),
    blockers,
    boundary: '仅支付流程说明：当前预览不启用订金支付，也不会扣款或外发消息。'
  }
}

export const buildPaymentReadinessSnapshot = (order = {}) => {
  const readiness = getPaymentReadiness()
  return {
    readiness,
    order: {
      order_number: order.order_number || 'PO-PREVIEW-READINESS',
      event_type: order.event_type || 'Party Event 预览活动',
      event_date: order.event_date || '',
      venue_name: order.venue_name || '待确认场地',
      currency: order.currency || 'AUD',
      deposit_amount: Number(order.deposit_amount || order.amount || 0)
    },
    created_at: new Date().toISOString()
  }
}

export const savePaymentReadinessSnapshot = (snapshot) => {
  if (typeof window === 'undefined') return snapshot
  window.localStorage.setItem(READINESS_STORAGE_KEY, JSON.stringify(snapshot))
  return snapshot
}

export const readPaymentReadinessSnapshot = () => {
  if (typeof window === 'undefined') return null
  try {
    const parsed = JSON.parse(window.localStorage.getItem(READINESS_STORAGE_KEY) || 'null')
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (error) {
    return null
  }
}
