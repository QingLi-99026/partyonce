<template>
  <main class="customer-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">Customer workspace</p>
        <h1>My Quotes</h1>
        <p>View your party quote status, package snapshot, amount, expiry, and the next action.</p>
      </div>
      <div class="hero-actions">
        <el-button @click="router.push('/my/inquiries')">My Inquiries</el-button>
        <el-button type="primary" @click="router.push('/my/orders')">My Orders</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Local/staging read-only view: no online payment, no Stripe, no webhook/n8n, and no outbound message is triggered."
    />

    <section class="toolbar">
      <el-input v-model="searchQuery" clearable placeholder="Search quote number, theme, package, or customer" />
      <el-select v-model="statusFilter" clearable placeholder="Status">
        <el-option label="All statuses" value="" />
        <el-option v-for="(label, status) in quoteStatuses" :key="status" :label="`${status} · ${label}`" :value="status" />
      </el-select>
    </section>

    <section class="cards-grid">
      <article v-for="quote in filteredQuotes" :key="quote.id" class="customer-card">
        <div class="card-head">
          <div>
            <strong>{{ quote.quote_number }}</strong>
            <span>{{ formatCustomerDateTime(quote.created_at) }}</span>
          </div>
          <el-tag :type="quoteTagType(quote.status)" effect="plain">{{ quote.status_text }}</el-tag>
        </div>

        <dl class="detail-list">
          <div>
            <dt>Theme / package</dt>
            <dd>{{ quote.theme }} · {{ quote.package }}</dd>
          </div>
          <div>
            <dt>Selection snapshot</dt>
            <dd>{{ quote.selection_snapshot.venue }} · {{ quote.selection_snapshot.guest_count }} guests</dd>
          </div>
          <div>
            <dt>Amount</dt>
            <dd>{{ formatCustomerMoney(quote.amount, quote.currency) }}</dd>
          </div>
          <div>
            <dt>Valid until</dt>
            <dd>{{ formatCustomerDate(quote.valid_until) }}</dd>
          </div>
        </dl>

        <div class="next-step">
          <span>Next step</span>
          <p>{{ quote.next_step }}</p>
        </div>

        <el-button type="primary" @click="router.push(`/my/quotes/${quote.id}`)">View Quote Detail</el-button>
      </article>
    </section>

    <el-empty v-if="!loading && filteredQuotes.length === 0" description="No quotes yet">
      <el-button type="primary" @click="router.push('/my/inquiries')">Open My Inquiries</el-button>
    </el-empty>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchCustomerQuotes,
  formatCustomerDate,
  formatCustomerDateTime,
  formatCustomerMoney,
  quoteStatuses
} from '@/services/customerExperienceService'

const router = useRouter()
const loading = ref(false)
const quotes = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

const filteredQuotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return quotes.value.filter((quote) => {
    const matchesStatus = !statusFilter.value || quote.status === statusFilter.value
    if (!query) return matchesStatus
    const haystack = [
      quote.quote_number,
      quote.customer_name,
      quote.customer_contact,
      quote.theme,
      quote.package,
      quote.status
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesStatus && haystack.includes(query)
  })
})

const quoteTagType = (status) => ({
  draft: 'info',
  sent: 'warning',
  accepted: 'success',
  rejected: 'danger',
  expired: ''
}[status] || 'info')

const loadQuotes = async () => {
  loading.value = true
  try {
    const result = await fetchCustomerQuotes()
    quotes.value = result.items
  } finally {
    loading.value = false
  }
}

onMounted(loadQuotes)
</script>

<style scoped>
.customer-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 34px;
}

.page-hero p {
  margin: 0;
  color: #475569;
}

.hero-actions,
.toolbar {
  display: flex;
  gap: 12px;
}

.scope-alert,
.toolbar {
  margin-bottom: 18px;
}

.toolbar {
  max-width: 720px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.customer-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.card-head strong,
.card-head span {
  display: block;
}

.card-head span {
  color: #64748b;
  font-size: 13px;
}

.detail-list {
  display: grid;
  gap: 12px;
  margin: 0 0 16px;
}

.detail-list div {
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

dt {
  color: #64748b;
  font-size: 12px;
}

dd {
  margin: 4px 0 0;
  color: #0f172a;
  font-weight: 650;
}

.next-step {
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
  margin-bottom: 16px;
}

.next-step span {
  color: #64748b;
  font-size: 12px;
}

.next-step p {
  margin: 4px 0 0;
  color: #334155;
}

@media (max-width: 760px) {
  .page-hero,
  .hero-actions,
  .toolbar {
    flex-direction: column;
  }
}
</style>
