<template>
  <main class="rewards-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">Social Sharing Rewards · local/staging</p>
        <h1>My Rewards</h1>
        <p>Submit UGC shares, track review status, and preview future voucher rewards. No real social posting, payment, webhook, n8n, email, SMS, or WhatsApp is triggered.</p>
      </div>
      <el-button type="primary" @click="router.push('/my/orders')">Open My Orders</el-button>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Staging only: voucher and points are placeholders until production reward policy is approved."
    />

    <section class="summary-grid">
      <article class="summary-card">
        <span>Approved points</span>
        <strong>{{ summary.approvedPoints }}</strong>
      </article>
      <article class="summary-card">
        <span>Pending points</span>
        <strong>{{ summary.pendingPoints }}</strong>
      </article>
      <article class="summary-card">
        <span>Submissions</span>
        <strong>{{ summary.submissions.length }}</strong>
      </article>
      <article class="summary-card">
        <span>Voucher placeholders</span>
        <strong>{{ summary.voucherPlaceholders.length }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel">
        <h2>Submit a social share</h2>
        <p class="panel-intro">Paste a post link or describe the share. The team reviews it before points are approved.</p>
        <label>
          Channel
          <el-select v-model="form.channel">
            <el-option label="Instagram" value="instagram" />
            <el-option label="TikTok" value="tiktok" />
            <el-option label="Facebook" value="facebook" />
            <el-option label="WeChat / private share" value="wechat_private" />
          </el-select>
        </label>
        <label>
          Post URL / placeholder
          <el-input v-model="form.post_url" placeholder="https://example.com/your-party-post" />
        </label>
        <label>
          Caption / notes
          <el-input v-model="form.caption" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </label>
        <div class="checks">
          <el-checkbox v-model="form.permission_to_reuse">PartyOnce may reuse this content in staging/investor demo</el-checkbox>
          <el-checkbox v-model="form.includes_partyonce_tag">Post mentions PartyOnce</el-checkbox>
          <el-checkbox v-model="form.includes_venue_or_theme">Post mentions theme or venue</el-checkbox>
        </div>
        <el-button type="primary" @click="submitShare">Submit for review</el-button>
      </article>

      <article class="panel">
        <h2>Reward rules</h2>
        <ul class="rules-list">
          <li v-for="rule in summary.rewardPointRules" :key="rule.id">
            <strong>{{ rule.label }} · {{ rule.points }} pts</strong>
            <span>{{ rule.customerText }}</span>
          </li>
        </ul>
      </article>
    </section>

    <section class="panel">
      <h2>Submission status</h2>
      <el-table :data="summary.submissions" empty-text="No share submissions yet">
        <el-table-column prop="channel" label="Channel" width="130" />
        <el-table-column prop="caption" label="Caption / notes" min-width="260" />
        <el-table-column label="Status" width="150">
          <template #default="{ row }">
            <el-tag :type="row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Points" width="150">
          <template #default="{ row }">
            {{ row.points_awarded || row.points_pending }} {{ row.status === 'approved' ? 'approved' : 'pending' }}
          </template>
        </el-table-column>
        <el-table-column prop="review_note" label="Review note" min-width="240" />
      </el-table>
    </section>

    <section class="panel">
      <h2>Voucher placeholders</h2>
      <div class="voucher-grid">
        <article v-for="voucher in summary.voucherPlaceholders" :key="voucher.id" class="voucher-card">
          <span>{{ voucher.value }}</span>
          <strong>{{ voucher.title }}</strong>
          <p>{{ voucher.pointsRequired }} points required</p>
          <small>{{ voucher.terms }}</small>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  createRewardSubmission,
  getRewardSummary,
  seedRewardDemoIfEmpty
} from '@/services/socialRewardsService'

const router = useRouter()
const customerId = 'customer-local-41'
const refreshToken = ref(0)
const form = reactive({
  channel: 'instagram',
  post_url: '',
  caption: '',
  permission_to_reuse: true,
  includes_partyonce_tag: true,
  includes_venue_or_theme: true
})

const summary = computed(() => {
  refreshToken.value
  return getRewardSummary(customerId)
})

const submitShare = () => {
  if (!form.caption.trim() && !form.post_url.trim()) {
    ElMessage.warning('Add a caption or post URL for review.')
    return
  }
  createRewardSubmission({
    ...form,
    customer_id: customerId,
    customer_name: 'Local Demo Customer',
    order_id: 'order-local-1001',
    order_number: 'PO-LOCAL-1001'
  })
  form.post_url = ''
  form.caption = ''
  refreshToken.value += 1
  ElMessage.success('Share submitted for local/staging review. No external post or message was sent.')
}

onMounted(() => {
  seedRewardDemoIfEmpty()
  refreshToken.value += 1
})
</script>

<style scoped>
.rewards-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 8px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0 0 10px;
  color: #0f172a;
}

.page-hero p,
.panel-intro,
.rules-list span,
.voucher-card small {
  color: #64748b;
  line-height: 1.6;
}

.scope-alert,
.summary-grid,
.content-grid,
.panel {
  margin-top: 18px;
}

.summary-grid,
.content-grid,
.voucher-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.content-grid {
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.8fr);
}

.voucher-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.summary-card,
.panel,
.voucher-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-card span,
.voucher-card span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  font-size: 26px;
}

label,
.rules-list,
.checks {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
  font-weight: 700;
}

.rules-list {
  padding: 0;
  list-style: none;
}

.rules-list li {
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
}

.rules-list span,
.rules-list strong,
.voucher-card span,
.voucher-card strong,
.voucher-card small {
  display: block;
}

@media (max-width: 820px) {
  .page-hero,
  .content-grid {
    display: block;
  }
}
</style>
