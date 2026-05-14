const SUBMISSIONS_KEY = 'partyonce_social_reward_submissions_v1'
const VOUCHERS_KEY = 'partyonce_social_reward_vouchers_v1'

export const SOCIAL_REWARD_SOURCE = 'local/staging social rewards fixture'

export const rewardPointRules = [
  {
    id: 'ugc_share_submission',
    label: 'Share submission',
    points: 20,
    status: 'pending_review',
    customerText: 'Submit a party photo, caption, or social post link for review.'
  },
  {
    id: 'ugc_approved',
    label: 'Approved UGC share',
    points: 120,
    status: 'approved',
    customerText: 'Awarded after the team approves the shared content.'
  },
  {
    id: 'venue_tag_bonus',
    label: 'Venue / theme tag bonus',
    points: 30,
    status: 'approved',
    customerText: 'Bonus when the post clearly mentions the theme, venue, or PartyOnce.'
  },
  {
    id: 'referral_placeholder',
    label: 'Referral placeholder',
    points: 80,
    status: 'future',
    customerText: 'Future referral reward. Not connected to external tracking in staging.'
  }
]

export const voucherPlaceholders = [
  {
    id: 'voucher-500-20',
    title: '$20 party upgrade voucher',
    pointsRequired: 500,
    value: '$20',
    status: 'placeholder',
    terms: 'Staging placeholder only. Not redeemable, not connected to payment, and not sent externally.'
  },
  {
    id: 'voucher-1000-dessert',
    title: 'Dessert table upgrade placeholder',
    pointsRequired: 1000,
    value: 'Dessert styling upgrade',
    status: 'placeholder',
    terms: 'Requires future production approval and supplier confirmation.'
  }
]

const nowIso = () => new Date().toISOString()
const clone = (value) => JSON.parse(JSON.stringify(value))

const safeRead = (key, fallback = []) => {
  if (typeof window === 'undefined') return fallback
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback))
    return Array.isArray(parsed) ? parsed : fallback
  } catch (error) {
    return fallback
  }
}

const safeWrite = (key, value) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export const buildDemoShareText = (order = {}) => {
  const theme = order.theme || order.event?.theme || 'Castle Princess'
  const venue = order.event_location || order.event?.location || 'Restaurant A'
  return `We planned a ${theme} party with PartyOnce at ${venue}. The preview helped us understand the theme, quote, and next steps.`
}

export const normalizeRewardSubmission = (item = {}) => ({
  id: String(item.id || `ugc-${Date.now()}`),
  customer_id: item.customer_id || item.customerId || 'customer-local-41',
  customer_name: item.customer_name || item.customerName || 'Local Demo Customer',
  order_id: item.order_id || item.orderId || '',
  order_number: item.order_number || item.orderNumber || '',
  channel: item.channel || 'instagram',
  post_url: item.post_url || item.postUrl || '',
  caption: item.caption || '',
  permission_to_reuse: Boolean(item.permission_to_reuse ?? item.permissionToReuse),
  includes_partyonce_tag: Boolean(item.includes_partyonce_tag ?? item.includesPartyOnceTag),
  includes_venue_or_theme: Boolean(item.includes_venue_or_theme ?? item.includesVenueOrTheme),
  status: item.status || 'pending_review',
  points_pending: Number(item.points_pending ?? rewardPointRules[0].points),
  points_awarded: Number(item.points_awarded || 0),
  voucher_placeholder_id: item.voucher_placeholder_id || '',
  review_note: item.review_note || '',
  created_at: item.created_at || nowIso(),
  updated_at: item.updated_at || item.created_at || nowIso(),
  reviewed_at: item.reviewed_at || null,
  source: item.source || SOCIAL_REWARD_SOURCE
})

export const listRewardSubmissions = (customerId = null) => {
  const items = safeRead(SUBMISSIONS_KEY).map(normalizeRewardSubmission)
  if (!customerId) return clone(items)
  return clone(items.filter((item) => String(item.customer_id) === String(customerId)))
}

export const createRewardSubmission = (payload = {}) => {
  const item = normalizeRewardSubmission({
    ...payload,
    id: `ugc-${Date.now()}`,
    status: 'pending_review',
    points_pending: rewardPointRules[0].points,
    points_awarded: 0,
    review_note: 'Waiting for local/staging admin review. No outbound message was sent.'
  })
  const items = [item, ...safeRead(SUBMISSIONS_KEY).map(normalizeRewardSubmission)]
  safeWrite(SUBMISSIONS_KEY, items)
  return clone(item)
}

export const reviewRewardSubmission = (id, patch = {}) => {
  const items = safeRead(SUBMISSIONS_KEY).map(normalizeRewardSubmission)
  const reviewed = items.map((item) => {
    if (String(item.id) !== String(id)) return item
    const approved = patch.status === 'approved'
    const tagBonus = approved && item.includes_venue_or_theme ? rewardPointRules.find((rule) => rule.id === 'venue_tag_bonus').points : 0
    const pointsAwarded = approved ? rewardPointRules.find((rule) => rule.id === 'ugc_approved').points + tagBonus : 0
    return normalizeRewardSubmission({
      ...item,
      status: patch.status || item.status,
      points_pending: approved ? 0 : item.points_pending,
      points_awarded: pointsAwarded,
      voucher_placeholder_id: approved ? patch.voucher_placeholder_id || item.voucher_placeholder_id : '',
      review_note: patch.review_note || item.review_note,
      updated_at: nowIso(),
      reviewed_at: nowIso()
    })
  })
  safeWrite(SUBMISSIONS_KEY, reviewed)
  return clone(reviewed.find((item) => String(item.id) === String(id)))
}

export const getRewardSummary = (customerId = 'customer-local-41') => {
  const submissions = listRewardSubmissions(customerId)
  const approvedPoints = submissions.reduce((sum, item) => sum + Number(item.points_awarded || 0), 0)
  const pendingPoints = submissions.reduce((sum, item) => sum + Number(item.points_pending || 0), 0)
  const availableVouchers = voucherPlaceholders.filter((voucher) => approvedPoints >= voucher.pointsRequired)
  return {
    source: SOCIAL_REWARD_SOURCE,
    approvedPoints,
    pendingPoints,
    submissions,
    rewardPointRules: clone(rewardPointRules),
    voucherPlaceholders: clone(voucherPlaceholders),
    availableVouchers
  }
}

export const seedRewardDemoIfEmpty = () => {
  const existing = safeRead(SUBMISSIONS_KEY)
  if (existing.length) return
  safeWrite(SUBMISSIONS_KEY, [
    normalizeRewardSubmission({
      id: 'ugc-local-1001',
      customer_id: 'customer-local-41',
      customer_name: 'Local Demo Customer',
      order_id: 'order-local-1001',
      order_number: 'PO-LOCAL-1001',
      channel: 'instagram',
      post_url: 'https://example.test/staging-social-post',
      caption: 'Castle Princess party preview with Restaurant A staging render.',
      permission_to_reuse: true,
      includes_partyonce_tag: true,
      includes_venue_or_theme: true,
      status: 'approved',
      points_pending: 0,
      points_awarded: 150,
      voucher_placeholder_id: '',
      review_note: 'Seed approved UGC reward for local/staging review.',
      reviewed_at: '2026-05-14T00:00:00.000Z',
      created_at: '2026-05-14T00:00:00.000Z',
      updated_at: '2026-05-14T00:00:00.000Z'
    })
  ])
  safeWrite(VOUCHERS_KEY, voucherPlaceholders)
}
