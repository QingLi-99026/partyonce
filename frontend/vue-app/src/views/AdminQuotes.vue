<template>
  <div class="admin-quotes-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Stage 2 Quote skeleton</p>
        <h1>Quote Review</h1>
        <p>
          Local/staging admin queue for Quotes created from persistent Leads.
          This page does not create orders, collect payment, or trigger outbound messages.
        </p>
      </div>
      <div class="header-actions">
        <el-button :loading="loading" @click="loadQuotes">Refresh</el-button>
        <el-button type="primary" @click="router.push('/admin/local-leads')">Lead Review</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Local/staging skeleton only: no Order API, no Stripe/payment, no webhook/n8n, no email/SMS/WhatsApp."
    />

    <section class="stats-grid">
      <article class="stat-card">
        <span>Total Quotes</span>
        <strong>{{ quoteTotal }}</strong>
        <small>From GET /api/quotes</small>
      </article>
      <article class="stat-card">
        <span>Visible</span>
        <strong>{{ filteredQuotes.length }}</strong>
        <small>After local filters</small>
      </article>
      <article class="stat-card">
        <span>Allowed States</span>
        <strong>5</strong>
        <small>converted_to_order hidden</small>
      </article>
      <article class="stat-card">
        <span>External Systems</span>
        <strong>Blocked</strong>
        <small>No payment or outbound actions</small>
      </article>
    </section>

    <section class="toolbar">
      <el-input
        v-model="searchQuery"
        class="search-input"
        clearable
        placeholder="Search quote number, customer, contact, lead ID, theme, or package"
        @keyup.enter="loadQuotes"
      />
      <el-select v-model="statusFilter" class="status-filter" placeholder="Status" @change="loadQuotes">
        <el-option label="All statuses" value="" />
        <el-option v-for="status in allowedStatuses" :key="status" :label="status" :value="status" />
      </el-select>
      <el-input
        v-model="ownerFilter"
        class="owner-filter"
        clearable
        placeholder="Filter owner"
        @keyup.enter="loadQuotes"
        @change="loadQuotes"
      />
      <el-input
        v-model="nextActionFilter"
        class="next-action-filter"
        clearable
        placeholder="Filter next action"
        @keyup.enter="loadQuotes"
        @change="loadQuotes"
      />
      <el-select v-model="riskFilter" class="status-filter wide-filter" placeholder="Ops alerts">
        <el-option label="All quotes" value="" />
        <el-option label="Missing amount" value="missing_amount" />
        <el-option label="Missing valid until" value="missing_valid_until" />
        <el-option label="Expired sent quote" value="expired_sent_quote" />
        <el-option label="Accepted needs order" value="accepted_needs_order" />
      </el-select>
      <el-button @click="clearFilters">Clear</el-button>
    </section>

    <section class="status-guide" aria-label="Quote status guidance">
      <article v-for="item in statusGuide" :key="item.status">
        <strong>{{ item.status }}</strong>
        <span>{{ item.label }}</span>
      </article>
    </section>

    <section class="bulk-panel" aria-label="Quote bulk operations">
      <div class="bulk-summary">
        <strong>{{ selectedQuotes.length }} selected</strong>
        <span>Bulk operations update local/staging Quote skeleton fields only.</span>
      </div>
      <el-input
        v-model="bulkOwner"
        class="bulk-input"
        clearable
        placeholder="Owner"
        :disabled="selectedQuotes.length === 0 || bulkLoading"
      />
      <el-input
        v-model="bulkNextAction"
        class="bulk-input wide-bulk-input"
        clearable
        placeholder="Next action"
        :disabled="selectedQuotes.length === 0 || bulkLoading"
      />
      <el-select
        v-model="bulkStatus"
        class="bulk-status"
        placeholder="Status"
        :disabled="selectedQuotes.length === 0 || bulkLoading"
      >
        <el-option v-for="status in allowedStatuses" :key="status" :label="status" :value="status" />
      </el-select>
      <el-button :disabled="!canApplyQuoteOps" :loading="bulkLoading" @click="applyBulkQuoteOps">
        Apply Owner / Next Action
      </el-button>
      <el-button type="warning" plain :disabled="!canApplyQuoteStatus" :loading="bulkLoading" @click="applyBulkQuoteStatus">
        Apply Status
      </el-button>
    </section>

    <el-alert
      v-if="message"
      class="scope-alert"
      :type="messageType"
      :closable="true"
      show-icon
      :title="message"
      @close="message = ''"
    />

    <section class="table-shell">
      <el-empty
        v-if="!loading && filteredQuotes.length === 0"
        description="No Quotes are available in the local/staging skeleton queue."
      >
        <el-button type="primary" @click="router.push('/admin/local-leads')">Go to Lead Review</el-button>
      </el-empty>

      <el-table
        v-else
        v-loading="loading"
        :data="filteredQuotes"
        row-key="id"
        style="width: 100%"
        @selection-change="selectedQuotes = $event"
      >
        <el-table-column type="selection" width="48" />

        <el-table-column label="Quote" min-width="190">
          <template #default="{ row }">
            <div class="quote-cell">
              <strong>{{ row.quote_number || `Quote #${row.id}` }}</strong>
              <span>ID {{ row.id }} · Lead {{ row.lead_id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Customer" min-width="210">
          <template #default="{ row }">
            <div class="quote-cell">
              <strong>{{ row.customer_summary?.name || '-' }}</strong>
              <span>{{ row.customer_summary?.contact || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="150">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Ops Alerts" min-width="230">
          <template #default="{ row }">
            <div class="alert-cell">
              <el-tag
                v-for="item in quoteExceptions(row)"
                :key="item.code"
                :type="item.type"
                effect="plain"
              >
                {{ item.label }}
              </el-tag>
              <span v-if="quoteExceptions(row).length === 0">No active alert</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Owner / Next Action" min-width="260">
          <template #default="{ row }">
            <div class="quote-cell">
              <strong>{{ quoteOwner(row) }}</strong>
              <span>{{ row.next_action || 'No next action saved' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Total" width="140" align="right">
          <template #default="{ row }">{{ formatMoney(row.final_total, row.currency) }}</template>
        </el-table-column>

        <el-table-column label="Selection" min-width="220">
          <template #default="{ row }">
            <div class="quote-cell">
              <strong>{{ selectionSummary(row) }}</strong>
              <span>{{ lineItemSummary(row) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Visual Context" min-width="260">
          <template #default="{ row }">
            <div class="visual-cell">
              <img :src="quoteVisual(row).restaurant.image_path" :alt="quoteVisual(row).restaurant.title">
              <div>
                <strong>{{ quoteVisual(row).restaurant.title }}</strong>
                <span>{{ quoteVisual(row).primaryVenue.name }} · {{ quoteVisual(row).suppliers.map((item) => item.name).join(' / ') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Created" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>

        <el-table-column label="Valid Until" min-width="150">
          <template #default="{ row }">{{ formatDate(row.valid_until) }}</template>
        </el-table-column>

        <el-table-column label="Status Update" min-width="210">
          <template #default="{ row }">
            <el-select
              :model-value="row.status"
              size="small"
              @change="updateQuoteStatus(row, $event)"
            >
              <el-option v-for="status in allowedStatuses" :key="status" :label="status" :value="status" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="Boundary" min-width="220">
          <template #default>
            <span class="boundary-note">No order/payment/outbound action</span>
          </template>
        </el-table-column>

        <el-table-column label="Action" width="110" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="router.push(`/admin/quotes/${row.id}`)">View</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import apiClient from '@/api'
import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets'

const router = useRouter()

const allowedStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired']
const quotes = ref([])
const quoteTotal = ref(0)
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const ownerFilter = ref('')
const nextActionFilter = ref('')
const riskFilter = ref('')
const message = ref('')
const messageType = ref('info')
const selectedQuotes = ref([])
const bulkOwner = ref('')
const bulkNextAction = ref('')
const bulkStatus = ref('')
const bulkLoading = ref(false)

const shouldUseStaticPreviewFallback = () => {
  if (typeof window === 'undefined') return false
  if (import.meta.env.VITE_ENABLE_REMOTE_QUOTE_API === 'true') return false
  const isVercelPreview = /vercel\.app$/i.test(window.location.hostname)
  const isViteStaticPreview = /^417\d$/.test(window.location.port)
  return isVercelPreview || isViteStaticPreview
}

const staticPreviewQuoteRows = [
  {
    id: '1',
    lead_id: 'lead-local-301',
    quote_number: 'PE-Q-0501',
    status: 'accepted',
    customer_summary: {
      id: 'customer-local-41',
      name: 'Ava Thompson',
      contact: 'ava.parent@example.test'
    },
    owner_label: 'Staging Ops',
    owner_user_id: null,
    next_action: 'Walk through Castle Princess Premium and confirm Restaurant A availability',
    internal_note: 'Static Preview demo quote only. No payment, webhook, n8n, or outbound message is triggered.',
    selection_snapshot: {
      theme: 'Castle Princess',
      package: 'Premium',
      venue: 'Restaurant A',
      guest_count: 18,
      event_date: '2026-06-14'
    },
    currency: 'AUD',
    final_total: 1680,
    valid_until: '2026-05-25',
    created_at: '2026-05-11T08:00:00.000Z',
    line_items: [
      { type: 'venue_fee', name: 'Restaurant A private room', amount: 420 },
      { type: 'decor_fee', name: 'Premium castle room styling', amount: 760 },
      { type: 'supplier_fee', name: 'Cake and activity supplier allowance', amount: 280 },
      { type: 'labor_fee', name: 'Setup and pack-down', amount: 160 },
      { type: 'service_fee', name: 'Planning service', amount: 60 }
    ]
  }
]

const statusGuide = [
  { status: 'draft', label: '后台准备报价，客户侧只读显示准备中。' },
  { status: 'sent', label: '报价已发送，运营需关注有效期和客户确认。' },
  { status: 'accepted', label: '客户已接受，下一步是人工创建或核对订单。' },
  { status: 'rejected', label: '报价已拒绝，保留备注和复盘原因。' },
  { status: 'expired', label: '报价已过期，不触发自动支付或外发。' }
]

const canApplyQuoteOps = computed(() => {
  return selectedQuotes.value.length > 0 && !bulkLoading.value && (
    bulkOwner.value.trim() || bulkNextAction.value.trim()
  )
})

const canApplyQuoteStatus = computed(() => {
  return selectedQuotes.value.length > 0 && !bulkLoading.value && allowedStatuses.includes(bulkStatus.value)
})

const filteredQuotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return quotes.value.filter((quote) => {
    const matchesStatus = !statusFilter.value || quote.status === statusFilter.value
    const matchesOwner = !ownerFilter.value.trim() || quoteOwner(quote).toLowerCase().includes(ownerFilter.value.trim().toLowerCase())
    const matchesNextAction = !nextActionFilter.value.trim() || String(quote.next_action || '').toLowerCase().includes(nextActionFilter.value.trim().toLowerCase())
    const matchesRisk = !riskFilter.value || quoteExceptions(quote).some((item) => item.code === riskFilter.value)
    if (!query) return matchesStatus && matchesOwner && matchesNextAction && matchesRisk
    const haystack = [
      quote.id,
      quote.lead_id,
      quote.quote_number,
      quote.customer_summary?.name,
      quote.customer_summary?.contact,
      quote.status,
      quoteOwner(quote),
      quote.next_action,
      quote.internal_note,
      selectionSummary(quote),
      lineItemSummary(quote)
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesStatus && matchesOwner && matchesNextAction && matchesRisk && haystack.includes(query)
  })
})

const quoteExceptions = (quote) => {
  const exceptions = []
  const total = Number(quote.final_total || 0)
  if (!total) {
    exceptions.push({ code: 'missing_amount', label: 'Missing amount', type: 'danger' })
  }
  if (!quote.valid_until && ['draft', 'sent'].includes(quote.status)) {
    exceptions.push({ code: 'missing_valid_until', label: 'No valid-until', type: 'warning' })
  }
  if (quote.status === 'sent' && quote.valid_until && new Date(quote.valid_until).getTime() < Date.now()) {
    exceptions.push({ code: 'expired_sent_quote', label: 'Past valid date', type: 'danger' })
  }
  if (quote.status === 'accepted') {
    exceptions.push({ code: 'accepted_needs_order', label: 'Needs order check', type: 'success' })
  }
  return exceptions
}

const loadQuotes = async () => {
  loading.value = true
  message.value = ''
  try {
    if (shouldUseStaticPreviewFallback()) {
      quotes.value = staticPreviewQuoteRows.map((row) => ({ ...row }))
      quoteTotal.value = quotes.value.length
      message.value = 'Static Preview mode: Quote Review is using safe demo quote data instead of calling the remote staging API. No payment, webhook, n8n, or outbound action is triggered.'
      messageType.value = 'warning'
      return
    }

    const params = {
      limit: 100,
      offset: 0
    }
    if (statusFilter.value) params.status = statusFilter.value
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
    if (ownerFilter.value.trim()) params.owner = ownerFilter.value.trim()
    if (nextActionFilter.value.trim()) params.next_action = nextActionFilter.value.trim()

    const response = await apiClient.get('/quotes', { params })
    quotes.value = Array.isArray(response?.items) ? response.items : []
    quoteTotal.value = Number(response?.total || quotes.value.length)
    if (quotes.value.length === 0) {
      message.value = 'No Quotes returned. Create a persistent Lead and draft Quote in the safe local backend profile first.'
      messageType.value = 'warning'
    }
  } catch (error) {
    quotes.value = []
    quoteTotal.value = 0
    message.value = getErrorMessage(error)
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

const updateQuoteStatus = async (quote, status) => {
  if (status === quote.status) return
  if (!allowedStatuses.includes(status)) {
    ElMessage.warning('converted_to_order is blocked in this skeleton UI.')
    return
  }

  try {
    const updated = await apiClient.patch(`/quotes/${quote.id}`, { status })
    const index = quotes.value.findIndex((item) => item.id === quote.id)
    if (index !== -1) {
      quotes.value[index] = updated
    }
    ElMessage.success(`Quote ${quote.quote_number || quote.id} updated to ${status}`)
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  }
}

const patchQuoteRow = async (quote, patch) => {
  const updated = await apiClient.patch(`/quotes/${quote.id}`, patch)
  const index = quotes.value.findIndex((item) => item.id === quote.id)
  if (index !== -1) {
    quotes.value[index] = updated
  }
  return updated
}

const applyBulkQuoteOps = async () => {
  if (!canApplyQuoteOps.value) return
  const patch = {}
  if (bulkOwner.value.trim()) patch.owner_label = bulkOwner.value.trim()
  if (bulkNextAction.value.trim()) patch.next_action = bulkNextAction.value.trim()
  await runBulkQuoteUpdate(patch, 'Quote owner / next action updated')
}

const applyBulkQuoteStatus = async () => {
  if (!canApplyQuoteStatus.value) return
  try {
    await ElMessageBox.confirm(
      `Update ${selectedQuotes.value.length} Quote skeleton record(s) to ${bulkStatus.value}? This does not create Orders, payments, or outbound messages.`,
      'Confirm bulk Quote status update',
      { type: 'warning', confirmButtonText: 'Apply Status', cancelButtonText: 'Cancel' }
    )
  } catch (error) {
    return
  }
  await runBulkQuoteUpdate({ status: bulkStatus.value }, `Quote status updated to ${bulkStatus.value}`)
}

const runBulkQuoteUpdate = async (patch, successMessage) => {
  bulkLoading.value = true
  let successCount = 0
  try {
    for (const quote of selectedQuotes.value) {
      await patchQuoteRow(quote, patch)
      successCount += 1
    }
    ElMessage.success(`${successMessage}: ${successCount} record(s). No external action was triggered.`)
  } catch (error) {
    ElMessage.error(`${successCount} updated before stop: ${getErrorMessage(error)}`)
  } finally {
    bulkLoading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  ownerFilter.value = ''
  nextActionFilter.value = ''
  riskFilter.value = ''
  loadQuotes()
}

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg || item.type).join('; ')
  return 'Could not load the local/staging Quote skeleton queue.'
}

const selectionSummary = (quote) => {
  const selection = quote.selection_snapshot || {}
  return selection.themeName || selection.theme || selection.packageName || selection.package || 'Snapshot pending'
}

const lineItemSummary = (quote) => {
  const items = Array.isArray(quote.line_items) ? quote.line_items : []
  if (items.length === 0) return 'No line item snapshot'
  return `${items.length} line item${items.length === 1 ? '' : 's'}`
}

const quoteVisual = (quote) => {
  const selection = quote.selection_snapshot || {}
  return getVisualContext(
    normalizeThemeId(selection.theme || quote.theme || selectionSummary(quote)),
    normalizeTierId(selection.package || quote.package_tier || selectionSummary(quote))
  )
}

const quoteOwner = (quote) => quote.owner_label || (quote.owner_user_id ? `Owner #${quote.owner_user_id}` : 'Unassigned')

const formatMoney = (value, currency = 'AUD') => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency || 'AUD'
  }).format(amount)
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString()
}

const statusTagType = (status) => {
  const typeMap = {
    draft: 'info',
    sent: 'warning',
    accepted: 'success',
    rejected: 'danger',
    expired: ''
  }
  return typeMap[status] || 'info'
}

onMounted(loadQuotes)
</script>

<style scoped>
.admin-quotes-page {
  min-height: 100vh;
  padding: 88px 24px 32px;
  background: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid #dee2e6;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #212529;
}

.page-header p {
  max-width: 760px;
  margin: 8px 0 0;
  color: #495057;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #7048e8;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.scope-alert,
.stats-grid,
.toolbar,
.status-guide,
.table-shell {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

.scope-alert {
  margin-bottom: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card {
  padding: 18px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-card span,
.stat-card small {
  display: block;
  color: #868e96;
}

.stat-card strong {
  display: block;
  margin: 8px 0 4px;
  font-size: 24px;
  color: #212529;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.search-input {
  max-width: 460px;
}

.status-filter {
  width: 180px;
}

.owner-filter {
  width: 180px;
}

.next-action-filter {
  width: 210px;
}

.wide-filter {
  width: 220px;
}

.status-guide {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.bulk-panel {
  max-width: 1280px;
  margin: 0 auto 18px;
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.bulk-summary {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 210px;
}

.bulk-summary strong {
  color: #212529;
}

.bulk-summary span {
  color: #868e96;
  font-size: 12px;
}

.bulk-input {
  width: 180px;
}

.wide-bulk-input {
  width: 240px;
}

.bulk-status {
  width: 170px;
}

.status-guide article {
  padding: 12px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.status-guide strong,
.status-guide span {
  display: block;
}

.status-guide strong {
  color: #212529;
  margin-bottom: 6px;
}

.status-guide span {
  color: #868e96;
  font-size: 12px;
  line-height: 1.45;
}

.table-shell {
  padding: 16px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.quote-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.quote-cell strong {
  color: #212529;
}

.quote-cell span,
.boundary-note {
  color: #868e96;
  font-size: 13px;
}

.alert-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.alert-cell span {
  color: #868e96;
  font-size: 12px;
}

.visual-cell {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 10px;
  align-items: center;
}

.visual-cell img {
  width: 72px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  object-position: top center;
}

.visual-cell strong,
.visual-cell span {
  display: block;
}

.visual-cell span {
  margin-top: 3px;
  color: #868e96;
  font-size: 12px;
  line-height: 1.35;
}

@media (max-width: 900px) {
  .page-header,
  .toolbar,
  .bulk-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid,
  .status-guide {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-input,
  .status-filter,
  .owner-filter,
  .next-action-filter,
  .wide-filter {
    width: 100%;
    max-width: none;
  }

  .bulk-input,
  .wide-bulk-input,
  .bulk-status {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .admin-quotes-page {
    padding: 80px 14px 24px;
  }

  .stats-grid,
  .status-guide {
    grid-template-columns: 1fr;
  }
}
</style>
