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
        placeholder="Search quote number, customer, contact, or lead ID"
        @keyup.enter="loadQuotes"
      />
      <el-select v-model="statusFilter" class="status-filter" placeholder="Status" @change="loadQuotes">
        <el-option label="All statuses" value="" />
        <el-option v-for="status in allowedStatuses" :key="status" :label="status" :value="status" />
      </el-select>
      <el-button @click="clearFilters">Clear</el-button>
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
      >
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

        <el-table-column label="Created" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
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
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import apiClient from '@/api'

const router = useRouter()

const allowedStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired']
const quotes = ref([])
const quoteTotal = ref(0)
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const message = ref('')
const messageType = ref('info')

const filteredQuotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return quotes.value.filter((quote) => {
    const matchesStatus = !statusFilter.value || quote.status === statusFilter.value
    if (!query) return matchesStatus
    const haystack = [
      quote.id,
      quote.lead_id,
      quote.quote_number,
      quote.customer_summary?.name,
      quote.customer_summary?.contact,
      quote.status
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesStatus && haystack.includes(query)
  })
})

const loadQuotes = async () => {
  loading.value = true
  message.value = ''
  try {
    const params = {
      limit: 100,
      offset: 0
    }
    if (statusFilter.value) params.status = statusFilter.value
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()

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

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
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

@media (max-width: 900px) {
  .page-header,
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-input,
  .status-filter {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 560px) {
  .admin-quotes-page {
    padding: 80px 14px 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
