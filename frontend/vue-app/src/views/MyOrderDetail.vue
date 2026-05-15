<template>
  <main class="customer-page">
    <el-button class="back-button" @click="router.push('/my/orders')">Back to My Orders</el-button>

    <el-empty v-if="!loading && !order" description="Order not found">
      <el-button type="primary" @click="router.push('/my/orders')">Open My Orders</el-button>
    </el-empty>

    <template v-if="order">
      <header class="page-hero">
        <div>
          <p class="eyebrow">Order Detail</p>
          <h1>{{ order.order_number }}</h1>
          <p>{{ order.status_text }} · Quote {{ order.quote_number }}</p>
        </div>
        <el-tag :type="orderTagType(order.status)" effect="plain" size="large">{{ order.status }}</el-tag>
      </header>

      <el-alert
        class="scope-alert"
        type="warning"
        :closable="false"
        show-icon
        title="pending_deposit is a business status placeholder. Deposit payment is not enabled in this preview; no webhook or n8n action is triggered."
      />
      <el-alert
        class="scope-alert"
        type="info"
        :closable="false"
        show-icon
        :title="`${dataSource} · ${identity.name} (${identity.id})`"
        :description="apiNotice || identity.accessBoundary"
      />

      <section class="summary-grid">
        <article class="summary-card">
          <span>Total amount</span>
          <strong>{{ formatCustomerMoney(order.total_amount, order.currency) }}</strong>
        </article>
        <article class="summary-card">
          <span>Deposit placeholder</span>
          <strong>{{ formatCustomerMoney(order.deposit_amount, order.currency) }}</strong>
        </article>
        <article class="summary-card">
          <span>Event date</span>
          <strong>{{ formatCustomerDate(order.event_date) }}</strong>
        </article>
        <article class="summary-card">
          <span>Location</span>
          <strong>{{ order.event_location }}</strong>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <h2>Event Snapshot</h2>
          <dl class="detail-list">
            <div><dt>Theme</dt><dd>{{ order.theme }}</dd></div>
            <div><dt>Package</dt><dd>{{ order.package }}</dd></div>
            <div><dt>Guests</dt><dd>{{ order.guest_count }}</dd></div>
            <div><dt>Created</dt><dd>{{ formatCustomerDateTime(order.created_at) }}</dd></div>
          </dl>
        </article>

        <article class="panel">
          <h2>Status Meaning</h2>
          <ul class="status-list">
            <li v-for="(label, status) in orderStatuses" :key="status" :class="{ active: order.status === status }">
              <strong>{{ status }}</strong>
              <span>{{ label }}</span>
            </li>
          </ul>
        </article>
      </section>

      <PartySceneSummary
        class="unified-panel"
        :title="sceneSummaryTitle"
        audience="customer"
        :scene-config="orderPartySceneConfig"
        :visual-context="orderVisualContext"
        :recommendation-text="orderRecommendationText"
      />

      <section class="panel">
        <h2>简化订单组成</h2>
        <p class="panel-intro">
          订单沿用标准报价类型，后续可用于正式报价单和 deposit 计算。
        </p>
        <el-table :data="orderLineItemSummary.groups" empty-text="No order item snapshot">
          <el-table-column label="Type" min-width="180">
            <template #default="{ row }">
              <strong>{{ row.labelZh }}</strong>
              <small>{{ row.customerLabel }}</small>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="Basis" min-width="260" />
          <el-table-column label="Amount" width="160" align="right">
            <template #default="{ row }">{{ formatCustomerMoney(row.amount, order.currency) }}</template>
          </el-table-column>
        </el-table>
      </section>

      <section class="panel venue-supplier-panel">
        <h2>场地与供应商上下文</h2>
        <p class="panel-intro">
          订单仍处于 staging skeleton；以下场地和供应商职责用于理解交付方案，不会自动派单。
        </p>
        <div class="context-grid">
          <img :src="orderVisualContext.restaurant.image_path" :alt="orderVisualContext.restaurant.title" />
          <dl class="detail-list">
            <div><dt>Recommended venue</dt><dd>{{ orderVisualContext.primaryVenue.name }} · {{ orderVisualContext.primaryVenue.capacity }}</dd></div>
            <div><dt>Rendering</dt><dd>{{ orderVisualContext.restaurant.title }}</dd></div>
            <div><dt>Suppliers</dt><dd>{{ orderVisualContext.suppliers.map((item) => `${item.categoryLabel || item.category}: ${item.name}`).join(' / ') }}</dd></div>
            <div><dt>Supplier roles</dt><dd>{{ orderVisualContext.suppliers.map((item) => item.responsibility || item.operationsRole).join(' / ') }}</dd></div>
          </dl>
        </div>
      </section>

      <section class="next-step">
        <span>Next step</span>
        <p>{{ order.next_step }}</p>
        <small>{{ order.deposit_note }}</small>
        <div class="blocked-actions">
          <el-button disabled>Pay Deposit · blocked</el-button>
          <el-button disabled>Online payment · disabled</el-button>
        </div>
      </section>

      <section id="supplement" class="panel interaction-panel">
        <h2>Update Request / Extra Notes</h2>
        <p>{{ customerInteractionBoundary.contactBody }}</p>
        <el-input
          v-model="supplementNote"
          type="textarea"
          :rows="4"
          maxlength="800"
          show-word-limit
          placeholder="Example: event time changed, please confirm setup access, or add a dietary requirement."
        />
        <div v-if="interaction.supplement_saved_at" class="saved-note">
          Update request saved locally at {{ formatCustomerDateTime(interaction.supplement_saved_at) }}.
        </div>
        <div class="blocked-actions">
          <el-button type="primary" @click="saveSupplement">Save Local Note</el-button>
          <el-button @click="router.push('/my/quotes')">Back to My Quotes</el-button>
        </div>
      </section>

      <section class="panel contact-panel">
        <h2>{{ customerInteractionBoundary.contactTitle }}</h2>
        <p>Order updates are captured locally for staging review only. No email, SMS, WhatsApp, payment, webhook, or n8n action is triggered.</p>
      </section>

      <section class="panel rewards-panel">
        <h2>Share & Rewards</h2>
        <p class="panel-intro">
          Share your party story for local/staging review. Points and vouchers are placeholders until production reward rules are approved.
        </p>
        <div class="reward-summary">
          <div><span>Approved points</span><strong>{{ rewardSummary.approvedPoints }}</strong></div>
          <div><span>Pending points</span><strong>{{ rewardSummary.pendingPoints }}</strong></div>
          <div><span>Submissions</span><strong>{{ rewardSummary.submissions.length }}</strong></div>
        </div>
        <el-input
          v-model="shareCaption"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          :placeholder="buildDemoShareText(order)"
        />
        <div class="blocked-actions">
          <el-button type="primary" @click="submitShareReward">Submit share for reward review</el-button>
          <el-button @click="router.push('/my/rewards')">Open My Rewards</el-button>
        </div>
        <small>No social post, email, SMS, WhatsApp, webhook, n8n, or payment action is triggered.</small>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  customerInteractionBoundary,
  fetchCustomerOrderDetail,
  formatCustomerDate,
  formatCustomerDateTime,
  formatCustomerMoney,
  getCustomerInteractionState,
  orderStatuses,
  saveCustomerSupplementRequest
} from '@/services/customerExperienceService'
import { summarizeQuoteLineItems } from '@/data/quoteLineItems'
import { buildPartySceneConfig } from '@/data/partySceneConfig'
import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets'
import { getPackageExplanation } from '@/data/packageExplanation'
import { featureFlags } from '@/config/featureFlags'
import PartySceneSummary from '@/components/PartySceneSummary.vue'
import {
  buildDemoShareText,
  createRewardSubmission,
  getRewardSummary,
  seedRewardDemoIfEmpty
} from '@/services/socialRewardsService'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const order = ref(null)
const dataSource = ref('not loaded')
const apiNotice = ref('')
const identity = ref({ id: '-', name: 'Local customer', accessBoundary: 'Loading customer read-only fixture.' })
const interaction = ref({})
const supplementNote = ref('')
const shareCaption = ref('')
const rewardRefresh = ref(0)
const sceneSummaryTitle = computed(() => featureFlags.aiExperienceEnabled ? '订单场景与 3D Preview' : '订单场景与视觉预览')
const orderLineItemSummary = computed(() => summarizeQuoteLineItems(order.value?.line_items || []))
const rewardSummary = computed(() => {
  rewardRefresh.value
  return getRewardSummary(identity.value?.id || 'customer-local-41')
})
const orderVisualContext = computed(() => getVisualContext(
  normalizeThemeId(order.value?.theme || order.value?.selection_snapshot?.theme),
  normalizeTierId(order.value?.package || order.value?.package_tier || order.value?.selection_snapshot?.package)
))
const orderPackageTier = computed(() => normalizeTierId(order.value?.package || order.value?.package_tier || order.value?.selection_snapshot?.package))
const orderPartySceneConfig = computed(() => order.value?.party_scene_config || order.value?.selection_snapshot?.party_scene_config || buildPartySceneConfig({}, {
  theme: orderVisualContext.value.packageVisual.theme,
  tier: orderPackageTier.value,
  visualContext: orderVisualContext.value,
  reasonHeadline: getPackageExplanation(orderPackageTier.value).whyRecommend
}))
const orderRecommendationText = computed(() => {
  const explanation = getPackageExplanation(orderPackageTier.value)
  if (!featureFlags.aiExperienceEnabled) return `${explanation.whyRecommend} ${explanation.customerFit}`
  return order.value?.aiRecommendation?.reasonHeadline || `${explanation.whyRecommend} ${explanation.customerFit}`
})

const orderTagType = (status) => ({
  draft: 'info',
  pending_deposit: 'warning',
  confirmed: 'success',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger'
}[status] || 'info')

const loadOrder = async () => {
  loading.value = true
  try {
    const result = await fetchCustomerOrderDetail(route.params.id)
    order.value = result.item
    dataSource.value = result.source
    identity.value = result.identity
    apiNotice.value = result.api_error || ''
    refreshInteraction()
  } finally {
    loading.value = false
  }
}

const refreshInteraction = () => {
  if (!order.value?.id) return
  interaction.value = getCustomerInteractionState('order', order.value.id)
  supplementNote.value = interaction.value.supplement_note || ''
}

const saveSupplement = () => {
  if (!order.value?.id) return
  interaction.value = saveCustomerSupplementRequest({
    type: 'order',
    id: order.value.id,
    note: supplementNote.value
  })
  ElMessage.success('Order update note saved locally for staging review.')
}

const submitShareReward = () => {
  if (!order.value?.id) return
  createRewardSubmission({
    customer_id: identity.value?.id || 'customer-local-41',
    customer_name: identity.value?.name || 'Local Demo Customer',
    order_id: order.value.id,
    order_number: order.value.order_number,
    channel: 'instagram',
    caption: shareCaption.value || buildDemoShareText(order.value),
    permission_to_reuse: true,
    includes_partyonce_tag: true,
    includes_venue_or_theme: true
  })
  shareCaption.value = ''
  rewardRefresh.value += 1
  ElMessage.success('Share submitted for reward review. No external action was triggered.')
}

onMounted(loadOrder)
onMounted(() => {
  seedRewardDemoIfEmpty()
})
</script>

<style scoped>
.customer-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.back-button,
.scope-alert,
.summary-grid,
.content-grid,
.panel {
  margin-bottom: 18px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
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

.panel-intro {
  margin: 0 0 14px;
  color: #64748b;
  line-height: 1.6;
}

.context-grid {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 16px;
}

.context-grid img {
  width: 100%;
  min-height: 220px;
  height: 100%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.context-grid .detail-list {
  margin: 0;
}

:deep(.el-table small) {
  display: block;
  margin-top: 4px;
  color: #64748b;
}

.page-hero p {
  margin: 0;
  color: #475569;
}

.summary-grid,
.content-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.content-grid {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
}

.summary-card,
.panel,
.unified-panel,
.next-step {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-card span,
dt,
.next-step span,
.next-step small {
  color: #64748b;
  font-size: 12px;
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 22px;
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

.status-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.status-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-radius: 8px;
  background: #f8fafc;
  padding: 10px;
}

.status-list li.active {
  outline: 2px solid #409eff;
  background: #ecf5ff;
}

.status-list span,
.next-step p {
  color: #334155;
}

.next-step p {
  margin: 4px 0 8px;
}

.blocked-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.reward-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.reward-summary div {
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
}

.reward-summary span,
.rewards-panel small {
  color: #64748b;
  font-size: 12px;
}

.reward-summary strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 20px;
}

.saved-note {
  margin-top: 12px;
  border-radius: 8px;
  background: #f0fdf4;
  color: #166534;
  padding: 10px 12px;
  font-size: 13px;
}

.interaction-panel p,
.contact-panel p {
  margin: 0 0 12px;
  color: #475569;
}

@media (max-width: 820px) {
  .page-hero,
  .content-grid,
  .context-grid {
    display: block;
  }
}
</style>
