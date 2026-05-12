<template>
  <main class="customer-page">
    <el-button class="back-button" @click="router.push('/my/orders')">Back to My Orders</el-button>

    <el-empty v-if="!loading && !order" description="Order not found">
      <el-button type="primary" @click="router.push('/my/orders')">Open My Orders</el-button>
    </el-empty>

    <template v-if="order">
      <header class="page-hero">
        <div>
          <p class="eyebrow">Order Detail</p>
          <h1>{{ order.order_number }}</h1>
          <p>{{ order.status_text }} · Quote {{ order.quote_number }}</p>
        </div>
        <el-tag :type="orderTagType(order.status)" effect="plain" size="large">{{ order.status }}</el-tag>
      </header>

      <el-alert
        class="scope-alert"
        type="warning"
        :closable="false"
        show-icon
        title="pending_deposit is a business status placeholder. No Stripe payment, PaymentIntent, webhook, or n8n action is triggered."
      />
      <el-alert
        class="scope-alert"
        type="info"
        :closable="false"
        show-icon
        :title="`${dataSource} · ${identity.name} (${identity.id})`"
        :description="apiNotice || identity.accessBoundary"
      />

      <section class="summary-grid">
        <article class="summary-card">
          <span>Total amount</span>
          <strong>{{ formatCustomerMoney(order.total_amount, order.currency) }}</strong>
        </article>
        <article class="summary-card">
          <span>Deposit placeholder</span>
          <strong>{{ formatCustomerMoney(order.deposit_amount, order.currency) }}</strong>
        </article>
        <article class="summary-card">
          <span>Event date</span>
          <strong>{{ formatCustomerDate(order.event_date) }}</strong>
        </article>
        <article class="summary-card">
          <span>Location</span>
          <strong>{{ order.event_location }}</strong>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <h2>Event Snapshot</h2>
          <dl class="detail-list">
            <div><dt>Theme</dt><dd>{{ order.theme }}</dd></div>
            <div><dt>Package</dt><dd>{{ order.package }}</dd></div>
            <div><dt>Guests</dt><dd>{{ order.guest_count }}</dd></div>
            <div><dt>Created</dt><dd>{{ formatCustomerDateTime(order.created_at) }}</dd></div>
          </dl>
        </article>

        <article class="panel">
          <h2>Status Meaning</h2>
          <ul class="status-list">
            <li v-for="(label, status) in orderStatuses" :key="status" :class="{ active: order.status === status }">
              <strong>{{ status }}</strong>
              <span>{{ label }}</span>
            </li>
          </ul>
        </article>
      </section>

      <section class="panel">
        <h2>Order Items</h2>
        <el-table :data="order.line_items" empty-text="No order item snapshot">
          <el-table-column prop="name" label="Item" />
          <el-table-column label="Amount" width="160" align="right">
            <template #default="{ row }">{{ formatCustomerMoney(row.amount, order.currency) }}</template>
          </el-table-column>
        </el-table>
      </section>

      <section class="next-step">
        <span>Next step</span>
        <p>{{ order.next_step }}</p>
        <small>{{ order.deposit_note }}</small>
        <div class="blocked-actions">
          <el-button disabled>Pay Deposit · blocked</el-button>
          <el-button disabled>Open Stripe · disabled</el-button>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchCustomerOrderDetail,
  formatCustomerDate,
  formatCustomerDateTime,
  formatCustomerMoney,
  orderStatuses
} from '@/services/customerExperienceService'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const order = ref(null)
const dataSource = ref('not loaded')
const apiNotice = ref('')
const identity = ref({ id: '-', name: 'Local customer', accessBoundary: 'Loading customer read-only fixture.' })

const orderTagType = (status) => ({
  draft: 'info',
  pending_deposit: 'warning',
  confirmed: 'success',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger'
}[status] || 'info')

const loadOrder = async () => {
  loading.value = true
  try {
    const result = await fetchCustomerOrderDetail(route.params.id)
    order.value = result.item
    dataSource.value = result.source
    identity.value = result.identity
    apiNotice.value = result.api_error || ''
  } finally {
    loading.value = false
  }
}

onMounted(loadOrder)
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
.next-step span,
.next-step small {
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

.next-step p {
  margin: 4px 0 8px;
}

.blocked-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

@media (max-width: 820px) {
  .page-hero,
  .content-grid {
    display: block;
  }
}
</style>
