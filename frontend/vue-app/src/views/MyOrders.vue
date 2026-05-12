<template>
  <main class="customer-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">Customer workspace</p>
        <h1>My Orders</h1>
        <p>Track your order status, event details, amount, placeholder deposit, and next action.</p>
      </div>
      <div class="hero-actions">
        <el-button @click="router.push('/my/inquiries')">My Inquiries</el-button>
        <el-button type="primary" @click="router.push('/my/quotes')">My Quotes</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="pending_deposit is a business status only. Stripe/payment is not enabled in this workpack."
    />

    <section class="toolbar">
      <el-input v-model="searchQuery" clearable placeholder="Search order number, location, theme, or quote" />
      <el-select v-model="statusFilter" clearable placeholder="Status">
        <el-option label="All statuses" value="" />
        <el-option v-for="(label, status) in orderStatuses" :key="status" :label="`${status} · ${label}`" :value="status" />
      </el-select>
    </section>

    <section class="cards-grid">
      <article v-for="order in filteredOrders" :key="order.id" class="customer-card">
        <div class="card-head">
          <div>
            <strong>{{ order.order_number }}</strong>
            <span>Quote {{ order.quote_number }}</span>
          </div>
          <el-tag :type="orderTagType(order.status)" effect="plain">{{ order.status_text }}</el-tag>
        </div>

        <dl class="detail-list">
          <div>
            <dt>Event date</dt>
            <dd>{{ formatCustomerDate(order.event_date) }}</dd>
          </div>
          <div>
            <dt>Event location</dt>
            <dd>{{ order.event_location }}</dd>
          </div>
          <div>
            <dt>Total amount</dt>
            <dd>{{ formatCustomerMoney(order.total_amount, order.currency) }}</dd>
          </div>
          <div>
            <dt>Deposit placeholder</dt>
            <dd>{{ formatCustomerMoney(order.deposit_amount, order.currency) }}</dd>
          </div>
        </dl>

        <div class="next-step">
          <span>Next step</span>
          <p>{{ order.next_step }}</p>
        </div>

        <el-button type="primary" @click="router.push(`/my/orders/${order.id}`)">View Order Detail</el-button>
      </article>
    </section>

    <el-empty v-if="!loading && filteredOrders.length === 0" description="No orders yet">
      <el-button type="primary" @click="router.push('/my/quotes')">Open My Quotes</el-button>
    </el-empty>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchCustomerOrders,
  formatCustomerDate,
  formatCustomerMoney,
  orderStatuses
} from '@/services/customerExperienceService'

const router = useRouter()
const loading = ref(false)
const orders = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return orders.value.filter((order) => {
    const matchesStatus = !statusFilter.value || order.status === statusFilter.value
    if (!query) return matchesStatus
    const haystack = [
      order.order_number,
      order.quote_number,
      order.event_location,
      order.theme,
      order.package,
      order.status
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesStatus && haystack.includes(query)
  })
})

const orderTagType = (status) => ({
  draft: 'info',
  pending_deposit: 'warning',
  confirmed: 'success',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger'
}[status] || 'info')

const loadOrders = async () => {
  loading.value = true
  try {
    const result = await fetchCustomerOrders()
    orders.value = result.items
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)
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
