<template>
  <main class="customer-page">
    <el-button class="back-button" @click="router.push('/my/quotes')">Back to My Quotes</el-button>

    <el-empty v-if="!loading && !quote" description="Quote not found">
      <el-button type="primary" @click="router.push('/my/quotes')">Open My Quotes</el-button>
    </el-empty>

    <template v-if="quote">
      <header class="page-hero">
        <div>
          <p class="eyebrow">Quote Detail</p>
          <h1>{{ quote.quote_number }}</h1>
          <p>{{ quote.status_text }} · {{ formatCustomerDateTime(quote.created_at) }}</p>
        </div>
        <el-tag :type="quoteTagType(quote.status)" effect="plain" size="large">{{ quote.status }}</el-tag>
      </header>

      <el-alert
        class="scope-alert"
        type="warning"
        :closable="false"
        show-icon
        title="This quote detail is read-only. Online payment is intentionally blocked in this workpack."
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
          <span>Amount</span>
          <strong>{{ formatCustomerMoney(quote.amount, quote.currency) }}</strong>
        </article>
        <article class="summary-card">
          <span>Valid until</span>
          <strong>{{ formatCustomerDate(quote.valid_until) }}</strong>
        </article>
        <article class="summary-card">
          <span>Theme</span>
          <strong>{{ quote.selection_snapshot.theme }}</strong>
        </article>
        <article class="summary-card">
          <span>Package</span>
          <strong>{{ quote.selection_snapshot.package }}</strong>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <h2>Selection Snapshot</h2>
          <dl class="detail-list">
            <div><dt>Venue / location</dt><dd>{{ quote.selection_snapshot.venue }}</dd></div>
            <div><dt>Guests</dt><dd>{{ quote.selection_snapshot.guest_count }}</dd></div>
            <div><dt>Event date</dt><dd>{{ formatCustomerDate(quote.selection_snapshot.event_date) }}</dd></div>
            <div><dt>Customer</dt><dd>{{ quote.customer_name }} · {{ quote.customer_contact }}</dd></div>
          </dl>
        </article>

        <article class="panel">
          <h2>Status Meaning</h2>
          <ul class="status-list">
            <li v-for="(label, status) in quoteStatuses" :key="status" :class="{ active: quote.status === status }">
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
        :scene-config="quotePartySceneConfig"
        :visual-context="quoteVisualContext"
        :recommendation-text="quoteRecommendationText"
      />

      <section class="panel">
        <h2>简化报价组成</h2>
        <p class="panel-intro">
          报价已按稳定类型拆分，方便后续正式报价单、PDF 和 deposit 计算。
        </p>
        <el-table :data="customerQuoteGroups" empty-text="No line item snapshot">
          <el-table-column label="Type" min-width="180">
            <template #default="{ row }">
              <strong>{{ row.label }}</strong>
              <small>{{ row.customerLabel }}</small>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="Basis" min-width="260" />
          <el-table-column label="Why this amount" min-width="260">
            <template #default="{ row }">
              <span>{{ row.items.map((item) => item.amount_basis).filter(Boolean).join(' / ') || row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Amount" width="160" align="right">
            <template #default="{ row }">{{ formatCustomerMoney(row.amount, quote.currency) }}</template>
          </el-table-column>
        </el-table>
        <p class="line-item-note">
          Deposit readiness placeholder: {{ formatCustomerMoney(quoteLineItemSummary.deposit_placeholder, quote.currency) }}.
          This does not create Stripe payment or mark a deposit as paid.
        </p>
      </section>

      <section class="panel venue-supplier-panel">
        <h2>场地与供应商上下文</h2>
        <p class="panel-intro">
          这些是当前 staging quote 使用的运营建议，帮助你理解方案会如何落地；不会自动联系供应商。
        </p>
        <div class="context-grid">
          <img :src="quoteVisualContext.restaurant.image_path" :alt="quoteVisualContext.restaurant.title" />
          <dl class="detail-list">
            <div><dt>Recommended venue</dt><dd>{{ quoteVisualContext.primaryVenue.name }} · {{ quoteVisualContext.primaryVenue.capacity }}</dd></div>
            <div><dt>Rendering</dt><dd>{{ quoteVisualContext.restaurant.title }}</dd></div>
            <div><dt>Suppliers</dt><dd>{{ quoteVisualContext.suppliers.map((item) => `${item.categoryLabel || item.category}: ${item.name}`).join(' / ') }}</dd></div>
            <div><dt>Why it fits</dt><dd>{{ quoteVisualContext.packageVisual.buyerCue }}</dd></div>
          </dl>
        </div>
      </section>

      <SocialRewardsPanel
        class="unified-panel"
        :customer-id="quote.customer_id || identity.id"
        title="分享奖励入口"
      />

      <section class="next-step">
        <span>Next step</span>
        <p>{{ quote.next_step }}</p>
        <el-alert
          class="interaction-alert"
          type="info"
          :closable="false"
          :title="customerInteractionBoundary.quoteConfirmation"
        />
        <div v-if="interaction.confirmation_placeholder_at" class="saved-note">
          Confirmation placeholder saved locally at {{ formatCustomerDateTime(interaction.confirmation_placeholder_at) }}.
        </div>
        <div class="blocked-actions">
          <el-button
            type="success"
            :disabled="!canConfirmQuote"
            @click="recordConfirmationPlaceholder"
          >
            Confirm Quote Interest · non-payment placeholder
          </el-button>
          <el-button disabled>Pay Deposit · blocked</el-button>
          <el-button type="primary" @click="router.push('/my/orders')">View My Orders</el-button>
        </div>
      </section>

      <section id="supplement" class="panel interaction-panel">
        <h2>Supplement Requirements</h2>
        <p>{{ customerInteractionBoundary.contactBody }}</p>
        <el-input
          v-model="supplementNote"
          type="textarea"
          :rows="4"
          maxlength="800"
          show-word-limit
          placeholder="Example: please change guest count to 20, add vegetarian snacks, or ask about a different venue time."
        />
        <div v-if="interaction.supplement_saved_at" class="saved-note">
          Supplement note saved locally at {{ formatCustomerDateTime(interaction.supplement_saved_at) }}.
        </div>
        <div class="blocked-actions">
          <el-button type="primary" @click="saveSupplement">Save Local Note</el-button>
          <el-button @click="router.push('/my/inquiries')">Open My Inquiries</el-button>
        </div>
      </section>

      <section class="panel contact-panel">
        <h2>{{ customerInteractionBoundary.contactTitle }}</h2>
        <p>For staging review, use the local note above. Production contact channels are intentionally not wired in this workpack.</p>
        <el-button disabled>Contact send-out · disabled</el-button>
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
  fetchCustomerQuoteDetail,
  formatCustomerDate,
  formatCustomerDateTime,
  formatCustomerMoney,
  getCustomerInteractionState,
  quoteStatuses,
  saveCustomerSupplementRequest,
  saveQuoteConfirmationPlaceholder
} from '@/services/customerExperienceService'
import { summarizeQuoteLineItems } from '@/data/quoteLineItems'
import { buildPartySceneConfig } from '@/data/partySceneConfig'
import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets'
import { getPackageExplanation } from '@/data/packageExplanation'
import { featureFlags } from '@/config/featureFlags'
import PartySceneSummary from '@/components/PartySceneSummary.vue'
import SocialRewardsPanel from '@/components/SocialRewardsPanel.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const quote = ref(null)
const dataSource = ref('not loaded')
const apiNotice = ref('')
const identity = ref({ id: '-', name: 'Local customer', accessBoundary: 'Loading customer read-only fixture.' })
const interaction = ref({})
const supplementNote = ref('')

const canConfirmQuote = computed(() => ['sent', 'accepted'].includes(quote.value?.status))
const sceneSummaryTitle = computed(() => featureFlags.aiExperienceEnabled ? 'AI 推荐与场景配置' : '场景配置与视觉规划')
const quoteLineItemSummary = computed(() => summarizeQuoteLineItems(quote.value?.line_items || []))
const quoteVisualContext = computed(() => {
  const selection = quote.value?.selection_snapshot || {}
  return getVisualContext(
    normalizeThemeId(selection.theme || selection.themeName),
    normalizeTierId(selection.package || selection.packageTier || selection.packageName)
  )
})
const quotePackageTier = computed(() => {
  const selection = quote.value?.selection_snapshot || {}
  return normalizeTierId(selection.package || selection.packageTier || selection.packageName)
})
const quotePartySceneConfig = computed(() => {
  const selection = quote.value?.selection_snapshot || {}
  return quote.value?.party_scene_config || selection.party_scene_config || buildPartySceneConfig({}, {
    theme: quoteVisualContext.value.packageVisual.theme,
    tier: quotePackageTier.value,
    visualContext: quoteVisualContext.value,
    reasonHeadline: getPackageExplanation(quotePackageTier.value).whyRecommend
  })
})
const quoteRecommendationText = computed(() => {
  const explanation = getPackageExplanation(quotePackageTier.value)
  if (!featureFlags.aiExperienceEnabled) return `${explanation.whyRecommend} ${explanation.customerFit}`
  return quote.value?.aiRecommendation?.reasonHeadline
    || quote.value?.selection_snapshot?.sceneConfigSummary?.label
    || `${explanation.whyRecommend} ${explanation.customerFit}`
})
const customerQuoteGroups = computed(() => {
  const groups = quoteLineItemSummary.value.groups
  const byType = (types) => groups.filter((group) => types.includes(group.type))
  const mergeGroup = ({ label, customerLabel, types }) => {
    const matched = byType(types)
    return {
      label,
      customerLabel,
      description: matched.map((group) => group.description).filter(Boolean).join(' / '),
      amount: matched.reduce((sum, group) => sum + Number(group.amount || 0), 0),
      items: matched.flatMap((group) => group.items || [])
    }
  }
  return [
    mergeGroup({ label: '场地费用', customerLabel: '场地与空间使用', types: ['venue_fee'] }),
    mergeGroup({ label: '装饰费用', customerLabel: '主题装饰', types: ['decor_fee'] }),
    mergeGroup({ label: '供应商服务', customerLabel: '供应商服务', types: ['supplier_fee'] }),
    mergeGroup({ label: '人工与运输', customerLabel: '现场执行与物流', types: ['labor_fee', 'transport_fee', 'service_fee'] }),
    mergeGroup({ label: '可选升级', customerLabel: '客户选择的升级项', types: ['optional_upgrade'] })
  ].filter((group) => group.amount > 0 || group.items.length > 0)
})

const quoteTagType = (status) => ({
  draft: 'info',
  sent: 'warning',
  accepted: 'success',
  rejected: 'danger',
  expired: ''
}[status] || 'info')

const loadQuote = async () => {
  loading.value = true
  try {
    const result = await fetchCustomerQuoteDetail(route.params.id)
    quote.value = result.item
    dataSource.value = result.source
    identity.value = result.identity
    apiNotice.value = result.api_error || ''
    refreshInteraction()
  } finally {
    loading.value = false
  }
}

const refreshInteraction = () => {
  if (!quote.value?.id) return
  interaction.value = getCustomerInteractionState('quote', quote.value.id)
  supplementNote.value = interaction.value.supplement_note || ''
}

const recordConfirmationPlaceholder = () => {
  if (!quote.value?.id || !canConfirmQuote.value) return
  interaction.value = saveQuoteConfirmationPlaceholder(quote.value.id)
  ElMessage.success('Quote interest saved locally. No payment or external action was triggered.')
}

const saveSupplement = () => {
  if (!quote.value?.id) return
  interaction.value = saveCustomerSupplementRequest({
    type: 'quote',
    id: quote.value.id,
    note: supplementNote.value
  })
  ElMessage.success('Supplement note saved locally for staging review.')
}

onMounted(loadQuote)
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

.line-item-note {
  margin: 14px 0 0;
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
.next-step span {
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

.interaction-alert,
.saved-note {
  margin-top: 12px;
}

.saved-note {
  border-radius: 8px;
  background: #f0fdf4;
  color: #166534;
  padding: 10px 12px;
  font-size: 13px;
}

.blocked-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
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
