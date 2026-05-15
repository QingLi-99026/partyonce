<template>
  <main class="feature-unavailable-page">
    <section class="status-card">
      <p class="eyebrow">Feature flag · staging-safe</p>
      <h1>3D Preview is temporarily unavailable</h1>
      <p class="lead">
        3D / 场景预览暂未开放，目前不作为正式商用功能展示。当前演示主线聚焦 Venue Finder、主题套餐、Quote 和分享奖励闭环。
      </p>

      <div class="status-grid">
        <article>
          <strong>Current status</strong>
          <span>Hidden from customer-facing navigation</span>
        </article>
        <article>
          <strong>Safety boundary</strong>
          <span>No real 3D editor, construction drawing, or supplier execution output is promised.</span>
        </article>
        <article>
          <strong>Future path</strong>
          <span>The underlying sandbox can be re-enabled after quality validation.</span>
        </article>
      </div>

      <div class="actions">
        <button type="button" @click="router.push('/')">Back to home</button>
        <button type="button" class="secondary" @click="router.push('/venue-finder')">Open Venue Finder</button>
        <button type="button" class="secondary" @click="router.push('/quote')">Get a quote</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.feature-unavailable-page {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: 110px 24px 64px;
  background:
    radial-gradient(circle at top left, rgba(255, 214, 165, 0.35), transparent 28%),
    linear-gradient(180deg, #fff7ed 0%, #fff 48%, #f8fafc 100%);
}

.status-card {
  width: min(980px, 100%);
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  padding: 32px;
  box-shadow: 0 20px 50px rgba(124, 45, 18, 0.12);
}

.eyebrow {
  margin: 0 0 10px;
  color: #c2410c;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #111827;
  font-size: clamp(30px, 5vw, 54px);
  line-height: 1.05;
}

.lead {
  max-width: 760px;
  margin: 16px 0 0;
  color: #475569;
  font-size: 18px;
  line-height: 1.7;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.status-grid article {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.status-grid strong,
.status-grid span {
  display: block;
}

.status-grid strong {
  color: #0f172a;
}

.status-grid span {
  margin-top: 6px;
  color: #64748b;
  line-height: 1.55;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

button {
  min-height: 44px;
  border: 0;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  padding: 0 18px;
  font-weight: 800;
  cursor: pointer;
}

button.secondary {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}
</style>
