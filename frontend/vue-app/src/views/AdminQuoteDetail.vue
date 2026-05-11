<template>
  <div class="admin-quote-detail-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Stage 2 Quote skeleton</p>
        <h1>{{ quote?.quote_number || 'Quote Detail' }}</h1>
        <p>
          Admin-only local/staging detail view for a Quote created from a persistent Lead.
          This page does not create Orders, collect payment, or trigger outbound messages.
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="router.push('/admin/quotes')">Back to Quote Review</el-button>
        <el-button type="primary" @click="router.push('/admin/local-leads')">Lead Review</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Local/staging skeleton only: converted_to_order, Order API, Stripe/payment, webhook/n8n, and outbound messages remain blocked."
    />

    <el-alert
      v-if="message"
      class="scope-alert"
      :type="messageType"
      :closable="true"
      show-icon
      :title="message"
      @close="message = ''"
    />

    <section v-loading="loading" class="detail-shell">
      <el-empty
        v-if="!loading && !quote"
        description="Quote detail is not available in the local/staging skeleton."
      >
        <el-button type="primary" @click="loadQuote">Retry</el-button>
      </el-empty>

      <template v-else-if="quote">
        <section class="summary-grid">
          <article class="summary-card">
            <span>Status</span>
            <strong>{{ quote.status }}</strong>
            <small>Skeleton status only</small>
          </article>
          <article class="summary-card">
            <span>Total</span>
            <strong>{{ formatMoney(quote.final_total, quote.currency) }}</strong>
            <small>{{ quote.currency || 'AUD' }}</small>
          </article>
          <article class="summary-card">
            <span>Lead</span>
            <strong>#{{ quote.lead_id }}</strong>
            <small>{{ quote.lead_summary?.status || 'lead status pending' }}</small>
          </article>
          <article class="summary-card">
            <span>External Systems</span>
            <strong>Blocked</strong>
            <small>No order/payment/outbound action</small>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Customer</h2>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{{ quote.customer_summary?.name || '-' }}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{{ quote.customer_summary?.contact || '-' }}</dd>
              </div>
              <div>
                <dt>Customer ID</dt>
                <dd>{{ quote.customer_id }}</dd>
              </div>
            </dl>
          </article>

          <article class="panel">
            <h2>Quote Controls</h2>
            <label class="field-label" for="quote-status-select">Status</label>
            <el-select
              id="quote-status-select"
              class="status-select"
              :model-value="quote.status"
              @change="updateQuoteStatus"
            >
              <el-option v-for="status in allowedStatuses" :key="status" :label="status" :value="status" />
            </el-select>
            <p class="control-note">
              `converted_to_order` is intentionally unavailable until the Order skeleton phase.
            </p>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Quote Amounts</h2>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>{{ formatMoney(quote.subtotal, quote.currency) }}</dd>
              </div>
              <div>
                <dt>Discount</dt>
                <dd>{{ formatMoney(quote.discount_total, quote.currency) }}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{{ formatMoney(quote.tax_total, quote.currency) }}</dd>
              </div>
              <div>
                <dt>Final Total</dt>
                <dd>{{ formatMoney(quote.final_total, quote.currency) }}</dd>
              </div>
            </dl>
          </article>

          <article class="panel">
            <h2>Timeline</h2>
            <dl>
              <div>
                <dt>Created</dt>
                <dd>{{ formatDateTime(quote.created_at) }}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{{ formatDateTime(quote.updated_at) }}</dd>
              </div>
              <div>
                <dt>Sent</dt>
                <dd>{{ formatDateTime(quote.sent_at) }}</dd>
              </div>
              <div>
                <dt>Accepted</dt>
                <dd>{{ formatDateTime(quote.accepted_at) }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section class="panel">
          <h2>Line Items Snapshot</h2>
          <el-table v-if="lineItems.length > 0" :data="lineItems" row-key="name" style="width: 100%">
            <el-table-column label="Name" min-width="220">
              <template #default="{ row }">{{ row.name || row.item_name || row.type || '-' }}</template>
            </el-table-column>
            <el-table-column label="Amount" width="160" align="right">
              <template #default="{ row }">{{ formatMoney(row.amount || row.price || row.total || 0, quote.currency) }}</template>
            </el-table-column>
            <el-table-column label="Source" min-width="200">
              <template #default="{ row }">{{ row.source || row.type || 'snapshot' }}</template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="No line item snapshot is available." />
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Selection Snapshot</h2>
            <pre>{{ formatJson(quote.selection_snapshot) }}</pre>
          </article>
          <article class="panel">
            <h2>Skeleton Notice</h2>
            <p>{{ quote.skeleton_notice || 'Stage 2 Quote skeleton only.' }}</p>
            <p class="control-note">
              Customer-facing Quote view, public share links, Orders, and payment remain out of scope.
            </p>
          </article>
        </section>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import apiClient from '@/api'

const route = useRoute()
const router = useRouter()

const allowedStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired']
const quote = ref(null)
const loading = ref(false)
const message = ref('')
const messageType = ref('info')

const lineItems = computed(() => (Array.isArray(quote.value?.line_items) ? quote.value.line_items : []))

const loadQuote = async () => {
  loading.value = true
  message.value = ''
  try {
    quote.value = await apiClient.get(`/quotes/${route.params.quoteId}`)
  } catch (error) {
    quote.value = null
    message.value = getErrorMessage(error)
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

const updateQuoteStatus = async (status) => {
  if (!quote.value || status === quote.value.status) return
  if (!allowedStatuses.includes(status)) {
    ElMessage.warning('converted_to_order is blocked in this skeleton UI.')
    return
  }

  try {
    quote.value = await apiClient.patch(`/quotes/${quote.value.id}`, { status })
    message.value = `Quote ${quote.value.quote_number || quote.value.id} updated to ${status}.`
    messageType.value = 'success'
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  }
}

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg || item.type).join('; ')
  return 'Could not load the local/staging Quote detail.'
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

const formatJson = (value) => {
  if (!value || Object.keys(value).length === 0) return 'No snapshot available'
  return JSON.stringify(value, null, 2)
}

onMounted(loadQuote)
</script>

<style scoped>
.admin-quote-detail-page {
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
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.scope-alert,
.detail-shell {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

.scope-alert {
  margin-bottom: 18px;
}

.detail-shell {
  min-height: 320px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card,
.panel {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.summary-card {
  padding: 18px;
}

.summary-card span,
.summary-card small {
  display: block;
  color: #868e96;
}

.summary-card strong {
  display: block;
  margin: 8px 0 4px;
  font-size: 22px;
  color: #212529;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.panel {
  padding: 18px;
  margin-bottom: 18px;
}

.panel h2 {
  margin: 0 0 14px;
  font-size: 18px;
  color: #212529;
}

dl {
  display: grid;
  gap: 12px;
  margin: 0;
}

dl div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f3f5;
}

dt {
  color: #868e96;
}

dd {
  margin: 0;
  text-align: right;
  color: #212529;
  font-weight: 600;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 700;
}

.status-select {
  width: 220px;
}

.control-note {
  margin: 12px 0 0;
  color: #868e96;
  font-size: 13px;
}

pre {
  max-height: 320px;
  overflow: auto;
  margin: 0;
  padding: 14px;
  background: #f1f3f5;
  border-radius: 6px;
  color: #212529;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 900px) {
  .page-header,
  dl div {
    flex-direction: column;
  }

  .summary-grid,
  .panel-grid {
    grid-template-columns: 1fr;
  }

  dd {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .admin-quote-detail-page {
    padding: 80px 14px 24px;
  }
}
</style>
