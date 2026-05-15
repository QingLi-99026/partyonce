<template>
  <main class="status-page">
    <section class="status-card">
      <p class="eyebrow">Test-mode payment status</p>
      <h1>Test Payment Failed Placeholder</h1>
      <p>No live payment was attempted. Use this route to verify customer-facing failure copy before real test-mode payment work starts.</p>
      <el-alert class="status-alert" type="warning" :closable="false" show-icon :title="errorMessage" />
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
const errorMessage = computed(() => route.query.error || 'Test-mode failure placeholder. No card was charged.')
</script>

<style scoped>
.status-page { min-height: 100vh; display: grid; place-items: center; background: #f8fafc; padding: 24px; }
.status-card { max-width: 680px; border: 1px solid #fed7aa; border-radius: 8px; background: #fff; padding: 32px; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08); }
.eyebrow { margin: 0 0 8px; color: #ea580c; font-size: 13px; font-weight: 700; text-transform: uppercase; }
h1 { margin: 0 0 10px; color: #0f172a; }
p { color: #64748b; }
.status-alert { margin: 18px 0; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
</style>
