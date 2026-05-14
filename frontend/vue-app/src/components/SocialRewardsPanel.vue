<template>
  <section class="social-rewards-panel">
    <div class="panel-header">
      <div>
        <p class="eyebrow">{{ mode === 'admin' ? 'Admin rewards context' : 'Customer rewards' }}</p>
        <h2>{{ title }}</h2>
      </div>
      <button type="button" @click="openRewards">{{ mode === 'admin' ? 'Review rewards' : 'Open My Rewards' }}</button>
    </div>
    <p class="intro">
      Share rewards are local/staging placeholders. They do not post to social channels, send messages, trigger webhooks, or create payment effects.
    </p>
    <div class="reward-stats">
      <div><span>Approved points</span><strong>{{ summary.approvedPoints }}</strong></div>
      <div><span>Pending points</span><strong>{{ summary.pendingPoints }}</strong></div>
      <div><span>Submissions</span><strong>{{ relevantSubmissions.length }}</strong></div>
    </div>
    <ul class="submission-list">
      <li v-for="item in relevantSubmissions.slice(0, 3)" :key="item.id">
        <strong>{{ item.status }}</strong>
        <span>{{ item.order_number || orderNumber || 'order context' }} · {{ item.caption || 'No caption' }}</span>
      </li>
      <li v-if="!relevantSubmissions.length">
        <strong>No reward submission yet</strong>
        <span>Customer can submit UGC for local/staging review from My Order Detail.</span>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRewardSummary, seedRewardDemoIfEmpty } from '@/services/socialRewardsService';

const props = defineProps({
  customerId: {
    type: String,
    default: 'customer-local-41'
  },
  orderId: {
    type: String,
    default: ''
  },
  orderNumber: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'customer'
  },
  title: {
    type: String,
    default: 'Share & rewards status'
  }
});

const router = useRouter();
const summary = computed(() => getRewardSummary(props.customerId || 'customer-local-41'));
const relevantSubmissions = computed(() => {
  if (!props.orderId && !props.orderNumber) return summary.value.submissions;
  return summary.value.submissions.filter((item) => (
    String(item.order_id) === String(props.orderId) || String(item.order_number) === String(props.orderNumber)
  ));
});

const openRewards = () => {
  router.push(props.mode === 'admin' ? '/admin/social-rewards' : '/my/rewards');
};

onMounted(() => {
  seedRewardDemoIfEmpty();
});
</script>

<style scoped>
.social-rewards-panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #0f172a;
}

.intro {
  margin: 12px 0;
  color: #475569;
  line-height: 1.6;
}

button {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #fff;
  color: #2563eb;
  font-weight: 800;
  cursor: pointer;
}

.reward-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.reward-stats div {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
}

.reward-stats span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.reward-stats strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 20px;
}

.submission-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.submission-list li {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}

.submission-list strong,
.submission-list span {
  display: block;
}

.submission-list span {
  margin-top: 3px;
  color: #64748b;
}

@media (max-width: 700px) {
  .panel-header,
  .reward-stats {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
