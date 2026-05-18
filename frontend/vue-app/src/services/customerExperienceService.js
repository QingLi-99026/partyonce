import { loadAdminOrderSkeletons } from '@/mock/adminOrders'
import apiClient from '@/api'
import { useUserStore } from '@/store'
import { normalizeQuoteLineItems } from '@/data/quoteLineItems'

const SOURCE_LOCAL_DEMO = '预览用户数据'
const SOURCE_READONLY_API = '客户只读数据'
const CUSTOMER_INTERACTION_STORAGE_KEY = 'partyonce_customer_interactions_v1'
const DEFAULT_CUSTOMER_FIXTURE = {
  id: 'customer-local-41',
  name: '预览用户',
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
  pending_deposit: '订金阶段仍为预览占位；当前不会启用真实在线支付，请等待人工确认下一步。',
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
    customer_name: '预览用户',
    customer_contact: 'ava.parent@example.test',
    theme: '梦幻城堡',
    package: '高级套餐',
    selection_snapshot: {
      theme: '梦幻城堡',
      package: '高级套餐',
      venue: '餐厅 A 私人包间',
      guest_count: 18,
      event_date: '2026-06-14'
    },
    customer_requirements: {
      food_notes: '家庭分享餐和儿童简单餐食。',
      allergy_notes: '正式报价前确认无坚果甜品选项。',
      cake_needs: '希望了解高级蛋糕或纸杯蛋糕塔。',
      parent_priorities: '照片好看、布置省心、家长负担低。'
    },
    currency: 'AUD',
    amount: 1680,
    valid_until: '2026-05-25',
    created_at: '2026-05-11T08:00:00.000Z',
    line_items: [
      { type: 'venue_fee', name: '餐厅 A 私人包间', amount: 420 },
      { type: 'decor_fee', name: '高级城堡主题布置', amount: 760 },
      { type: 'supplier_fee', name: '蛋糕和活动供应商预留', amount: 280 },
      { type: 'labor_fee', name: '布置和收场服务', amount: 160 },
      { type: 'service_fee', name: '策划服务', amount: 60 },
      {
        type: 'optional_upgrade',
        name: '拍照区 / 背景板升级',
        amount: 360,
        amount_basis: '客户选择的视觉升级，用于更好的家庭照片和分享素材。',
        customer_explanation: '增加主题拍照角、背景板、气球和主题标识。',
        admin_edit_hint: '正式报价前确认背景板尺寸、墙面权限和布置时间。'
      },
      {
        type: 'optional_upgrade',
        name: '儿童派对主持人',
        amount: 320,
        amount_basis: '客户选择的主持支持，用于游戏、切蛋糕和活动流程。',
        customer_explanation: '帮助活动更有秩序，家长不用全程自己控场。',
        admin_edit_hint: '确认主持语言、时长、流程表和人员档期。'
      }
    ]
  },
  {
    id: 'quote-local-502',
    customer_id: 'customer-local-42',
    quote_number: 'PE-Q-0502',
    status: 'sent',
    customer_name: '预览用户',
    customer_contact: 'noah.family@example.test',
    theme: '星际探险',
    package: '标准套餐',
    selection_snapshot: {
      theme: '星际探险',
      package: '标准套餐',
      venue: '海景活动包房',
      guest_count: 14,
      event_date: '2026-06-22'
    },
    customer_requirements: {
      food_notes: '轻松用餐，搭配儿童友好小食桌。',
      allergy_notes: '确认无麸质小食选项。',
      cake_needs: '可能希望自带蛋糕。',
      parent_priorities: '活动流程顺畅，布置时间清楚。'
    },
    currency: 'AUD',
    amount: 1240,
    valid_until: '2026-05-28',
    created_at: '2026-05-11T08:20:00.000Z',
    line_items: [
      { type: 'venue_fee', name: '海景活动包房', amount: 280 },
      { type: 'decor_fee', name: '标准太空主题布置', amount: 520 },
      { type: 'supplier_fee', name: '活动材料供应商预留', amount: 220 },
      { type: 'labor_fee', name: '布置和收场服务', amount: 160 },
      { type: 'transport_fee', name: '运输和搬运', amount: 60 },
      {
        type: 'optional_upgrade',
        name: '音响 / 麦克风基础包',
        amount: 180,
        amount_basis: '客户选择的音频支持，用于主持、音乐或活动提醒。',
        customer_explanation: '增加基础音响和麦克风支持，让派对流程更顺。',
        admin_edit_hint: '确认场地音量限制、电源和设备取还。'
      }
    ]
  },
  {
    id: 'quote-local-503',
    customer_id: 'customer-local-43',
    quote_number: 'PE-Q-0503',
    status: 'draft',
    customer_name: '预览用户',
    customer_contact: 'mia.parent@example.test',
    theme: '森林奇境',
    package: '基础套餐',
    selection_snapshot: {
      theme: '森林奇境',
      package: '基础套餐',
      venue: '森林主题亲子咖啡馆',
      guest_count: 10,
      event_date: '2026-07-03'
    },
    currency: 'AUD',
    amount: 780,
    valid_until: '2026-05-30',
    created_at: '2026-05-11T08:35:00.000Z',
    line_items: [
      { type: 'venue_fee', name: '森林主题亲子咖啡馆', amount: 180 },
      { type: 'decor_fee', name: '基础森林主题布置', amount: 390 },
      { type: 'labor_fee', name: '现场布置支持', amount: 120 },
      { type: 'transport_fee', name: '运输和搬运', amount: 50 },
      { type: 'service_fee', name: '策划服务', amount: 40 }
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
  const fixtureId = userInfo.customer_fixture_id ||
    userInfo.customerId ||
    (isAdminLike ? DEFAULT_CUSTOMER_FIXTURE.id : userInfo.id) ||
    DEFAULT_CUSTOMER_FIXTURE.id

  return {
    id: fixtureId,
    name: userInfo.full_name || userInfo.name || DEFAULT_CUSTOMER_FIXTURE.name,
    contact: userInfo.email || userInfo.contact || DEFAULT_CUSTOMER_FIXTURE.contact,
    role,
    token: isAdminLike ? '' : userStore.token,
    apiCustomerId: apiCustomerId && String(apiCustomerId).match(/^\d+$/) ? String(apiCustomerId) : null,
    isFixture: !userStore.token || !apiCustomerId,
    accessBoundary: isAdminLike
      ? '当前以预览用户身份查看客户页面，不使用后台管理员身份。'
      : '当前为预览用户视图，仅用于查看报价和订单说明。'
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
      customer_name: inquiry.customerInfo?.name || '预览咨询用户',
      customer_contact: inquiry.customerInfo?.contact || '-',
      theme: inquiry.selection?.themeName || '主题待确认',
      package: inquiry.selection?.packageName || '套餐待确认',
      selection_snapshot: {
        theme: inquiry.selection?.themeName || inquiry.selection?.themeId || '-',
        package: inquiry.selection?.packageName || inquiry.selection?.packageId || '-',
        venue: inquiry.selection?.sceneName || '-',
        guest_count: inquiry.customerInfo?.guestCount || '-',
        event_date: inquiry.customerInfo?.preferredDate || '-',
        party_scene_config: inquiry.party_scene_config || inquiry.selection?.party_scene_config || inquiry.aiRecommendation?.party_scene_config || null,
        customer_requirements: {
          food_notes: inquiry.customerInfo?.foodNotes || '',
          allergy_notes: inquiry.customerInfo?.allergyNotes || '',
          cultural_requirements: inquiry.customerInfo?.culturalRequirements || '',
          cake_needs: inquiry.customerInfo?.cakeNeeds || '',
          parent_priorities: inquiry.customerInfo?.parentPriorities || ''
        }
      },
      customer_requirements: {
        food_notes: inquiry.customerInfo?.foodNotes || '',
        allergy_notes: inquiry.customerInfo?.allergyNotes || '',
        cultural_requirements: inquiry.customerInfo?.culturalRequirements || '',
        cake_needs: inquiry.customerInfo?.cakeNeeds || '',
        parent_priorities: inquiry.customerInfo?.parentPriorities || ''
      },
      party_scene_config: inquiry.party_scene_config || inquiry.selection?.party_scene_config || inquiry.aiRecommendation?.party_scene_config || null,
      currency: 'AUD',
      amount: Number(inquiry.pricing?.finalTotal || 0),
      valid_until: '-',
      created_at: inquiry.submitTime || null,
      line_items: normalizeQuoteLineItems(inquiry.pricing?.lineItems || [
        { type: 'decor_fee', name: inquiry.selection?.packageName || '套餐布置项', amount: Number(inquiry.pricing?.packagePrice || 0) },
        { type: 'venue_fee', name: inquiry.selection?.sceneName || 'Scene fee', amount: Number(inquiry.pricing?.sceneFee || 0) },
        { type: 'optional_upgrade', name: '附加服务', amount: Number(inquiry.pricing?.addonsTotal || 0) }
      ]).filter((item) => item.amount > 0)
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
      event_date: snapshot.eventDate || snapshot.event_date || snapshot.preferredDate || '-',
      customer_requirements: quote.customer_requirements || snapshot.customer_requirements || {}
    },
    customer_requirements: quote.customer_requirements || snapshot.customer_requirements || {},
    party_scene_config: quote.party_scene_config || snapshot.party_scene_config || quote.aiRecommendation?.party_scene_config || null,
    currency: quote.currency || 'AUD',
    amount: Number(quote.amount || quote.final_total || quote.total_amount || 0),
    valid_until: quote.valid_until || '-',
    created_at: quote.created_at || null,
    next_step: quote.next_step || quoteNextStep[status] || '请联系 PartyOnce 顾问确认下一步。',
    line_items: normalizeQuoteLineItems(quote.line_items)
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
    deposit_note: '订金待确认只是业务状态；当前预览不会启用真实在线支付。',
    next_step: order.next_action || orderNextStep[status] || '请联系 PartyOnce 顾问确认下一步。',
    created_at: order.created_at || null,
    updated_at: order.updated_at || null,
    party_scene_config: order.party_scene_config || order.selection_snapshot?.party_scene_config || order.quote?.party_scene_config || null,
    customer_requirements: order.customer_requirements || order.selection_snapshot?.customer_requirements || order.quote?.customer_requirements || {},
    line_items: normalizeQuoteLineItems(order.line_items)
  }
}

export const quoteStatuses = quoteStatusText
export const orderStatuses = orderStatusText
export const localCustomerFixture = DEFAULT_CUSTOMER_FIXTURE

const interactionKey = (type, id) => `${type}:${id}`

const readCustomerInteractionStore = () => {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CUSTOMER_INTERACTION_STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch (error) {
    return {}
  }
}

const writeCustomerInteractionStore = (store) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CUSTOMER_INTERACTION_STORAGE_KEY, JSON.stringify(store))
}

export const getCustomerInteractionState = (type, id) => {
  const store = readCustomerInteractionStore()
  return store[interactionKey(type, id)] || {}
}

export const saveCustomerSupplementRequest = ({ type, id, note }) => {
  const cleanType = type === 'order' ? 'order' : 'quote'
  const store = readCustomerInteractionStore()
  const key = interactionKey(cleanType, id)
  const current = store[key] || {}
  const updated = {
    ...current,
    type: cleanType,
    id: String(id),
    supplement_note: String(note || '').trim(),
    supplement_saved_at: new Date().toISOString(),
    local_only: true
  }
  store[key] = updated
  writeCustomerInteractionStore(store)
  return updated
}

export const saveQuoteConfirmationPlaceholder = (quoteId) => {
  const store = readCustomerInteractionStore()
  const key = interactionKey('quote', quoteId)
  const current = store[key] || {}
  const updated = {
    ...current,
    type: 'quote',
    id: String(quoteId),
    confirmation_placeholder: true,
    confirmation_placeholder_at: new Date().toISOString(),
    confirmation_note: '已记录客户意向，仍需人工复核；不会创建真实订单、扣款或外发消息。',
    local_only: true
  }
  store[key] = updated
  writeCustomerInteractionStore(store)
  return updated
}

export const customerInteractionBoundary = {
  contactTitle: 'Need help or changes?',
  contactBody: '请在下方填写想调整的内容，团队会人工复核；不会发送外部消息或触发付款。',
  quoteConfirmation: '这里只记录客户意向，不代表正式接受报价、创建订单或启动在线支付。'
}

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
        api_error: '当前暂无可用客户接口，已显示预览用户报价。',
        items,
        total: items.length
      }
    }
  }

  const items = localFixtureQuotes()
  return {
    source: SOURCE_LOCAL_DEMO,
    identity,
    api_error: '当前为预览用户，暂无登录后的专属报价接口。',
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
        api_error: '当前暂无可用客户接口，已显示预览用户订单。',
        items,
        total: items.length
      }
    }
  }

  const items = localFixtureOrders()
  return {
    source: SOURCE_LOCAL_DEMO,
    identity,
    api_error: '当前为预览用户，暂无登录后的专属订单接口。',
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
