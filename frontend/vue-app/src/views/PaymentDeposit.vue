<template>
  <main class="payment-readiness-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">Payment readiness</p>
        <h1>Test-Mode Payment Preparation</h1>
        <p>Local/staging readiness gate. Deposit payment is not enabled in this preview and no real payment will be triggered.</p>
      </div>
      <el-tag :type="readiness.ready ? 'success' : 'warning'" effect="plain" size="large">
        {{ readiness.ready ? 'test-mode ready' : 'blocked' }}
      </el-tag>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Readiness only: no live payment, no webhook/n8n, and no outbound message."
    />

    <section class="parent-trust-panel">
      <div>
        <p class="eyebrow">Parent-safe payment boundary</p>
        <h2>No card charge happens in this preview</h2>
        <p>
          This page is a staging readiness check only. Families should first receive a
          human-reviewed quote, confirm venue and supplier availability, then move to
          a separate approved deposit step.
        </p>
      </div>
      <ul>
        <li v-for="item in trustChecklist" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="process-panel">
      <p class="eyebrow">Quote-to-deposit path</p>
      <h2>Four steps before any future deposit</h2>
      <div class="process-grid">
        <article v-for="(step, index) in quoteProcessSteps" :key="step.id">
          <span>{{ index + 1 }}</span>
          <strong>{{ step.title }}</strong>
          <small>{{ step.body }}</small>
        </article>
      </div>
    </section>

    <section class="content-grid">
      <article class="panel">
        <h2>Order Snapshot</h2>
        <dl class="detail-list">
          <div><dt>Order number</dt><dd>{{ snapshot.order.order_number }}</dd></div>
          <div><dt>Event type</dt><dd>{{ snapshot.order.event_type }}</dd></div>
          <div><dt>Event date</dt><dd>{{ snapshot.order.event_date || '-' }}</dd></div>
          <div><dt>Venue</dt><dd>{{ snapshot.order.venue_name }}</dd></div>
          <div><dt>Deposit placeholder</dt><dd>{{ formatMoney(snapshot.order.deposit_amount, snapshot.order.currency) }}</dd></div>
        </dl>
      </article>

      <article class="panel">
        <h2>Test-Mode Payment Checks</h2>
        <ul class="check-list">
          <li :class="{ ok: readiness.testModeEnabled }">
            <span>{{ readiness.testModeEnabled ? 'OK' : 'WAIT' }}</span>
            <p>Test mode flag enabled</p>
          </li>
          <li :class="{ ok: readiness.hasTestPublishableKey }">
            <span>{{ readiness.hasTestPublishableKey ? 'OK' : 'WAIT' }}</span>
            <p>Publishable key is `pk_test_*`</p>
          </li>
          <li :class="{ ok: !readiness.hasLivePublishableKey }">
            <span>{{ !readiness.hasLivePublishableKey ? 'OK' : 'BLOCK' }}</span>
            <p>No live key detected</p>
          </li>
        </ul>
        <p class="key-line">Configured key: {{ readiness.publishableKeyMasked || 'not configured' }}</p>
      </article>
    </section>

    <section class="panel">
      <h2>Blockers</h2>
      <el-empty v-if="readiness.blockers.length === 0" description="No local readiness blockers" />
      <ul v-else class="blocker-list">
        <li v-for="blocker in readiness.blockers" :key="blocker">{{ blocker }}</li>
      </ul>
    </section>

    <section class="panel">
      <h2>Test-Mode Next Step</h2>
      <p>{{ readiness.boundary }}</p>
      <div class="actions">
        <el-button type="primary" :disabled="!readiness.ready" @click="prepareTestMode">
          Prepare test card field
        </el-button>
        <el-button @click="router.push('/my/orders')">Back to My Orders</el-button>
        <el-button @click="router.push('/payment/cancelled')">Open Cancelled State</el-button>
      </div>
      <div v-if="stripeMounted" class="test-card-shell">
        <p>Test card field mounted. Payment confirmation remains disabled until a separate approved backend test-payment endpoint exists.</p>
        <div ref="cardMountRef" class="card-mount"></div>
        <el-button disabled>Confirm test payment · backend not enabled</el-button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  buildPaymentReadinessSnapshot,
  getPaymentReadiness,
  savePaymentReadinessSnapshot
} from '@/services/paymentReadinessService'
import { getQuoteProcessSteps, getTrustChecklist } from '@/data/parentTrustContent'

const route = useRoute()
const router = useRouter()
const readiness = ref(getPaymentReadiness())
const cardMountRef = ref(null)
const stripeMounted = ref(false)
const trustChecklist = getTrustChecklist()
const quoteProcessSteps = getQuoteProcessSteps()
const snapshot = ref(buildPaymentReadinessSnapshot({
  order_number: route.query.order_number,
  amount: route.query.amount,
  event_date: route.query.event_date,
  venue_name: route.query.venue_name
}))

const formatMoney = (amount, currency = 'AUD') => {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(Number(amount || 0))
}

const canMountStripe = computed(() => readiness.value.ready && !stripeMounted.value)

const prepareTestMode = async () => {
  if (!canMountStripe.value) return
  const { loadStripe } = await import('@stripe/stripe-js')
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  if (!stripe) {
    ElMessage.error('Test payment field could not be initialized with the test publishable key.')
    return
  }
  const elements = stripe.elements()
  const card = elements.create('card', { hidePostalCode: true })
  card.mount(cardMountRef.value)
  stripeMounted.value = true
  ElMessage.success('Test card field mounted. Payment confirmation is still blocked.')
}

onMounted(() => {
  readiness.value = getPaymentReadiness()
  snapshot.value = buildPaymentReadinessSnapshot(snapshot.value.order)
  savePaymentReadinessSnapshot(snapshot.value)
})
</script>

<style scoped>
.payment-readiness-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
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

.page-hero p,
.panel p,
dt {
  color: #64748b;
}

.scope-alert,
.parent-trust-panel,
.content-grid,
.panel {
  margin-bottom: 18px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.parent-trust-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 16px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  padding: 18px;
}

.parent-trust-panel ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.process-panel {
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  margin-bottom: 18px;
  padding: 18px;
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.process-grid article {
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

.process-grid span {
  display: inline-grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-weight: 900;
}

.process-grid strong,
.process-grid small {
  display: block;
  margin-top: 8px;
}

.process-grid small {
  color: #64748b;
  line-height: 1.5;
}

.parent-trust-panel li {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  color: #92400e;
  padding: 10px 12px;
  font-weight: 650;
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

.check-list,
.blocker-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.check-list li {
  display: flex;
  gap: 10px;
  align-items: center;
  border-radius: 8px;
  background: #fff7ed;
  padding: 10px;
}

.check-list li.ok {
  background: #f0fdf4;
}

.check-list span {
  min-width: 52px;
  border-radius: 999px;
  background: #fed7aa;
  color: #9a3412;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.check-list li.ok span {
  background: #bbf7d0;
  color: #166534;
}

.check-list p {
  margin: 0;
}

.key-line {
  margin: 12px 0 0;
  font-family: monospace;
}

.blocker-list li {
  border-radius: 8px;
  background: #fef2f2;
  color: #991b1b;
  padding: 10px 12px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.test-card-shell {
  margin-top: 16px;
  border-radius: 8px;
  background: #f8fafc;
  padding: 14px;
}

.card-mount {
  margin: 12px 0;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

@media (max-width: 720px) {
  .page-hero {
    display: block;
  }

  .parent-trust-panel {
    grid-template-columns: 1fr;
  }

  .process-grid {
    grid-template-columns: 1fr;
  }
}
</style>
