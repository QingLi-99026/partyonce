import apiClient from '@/api'
import { supplierDisplaySeeds, venueDisplaySeeds } from '@/data/visualAssets'

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

const priceLevelFromRange = (range = '') => {
  if (String(range).includes('2,800') || String(range).includes('850') || String(range).includes('900')) return '高'
  if (String(range).includes('160') || String(range).includes('220')) return '中'
  return '中'
}

const demoSuppliers = [
  ...venueDisplaySeeds.map((venue, index) => ({
    supplier_id: venue.id,
    name: venue.name,
    company_name: venue.name,
    category_level_1: '场地类',
    category: 'venue',
    suburb: index === 0 ? 'North Sydney' : 'Sydney',
    rating: 4.6 + (index * 0.1),
    review_count: 48 + (index * 16),
    price_level: priceLevelFromRange(venue.priceRange),
    max_capacity: Number(String(venue.capacity).match(/\d+/g)?.at(-1) || 28),
    distance_km: 0.8 + index * 2.1,
    service_tags: ['AI推荐场地', ...(venue.themeFit || []), venue.aiRecommendationRole].filter(Boolean),
    cover_image_url: venue.image_path,
    visual_context: venue
  })),
  ...supplierDisplaySeeds.map((supplier, index) => ({
    supplier_id: supplier.id,
    name: supplier.name,
    company_name: supplier.name,
    category_level_1: supplier.category,
    category: supplier.category,
    suburb: supplier.serviceArea?.split(' ')?.[0] || 'Sydney',
    rating: 4.7,
    review_count: 54 + index * 11,
    price_level: priceLevelFromRange(supplier.priceRange),
    max_capacity: 120,
    distance_km: 3.2 + index,
    service_tags: [supplier.quoteRole, ...(supplier.supportedThemes || []), ...(supplier.supportedTiers || [])].filter(Boolean),
    cover_image_url: supplier.image_path,
    visual_context: supplier
  }))
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
  const enableRemoteSupplierApi = import.meta.env.VITE_SUPPLIER_REMOTE_API === 'true'
  if (!enableRemoteSupplierApi) {
    return listLocalSupplierDisplayItems(params)
  }

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
