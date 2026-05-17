<template>
  <main class="admin-rewards-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">Admin Review · local/staging</p>
        <h1>Social Sharing Rewards Review</h1>
        <p>
          Review customer UGC proof, approve placeholder points and voucher status, or reject with a visible reason.
          This page updates only in-app localStorage status and never posts to social platforms or sends customer messages.
        </p>
      </div>
      <el-button @click="router.push('/my/rewards')">Open customer rewards</el-button>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Admin reward review is local/staging only. Voucher placeholders are not redeemable and no outbound notification is sent."
    />

    <section class="summary-grid">
      <article class="summary-card">
        <span>Total submissions</span>
        <strong>{{ submissions.length }}</strong>
      </article>
      <article class="summary-card">
        <span>Pending review</span>
        <strong>{{ pendingCount }}</strong>
      </article>
      <article class="summary-card">
        <span>Approved points</span>
        <strong>{{ approvedPoints }}</strong>
      </article>
      <article class="summary-card">
        <span>Issued placeholders</span>
        <strong>{{ voucherCount }}</strong>
      </article>
    </section>

    <section class="panel">
      <h2>Customer-facing fixed rewards</h2>
      <p class="panel-intro">
        Keep the public rule simple. Admin can still use points as local/staging accounting, but customers should see
        fixed vouchers or free upgrade placeholders after manual review.
      </p>
      <div class="rules-grid">
        <article v-for="offer in fixedRewardOffers" :key="offer.id">
          <strong>{{ offer.title }}</strong>
          <span>{{ offer.trigger }}</span>
          <p>{{ offer.adminCheck }}</p>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>UGC submission queue</h2>
      <el-table :data="submissions" empty-text="No reward submissions">
        <el-table-column label="Customer / Order" min-width="180">
          <template #default="{ row }">
            <strong>{{ row.customer_name }}</strong>
            <small>{{ row.order_number || row.order_id }}</small>
          </template>
        </el-table-column>
        <el-table-column label="Proof" min-width="280">
          <template #default="{ row }">
            <strong>{{ platformLabel(row.platform || row.channel) }} · {{ row.proof_type }}</strong>
            <small>{{ row.proof_url || row.post_url || row.proof_note || 'No proof detail' }}</small>
          </template>
        </el-table-column>
        <el-table-column label="Signals" min-width="220">
          <template #default="{ row }">
            <span>{{ row.permission_to_reuse ? 'reuse ok' : 'reuse missing' }}</span>
            <small>{{ row.includes_partyonce_tag ? 'PartyOnce tag' : 'no tag' }} · {{ row.includes_venue_or_theme ? 'venue/theme mentioned' : 'no venue/theme' }}</small>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="150">
          <template #default="{ row }">
            <el-tag :type="statusType(row.review_status || row.status)">{{ row.review_status || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Review note" min-width="280">
          <template #default="{ row }">
            <el-input
              v-model="reviewForm(row).review_reason"
              type="textarea"
              :rows="2"
              maxlength="260"
              show-word-limit
              placeholder="Reason shown to customer in-app"
            />
            <el-select v-model="reviewForm(row).voucher_placeholder_id" class="voucher-select">
              <el-option v-for="voucher in voucherPlaceholders" :key="voucher.id" :label="voucher.title" :value="voucher.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="success" @click="approve(row)">Approve</el-button>
            <el-button size="small" type="danger" plain @click="reject(row)">Reject</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="panel">
      <h2>Points and voucher rules</h2>
      <div class="rules-grid">
        <article v-for="rule in rewardPointRules" :key="rule.id">
          <strong>{{ rule.label }}</strong>
          <span>{{ rule.points }} points · {{ rule.status }}</span>
          <p>{{ rule.customerText }}</p>
        </article>
        <article v-for="voucher in voucherPlaceholders" :key="voucher.id">
          <strong>{{ voucher.title }}</strong>
          <span>{{ voucher.pointsRequired }} points · {{ voucher.value }}</span>
          <p>{{ voucher.terms }}</p>
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
  fixedRewardOffers,
  listRewardSubmissions,
  reviewRewardSubmission,
  rewardPointRules,
  seedRewardDemoIfEmpty,
  socialSharePlatforms,
  voucherPlaceholders
} from '@/services/socialRewardsService'

const router = useRouter()
const submissions = ref([])
const reviewForms = reactive({})

const refresh = () => {
  submissions.value = listRewardSubmissions()
  submissions.value.forEach((row) => reviewForm(row))
}

const reviewForm = (row) => {
  if (!reviewForms[row.id]) {
    reviewForms[row.id] = {
      review_reason: row.review_reason || row.review_note || '',
      voucher_placeholder_id: row.voucher_placeholder_id || 'voucher-500-20'
    }
  }
  return reviewForms[row.id]
}

const pendingCount = computed(() => submissions.value.filter((item) => (item.review_status || item.status) === 'pending_review').length)
const approvedPoints = computed(() => submissions.value.reduce((sum, item) => sum + Number(item.points_awarded || 0), 0))
const voucherCount = computed(() => submissions.value.filter((item) => item.voucher_placeholder_id).length)

const platformLabel = (id) => socialSharePlatforms.find((item) => item.id === id)?.label || id
const statusType = (status) => status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'

const approve = (row) => {
  const form = reviewForm(row)
  reviewRewardSubmission(row.id, {
    status: 'approved',
    voucher_placeholder_id: form.voucher_placeholder_id,
    review_reason: form.review_reason || 'Approved in local/staging admin review. Voucher remains a placeholder.'
  })
  refresh()
  ElMessage.success('Reward approved locally. In-app status updated; no external notification was sent.')
}

const reject = (row) => {
  const form = reviewForm(row)
  reviewRewardSubmission(row.id, {
    status: 'rejected',
    review_reason: form.review_reason || 'Proof was not clear enough for local/staging review. Please resubmit with a public link or clearer screenshot note.'
  })
  refresh()
  ElMessage.warning('Reward rejected locally. In-app status updated; no external notification was sent.')
}

onMounted(() => {
  seedRewardDemoIfEmpty()
  refresh()
})
</script>

<style scoped>
.admin-rewards-page {
  max-width: 1220px;
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
}

.page-hero p,
.panel-intro,
.rules-grid p,
:deep(.el-table small) {
  color: #64748b;
  line-height: 1.6;
}

.scope-alert,
.summary-grid,
.panel {
  margin-top: 18px;
}

.summary-grid,
.rules-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.rules-grid {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.summary-card,
.panel,
.rules-grid article {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-card span,
.rules-grid span,
:deep(.el-table small) {
  display: block;
}

.summary-card span,
.rules-grid span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  font-size: 26px;
}

.voucher-select {
  width: 100%;
  margin-top: 8px;
}

@media (max-width: 820px) {
  .page-hero {
    display: block;
  }
}
</style>
