import apiClient from '@/api'
import {
  getAdminOrderSkeleton,
  loadAdminOrderSkeletons,
  resetAdminOrderSkeletons,
  updateAdminOrderSkeleton
} from '@/mock/adminOrders'
import { normalizeQuoteLineItems } from '@/data/quoteLineItems'

export const ORDER_SOURCE_API = 'local API'
export const ORDER_SOURCE_FALLBACK = 'fallback mock'
export const ORDER_SOURCE_MIXED_FALLBACK = 'mixed fallback'
export const ORDER_SOURCE_STATIC_PREVIEW_FALLBACK = 'static preview fallback'

const shouldUseStaticPreviewFallback = () => {
  if (typeof window === 'undefined') return false
  if (import.meta.env.VITE_ENABLE_REMOTE_ORDER_API === 'true') return false
  const isVercelPreview = /vercel\.app$/i.test(window.location.hostname)
  const isViteStaticPreview = /^417\d$/.test(window.location.port)
  return isVercelPreview || isViteStaticPreview
}

const normalizeCustomer = (order) => {
  const customer = order.customer || order.customer_summary || {}
  return {
    id: order.customer_id || customer.id || '-',
    name: customer.name || order.customer_name || '-',
    contact: customer.contact || customer.email || order.customer_contact || '-',
    phone: customer.phone || order.customer_phone || '-'
  }
}

const normalizeQuote = (order) => {
  const quote = order.quote || order.quote_summary || {}
  return {
    id: order.quote_id || quote.id || '-',
    quote_number: quote.quote_number || order.quote_number || '-',
    status: quote.status || order.quote_status || '-',
    lead_id: order.lead_id || quote.lead_id || '-'
  }
}

const normalizeEvent = (order) => {
  const event = order.event || {}
  return {
    date: order.event_date || event.date || '-',
    location: order.event_location || event.location || '-',
    theme: event.theme || order.theme || order.selection_snapshot?.themeName || order.selection_snapshot?.theme || 'Snapshot pending',
    package_tier: event.package_tier || order.package_tier || order.selection_snapshot?.packageName || order.selection_snapshot?.package || 'Snapshot pending',
    guest_count: event.guest_count || order.guest_count || order.selection_snapshot?.guestCount || '-'
  }
}

const normalizeStatusFlow = (order) => {
  if (Array.isArray(order.status_flow)) return order.status_flow
  const statuses = ['draft', 'pending_deposit', 'confirmed', 'in_progress', 'completed']
  const currentIndex = statuses.indexOf(order.status)
  return statuses.map((status, index) => ({
    status,
    label: status === 'pending_deposit' ? 'Deposit stage prepared, payment still blocked' : `Order ${status}`,
    completed: currentIndex >= index && currentIndex !== -1
  }))
}

export const normalizeAdminOrder = (order) => ({
  id: String(order.id),
  order_number: order.order_number || `Order #${order.id}`,
  status: order.status || 'draft',
  customer: normalizeCustomer(order),
  quote: normalizeQuote(order),
  event: normalizeEvent(order),
  currency: order.currency || 'AUD',
  total_amount: Number(order.total_amount || order.final_total || 0),
  deposit_amount: Number(order.deposit_amount || 0),
  deposit_status: order.deposit_status || 'not_started',
  payment_reference: order.payment_reference || null,
  owner: order.owner_label || order.owner || order.owner_user_id || 'Ops review',
  owner_user_id: order.owner_user_id || null,
  owner_label: order.owner_label || order.owner || '',
  next_action: order.next_action || 'Review order details manually',
  internal_note: order.internal_notes || order.internal_note || order.intake_notes || order.skeleton_notice || 'Local/staging Order skeleton only.',
  created_at: order.created_at || null,
  updated_at: order.updated_at || null,
  confirmed_at: order.confirmed_at || null,
  status_flow: normalizeStatusFlow(order),
  line_items: normalizeQuoteLineItems(order.line_items)
})

const fallbackList = (error, source = ORDER_SOURCE_FALLBACK) => ({
  source,
  error,
  items: loadAdminOrderSkeletons().map(normalizeAdminOrder),
  total: loadAdminOrderSkeletons().length
})

export const fetchAdminOrders = async (params = {}) => {
  if (shouldUseStaticPreviewFallback()) {
    return fallbackList(
      new Error('Static Preview uses local/staging fallback data for Admin Orders unless VITE_ENABLE_REMOTE_ORDER_API=true.'),
      ORDER_SOURCE_STATIC_PREVIEW_FALLBACK
    )
  }
  try {
    const response = await apiClient.get('/orders', { params })
    const items = Array.isArray(response?.items) ? response.items.map(normalizeAdminOrder) : []
    return {
      source: ORDER_SOURCE_API,
      error: null,
      items,
      total: Number(response?.total || items.length)
    }
  } catch (error) {
    return fallbackList(error)
  }
}

export const fetchAdminOrderDetail = async (orderId) => {
  if (shouldUseStaticPreviewFallback()) {
    const item = getAdminOrderSkeleton(orderId) || updateAdminOrderSkeleton(orderId, {}, { id: orderId })
    return {
      source: ORDER_SOURCE_STATIC_PREVIEW_FALLBACK,
      error: new Error('Static Preview uses local/staging fallback data for Admin Order Detail unless VITE_ENABLE_REMOTE_ORDER_API=true.'),
      item: normalizeAdminOrder(item)
    }
  }
  try {
    const response = await apiClient.get(`/orders/${orderId}`)
    return {
      source: ORDER_SOURCE_API,
      error: null,
      item: normalizeAdminOrder(response)
    }
  } catch (error) {
    const item = getAdminOrderSkeleton(orderId) || updateAdminOrderSkeleton(orderId, {}, { id: orderId })
    return {
      source: ORDER_SOURCE_FALLBACK,
      error,
      item: normalizeAdminOrder(item)
    }
  }
}

export const updateAdminOrderStatus = async (order, status, source) => {
  if (source === ORDER_SOURCE_API) {
    try {
      const response = await apiClient.patch(`/orders/${order.id}`, { status })
      return {
        source: ORDER_SOURCE_API,
        error: null,
        item: normalizeAdminOrder(response)
      }
    } catch (error) {
      const updated = updateAdminOrderSkeleton(order.id, { status }, order)
      return {
        source: ORDER_SOURCE_MIXED_FALLBACK,
        error,
        item: normalizeAdminOrder(updated)
      }
    }
  }

  const updated = updateAdminOrderSkeleton(order.id, { status }, order)
  return {
    source: ORDER_SOURCE_FALLBACK,
    error: null,
    item: normalizeAdminOrder(updated)
  }
}

export const updateAdminOrderOperations = async (order, patch, source) => {
  const normalizedPatch = { ...patch }
  if (normalizedPatch.internal_note !== undefined) {
    normalizedPatch.internal_notes = normalizedPatch.internal_note
    delete normalizedPatch.internal_note
  }
  if (normalizedPatch.owner !== undefined) {
    normalizedPatch.owner_label = normalizedPatch.owner
    delete normalizedPatch.owner
  }

  if (source === ORDER_SOURCE_API) {
    try {
      const response = await apiClient.patch(`/orders/${order.id}`, normalizedPatch)
      return {
        source: ORDER_SOURCE_API,
        error: null,
        item: normalizeAdminOrder(response)
      }
    } catch (error) {
      const fallbackPatch = {
        ...patch,
        internal_note: patch.internal_note ?? patch.internal_notes
      }
      const updated = updateAdminOrderSkeleton(order.id, fallbackPatch, order)
      return {
        source: ORDER_SOURCE_MIXED_FALLBACK,
        error,
        item: normalizeAdminOrder(updated)
      }
    }
  }

  const updated = updateAdminOrderSkeleton(order.id, patch, order)
  return {
    source: ORDER_SOURCE_FALLBACK,
    error: null,
    item: normalizeAdminOrder(updated)
  }
}

export const resetAdminOrderFallback = () => resetAdminOrderSkeletons().map(normalizeAdminOrder)

export const createDraftOrderFromQuote = async (quote) => {
  if (!quote || quote.status !== 'accepted') {
    return {
      source: ORDER_SOURCE_API,
      error: new Error('Draft Order can only be created from an accepted Quote.'),
      item: null
    }
  }

  try {
    const response = await apiClient.post('/orders', {
      quote_id: String(quote.id),
      event_date: quote.selection_snapshot?.eventDate || quote.selection_snapshot?.preferredDate || null,
      event_location: quote.selection_snapshot?.venueName || quote.selection_snapshot?.venue || null,
      internal_notes: 'Created from Admin Quote Detail local/staging action. No payment or outbound action triggered.'
    })
    return {
      source: ORDER_SOURCE_API,
      error: null,
      item: normalizeAdminOrder(response)
    }
  } catch (error) {
    return {
      source: ORDER_SOURCE_API,
      error,
      item: null
    }
  }
}
