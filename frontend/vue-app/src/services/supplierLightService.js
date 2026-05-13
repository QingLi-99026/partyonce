import apiClient from '@/api'

const APPLICATIONS_KEY = 'partyonce_supplier_applications_v1'
const SOURCE_LOCAL = 'local/staging supplier fixture'
const SOURCE_REMOTE = 'remote staging supplier API'

const categoryLabels = {
  venue: '场地租赁',
  catering: '餐饮服务',
  decoration: '装饰布置',
  photography: '摄影摄像',
  entertainment: '娱乐表演',
  other: '其他服务'
}

const statusLabels = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  needs_info: '需补充资料'
}

const demoSuppliers = [
  {
    supplier_id: 'demo-supplier-1',
    name: '悉尼儿童派对中心',
    company_name: 'Sydney Kids Party Centre',
    category_level_1: '场地类',
    category: 'venue',
    suburb: 'North Sydney',
    rating: 4.8,
    review_count: 127,
    price_level: '中',
    max_capacity: 50,
    distance_km: 0.5,
    service_tags: ['儿童生日', '室内场地', '周末可用'],
    cover_image_url: ''
  },
  {
    supplier_id: 'demo-supplier-2',
    name: 'Manly 海滨派对屋',
    company_name: 'Manly Beach Party House',
    category_level_1: '场地类',
    category: 'venue',
    suburb: 'Manly',
    rating: 4.6,
    review_count: 89,
    price_level: '高',
    max_capacity: 80,
    distance_km: 8.2,
    service_tags: ['海景', '家庭聚会', '高端场地'],
    cover_image_url: ''
  },
  {
    supplier_id: 'demo-supplier-3',
    name: 'Little Star 主题布置',
    company_name: 'Little Star Styling',
    category_level_1: '装饰布置',
    category: 'decoration',
    suburb: 'Chatswood',
    rating: 4.7,
    review_count: 54,
    price_level: '中',
    max_capacity: 120,
    distance_km: 5.4,
    service_tags: ['主题气球', '儿童桌布置', '公主主题'],
    cover_image_url: ''
  }
]

const clone = (value) => JSON.parse(JSON.stringify(value))

const readApplications = () => {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(APPLICATIONS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

const writeApplications = (items) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(items))
}

const nowIso = () => new Date().toISOString()

const normalizeApplication = (application) => ({
  id: String(application.id || application.application_id || `partner-${Date.now()}`),
  company_name: application.company_name || '-',
  category: application.category || application.business_type || application.service_categories?.[0] || 'other',
  contact_name: application.contact_name || '-',
  contact_phone: application.contact_phone || '-',
  email: application.email || application.contact_email || '-',
  service_area: application.service_area || application.service_areas || [],
  abn_optional: application.abn_optional || application.business_registration_number || '',
  status: application.status || 'pending',
  review_note: application.review_note || '',
  reject_reason: application.reject_reason || application.rejection_reason || '',
  reviewed_at: application.reviewed_at || null,
  category_label: categoryLabels[application.category || application.business_type] || application.category || application.business_type || '其他服务',
  source: application.source || SOURCE_LOCAL,
  created_at: application.created_at || nowIso(),
  updated_at: application.updated_at || application.created_at || nowIso()
})

const seedDemoApplication = () => ({
  id: 'partner-local-1001',
  company_name: 'Little Star Styling',
  category: 'decoration',
  contact_name: 'Emma Li',
  contact_phone: '+61 400 000 101',
  email: 'supplier.demo@example.test',
  service_area: ['悉尼', 'North Sydney'],
  abn_optional: 'Demo ABN',
  status: 'pending',
  review_note: 'Local/staging demo application waiting for admin review.',
  reject_reason: '',
  source: SOURCE_LOCAL,
  created_at: '2026-05-12T09:00:00.000Z',
  updated_at: '2026-05-12T09:00:00.000Z'
})

export const supplierStatusLabels = statusLabels
export const supplierCategoryLabels = categoryLabels

const listLocalSupplierDisplayItems = (params = {}) => {
  const category = params.category || ''
  const suburb = String(params.suburb || '').toLowerCase()
  const price = params.price_level || ''
  const items = clone(demoSuppliers).filter((supplier) => {
    const matchesCategory = !category || supplier.category_level_1 === category || supplier.category === category
    const matchesSuburb = !suburb || String(supplier.suburb || '').toLowerCase().includes(suburb)
    const matchesPrice = !price || supplier.price_level === price
    return matchesCategory && matchesSuburb && matchesPrice
  })
  return { source: SOURCE_LOCAL, items }
}

export const listSupplierDisplayItems = async (params = {}) => {
  try {
    const response = await apiClient.get('/suppliers', { params })
    const items = Array.isArray(response) ? response : []
    if (items.length > 0) {
      return { source: SOURCE_REMOTE, items }
    }
    const unfilteredResponse = await apiClient.get('/suppliers')
    const unfilteredItems = Array.isArray(unfilteredResponse) ? unfilteredResponse : []
    return { source: SOURCE_REMOTE, items: unfilteredItems }
  } catch (error) {
    // Fall back to local/staging fixture so preview smoke remains inspectable if the API is unavailable.
  }
  return listLocalSupplierDisplayItems(params)
}

export const createSupplierApplication = async (form) => {
  const application = normalizeApplication({
    ...form,
    id: `partner-local-${Date.now()}`,
    status: 'pending',
    review_note: 'Application submitted in local/staging mode. No outbound message was sent.',
    source: SOURCE_LOCAL,
    created_at: nowIso(),
    updated_at: nowIso()
  })
  const items = readApplications().filter((item) => item.email !== application.email)
  items.unshift(application)
  writeApplications(items)
  return { source: SOURCE_LOCAL, item: application }
}

export const getSupplierApplicationByEmail = async (email) => {
  const cleanEmail = String(email || '').trim().toLowerCase()
  const local = readApplications()
    .map(normalizeApplication)
    .find((item) => String(item.email || '').toLowerCase() === cleanEmail)
  if (local) return { source: SOURCE_LOCAL, item: local }
  const demo = seedDemoApplication()
  if (String(demo.email).toLowerCase() === cleanEmail) return { source: SOURCE_LOCAL, item: demo }
  return { source: SOURCE_LOCAL, item: null }
}

export const listSupplierApplications = async (filters = {}) => {
  let items = readApplications().map(normalizeApplication)
  if (!items.some((item) => item.id === 'partner-local-1001')) {
    items = [seedDemoApplication(), ...items]
  }
  if (filters.status) items = items.filter((item) => item.status === filters.status)
  if (filters.category) items = items.filter((item) => item.category === filters.category)
  if (filters.keyword) {
    const query = String(filters.keyword).toLowerCase()
    items = items.filter((item) => [
      item.company_name,
      item.contact_name,
      item.email,
      item.contact_phone
    ].filter(Boolean).join(' ').toLowerCase().includes(query))
  }
  return {
    source: SOURCE_LOCAL,
    items,
    total: items.length
  }
}

export const updateSupplierApplicationReview = async (id, patch) => {
  const normalizedId = String(id)
  const items = readApplications().map(normalizeApplication)
  const withSeed = items.some((item) => item.id === 'partner-local-1001') ? items : [seedDemoApplication(), ...items]
  const updatedItems = withSeed.map((item) => {
    if (String(item.id) !== normalizedId) return item
    return normalizeApplication({
      ...item,
      ...patch,
      review_note: patch.review_note ?? item.review_note,
      reject_reason: patch.reject_reason ?? patch.rejection_reason ?? item.reject_reason,
      reviewed_at: nowIso(),
      updated_at: nowIso()
    })
  })
  writeApplications(updatedItems)
  const updated = updatedItems.find((item) => String(item.id) === normalizedId)
  return { source: SOURCE_LOCAL, item: updated || null }
}
