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

  if (!testModeEnabled) blockers.push('Test-mode payment preparation is not enabled for this local/staging preview.')
  if (!publishableKey) blockers.push('Test payment key is not configured for this local/staging preview.')
  if (hasLivePublishableKey) blockers.push('Live publishable key detected; payment readiness blocks live mode.')
  if (publishableKey && !hasTestPublishableKey) blockers.push('Publishable key is not a test-mode payment key.')

  return {
    mode: testModeEnabled ? 'test-mode' : 'blocked',
    ready: blockers.length === 0 && hasTestPublishableKey,
    testModeEnabled,
    hasTestPublishableKey,
    hasLivePublishableKey,
    publishableKeyMasked: maskKey(publishableKey),
    blockers,
    boundary: 'Payment readiness check only: deposit payment is not enabled in this preview, and no real payment, webhook, n8n, outbound message, or production payment is triggered.'
  }
}

export const buildPaymentReadinessSnapshot = (order = {}) => {
  const readiness = getPaymentReadiness()
  return {
    readiness,
    order: {
      order_number: order.order_number || 'PO-TEST-READINESS',
      event_type: order.event_type || 'PartyOnce local/staging event',
      event_date: order.event_date || '',
      venue_name: order.venue_name || 'Local/staging venue',
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
