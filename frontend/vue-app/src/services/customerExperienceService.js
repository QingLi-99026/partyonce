import { loadAdminOrderSkeletons } from '@/mock/adminOrders'
import apiClient from '@/api'
import { useUserStore } from '@/store'

const SOURCE_LOCAL_DEMO = 'local/staging filtered fixture'
const SOURCE_READONLY_API = 'customer read-only API'
const DEFAULT_CUSTOMER_FIXTURE = {
  id: 'customer-local-41',
  name: 'Ava Thompson',
  contact: 'ava.parent@example.test',
  apiCustomerId: null
}

const quoteStatusText = {
  draft: '后台正在准备',
  sent: '报价已发送',
  accepted: '报价已接受',
  rejected: '报价已拒绝',
  expired: '报价已过期'
}

const quoteNextStep = {
  draft: 'PartyOnce 顾问正在整理场地、主题和价格快照，请等待报价发送。',
  sent: '请查看报价内容；如需要调整主题、日期或人数，请联系顾问。',
  accepted: '报价已接受，运营会准备订单草稿。本轮不开放在线支付。',
  rejected: '报价已拒绝。如需重开方案，请重新提交 inquiry 或联系顾问。',
  expired: '报价已过期。请联系顾问刷新有效期和价格。'
}

const orderStatusText = {
  draft: '订单草稿',
  pending_deposit: '待订金确认',
  confirmed: '已确认',
  in_progress: '筹备中',
  completed: '已完成',
  cancelled: '已取消'
}

const orderNextStep = {
  draft: '运营正在复核订单草稿和活动信息。',
  pending_deposit: '订金阶段已准备，但本轮不接入 Stripe；请等待人工确认下一步。',
  confirmed: '订单已人工确认，PartyOnce 团队会继续推进筹备。',
  in_progress: '活动正在筹备中，请留意顾问更新。',
  completed: '活动已完成，可等待后续回访或评价。',
  cancelled: '订单已取消，如需恢复请联系顾问。'
}

const quoteFixtures = [
  {
    id: 'quote-local-501',
    customer_id: 'customer-local-41',
    quote_number: 'PE-Q-0501',
    status: 'accepted',
    customer_name: 'Ava Thompson',
    customer_contact: 'ava.parent@example.test',
    theme: 'Castle Princess',
    package: 'Premium',
    selection_snapshot: {
      theme: 'Castle Princess',
      package: 'Premium',
      venue: 'Sydney Kids Studio Room A',
      guest_count: 18,
      event_date: '2026-06-14'
    },
    currency: 'AUD',
    amount: 1680,
    valid_until: '2026-05-25',
    created_at: '2026-05-11T08:00:00.000Z',
    line_items: [
      { name: 'Premium castle room styling', amount: 980 },
      { name: 'Private dining room setup', amount: 420 },
      { name: 'Materials and activity station', amount: 280 }
    ]
  },
  {
    id: 'quote-local-502',
    customer_id: 'customer-local-42',
    quote_number: 'PE-Q-0502',
    status: 'sent',
    customer_name: 'Noah Chen',
    customer_contact: 'noah.family@example.test',
    theme: 'Space Explorer',
    package: 'Standard',
    selection_snapshot: {
      theme: 'Space Explorer',
      package: 'Standard',
      venue: 'Harbour View Function Room',
      guest_count: 14,
      event_date: '2026-06-22'
    },
    currency: 'AUD',
    amount: 1240,
    valid_until: '2026-05-28',
    created_at: '2026-05-11T08:20:00.000Z',
    line_items: [
      { name: 'Standard space room styling', amount: 720 },
      { name: 'Activity materials', amount: 260 },
      { name: 'Setup and pack-down', amount: 260 }
    ]
  },
  {
    id: 'quote-local-503',
    customer_id: 'customer-local-43',
    quote_number: 'PE-Q-0503',
    status: 'draft',
    customer_name: 'Mia Williams',
    customer_contact: 'mia.parent@example.test',
    theme: 'Forest Adventure',
    package: 'Basic',
    selection_snapshot: {
      theme: 'Forest Adventure',
      package: 'Basic',
      venue: 'Forest Play Cafe',
      guest_count: 10,
      event_date: '2026-07-03'
    },
    currency: 'AUD',
    amount: 780,
    valid_until: '2026-05-30',
    created_at: '2026-05-11T08:35:00.000Z',
    line_items: [
      { name: 'Basic forest theme styling', amount: 520 },
      { name: 'Kids table materials', amount: 160 },
      { name: 'Local setup support', amount: 100 }
    ]
  }
]

const clone = (value) => JSON.parse(JSON.stringify(value))

export const getCustomerReadOnlyIdentity = () => {
  const userStore = useUserStore()
  const userInfo = userStore.userInfo || {}
  const role = userInfo.role || 'customer'
  const isAdminLike = ['admin', 'manager'].includes(role)
  const apiCustomerId = userInfo.customer_id || userInfo.customerId || null

  return {
    id: userInfo.customer_fixture_id || userInfo.customerId || userInfo.id || DEFAULT_CUSTOMER_FIXTURE.id,
    name: userInfo.full_name || userInfo.name || DEFAULT_CUSTOMER_FIXTURE.name,
    contact: userInfo.email || userInfo.contact || DEFAULT_CUSTOMER_FIXTURE.contact,
    role,
    token: isAdminLike ? '' : userStore.token,
    apiCustomerId: apiCustomerId && String(apiCustomerId).match(/^\d+$/) ? String(apiCustomerId) : null,
    isFixture: !userStore.token || !apiCustomerId,
    accessBoundary: isAdminLike
      ? 'Admin/manager token is not used as customer identity; local fixture fallback is shown instead.'
      : 'Customer read-only identity is scoped to the current local/staging customer fixture.'
  }
}

const buildCustomerHeaders = () => {
  const identity = getCustomerReadOnlyIdentity()
  if (!identity.token && !identity.apiCustomerId) return null
  const headers = {}
  if (identity.apiCustomerId) headers['X-PartyOnce-Customer-Id'] = identity.apiCustomerId
  return headers
}

const readInquiryQuotes = () => {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem('inquirySubmissions') || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.map((inquiry, index) => ({
      id: inquiry.id || inquiry.demoSeedId || `inquiry-quote-${index + 1}`,
      customer_id: DEFAULT_CUSTOMER_FIXTURE.id,
      quote_number: `LOCAL-INQ-Q-${String(index + 1).padStart(3, '0')}`,
      status: inquiry.status === 'contacted' ? 'sent' : 'draft',
      customer_name: inquiry.customerInfo?.name || 'Local inquiry customer',
      customer_contact: inquiry.customerInfo?.contact || '-',
      theme: inquiry.selection?.themeName || 'Theme pending',
      package: inquiry.selection?.packageName || 'Package pending',
      selection_snapshot: {
        theme: inquiry.selection?.themeName || inquiry.selection?.themeId || '-',
        package: inquiry.selection?.packageName || inquiry.selection?.packageId || '-',
        venue: inquiry.selection?.sceneName || '-',
        guest_count: inquiry.customerInfo?.guestCount || '-',
        event_date: inquiry.customerInfo?.preferredDate || '-'
      },
      currency: 'AUD',
      amount: Number(inquiry.pricing?.finalTotal || 0),
      valid_until: '-',
      created_at: inquiry.submitTime || null,
      line_items: [
        { name: inquiry.selection?.packageName || 'Package', amount: Number(inquiry.pricing?.packagePrice || 0) },
        { name: inquiry.selection?.sceneName || 'Scene fee', amount: Number(inquiry.pricing?.sceneFee || 0) },
        { name: 'Add-ons', amount: Number(inquiry.pricing?.addonsTotal || 0) }
      ].filter((item) => item.amount > 0)
    }))
  } catch (error) {
    return []
  }
}

const normalizeQuote = (quote) => {
  const snapshot = quote.selection_snapshot || {}
  const status = quote.status || 'draft'
  return {
    id: String(quote.id),
    customer_id: String(quote.customer_id || quote.customer_summary?.id || DEFAULT_CUSTOMER_FIXTURE.id),
    quote_number: quote.quote_number || `Quote #${quote.id}`,
    status,
    status_text: quoteStatusText[status] || status,
    customer_name: quote.customer_name || quote.customer_summary?.name || '-',
    customer_contact: quote.customer_contact || quote.customer_summary?.contact || '-',
    theme: quote.theme || snapshot.themeName || snapshot.theme || '-',
    package: quote.package || quote.package_tier || snapshot.packageName || snapshot.package || '-',
    selection_snapshot: {
      theme: snapshot.themeName || snapshot.theme || quote.theme || '-',
      package: snapshot.packageName || snapshot.package || quote.package || '-',
      venue: snapshot.venueName || snapshot.venue || snapshot.location || '-',
      guest_count: snapshot.guestCount || snapshot.guest_count || '-',
      event_date: snapshot.eventDate || snapshot.event_date || snapshot.preferredDate || '-'
    },
    currency: quote.currency || 'AUD',
    amount: Number(quote.amount || quote.final_total || quote.total_amount || 0),
    valid_until: quote.valid_until || '-',
    created_at: quote.created_at || null,
    next_step: quote.next_step || quoteNextStep[status] || '请联系 PartyOnce 顾问确认下一步。',
    line_items: Array.isArray(quote.line_items) ? quote.line_items : []
  }
}

const normalizeOrder = (order) => {
  const event = order.event || {}
  const status = order.status || 'draft'
  return {
    id: String(order.id),
    customer_id: String(order.customer_id || order.customer?.id || order.customer_summary?.id || DEFAULT_CUSTOMER_FIXTURE.id),
    order_number: order.order_number || `Order #${order.id}`,
    status,
    status_text: orderStatusText[status] || status,
    quote_number: order.quote?.quote_number || order.quote_number || '-',
    event_date: order.event_date || event.date || '-',
    event_location: order.event_location || event.location || order.venue_name || '-',
    theme: event.theme || order.theme || '-',
    package: event.package_tier || order.package_tier || '-',
    guest_count: event.guest_count || order.guest_count || '-',
    currency: order.currency || 'AUD',
    total_amount: Number(order.total_amount || order.final_total || 0),
    deposit_amount: Number(order.deposit_amount || 0),
    deposit_note: 'pending_deposit 只是业务状态；本轮没有真实 Stripe 支付。',
    next_step: order.next_action || orderNextStep[status] || '请联系 PartyOnce 顾问确认下一步。',
    created_at: order.created_at || null,
    updated_at: order.updated_at || null,
    line_items: Array.isArray(order.line_items) ? order.line_items : []
  }
}

export const quoteStatuses = quoteStatusText
export const orderStatuses = orderStatusText
export const localCustomerFixture = DEFAULT_CUSTOMER_FIXTURE

export const bootstrapLocalCustomerFixture = () => {
  if (typeof window === 'undefined') return null
  const fixtureUserInfo = {
    id: DEFAULT_CUSTOMER_FIXTURE.id,
    customer_fixture_id: DEFAULT_CUSTOMER_FIXTURE.id,
    full_name: DEFAULT_CUSTOMER_FIXTURE.name,
    name: DEFAULT_CUSTOMER_FIXTURE.name,
    email: DEFAULT_CUSTOMER_FIXTURE.contact,
    contact: DEFAULT_CUSTOMER_FIXTURE.contact,
    role: 'customer',
    user_type: 'personal',
    fixture_scope: 'local_staging_only',
    customer_readonly_fixture: true
  }
  window.localStorage.setItem('userInfo', JSON.stringify(fixtureUserInfo))
  window.localStorage.removeItem('token')
  return fixtureUserInfo
}

export const clearLocalCustomerFixture = () => {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem('userInfo')
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.customer_readonly_fixture) {
      window.localStorage.removeItem('userInfo')
      window.localStorage.removeItem('token')
    }
  } catch (error) {
    window.localStorage.removeItem('userInfo')
  }
}

const localFixtureQuotes = () => {
  const identity = getCustomerReadOnlyIdentity()
  return [...readInquiryQuotes(), ...clone(quoteFixtures)]
    .map(normalizeQuote)
    .filter((quote) => String(quote.customer_id) === String(identity.id))
}

const localFixtureOrders = () => {
  const identity = getCustomerReadOnlyIdentity()
  return loadAdminOrderSkeletons()
    .map(normalizeOrder)
    .filter((order) => String(order.customer_id) === String(identity.id))
}

export const fetchCustomerQuotes = async () => {
  const identity = getCustomerReadOnlyIdentity()
  const headers = buildCustomerHeaders()
  if (headers || identity.token) {
    try {
      const response = await apiClient.get('/my/quotes', { params: { limit: 100, offset: 0 }, headers })
      const items = Array.isArray(response?.items) ? response.items.map(normalizeQuote) : []
      return {
        source: SOURCE_READONLY_API,
        identity,
        api_error: null,
        items,
        total: Number(response?.total || items.length)
      }
    } catch (error) {
      const items = localFixtureQuotes()
      return {
        source: SOURCE_LOCAL_DEMO,
        identity,
        api_error: error?.response?.data?.detail || error?.message || 'Customer read-only API unavailable; using local fixture fallback.',
        items,
        total: items.length
      }
    }
  }

  const items = localFixtureQuotes()
  return {
    source: SOURCE_LOCAL_DEMO,
    identity,
    api_error: 'No customer auth token or numeric local customer API fixture; using filtered local/staging fixture.',
    items,
    total: items.length
  }
}

export const fetchCustomerQuoteDetail = async (quoteId) => {
  const identity = getCustomerReadOnlyIdentity()
  const headers = buildCustomerHeaders()
  if (headers || identity.token) {
    try {
      const item = await apiClient.get(`/my/quotes/${quoteId}`, { headers })
      return {
        source: SOURCE_READONLY_API,
        identity,
        api_error: null,
        item: normalizeQuote(item)
      }
    } catch (error) {
      const list = await fetchCustomerQuotes()
      return {
        source: list.source,
        identity: list.identity,
        api_error: error?.response?.data?.detail || error?.message || list.api_error,
        item: list.items.find((quote) => String(quote.id) === String(quoteId)) || null
      }
    }
  }

  const list = await fetchCustomerQuotes()
  return {
    source: list.source,
    identity: list.identity,
    api_error: list.api_error,
    item: list.items.find((quote) => String(quote.id) === String(quoteId)) || null
  }
}

export const fetchCustomerOrders = async () => {
  const identity = getCustomerReadOnlyIdentity()
  const headers = buildCustomerHeaders()
  if (headers || identity.token) {
    try {
      const response = await apiClient.get('/my/orders', { params: { limit: 100, offset: 0 }, headers })
      const items = Array.isArray(response?.items) ? response.items.map(normalizeOrder) : []
      return {
        source: SOURCE_READONLY_API,
        identity,
        api_error: null,
        items,
        total: Number(response?.total || items.length)
      }
    } catch (error) {
      const items = localFixtureOrders()
      return {
        source: SOURCE_LOCAL_DEMO,
        identity,
        api_error: error?.response?.data?.detail || error?.message || 'Customer read-only API unavailable; using local fixture fallback.',
        items,
        total: items.length
      }
    }
  }

  const items = localFixtureOrders()
  return {
    source: SOURCE_LOCAL_DEMO,
    identity,
    api_error: 'No customer auth token or numeric local customer API fixture; using filtered local/staging fixture.',
    items,
    total: items.length
  }
}

export const fetchCustomerOrderDetail = async (orderId) => {
  const identity = getCustomerReadOnlyIdentity()
  const headers = buildCustomerHeaders()
  if (headers || identity.token) {
    try {
      const item = await apiClient.get(`/my/orders/${orderId}`, { headers })
      return {
        source: SOURCE_READONLY_API,
        identity,
        api_error: null,
        item: normalizeOrder(item)
      }
    } catch (error) {
      const list = await fetchCustomerOrders()
      return {
        source: list.source,
        identity: list.identity,
        api_error: error?.response?.data?.detail || error?.message || list.api_error,
        item: list.items.find((order) => String(order.id) === String(orderId)) || null
      }
    }
  }

  const list = await fetchCustomerOrders()
  return {
    source: list.source,
    identity: list.identity,
    api_error: list.api_error,
    item: list.items.find((order) => String(order.id) === String(orderId)) || null
  }
}

export const formatCustomerMoney = (value, currency = 'AUD') => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency || 'AUD'
  }).format(Number(value || 0))
}

export const formatCustomerDate = (value) => {
  if (!value || value === '-') return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatCustomerDateTime = (value) => {
  if (!value || value === '-') return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-AU')
}
