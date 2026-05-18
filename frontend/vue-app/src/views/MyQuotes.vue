<template>
  <main class="customer-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">{{ t('customerPages.workspace') }}</p>
        <h1>{{ t('customerPages.myQuotes.title') }}</h1>
        <p>{{ t('customerPages.myQuotes.subtitle') }}</p>
      </div>
      <div class="hero-actions">
        <el-button @click="router.push('/my/inquiries')">{{ t('nav.myInquiries') }}</el-button>
        <el-button type="primary" @click="router.push('/my/orders')">{{ t('nav.myOrders') }}</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="t('customerPages.myQuotes.safety')"
    />
    <el-alert
      class="scope-alert"
      type="info"
      :closable="false"
      show-icon
      :title="`${dataSource} · ${identity.name} (${identity.id})`"
      :description="apiNotice || identity.accessBoundary"
    />

    <section class="trust-strip">
      <div>
        <p class="eyebrow">报价复核承诺</p>
        <h2>人工复核后才会形成正式报价</h2>
        <p>这些报价卡片用于理解预算、场地、套餐和附加服务，不会自动预订场地，也不会触发订金支付。</p>
      </div>
      <ul>
        <li v-for="item in trustChecklist" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="process-strip">
      <article v-for="step in quoteProcessSteps" :key="step.id">
        <span>{{ step.customerTitle }}</span>
        <strong>{{ step.title }}</strong>
        <p>{{ step.body }}</p>
      </article>
    </section>

    <section class="toolbar">
      <el-input v-model="searchQuery" clearable :placeholder="t('customerPages.myQuotes.search')" />
      <el-select v-model="statusFilter" clearable :placeholder="t('customerPages.status')">
        <el-option :label="t('customerPages.allStatuses')" value="" />
        <el-option v-for="(label, status) in quoteStatuses" :key="status" :label="`${status} · ${label}`" :value="status" />
      </el-select>
    </section>

    <section class="cards-grid">
      <article v-for="quote in filteredQuotes" :key="quote.id" class="customer-card">
        <div class="card-head">
          <div>
            <strong>{{ quote.quote_number }}</strong>
            <span>{{ formatCustomerDateTime(quote.created_at) }}</span>
          </div>
          <el-tag :type="quoteTagType(quote.status)" effect="plain">{{ quote.status_text }}</el-tag>
        </div>

        <div class="visual-strip">
          <img :src="quoteVisual(quote).restaurant.image_path" :alt="quoteVisual(quote).restaurant.title">
          <div>
            <strong>{{ displayVisualTitle(quoteVisual(quote)) }}</strong>
            <span>{{ displayVisualSummary(quoteVisual(quote)) }}</span>
          </div>
        </div>

        <dl class="detail-list">
          <div>
            <dt>主题 / 套餐</dt>
            <dd>{{ quote.theme }} · {{ quote.package }}</dd>
          </div>
          <div>
            <dt>选择摘要</dt>
            <dd>{{ quote.selection_snapshot.venue }} · {{ quote.selection_snapshot.guest_count }} 人</dd>
          </div>
          <div>
            <dt>金额</dt>
            <dd>{{ formatCustomerMoney(quote.amount, quote.currency) }}</dd>
          </div>
          <div>
            <dt>有效期至</dt>
            <dd>{{ formatCustomerDate(quote.valid_until) }}</dd>
          </div>
        </dl>

        <div class="package-explanation">
          <strong>{{ displayPackageLabel(quotePackageExplanation(quote)) }} · {{ t('customerPages.whyFits') }}</strong>
          <p>{{ quotePackageExplanation(quote).customerFit }}</p>
          <span>{{ t('customerPages.priceDrivers') }}: {{ displayPriceDrivers(quotePackageExplanation(quote)).join(' / ') }}</span>
        </div>

        <div v-if="sceneConfigSummary(quote)" class="scene-config-summary">
          <strong>{{ t('customerPages.sceneConfig') }}</strong>
          <p>{{ sceneConfigSummary(quote).layout }}</p>
          <span>{{ sceneConfigSummary(quote).decor }}</span>
        </div>

        <div class="next-step">
          <span>下一步</span>
          <p>{{ quote.next_step }}</p>
        </div>

        <div class="interaction-hint">
          <el-tag v-if="quoteInteraction(quote.id).confirmation_placeholder_at" type="success" effect="plain">
            已记录确认意向
          </el-tag>
          <el-tag v-if="quoteInteraction(quote.id).supplement_saved_at" type="info" effect="plain">
            补充说明已保存
          </el-tag>
          <span v-if="!quoteInteraction(quote.id).confirmation_placeholder_at && !quoteInteraction(quote.id).supplement_saved_at">
            需要调整？打开详情填写补充要求，团队会人工复核。
          </span>
        </div>

        <div class="card-actions">
          <el-button type="primary" @click="router.push(`/my/quotes/${quote.id}`)">查看报价详情</el-button>
          <el-button @click="router.push(`/my/quotes/${quote.id}#supplement`)">补充需求</el-button>
        </div>
      </article>
    </section>

    <section v-if="!loading && filteredQuotes.length === 0" class="demo-empty-state">
      <div>
        <p class="eyebrow">{{ t('customerPages.myQuotes.emptyEyebrow') }}</p>
        <h2>{{ t('customerPages.myQuotes.emptyTitle') }}</h2>
        <p>{{ t('customerPages.myQuotes.emptyCopy') }}</p>
      </div>
      <div class="empty-actions">
        <el-button type="primary" @click="router.push('/quote')">{{ t('quote.entry') }}</el-button>
        <el-button @click="router.push('/my/inquiries')">{{ t('nav.myInquiries') }}</el-button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  fetchCustomerQuotes,
  formatCustomerDate,
  formatCustomerDateTime,
  formatCustomerMoney,
  getCustomerInteractionState,
  quoteStatuses
} from '@/services/customerExperienceService'
import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets'
import { getPackageExplanation } from '@/data/packageExplanation'
import { summarizePartySceneConfig } from '@/data/partySceneConfig'
import { getQuoteProcessSteps, getTrustChecklist } from '@/data/parentTrustContent'

const router = useRouter()
const { t, locale } = useI18n()
const loading = ref(false)
const quotes = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const dataSource = ref('未加载')
const apiNotice = ref('')
const identity = ref({ id: '-', name: '预览用户', accessBoundary: '正在加载客户预览信息。' })
const trustChecklist = getTrustChecklist()
const quoteProcessSteps = getQuoteProcessSteps()

const filteredQuotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return quotes.value.filter((quote) => {
    const matchesStatus = !statusFilter.value || quote.status === statusFilter.value
    if (!query) return matchesStatus
    const haystack = [
      quote.quote_number,
      quote.customer_name,
      quote.customer_contact,
      quote.theme,
      quote.package,
      quote.status
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesStatus && haystack.includes(query)
  })
})

const quoteTagType = (status) => ({
  draft: 'info',
  sent: 'warning',
  accepted: 'success',
  rejected: 'danger',
  expired: ''
}[status] || 'info')

const quoteInteraction = (quoteId) => getCustomerInteractionState('quote', quoteId)

const quoteVisual = (quote) => getVisualContext(normalizeThemeId(quote.theme), normalizeTierId(quote.package))
const quotePackageExplanation = (quote) => getPackageExplanation(normalizeTierId(quote.package))
const sceneConfigSummary = (quote) => summarizePartySceneConfig(quote.party_scene_config || quote.selection_snapshot?.party_scene_config)

const isChineseLocale = computed(() => locale.value === 'zh')
const displayVisualTitle = (visual) => isChineseLocale.value ? '餐厅 A 私人包间' : t('ai.restaurantPlaceholderTitle')
const displayVisualSummary = (visual) => isChineseLocale.value
  ? '场地、主题布置和供应商信息需人工复核后确认'
  : t('ai.restaurantPlaceholderCopy')
const displayPackageLabel = (explanation) => isChineseLocale.value ? explanation.labelZh : t('quotePage.package')
const displayPriceDrivers = (explanation) => (
  isChineseLocale.value
    ? explanation.priceDrivers.slice(0, 3)
    : [t('ai.recommendation.priceDriverGeneric1'), t('ai.recommendation.priceDriverGeneric2')]
)

const loadQuotes = async () => {
  loading.value = true
  try {
    const result = await fetchCustomerQuotes()
    quotes.value = result.items
    dataSource.value = result.source
    identity.value = result.identity
    apiNotice.value = result.api_error || ''
  } finally {
    loading.value = false
  }
}

onMounted(loadQuotes)
</script>

<style scoped>
.customer-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
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

h1 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 34px;
}

.page-hero p {
  margin: 0;
  color: #475569;
}

.hero-actions,
.toolbar {
  display: flex;
  gap: 12px;
}

.scope-alert,
.toolbar {
  margin-bottom: 18px;
}

.trust-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
  gap: 18px;
  align-items: start;
  margin-bottom: 18px;
  padding: 18px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: linear-gradient(135deg, #fffbeb, #fff7ed);
}

.trust-strip h2 {
  margin: 0 0 8px;
  color: #78350f;
}

.trust-strip p {
  margin: 0;
  color: #92400e;
  line-height: 1.6;
}

.trust-strip ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.trust-strip li {
  border-radius: 999px;
  background: #fff;
  color: #92400e;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 800;
}

.process-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.process-strip article {
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  background: #f8faff;
  padding: 12px;
}

.process-strip span {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.process-strip strong {
  display: block;
  margin-top: 5px;
  color: #1e293b;
}

.process-strip p {
  margin: 6px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}

.toolbar {
  max-width: 720px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.demo-empty-state {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  margin-top: 34px;
  padding: 24px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff, #fff7ed);
}

.demo-empty-state h2 {
  margin: 0 0 8px;
  color: #0f172a;
}

.demo-empty-state p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.customer-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.visual-strip {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  align-items: center;
  margin: 14px 0;
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
}

.visual-strip img {
  width: 96px;
  height: 68px;
  border-radius: 8px;
  object-fit: cover;
  object-position: top center;
}

.visual-strip strong,
.visual-strip span {
  display: block;
}

.visual-strip span {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.card-head strong,
.card-head span {
  display: block;
}

.card-head span {
  color: #64748b;
  font-size: 13px;
}

.detail-list {
  display: grid;
  gap: 12px;
  margin: 0 0 16px;
}

.detail-list div {
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.package-explanation,
.scene-config-summary {
  display: grid;
  gap: 6px;
  margin: 0 0 16px;
  padding: 12px;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  background: #f8faff;
}

.scene-config-summary {
  border-color: #ddd6fe;
  background: #f5f3ff;
}

.package-explanation strong,
.scene-config-summary strong {
  color: #1e293b;
}

.package-explanation p,
.package-explanation span,
.scene-config-summary p,
.scene-config-summary span {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}

dt {
  color: #64748b;
  font-size: 12px;
}

dd {
  margin: 4px 0 0;
  color: #0f172a;
  font-weight: 650;
}

.next-step {
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
  margin-bottom: 16px;
}

.next-step span {
  color: #64748b;
  font-size: 12px;
}

.next-step p {
  margin: 4px 0 0;
  color: #334155;
}

.interaction-hint {
  display: flex;
  min-height: 32px;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
  color: #64748b;
  font-size: 13px;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 760px) {
  .trust-strip,
  .process-strip {
    grid-template-columns: 1fr;
  }

  .page-hero,
  .hero-actions,
  .toolbar {
    flex-direction: column;
  }
}
</style>
