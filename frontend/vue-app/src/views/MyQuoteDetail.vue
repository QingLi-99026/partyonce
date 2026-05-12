<template>
  <main class="customer-page">
    <el-button class="back-button" @click="router.push('/my/quotes')">Back to My Quotes</el-button>

    <el-empty v-if="!loading && !quote" description="Quote not found">
      <el-button type="primary" @click="router.push('/my/quotes')">Open My Quotes</el-button>
    </el-empty>

    <template v-if="quote">
      <header class="page-hero">
        <div>
          <p class="eyebrow">Quote Detail</p>
          <h1>{{ quote.quote_number }}</h1>
          <p>{{ quote.status_text }} · {{ formatCustomerDateTime(quote.created_at) }}</p>
        </div>
        <el-tag :type="quoteTagType(quote.status)" effect="plain" size="large">{{ quote.status }}</el-tag>
      </header>

      <el-alert
        class="scope-alert"
        type="warning"
        :closable="false"
        show-icon
        title="This quote detail is read-only. Online payment is intentionally blocked in this workpack."
      />

      <section class="summary-grid">
        <article class="summary-card">
          <span>Amount</span>
          <strong>{{ formatCustomerMoney(quote.amount, quote.currency) }}</strong>
        </article>
        <article class="summary-card">
          <span>Valid until</span>
          <strong>{{ formatCustomerDate(quote.valid_until) }}</strong>
        </article>
        <article class="summary-card">
          <span>Theme</span>
          <strong>{{ quote.selection_snapshot.theme }}</strong>
        </article>
        <article class="summary-card">
          <span>Package</span>
          <strong>{{ quote.selection_snapshot.package }}</strong>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <h2>Selection Snapshot</h2>
          <dl class="detail-list">
            <div><dt>Venue / location</dt><dd>{{ quote.selection_snapshot.venue }}</dd></div>
            <div><dt>Guests</dt><dd>{{ quote.selection_snapshot.guest_count }}</dd></div>
            <div><dt>Event date</dt><dd>{{ formatCustomerDate(quote.selection_snapshot.event_date) }}</dd></div>
            <div><dt>Customer</dt><dd>{{ quote.customer_name }} · {{ quote.customer_contact }}</dd></div>
          </dl>
        </article>

        <article class="panel">
          <h2>Status Meaning</h2>
          <ul class="status-list">
            <li v-for="(label, status) in quoteStatuses" :key="status" :class="{ active: quote.status === status }">
              <strong>{{ status }}</strong>
              <span>{{ label }}</span>
            </li>
          </ul>
        </article>
      </section>

      <section class="panel">
        <h2>Quote Items</h2>
        <el-table :data="quote.line_items" empty-text="No line item snapshot">
          <el-table-column prop="name" label="Item" />
          <el-table-column label="Amount" width="160" align="right">
            <template #default="{ row }">{{ formatCustomerMoney(row.amount, quote.currency) }}</template>
          </el-table-column>
        </el-table>
      </section>

      <section class="next-step">
        <span>Next step</span>
        <p>{{ quote.next_step }}</p>
        <el-button type="primary" @click="router.push('/my/orders')">View My Orders</el-button>
      </section>
    </template>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchCustomerQuoteDetail,
  formatCustomerDate,
  formatCustomerDateTime,
  formatCustomerMoney,
  quoteStatuses
} from '@/services/customerExperienceService'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const quote = ref(null)

const quoteTagType = (status) => ({
  draft: 'info',
  sent: 'warning',
  accepted: 'success',
  rejected: 'danger',
  expired: ''
}[status] || 'info')

const loadQuote = async () => {
  loading.value = true
  try {
    const result = await fetchCustomerQuoteDetail(route.params.id)
    quote.value = result.item
  } finally {
    loading.value = false
  }
}

onMounted(loadQuote)
</script>

<style scoped>
.customer-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.back-button,
.scope-alert,
.summary-grid,
.content-grid,
.panel {
  margin-bottom: 18px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
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

h1,
h2 {
  margin: 0 0 8px;
  color: #0f172a;
}

.page-hero p {
  margin: 0;
  color: #475569;
}

.summary-grid,
.content-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.content-grid {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
}

.summary-card,
.panel,
.next-step {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-card span,
dt,
.next-step span {
  color: #64748b;
  font-size: 12px;
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 22px;
}

.detail-list {
  display: grid;
  gap: 12px;
  margin: 0;
}

dd {
  margin: 4px 0 0;
  color: #0f172a;
  font-weight: 650;
}

.status-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.status-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-radius: 8px;
  background: #f8fafc;
  padding: 10px;
}

.status-list li.active {
  outline: 2px solid #409eff;
  background: #ecf5ff;
}

.status-list span,
.next-step p {
  color: #334155;
}

@media (max-width: 820px) {
  .page-hero,
  .content-grid {
    display: block;
  }
}
</style>
