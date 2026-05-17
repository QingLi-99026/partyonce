const SUBMISSIONS_KEY = 'partyonce_social_reward_submissions_v1'
const VOUCHERS_KEY = 'partyonce_social_reward_vouchers_v1'

export const SOCIAL_REWARD_SOURCE = 'local/staging social rewards fixture'

export const rewardPointRules = [
  {
    id: 'ugc_share_submission',
    label: 'Share submission',
    points: 20,
    status: 'pending_review',
    customerText: 'Share from your own account, then submit a post link or screenshot note for review.'
  },
  {
    id: 'ugc_approved',
    label: 'Approved UGC share',
    points: 120,
    status: 'approved',
    customerText: 'Approval can unlock a fixed voucher or free upgrade placeholder in this preview.'
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
    customerText: 'Future version: when a friend submits a quote, both sides can receive a fixed reward.'
  }
]

export const voucherPlaceholders = [
  {
    id: 'voucher-500-20',
    title: '$30 party upgrade voucher',
    pointsRequired: 120,
    value: '$30',
    status: 'placeholder',
    terms: 'Staging placeholder only. Not redeemable, not connected to payment, and not sent externally.'
  },
  {
    id: 'voucher-balloon-upgrade',
    title: 'Free balloon upgrade placeholder',
    pointsRequired: 120,
    value: 'Balloon upgrade',
    status: 'placeholder',
    terms: 'A future production reward could upgrade a small balloon cluster to a stronger visual moment.'
  },
  {
    id: 'voucher-photo-corner',
    title: 'Free photo-corner upgrade placeholder',
    pointsRequired: 150,
    value: 'Photo corner upgrade',
    status: 'placeholder',
    terms: 'Requires future production approval and supplier confirmation.'
  }
]

export const fixedRewardOffers = [
  {
    id: 'offer-30-voucher',
    title: '$30 party voucher',
    shortTitle: '$30 voucher',
    trigger: 'Approved share proof or future friend quote submission',
    customerText: 'Use as a simple future party discount after manual review.',
    adminCheck: 'Confirm post/proof is real and mentions Party Event or the selected venue/theme.',
    voucher_placeholder_id: 'voucher-500-20'
  },
  {
    id: 'offer-balloon-upgrade',
    title: 'Free balloon upgrade',
    shortTitle: 'Balloon upgrade',
    trigger: 'Approved photo/video share with visible party setup',
    customerText: 'Upgrade a small balloon cluster to a stronger visual moment in a future quote.',
    adminCheck: 'Confirm the share includes clear party visuals and customer permission to reuse.',
    voucher_placeholder_id: 'voucher-balloon-upgrade'
  },
  {
    id: 'offer-photo-corner',
    title: 'Free photo-corner upgrade',
    shortTitle: 'Photo-corner upgrade',
    trigger: 'Approved share plus theme/venue mention',
    customerText: 'Add a simple photo-corner upgrade placeholder after manual approval.',
    adminCheck: 'Confirm theme or venue is mentioned and the proof is reviewable.',
    voucher_placeholder_id: 'voucher-photo-corner'
  }
]

export const socialSharePlatforms = [
  {
    id: 'instagram',
    label: 'Instagram',
    openUrl: 'https://www.instagram.com/',
    instruction: 'Copy the caption, open Instagram, and publish from your own account.'
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    openUrl: 'https://www.tiktok.com/upload',
    instruction: 'Copy the caption, open TikTok, and publish from your own account.'
  },
  {
    id: 'xiaohongshu',
    label: '小红书',
    openUrl: '',
    instruction: 'Copy the caption, then open 小红书 manually. Public web upload is not assumed in this preview.'
  },
  {
    id: 'facebook',
    label: 'Facebook',
    openUrl: 'https://www.facebook.com/',
    instruction: 'Copy the caption, open Facebook, and publish from your own account.'
  },
  {
    id: 'wechat_private',
    label: 'WeChat / private share',
    openUrl: '',
    instruction: 'Copy the caption and share manually. This preview does not connect to WeChat APIs.'
  }
]

export const shareCopyTemplates = [
  {
    id: 'venue_theme_story',
    label: 'Venue + theme story',
    text: 'We celebrated with PartyOnce at {venue}. The {theme} setup made the party feel easy to understand and fun for the kids. #PartyOnce #PartyEvent'
  },
  {
    id: 'family_memory',
    label: 'Family memory',
    text: 'A beautiful family party moment planned with PartyOnce. Theme: {theme}. Venue: {venue}. #PartyOnce'
  },
  {
    id: 'photo_zone',
    label: 'Photo moment',
    text: 'The party photo zone and theme styling came together so nicely. Thanks PartyOnce for helping us plan the look and next steps. #PartyOnce'
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

export const buildShareTemplateText = (templateId, order = {}) => {
  const template = shareCopyTemplates.find((item) => item.id === templateId) || shareCopyTemplates[0]
  const theme = order.theme || order.event?.theme || 'Castle Princess'
  const venue = order.event_location || order.event?.location || 'Restaurant A'
  return template.text
    .replaceAll('{theme}', theme)
    .replaceAll('{venue}', venue)
}

export const normalizeRewardSubmission = (item = {}) => ({
  id: String(item.id || `ugc-${Date.now()}`),
  customer_id: item.customer_id || item.customerId || 'customer-local-41',
  customer_name: item.customer_name || item.customerName || 'Local Demo Customer',
  order_id: item.order_id || item.orderId || '',
  order_number: item.order_number || item.orderNumber || '',
  platform: item.platform || item.channel || 'instagram',
  channel: item.channel || item.platform || 'instagram',
  copy_template_id: item.copy_template_id || 'venue_theme_story',
  share_text: item.share_text || item.caption || '',
  proof_type: item.proof_type || (item.post_url || item.postUrl ? 'post_url' : 'proof_note'),
  proof_url: item.proof_url || item.post_url || item.postUrl || '',
  proof_note: item.proof_note || '',
  post_url: item.post_url || item.postUrl || item.proof_url || '',
  caption: item.caption || item.share_text || '',
  permission_to_reuse: Boolean(item.permission_to_reuse ?? item.permissionToReuse),
  includes_partyonce_tag: Boolean(item.includes_partyonce_tag ?? item.includesPartyOnceTag),
  includes_venue_or_theme: Boolean(item.includes_venue_or_theme ?? item.includesVenueOrTheme),
  status: item.status || item.review_status || 'pending_review',
  review_status: item.review_status || item.status || 'pending_review',
  points_pending: Number(item.points_pending ?? rewardPointRules[0].points),
  points_awarded: Number(item.points_awarded || 0),
  voucher_placeholder_id: item.voucher_placeholder_id || '',
  voucher_status: item.voucher_status || (item.voucher_placeholder_id ? 'placeholder_issued' : 'not_issued'),
  review_reason: item.review_reason || item.review_note || '',
  review_note: item.review_note || '',
  created_at: item.created_at || nowIso(),
  updated_at: item.updated_at || item.created_at || nowIso(),
  reviewed_at: item.reviewed_at || null,
  customer_notification: item.customer_notification || 'app_status_only_no_outbound',
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
    review_status: 'pending_review',
    points_pending: rewardPointRules[0].points,
    points_awarded: 0,
    voucher_status: 'not_issued',
    review_note: 'Waiting for local/staging admin review. No outbound message was sent.',
    review_reason: 'Waiting for local/staging admin review. No outbound message was sent.'
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
    const reviewReason = patch.review_reason || patch.review_note || item.review_reason || item.review_note
    const voucherId = approved ? patch.voucher_placeholder_id || item.voucher_placeholder_id || 'voucher-500-20' : ''
    return normalizeRewardSubmission({
      ...item,
      status: patch.status || item.status,
      review_status: patch.status || item.review_status || item.status,
      points_pending: approved ? 0 : item.points_pending,
      points_awarded: pointsAwarded,
      voucher_placeholder_id: voucherId,
      voucher_status: approved ? 'placeholder_issued' : 'not_issued',
      review_reason: reviewReason,
      review_note: reviewReason,
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
    fixedRewardOffers: clone(fixedRewardOffers),
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
      platform: 'instagram',
      post_url: 'https://example.test/staging-social-post',
      proof_type: 'post_url',
      proof_url: 'https://example.test/staging-social-post',
      copy_template_id: 'venue_theme_story',
      share_text: 'Castle Princess party preview with Restaurant A staging render. #PartyOnce',
      caption: 'Castle Princess party preview with Restaurant A staging render.',
      permission_to_reuse: true,
      includes_partyonce_tag: true,
      includes_venue_or_theme: true,
      status: 'approved',
      review_status: 'approved',
      points_pending: 0,
      points_awarded: 150,
      voucher_placeholder_id: 'voucher-500-20',
      voucher_status: 'placeholder_issued',
      review_note: 'Seed approved UGC reward for local/staging review.',
      review_reason: 'Approved local/staging seed. Voucher placeholder is visible in-app only.',
      reviewed_at: '2026-05-14T00:00:00.000Z',
      created_at: '2026-05-14T00:00:00.000Z',
      updated_at: '2026-05-14T00:00:00.000Z'
    })
  ])
  safeWrite(VOUCHERS_KEY, voucherPlaceholders)
}
