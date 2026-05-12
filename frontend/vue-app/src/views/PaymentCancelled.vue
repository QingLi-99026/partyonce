<template>
  <main class="status-page">
    <section class="status-card">
      <p class="eyebrow">Stripe test-mode status</p>
      <h1>Payment Cancelled Placeholder</h1>
      <p>This local/staging page confirms cancellation copy and routing only. It does not contact customers or release/hold inventory.</p>
      <dl>
        <div><dt>Order</dt><dd>{{ orderNumber }}</dd></div>
        <div><dt>Boundary</dt><dd>No PaymentIntent, webhook, n8n, email, SMS, or WhatsApp was triggered.</dd></div>
      </dl>
      <div class="actions">
        <el-button type="primary" @click="router.push('/payment/deposit')">Back to Readiness</el-button>
        <el-button @click="router.push('/my/orders')">My Orders</el-button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const orderNumber = computed(() => route.query.order_number || 'PO-TEST-READINESS')
</script>

<style scoped>
.status-page { min-height: 100vh; display: grid; place-items: center; background: #f8fafc; padding: 24px; }
.status-card { max-width: 680px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; padding: 32px; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08); }
.eyebrow { margin: 0 0 8px; color: #475569; font-size: 13px; font-weight: 700; text-transform: uppercase; }
h1 { margin: 0 0 10px; color: #0f172a; }
p, dt { color: #64748b; }
dl { display: grid; gap: 10px; margin: 20px 0; }
dd { margin: 4px 0 0; color: #0f172a; font-weight: 650; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
</style>
