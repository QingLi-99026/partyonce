<template>
  <main class="rewards-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">Social Sharing Rewards · local/staging</p>
        <h1>Share after party and claim reward</h1>
        <p>
          A simple customer-friendly reward loop: share the party from your own social account,
          submit proof, and let the team review a fixed voucher or free upgrade placeholder.
          We never collect social passwords and no outbound message is sent.
        </p>
      </div>
      <div class="hero-actions">
        <el-button @click="router.push('/my/orders')">Open My Orders</el-button>
        <el-button type="primary" @click="router.push('/share')">Open /share</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Staging only: rewards are voucher / upgrade placeholders until production policy is approved."
      description="No real coupon, payment discount, webhook, n8n, email, SMS, WhatsApp, or social platform API is triggered."
    />

    <section class="reward-process panel">
      <h2>How the reward works</h2>
      <div class="reward-process-grid">
        <article>
          <span>1</span>
          <strong>Share with your own account</strong>
          <p>Post a party photo, short video, or private recommendation. Use your own TikTok, Instagram, 小红书, Facebook, or private channel.</p>
        </article>
        <article>
          <span>2</span>
          <strong>Friend submits a quote or you submit proof</strong>
          <p>In staging, we collect a post link or screenshot note. Future production can connect this to referral quote submissions.</p>
        </article>
        <article>
          <span>3</span>
          <strong>Team reviews and issues a placeholder reward</strong>
          <p>Approval can unlock a $30 voucher, free balloon upgrade, or free photo-corner upgrade placeholder.</p>
        </article>
      </div>
    </section>

    <section class="panel fixed-rewards-panel">
      <h2>Simple reward options</h2>
      <p class="panel-intro">
        Parents should not need to understand a complex points ladder. The visible customer promise stays simple:
        submit a real share proof, wait for manual review, then receive one fixed voucher or free upgrade placeholder.
      </p>
      <div class="fixed-reward-grid">
        <article v-for="offer in summary.fixedRewardOffers" :key="offer.id">
          <span>{{ offer.shortTitle }}</span>
          <strong>{{ offer.title }}</strong>
          <p>{{ offer.customerText }}</p>
          <small>{{ offer.trigger }}</small>
        </article>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card">
        <span>Approved review credit</span>
        <strong>{{ summary.approvedPoints }}</strong>
      </article>
      <article class="summary-card">
        <span>Pending review credit</span>
        <strong>{{ summary.pendingPoints }}</strong>
      </article>
      <article class="summary-card">
        <span>Submissions</span>
        <strong>{{ summary.submissions.length }}</strong>
      </article>
      <article class="summary-card">
        <span>Voucher placeholders</span>
        <strong>{{ summary.availableVouchers.length }} available</strong>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel">
        <h2>1. Choose a platform and copy a caption</h2>
        <p class="panel-intro">
          Publish from your own account. If a platform does not support direct web upload, copy the caption and open the app manually.
        </p>

        <label>
          Platform
          <el-select v-model="form.platform" @change="syncTemplateText">
            <el-option v-for="platform in socialSharePlatforms" :key="platform.id" :label="platform.label" :value="platform.id" />
          </el-select>
        </label>

        <label>
          Caption template
          <el-select v-model="form.copy_template_id" @change="syncTemplateText">
            <el-option v-for="template in shareCopyTemplates" :key="template.id" :label="template.label" :value="template.id" />
          </el-select>
        </label>

        <label>
          Share caption / free text
          <el-input v-model="form.share_text" type="textarea" :rows="5" maxlength="700" show-word-limit />
        </label>

        <div class="button-row">
          <el-button type="primary" @click="copyShareText">Copy caption</el-button>
          <el-button @click="openPlatform">Open platform</el-button>
        </div>
        <p class="platform-note">{{ currentPlatform.instruction }}</p>
        <el-alert
          v-if="copyFallback"
          class="manual-copy"
          type="info"
          :closable="false"
          title="Clipboard was not available. Please copy the caption manually from the text box above."
        />
      </article>

      <article class="panel">
        <h2>2. Submit proof for review</h2>
        <p class="panel-intro">
          After posting, paste a public post link or describe the screenshot/proof. File upload is mocked in this preview, so screenshot evidence is captured as a note.
        </p>

        <label>
          Proof type
          <el-select v-model="form.proof_type">
            <el-option label="Post URL" value="post_url" />
            <el-option label="Screenshot filename / note" value="screenshot_note" />
            <el-option label="Private share note" value="private_share_note" />
          </el-select>
        </label>

        <label>
          Post URL
          <el-input v-model="form.proof_url" placeholder="https://example.com/your-party-post" />
        </label>

        <label>
          Screenshot / proof note
          <el-input v-model="form.proof_note" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="Example: uploaded screenshot filename, post time, platform handle visible, or private share explanation." />
        </label>

        <div class="checks">
          <el-checkbox v-model="form.permission_to_reuse">PartyOnce may reuse this content in staging/investor demo</el-checkbox>
          <el-checkbox v-model="form.includes_partyonce_tag">Post mentions PartyOnce / Party Event</el-checkbox>
          <el-checkbox v-model="form.includes_venue_or_theme">Post mentions theme or venue</el-checkbox>
        </div>

        <el-button type="primary" @click="submitShare">Submit for review</el-button>
      </article>
    </section>

    <section class="panel">
      <h2>Reward rules</h2>
      <p class="panel-intro">
        Keep production rules simple: no complicated point tiers for parents. The current point display is a staging
        accounting layer for admin review only; customer-facing rewards should be fixed vouchers or free upgrades.
      </p>
      <ul class="rules-list">
        <li v-for="rule in summary.rewardPointRules" :key="rule.id">
          <strong>{{ rule.label }} · {{ rule.points }} pts</strong>
          <span>{{ rule.customerText }}</span>
        </li>
      </ul>
    </section>

    <section class="panel">
      <h2>Submission status</h2>
      <el-table :data="summary.submissions" empty-text="No share submissions yet">
        <el-table-column label="Platform" width="150">
          <template #default="{ row }">{{ platformLabel(row.platform || row.channel) }}</template>
        </el-table-column>
        <el-table-column label="Proof" min-width="260">
          <template #default="{ row }">
            <strong>{{ row.proof_url || row.post_url || row.proof_type }}</strong>
            <small>{{ row.proof_note || row.caption || row.share_text }}</small>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="150">
          <template #default="{ row }">
            <el-tag :type="statusType(row.review_status || row.status)">{{ row.review_status || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Reward" min-width="210">
          <template #default="{ row }">
            <strong>{{ row.points_awarded || row.points_pending }} {{ row.status === 'approved' ? 'approved' : 'pending' }} pts</strong>
            <small v-if="row.voucher_placeholder_id">{{ voucherTitle(row.voucher_placeholder_id) }} · {{ row.voucher_status }}</small>
          </template>
        </el-table-column>
        <el-table-column label="Review result" min-width="260">
          <template #default="{ row }">
            <span>{{ row.review_reason || row.review_note }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="panel">
      <h2>Voucher placeholders</h2>
      <div class="voucher-grid">
        <article v-for="voucher in summary.voucherPlaceholders" :key="voucher.id" class="voucher-card" :class="{ active: summary.availableVouchers.some((item) => item.id === voucher.id) }">
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
  buildShareTemplateText,
  createRewardSubmission,
  getRewardSummary,
  seedRewardDemoIfEmpty,
  shareCopyTemplates,
  socialSharePlatforms
} from '@/services/socialRewardsService'

const router = useRouter()
const customerId = 'customer-local-41'
const refreshToken = ref(0)
const copyFallback = ref(false)

const form = reactive({
  platform: 'instagram',
  copy_template_id: 'venue_theme_story',
  share_text: '',
  proof_type: 'post_url',
  proof_url: '',
  proof_note: '',
  permission_to_reuse: true,
  includes_partyonce_tag: true,
  includes_venue_or_theme: true
})

const demoOrder = {
  theme: 'Castle Princess',
  event_location: 'Marrickville Family Dining Room'
}

const summary = computed(() => {
  refreshToken.value
  return getRewardSummary(customerId)
})

const currentPlatform = computed(() => socialSharePlatforms.find((item) => item.id === form.platform) || socialSharePlatforms[0])

const syncTemplateText = () => {
  form.share_text = buildShareTemplateText(form.copy_template_id, demoOrder)
}

const platformLabel = (id) => socialSharePlatforms.find((item) => item.id === id)?.label || id
const voucherTitle = (id) => summary.value.voucherPlaceholders.find((item) => item.id === id)?.title || id
const statusType = (status) => status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'

const copyShareText = async () => {
  copyFallback.value = false
  try {
    await navigator.clipboard.writeText(form.share_text)
    ElMessage.success('Caption copied. Publish from your own social account.')
  } catch (error) {
    copyFallback.value = true
    ElMessage.info('Clipboard unavailable. Please copy the caption manually.')
  }
}

const openPlatform = () => {
  if (!currentPlatform.value.openUrl) {
    ElMessage.info(currentPlatform.value.instruction)
    return
  }
  window.open(currentPlatform.value.openUrl, '_blank', 'noopener')
}

const submitShare = () => {
  if (!form.share_text.trim()) {
    ElMessage.warning('Add or copy a caption before submitting.')
    return
  }
  if (!form.proof_url.trim() && !form.proof_note.trim()) {
    ElMessage.warning('Add a post URL or proof note for review.')
    return
  }
  createRewardSubmission({
    ...form,
    channel: form.platform,
    caption: form.share_text,
    post_url: form.proof_url,
    customer_id: customerId,
    customer_name: 'Local Demo Customer',
    order_id: 'order-local-1001',
    order_number: 'PO-LOCAL-1001'
  })
  form.proof_url = ''
  form.proof_note = ''
  refreshToken.value += 1
  ElMessage.success('Share proof submitted for local/staging review. No external message was sent.')
}

onMounted(() => {
  seedRewardDemoIfEmpty()
  syncTemplateText()
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

.hero-actions,
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
.voucher-card small,
.platform-note,
:deep(.el-table small) {
  display: block;
  color: #64748b;
  line-height: 1.6;
}

.scope-alert,
.summary-grid,
.content-grid,
.panel,
.manual-copy {
  margin-top: 18px;
}

.summary-grid,
.content-grid,
.voucher-grid,
.fixed-reward-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.reward-process {
  background:
    linear-gradient(135deg, rgba(255, 247, 237, 0.96), rgba(239, 246, 255, 0.96)),
    #fff;
}

.reward-process-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.reward-process-grid article {
  display: grid;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
}

.reward-process-grid span {
  display: inline-grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-weight: 900;
}

.reward-process-grid strong {
  color: #0f172a;
}

.reward-process-grid p {
  margin: 0;
  color: #64748b;
  line-height: 1.55;
}

.content-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.voucher-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.fixed-reward-grid {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.summary-card,
.panel,
.voucher-card,
.fixed-reward-grid article {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-card span,
.voucher-card span,
.fixed-reward-grid span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.fixed-rewards-panel {
  border-color: #facc15;
  background:
    linear-gradient(135deg, rgba(255, 251, 235, 0.92), rgba(255, 255, 255, 0.98)),
    #fff;
}

.fixed-reward-grid article {
  display: grid;
  gap: 8px;
  box-shadow: none;
}

.fixed-reward-grid strong {
  color: #0f172a;
  font-size: 18px;
}

.fixed-reward-grid p,
.fixed-reward-grid small {
  margin: 0;
  color: #64748b;
  line-height: 1.55;
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
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.voucher-card.active {
  border-color: #22c55e;
  background: #f0fdf4;
}

@media (max-width: 820px) {
  .page-hero {
    display: block;
  }

  .hero-actions {
    margin-top: 14px;
  }
}
</style>
