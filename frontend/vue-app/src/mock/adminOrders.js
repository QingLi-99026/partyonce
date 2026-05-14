const STORAGE_KEY = 'partyEventAdminOrderSkeleton'

const now = new Date().toISOString()

const seedOrders = [
  {
    id: 'order-local-1001',
    order_number: 'PE-ORD-1001',
    status: 'draft',
    customer: {
      id: 'customer-local-41',
      name: 'Ava Thompson',
      contact: 'ava.parent@example.test',
      phone: '+61 400 100 201'
    },
    quote: {
      id: 'quote-local-501',
      quote_number: 'PE-Q-0501',
      status: 'accepted',
      lead_id: 'lead-local-301'
    },
    event: {
      date: '2026-06-14',
      location: 'Sydney Kids Studio Room A',
      theme: 'Castle Princess',
      package_tier: 'Premium',
      guest_count: 18
    },
    currency: 'AUD',
    total_amount: 1680,
    deposit_amount: 420,
    deposit_status: 'not_started',
    payment_reference: null,
    owner: 'Ops review',
    next_action: 'Confirm event timing and parent contact details',
    internal_note: 'Local-only skeleton record. No payment or outbound message is triggered.',
    created_at: '2026-05-11T08:00:00.000Z',
    updated_at: now,
    status_flow: [
      { status: 'draft', label: 'Draft order created from accepted Quote', completed: true },
      { status: 'pending_deposit', label: 'Deposit request prepared, payment still blocked', completed: false },
      { status: 'confirmed', label: 'Manual operation confirmation', completed: false },
      { status: 'in_progress', label: 'Event preparation', completed: false },
      { status: 'completed', label: 'Event completed', completed: false }
    ],
    line_items: [
      { type: 'venue_fee', name: 'Sydney Kids Studio Room A', amount: 420 },
      { type: 'decor_fee', name: 'Premium castle room styling', amount: 760 },
      { type: 'supplier_fee', name: 'Cake and activity station supplier allowance', amount: 280 },
      { type: 'labor_fee', name: 'Setup and pack-down', amount: 160 },
      { type: 'service_fee', name: 'Planning service', amount: 60 }
    ]
  },
  {
    id: 'order-local-1002',
    order_number: 'PE-ORD-1002',
    status: 'pending_deposit',
    customer: {
      id: 'customer-local-42',
      name: 'Noah Chen',
      contact: 'noah.family@example.test',
      phone: '+61 400 100 202'
    },
    quote: {
      id: 'quote-local-502',
      quote_number: 'PE-Q-0502',
      status: 'accepted',
      lead_id: 'lead-local-302'
    },
    event: {
      date: '2026-06-22',
      location: 'Harbour View Function Room',
      theme: 'Space Explorer',
      package_tier: 'Standard',
      guest_count: 14
    },
    currency: 'AUD',
    total_amount: 1240,
    deposit_amount: 310,
    deposit_status: 'not_started',
    payment_reference: null,
    owner: 'Manager review',
    next_action: 'Prepare deposit instructions after payment stage is approved',
    internal_note: 'Keep deposit_paid disabled until Stripe/payment stage.',
    created_at: '2026-05-11T08:20:00.000Z',
    updated_at: now,
    status_flow: [
      { status: 'draft', label: 'Draft order created', completed: true },
      { status: 'pending_deposit', label: 'Waiting for future deposit workflow', completed: true },
      { status: 'confirmed', label: 'Manual operation confirmation', completed: false },
      { status: 'in_progress', label: 'Event preparation', completed: false },
      { status: 'completed', label: 'Event completed', completed: false }
    ],
    line_items: [
      { type: 'venue_fee', name: 'Harbour View Function Room', amount: 280 },
      { type: 'decor_fee', name: 'Standard space room styling', amount: 520 },
      { type: 'supplier_fee', name: 'Activity materials supplier allowance', amount: 220 },
      { type: 'labor_fee', name: 'Setup and pack-down', amount: 160 },
      { type: 'transport_fee', name: 'Transport and handling', amount: 60 }
    ]
  },
  {
    id: 'order-local-1003',
    order_number: 'PE-ORD-1003',
    status: 'confirmed',
    customer: {
      id: 'customer-local-43',
      name: 'Mia Williams',
      contact: 'mia.parent@example.test',
      phone: '+61 400 100 203'
    },
    quote: {
      id: 'quote-local-503',
      quote_number: 'PE-Q-0503',
      status: 'converted_to_order',
      lead_id: 'lead-local-303'
    },
    event: {
      date: '2026-07-03',
      location: 'Forest Play Cafe',
      theme: 'Forest Adventure',
      package_tier: 'Basic',
      guest_count: 10
    },
    currency: 'AUD',
    total_amount: 780,
    deposit_amount: 195,
    deposit_status: 'not_started',
    payment_reference: null,
    owner: 'Ops confirmed',
    next_action: 'Confirm supplier availability manually',
    internal_note: 'Confirmed is an operational skeleton status only, not a payment confirmation.',
    created_at: '2026-05-11T08:35:00.000Z',
    updated_at: now,
    status_flow: [
      { status: 'draft', label: 'Draft order created', completed: true },
      { status: 'pending_deposit', label: 'Deposit stage prepared', completed: true },
      { status: 'confirmed', label: 'Operations confirmed manually', completed: true },
      { status: 'in_progress', label: 'Event preparation', completed: false },
      { status: 'completed', label: 'Event completed', completed: false }
    ],
    line_items: [
      { type: 'venue_fee', name: 'Forest Play Cafe', amount: 180 },
      { type: 'decor_fee', name: 'Basic forest theme styling', amount: 390 },
      { type: 'labor_fee', name: 'Local setup support', amount: 120 },
      { type: 'transport_fee', name: 'Transport and handling', amount: 50 },
      { type: 'service_fee', name: 'Planning service', amount: 40 }
    ]
  }
]

export const orderStatuses = ['draft', 'pending_deposit', 'confirmed', 'in_progress', 'completed', 'cancelled']

export const blockedOrderActions = [
  'deposit_paid',
  'Stripe checkout',
  'PaymentIntent',
  'webhook/n8n',
  'email/SMS/WhatsApp',
  'supplier dispatch',
  'contract generation'
]

const clone = (value) => JSON.parse(JSON.stringify(value))

const readStoredOrders = () => {
  if (typeof window === 'undefined') return clone(seedOrders)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return clone(seedOrders)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : clone(seedOrders)
  } catch (error) {
    return clone(seedOrders)
  }
}

const writeStoredOrders = (orders) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export const loadAdminOrderSkeletons = () => readStoredOrders()

export const resetAdminOrderSkeletons = () => {
  const orders = clone(seedOrders)
  writeStoredOrders(orders)
  return orders
}

export const getAdminOrderSkeleton = (orderId) => {
  return readStoredOrders().find((order) => String(order.id) === String(orderId)) || null
}

const buildStatusFlow = (status) => {
  const flow = ['draft', 'pending_deposit', 'confirmed', 'in_progress', 'completed']
  const currentIndex = flow.indexOf(status)
  return flow.map((item, index) => ({
    status: item,
    label: item === 'pending_deposit' ? 'Deposit stage prepared, payment still blocked' : `Order ${item}`,
    completed: currentIndex >= index && currentIndex !== -1
  }))
}

const buildFallbackOrderSkeleton = (orderId, base = {}, patch = {}) => {
  const nowValue = new Date().toISOString()
  const status = patch.status || base.status || 'draft'
  return {
    id: String(orderId),
    order_number: base.order_number || `LOCAL-FALLBACK-${orderId}`,
    status,
    customer: {
      id: base.customer?.id || base.customer_id || 'local-fallback-customer',
      name: base.customer?.name || base.customer_summary?.name || base.customer_name || 'Local fallback customer',
      contact: base.customer?.contact || base.customer_summary?.contact || base.customer_summary?.email || base.customer_contact || 'local-fallback@example.test',
      phone: base.customer?.phone || base.customer_phone || '-'
    },
    quote: {
      id: base.quote?.id || base.quote_id || 'local-fallback-quote',
      quote_number: base.quote?.quote_number || base.quote_number || 'LOCAL-FALLBACK-QUOTE',
      status: base.quote?.status || base.quote_status || 'accepted',
      lead_id: base.quote?.lead_id || base.lead_id || 'local-fallback-lead'
    },
    event: {
      date: base.event?.date || base.event_date || '-',
      location: base.event?.location || base.event_location || 'Local fallback venue',
      theme: base.event?.theme || base.selection_snapshot?.themeName || base.selection_snapshot?.theme || 'Local fallback theme',
      package_tier: base.event?.package_tier || base.selection_snapshot?.packageName || base.selection_snapshot?.package || 'Local fallback package',
      guest_count: base.event?.guest_count || base.selection_snapshot?.guestCount || '-'
    },
    currency: base.currency || 'AUD',
    total_amount: Number(base.total_amount || base.final_total || 0),
    deposit_amount: Number(base.deposit_amount || 0),
    deposit_status: base.deposit_status || 'not_started',
    payment_reference: null,
    owner: base.owner || base.owner_user_id || 'Fallback review',
    next_action: base.next_action || 'Review fallback Order after local API is available',
    internal_note: base.internal_note || base.skeleton_notice || 'Generated local fallback Order after local API update failed. No external action was triggered.',
    created_at: base.created_at || nowValue,
    updated_at: nowValue,
    confirmed_at: base.confirmed_at || null,
    status_flow: Array.isArray(base.status_flow) ? base.status_flow : buildStatusFlow(status),
    line_items: Array.isArray(base.line_items) ? base.line_items : []
  }
}

export const updateAdminOrderSkeleton = (orderId, patch, base = null) => {
  const orders = readStoredOrders()
  const index = orders.findIndex((order) => String(order.id) === String(orderId))
  if (index === -1) {
    const fallback = {
      ...buildFallbackOrderSkeleton(orderId, base || {}, patch),
      ...patch,
      updated_at: new Date().toISOString()
    }
    fallback.status_flow = buildStatusFlow(fallback.status)
    orders.unshift(fallback)
    writeStoredOrders(orders)
    return fallback
  }
  orders[index] = {
    ...orders[index],
    ...patch,
    updated_at: new Date().toISOString()
  }
  if (patch.status) {
    orders[index].status_flow = buildStatusFlow(patch.status)
  }
  writeStoredOrders(orders)
  return orders[index]
}
