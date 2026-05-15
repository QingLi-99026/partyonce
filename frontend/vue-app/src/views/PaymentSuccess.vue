<template>
  <main class="status-page">
    <section class="status-card">
      <p class="eyebrow">Test-mode payment status</p>
      <h1>Test Payment Success Placeholder</h1>
      <p>This page is for local/staging readiness only. It does not prove a live charge, send confirmation email, or update production order state.</p>
      <dl>
        <div><dt>Order</dt><dd>{{ orderNumber }}</dd></div>
        <div><dt>Amount</dt><dd>{{ amount }}</dd></div>
        <div><dt>Readiness source</dt><dd>{{ snapshot?.readiness?.mode || 'not recorded' }}</dd></div>
      </dl>
      <div class="actions">
        <el-button type="primary" @click="router.push('/my/orders')">My Orders</el-button>
        <el-button @click="router.push('/payment/deposit')">Back to Readiness</el-button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { readPaymentReadinessSnapshot } from '@/services/paymentReadinessService'

const route = useRoute()
const router = useRouter()
const snapshot = readPaymentReadinessSnapshot()
const orderNumber = computed(() => route.query.order_number || snapshot?.order?.order_number || 'PO-TEST-READINESS')
const amount = computed(() => route.query.amount || snapshot?.order?.deposit_amount || 'test-mode only')
</script>

<style scoped>
.status-page { min-height: 100vh; display: grid; place-items: center; background: #f8fafc; padding: 24px; }
.status-card { max-width: 680px; border: 1px solid #bbf7d0; border-radius: 8px; background: #fff; padding: 32px; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08); }
.eyebrow { margin: 0 0 8px; color: #16a34a; font-size: 13px; font-weight: 700; text-transform: uppercase; }
h1 { margin: 0 0 10px; color: #0f172a; }
p, dt { color: #64748b; }
dl { display: grid; gap: 10px; margin: 20px 0; }
dd { margin: 4px 0 0; color: #0f172a; font-weight: 650; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
</style>
