<template>
  <div class="admin-quote-detail-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Stage 2 Quote skeleton</p>
        <h1>{{ quote?.quote_number || 'Quote Detail' }}</h1>
        <p>
          Admin-only local/staging detail view for a Quote created from a persistent Lead.
          Accepted Quotes can create a draft Order through the safe local Order API skeleton.
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="router.push('/admin/quotes')">Back to Quote Review</el-button>
        <el-button type="primary" @click="router.push('/admin/local-leads')">Lead Review</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Local/staging skeleton only: draft Order creation is allowed only for accepted Quotes; Stripe/payment, webhook/n8n, and outbound messages remain blocked."
    />

    <el-alert
      v-if="message"
      class="scope-alert"
      :type="messageType"
      :closable="true"
      show-icon
      :title="message"
      @close="message = ''"
    />

    <section v-loading="loading" class="detail-shell">
      <el-empty
        v-if="!loading && !quote"
        description="Quote detail is not available in the local/staging skeleton."
      >
        <el-button type="primary" @click="loadQuote">Retry</el-button>
      </el-empty>

      <template v-else-if="quote">
        <section class="summary-grid">
          <article class="summary-card">
            <span>Status</span>
            <strong>{{ quote.status }}</strong>
            <small>Skeleton status only</small>
          </article>
          <article class="summary-card">
            <span>Total</span>
            <strong>{{ formatMoney(quote.final_total, quote.currency) }}</strong>
            <small>{{ quote.currency || 'AUD' }}</small>
          </article>
          <article class="summary-card">
            <span>Lead</span>
            <strong>#{{ quote.lead_id }}</strong>
            <small>{{ quote.lead_summary?.status || 'lead status pending' }}</small>
          </article>
          <article class="summary-card">
            <span>External Systems</span>
            <strong>Blocked</strong>
            <small>No order/payment/outbound action</small>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Customer</h2>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{{ quote.customer_summary?.name || '-' }}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{{ quote.customer_summary?.contact || '-' }}</dd>
              </div>
              <div>
                <dt>Customer ID</dt>
                <dd>{{ quote.customer_id }}</dd>
              </div>
            </dl>
          </article>

          <article class="panel">
            <h2>Quote Controls</h2>
            <label class="field-label" for="quote-status-select">Status</label>
            <el-select
              id="quote-status-select"
              class="status-select"
              :model-value="quote.status"
              @change="updateQuoteStatus"
            >
              <el-option v-for="status in allowedStatuses" :key="status" :label="status" :value="status" />
            </el-select>
            <p class="control-note">
              `converted_to_order` is still unavailable in the status dropdown. Use Create Draft Order after the Quote is accepted.
            </p>
            <el-button
              class="create-order-button"
              type="success"
              :disabled="!canCreateDraftOrder"
              :loading="creatingOrder"
              @click="createDraftOrder"
            >
              Create Draft Order
            </el-button>
            <p class="control-note">
              Enabled only for accepted Quotes. This calls POST /api/orders and never opens payment or outbound automation.
            </p>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Quote Amounts</h2>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>{{ formatMoney(quote.subtotal, quote.currency) }}</dd>
              </div>
              <div>
                <dt>Discount</dt>
                <dd>{{ formatMoney(quote.discount_total, quote.currency) }}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{{ formatMoney(quote.tax_total, quote.currency) }}</dd>
              </div>
              <div>
                <dt>Final Total</dt>
                <dd>{{ formatMoney(quote.final_total, quote.currency) }}</dd>
              </div>
            </dl>
          </article>

          <article class="panel">
            <h2>Timeline</h2>
            <dl>
              <div>
                <dt>Created</dt>
                <dd>{{ formatDateTime(quote.created_at) }}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{{ formatDateTime(quote.updated_at) }}</dd>
              </div>
              <div>
                <dt>Sent</dt>
                <dd>{{ formatDateTime(quote.sent_at) }}</dd>
              </div>
              <div>
                <dt>Accepted</dt>
                <dd>{{ formatDateTime(quote.accepted_at) }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Ops Owner & Remark</h2>
            <label class="field-label" for="quote-ops-owner">Owner</label>
            <el-input
              id="quote-ops-owner"
              v-model="quoteOps.owner"
              placeholder="Local/staging owner"
            />
            <label class="field-label stacked" for="quote-ops-next-action">Next Action</label>
            <el-input
              id="quote-ops-next-action"
              v-model="quoteOps.nextAction"
              placeholder="Example: confirm package changes before sending"
            />
            <label class="field-label stacked" for="quote-ops-note">Internal Remark</label>
            <el-input
              id="quote-ops-note"
              v-model="quoteOps.note"
              type="textarea"
              :rows="4"
              maxlength="700"
              show-word-limit
              placeholder="Local operations note. Not sent to customer."
            />
            <el-button class="create-order-button" type="primary" plain @click="saveQuoteOpsState">
              Save Local Ops Note
            </el-button>
            <p class="control-note">
              Saved to the local/staging Quote skeleton when the backend is available; fallback localStorage is used only if the local API is unavailable.
            </p>
          </article>

          <article class="panel">
            <h2>Ops Alerts</h2>
            <ul class="blocked-list">
              <li v-for="item in quoteOpsAlerts" :key="item">{{ item }}</li>
            </ul>
          </article>
        </section>

        <section class="panel">
          <h2>Standardized Line Items Snapshot</h2>
          <template v-if="lineItems.length > 0">
            <el-table :data="lineItems" row-key="name" style="width: 100%">
              <el-table-column label="Type" width="170">
                <template #default="{ row }">
                  <strong>{{ row.type_label_zh }}</strong>
                  <small>{{ row.customer_label }}</small>
                </template>
              </el-table-column>
              <el-table-column label="Name / Basis" min-width="260">
                <template #default="{ row }">
                  <span>{{ row.name || '-' }}</span>
                  <small>{{ row.description }}</small>
                </template>
              </el-table-column>
              <el-table-column label="Amount" width="160" align="right">
                <template #default="{ row }">{{ formatMoney(row.amount, quote.currency) }}</template>
              </el-table-column>
              <el-table-column label="Source" min-width="200">
                <template #default="{ row }">{{ row.source || 'snapshot' }}</template>
              </el-table-column>
              <el-table-column label="Amount Basis / Edit Hint" min-width="320">
                <template #default="{ row }">
                  <span>{{ row.amount_basis }}</span>
                  <small>{{ row.admin_edit_hint }}</small>
                </template>
              </el-table-column>
            </el-table>
            <p class="control-note">
              Schema: {{ lineItemSummary.schema_version }} · Deposit placeholder:
              {{ formatMoney(lineItemSummary.deposit_placeholder, quote.currency) }}.
              This is readiness-only and does not create payment.
            </p>
          </template>
          <el-empty v-else description="No line item snapshot is available." />
        </section>

        <section class="panel editable-line-items-panel">
          <div class="panel-heading-row">
            <div>
              <h2>Editable Line Item Draft</h2>
              <p class="control-note">
                Local/staging draft only. This does not finalize payment amount, create invoice, create contract, or trigger external systems.
              </p>
            </div>
            <div class="draft-actions">
              <el-button type="primary" plain @click="addLineItemDraftRow">Add Line Item</el-button>
              <el-button @click="resetLineItemDraft">Reset from Snapshot</el-button>
              <el-button type="success" @click="saveLineItemDraft">Save Draft Locally</el-button>
            </div>
          </div>

          <div class="line-item-draft-summary">
            <strong>Draft subtotal: {{ formatMoney(lineItemDraftSummary.total, quote.currency) }}</strong>
            <span>Deposit placeholder: {{ formatMoney(lineItemDraftSummary.deposit_placeholder, quote.currency) }}</span>
            <small>{{ lineItemDraftSummary.deposit_note }}</small>
          </div>

          <div class="line-item-editor-list">
            <article v-for="(item, index) in lineItemDraftRows" :key="item.draft_id" class="line-item-editor-row">
              <div class="editor-row-header">
                <strong>报价项目 {{ index + 1 }}</strong>
                <el-button type="danger" text @click="removeLineItemDraftRow(index)">Delete</el-button>
              </div>
              <div class="line-item-form-grid">
                <label>
                  <span>费用类型</span>
                  <el-select v-model="item.type" placeholder="Line item type">
                    <el-option
                      v-for="type in quoteLineItemTypeOptions"
                      :key="type.type"
                      :label="`${type.labelZh} · ${type.customerLabel}`"
                      :value="type.type"
                    />
                  </el-select>
                </label>
                <label>
                  <span>Label / Title</span>
                  <el-input v-model="item.name" placeholder="Line item title" />
                </label>
                <label>
                  <span>Amount</span>
                  <el-input-number v-model="item.amount" :min="0" :step="25" controls-position="right" />
                </label>
                <label>
                  <span>可选升级项</span>
                  <el-switch
                    :model-value="item.type === 'optional_upgrade'"
                    active-text="Optional"
                    inactive-text="Base"
                    @change="(checked) => setOptionalUpgrade(item, checked)"
                  />
                </label>
              </div>
              <label class="wide-field">
                <span>计费依据 amount_basis</span>
                <el-input v-model="item.amount_basis" type="textarea" :rows="2" placeholder="Why this amount is here" />
              </label>
              <label class="wide-field">
                <span>客户解释 customer_explanation</span>
                <el-input v-model="item.customer_explanation" type="textarea" :rows="2" placeholder="Customer-facing explanation" />
              </label>
              <label class="wide-field">
                <span>后台编辑提示 admin_edit_hint</span>
                <el-input v-model="item.admin_edit_hint" type="textarea" :rows="2" placeholder="Internal edit guidance" />
              </label>
            </article>
          </div>
        </section>

        <section class="panel-grid">
          <article class="panel visual-panel">
            <h2>Visual Delivery Context</h2>
            <div class="visual-pair">
              <img :src="quoteVisualContext.packageVisual.image_path" :alt="quoteVisualContext.packageVisual.title">
              <img :src="quoteVisualContext.restaurant.image_path" :alt="quoteVisualContext.restaurant.title">
            </div>
            <dl>
              <div>
                <dt>Theme / Package</dt>
                <dd>{{ quoteVisualContext.packageVisual.title }}</dd>
              </div>
              <div>
                <dt>Restaurant Rendering</dt>
                <dd>{{ quoteVisualContext.restaurant.title }}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>{{ quoteVisualContext.primaryVenue.name }} · {{ quoteVisualContext.primaryVenue.capacity }}</dd>
              </div>
              <div>
                <dt>Suppliers</dt>
                <dd>{{ quoteVisualContext.suppliers.map((item) => `${item.name} (${item.category})`).join(' / ') }}</dd>
              </div>
            </dl>
          </article>

          <article class="panel">
            <h2>Quote Basis</h2>
            <ul class="blocked-list">
              <li>{{ quoteVisualContext.packageVisual.scope }}</li>
              <li>{{ quoteVisualContext.restaurant.decorationLayer }}</li>
              <li v-for="supplier in quoteVisualContext.suppliers" :key="supplier.id">
                {{ supplier.name }} · {{ supplier.operationsRole }}
              </li>
            </ul>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel ops-explainer-panel">
            <h2>Ops Pricing Explanation</h2>
            <div class="scene-config-admin-summary">
              <strong>party_scene_config</strong>
              <p>{{ quoteSceneConfigSummary.layout }}</p>
              <span>{{ quoteSceneConfigSummary.decor }}</span>
            </div>
            <p class="body-text">
              {{ quotePackageExplanation.positioning }}
            </p>
            <div class="explanation-block">
              <h3>客户为什么被推荐这个套餐</h3>
              <p>{{ quotePackageExplanation.whyRecommend }}</p>
              <p>{{ quotePackageExplanation.customerFit }}</p>
            </div>
            <div class="explanation-block">
              <h3>价格由哪些部分构成</h3>
              <ul class="blocked-list">
                <li v-for="item in quotePriceBasis" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="explanation-block">
              <h3>{{ quoteUpgradeExplanation.title }}</h3>
              <ul class="blocked-list">
                <li v-for="item in quoteUpgradeExplanation.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </article>

          <article class="panel ops-explainer-panel">
            <h2>Customer Explanation Script</h2>
            <p class="control-note">
              运营人员可以直接引用这段口径解释报价；本段不会自动外发。
            </p>
            <div class="quote-script">
              {{ quoteCustomerScript }}
            </div>
            <dl class="ops-basis-list">
              <div>
                <dt>Venue / 场地</dt>
                <dd>{{ quoteVisualContext.primaryVenue.name }} · {{ quoteVisualContext.primaryVenue.priceRange }}</dd>
              </div>
              <div>
                <dt>Rendering / 渲染</dt>
                <dd>{{ quoteVisualContext.restaurant.title }}</dd>
              </div>
              <div>
                <dt>Suppliers / 供应商</dt>
                <dd>{{ quoteVisualContext.suppliers.map((item) => `${item.name} · ${item.priceRange}`).join(' / ') }}</dd>
              </div>
              <div>
                <dt>Decor / 装饰</dt>
                <dd>{{ quoteVisualContext.packageVisual.scope }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Selection Snapshot</h2>
            <pre>{{ formatJson(quote.selection_snapshot) }}</pre>
          </article>
          <article class="panel">
            <h2>Skeleton Notice</h2>
            <p>{{ quote.skeleton_notice || 'Stage 2 Quote skeleton only.' }}</p>
            <p class="control-note">
              Customer-facing Quote view, public share links, payment, and outbound messages remain out of scope.
            </p>
          </article>
        </section>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import apiClient from '@/api'
import { createDraftOrderFromQuote } from '@/services/adminOrderService'
import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets'
import { getPackageExplanation, getUpgradeExplanation } from '@/data/packageExplanation'
import { buildQuoteLineItemsFromSelection, normalizeQuoteLineItem, normalizeQuoteLineItems, quoteLineItemOrder, quoteLineItemTypes, summarizeQuoteLineItems } from '@/data/quoteLineItems'
import { buildPartySceneConfig, summarizePartySceneConfig } from '@/data/partySceneConfig'

const route = useRoute()
const router = useRouter()

const allowedStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired']
const quote = ref(null)
const loading = ref(false)
const message = ref('')
const messageType = ref('info')
const creatingOrder = ref(false)
const lineItemDraftRows = ref([])
const quoteOps = ref({
  owner: '',
  nextAction: '',
  note: '',
  updatedAt: ''
})

const quoteLineItemTypeOptions = quoteLineItemOrder.map((type) => ({
  type,
  ...quoteLineItemTypes[type]
}))
const lineItems = computed(() => normalizeQuoteLineItems(lineItemDraftRows.value.length ? lineItemDraftRows.value : quote.value?.line_items))
const lineItemSummary = computed(() => summarizeQuoteLineItems(lineItems.value))
const lineItemDraftSummary = computed(() => summarizeQuoteLineItems(lineItemDraftRows.value))
const canCreateDraftOrder = computed(() => quote.value?.status === 'accepted')
const quoteVisualContext = computed(() => {
  const selection = quote.value?.selection_snapshot || {}
  return getVisualContext(
    normalizeThemeId(selection.theme || selection.themeName || quote.value?.theme),
    normalizeTierId(selection.package || selection.packageName || quote.value?.package_tier)
  )
})
const quotePackageTier = computed(() => {
  const selection = quote.value?.selection_snapshot || {}
  return normalizeTierId(selection.package || selection.packageTier || selection.packageName || quote.value?.package_tier)
})
const quotePackageExplanation = computed(() => getPackageExplanation(quotePackageTier.value))
const quoteUpgradeExplanation = computed(() => getUpgradeExplanation(quotePackageTier.value))
const quotePartySceneConfig = computed(() => {
  const selection = quote.value?.selection_snapshot || {}
  return selection.party_scene_config || quote.value?.party_scene_config || buildPartySceneConfig({}, {
    theme: quoteVisualContext.value.packageVisual.theme,
    tier: quotePackageTier.value,
    visualContext: quoteVisualContext.value,
    reasonHeadline: quotePackageExplanation.value.whyRecommend
  })
})
const quoteSceneConfigSummary = computed(() => summarizePartySceneConfig(quotePartySceneConfig.value))
const quotePriceBasis = computed(() => {
  const context = quoteVisualContext.value
  const explanation = quotePackageExplanation.value
  const lineItemBasis = lineItemSummary.value.groups
    .map((group) => `${group.labelZh}：${formatMoney(group.amount, quote.value?.currency)} · ${group.description}`)
  return [
    `套餐层级：${explanation.label} · ${explanation.positioning}`,
    `装饰项：${context.packageVisual.scope}`,
    `餐厅 / 场地：${context.primaryVenue.name} · ${context.primaryVenue.priceRange}`,
    `渲染范围：${context.restaurant.decorationLayer}`,
    ...context.suppliers.map((supplier) => `供应商：${supplier.name} (${supplier.category}) · ${supplier.priceRange}`),
    ...explanation.priceDrivers.map((driver) => `价格驱动：${driver}`),
    ...lineItemBasis
  ].filter(Boolean)
})
const quoteCustomerScript = computed(() => {
  const context = quoteVisualContext.value
  const explanation = quotePackageExplanation.value
  return [
    `我们推荐 ${context.packageVisual.title}，因为${explanation.whyRecommend}`,
    `${explanation.customerFit}`,
    `这份报价主要由 ${context.primaryVenue.name} 场地样板、${context.packageVisual.scope}、${context.suppliers.map((item) => item.category).join(' / ')} 供应商建议和现场布置人工构成。`,
    `${explanation.quoteExplanation}`,
    `${quoteUpgradeExplanation.value.title}：${quoteUpgradeExplanation.value.items.join('；')}`
  ].join('\n\n')
})
const quoteOpsAlerts = computed(() => {
  if (!quote.value) return ['Quote detail is still loading.']
  const alerts = []
  if (!Number(quote.value.final_total || 0)) alerts.push('Missing final total. Confirm pricing before customer communication.')
  if (['draft', 'sent'].includes(quote.value.status) && !quote.value.valid_until) alerts.push('Missing valid_until. Add before sending or relying on this quote.')
  if (quote.value.status === 'sent' && quote.value.valid_until && new Date(quote.value.valid_until).getTime() < Date.now()) alerts.push('Sent quote is past valid_until. Mark expired or reissue manually.')
  if (quote.value.status === 'accepted') alerts.push('Accepted quote: review whether a draft Order exists. Payment remains blocked.')
  if (!quoteOps.value.owner) alerts.push('No local ops owner assigned.')
  return alerts.length ? alerts : ['No active operations alert.']
})

const opsStorageKey = computed(() => `partyonce_quote_ops_${route.params.quoteId}`)
const lineItemDraftStorageKey = computed(() => `partyonce_quote_line_item_draft_${route.params.quoteId}`)

const toDraftRow = (item = {}, index = 0) => {
  const normalized = normalizeQuoteLineItem(item, index)
  return {
    draft_id: item.draft_id || item.id || `draft-${Date.now()}-${index}`,
    id: normalized.id,
    type: normalized.type,
    name: normalized.name,
    amount: Number(normalized.amount || 0),
    amount_basis: normalized.amount_basis || '',
    customer_explanation: normalized.customer_explanation || '',
    admin_edit_hint: normalized.admin_edit_hint || '',
    description: normalized.description || '',
    source: normalized.source || 'admin_draft'
  }
}

const readStoredLineItemDraft = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(lineItemDraftStorageKey.value) || 'null')
    if (Array.isArray(parsed?.items)) return parsed.items.map(toDraftRow)
  } catch (error) {
    // Ignore corrupt local/staging draft and rebuild from snapshot.
  }
  return null
}

const loadLineItemDraft = async () => {
  if (quote.value?.id) {
    try {
      const response = await apiClient.get(`/quotes/${quote.value.id}/line-items`)
      if (Array.isArray(response.items) && response.items.length) {
        lineItemDraftRows.value = response.items.map(toDraftRow)
        return
      }
    } catch (error) {
      // Keep localStorage fallback for offline/local preview review.
    }
  }
  const stored = readStoredLineItemDraft()
  if (stored?.length) {
    lineItemDraftRows.value = stored
    return
  }
  lineItemDraftRows.value = normalizeQuoteLineItems(quote.value?.line_items).map(toDraftRow)
}

const resetLineItemDraft = () => {
  lineItemDraftRows.value = normalizeQuoteLineItems(quote.value?.line_items).map(toDraftRow)
  localStorage.removeItem(lineItemDraftStorageKey.value)
  ElMessage.info('Line item draft reset from current Quote snapshot.')
}

const addLineItemDraftRow = () => {
  lineItemDraftRows.value.push(toDraftRow({
    id: `admin-draft-${Date.now()}`,
    type: 'optional_upgrade',
    name: 'New optional upgrade',
    amount: 0,
    amount_basis: 'Manual local/staging draft item.',
    customer_explanation: quoteLineItemTypes.optional_upgrade.customerExplanation,
    admin_edit_hint: quoteLineItemTypes.optional_upgrade.adminEditHint,
    source: 'admin_line_item_draft'
  }, lineItemDraftRows.value.length))
}

const removeLineItemDraftRow = (index) => {
  lineItemDraftRows.value.splice(index, 1)
}

const setOptionalUpgrade = (item, checked) => {
  item.type = checked ? 'optional_upgrade' : 'service_fee'
}

const saveLineItemDraft = () => {
  const normalized = normalizeQuoteLineItems(lineItemDraftRows.value).map((item) => ({
    ...item,
    source: 'admin_line_item_draft',
    draft_saved_at: new Date().toISOString()
  }))
  const summary = summarizeQuoteLineItems(normalized)
  const applySavedDraft = (persistence, items = normalized, savedSummary = summary) => {
    quote.value = {
      ...quote.value,
      line_items: items,
      subtotal: savedSummary.selected_total ?? savedSummary.total,
      final_total: savedSummary.selected_total ?? savedSummary.total,
      line_item_draft_saved_at: new Date().toISOString(),
      line_item_draft_persistence: persistence
    }
    lineItemDraftRows.value = items.map(toDraftRow)
  }
  const payload = {
    quote_id: quote.value?.id,
    saved_at: new Date().toISOString(),
    persistence: 'localStorage fallback; backend quote line item draft API not yet enabled',
    items: normalized,
    summary
  }
  if (!quote.value?.id) {
    localStorage.setItem(lineItemDraftStorageKey.value, JSON.stringify(payload))
    applySavedDraft('localStorage fallback')
    ElMessage.warning('Line item draft saved to browser fallback. Quote id is unavailable.')
    return
  }
  apiClient.put(`/quotes/${quote.value.id}/line-items`, {
    schema_version: summary.schema_version,
    items: normalized,
    draft_note: 'Admin editable line item draft mode; local/staging skeleton only.'
  })
    .then((response) => {
      const backendItems = Array.isArray(response.items) ? response.items : normalized
      const backendSummary = response.summary || summary
      localStorage.removeItem(lineItemDraftStorageKey.value)
      applySavedDraft('backend skeleton', backendItems, backendSummary)
      ElMessage.success('Line item draft saved to local/staging backend skeleton. No payment, contract, webhook, or outbound action was triggered.')
    })
    .catch(() => {
      localStorage.setItem(lineItemDraftStorageKey.value, JSON.stringify(payload))
      applySavedDraft('localStorage fallback')
      ElMessage.warning('Local Quote line item API unavailable. Draft saved to browser fallback only.')
    })
}

const buildFallbackQuoteDetail = () => {
  const visualContext = getVisualContext('castle', 'standard')
  const packageExplanation = getPackageExplanation('standard')
  const lineItems = buildQuoteLineItemsFromSelection({
    packageData: { name: 'Castle Princess Standard', price: 1499 },
    sceneData: { name: 'Restaurant A Private Dining', basePrice: 2600 },
    visualContext,
    packageExplanation,
    currency: 'AUD'
  })
  const summary = summarizeQuoteLineItems(lineItems)
  return {
    id: route.params.quoteId || 'local-fallback-quote',
    quote_number: `LOCAL-STAGING-Q-${route.params.quoteId || '001'}`,
    status: 'draft',
    currency: 'AUD',
    subtotal: summary.total,
    discount_total: 0,
    tax_total: 0,
    final_total: summary.total,
    lead_id: 'local-fallback',
    customer_id: 'customer-local-41',
    customer_summary: {
      name: 'Local staging customer',
      contact: 'fixture@example.test'
    },
    lead_summary: {
      status: 'fallback_demo'
    },
    selection_snapshot: {
      theme: 'castle',
      package: 'standard',
      venueName: visualContext.primaryVenue.name
    },
    line_items: lineItems,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skeleton_notice: 'Fallback local/staging Quote detail used because the backend Quote detail API was unavailable.'
  }
}

const loadQuoteOpsState = () => {
  if (quote.value) {
    quoteOps.value = {
      owner: quote.value.owner_label || (quote.value.owner_user_id ? String(quote.value.owner_user_id) : ''),
      nextAction: quote.value.next_action || '',
      note: quote.value.internal_note || '',
      updatedAt: quote.value.updated_at || ''
    }
    return
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(opsStorageKey.value) || '{}')
    quoteOps.value = {
      owner: parsed.owner || '',
      nextAction: parsed.nextAction || '',
      note: parsed.note || '',
      updatedAt: parsed.updatedAt || ''
    }
  } catch (error) {
    quoteOps.value = { owner: '', nextAction: '', note: '', updatedAt: '' }
  }
}

const saveQuoteOpsState = () => {
  if (!quote.value) return
  const payload = {
    owner_label: quoteOps.value.owner || null,
    next_action: quoteOps.value.nextAction || null,
    internal_note: quoteOps.value.note || null
  }
  apiClient.patch(`/quotes/${quote.value.id}`, payload)
    .then((updated) => {
      quote.value = updated
      loadQuoteOpsState()
      ElMessage.success('Quote ops fields saved to local/staging SQLite. No external action was triggered.')
    })
    .catch(() => {
      quoteOps.value.updatedAt = new Date().toISOString()
      localStorage.setItem(opsStorageKey.value, JSON.stringify(quoteOps.value))
      ElMessage.warning('Local Quote API unavailable. Ops note saved to browser fallback only.')
    })
}

const loadQuote = async () => {
  loading.value = true
  message.value = ''
  try {
    quote.value = await apiClient.get(`/quotes/${route.params.quoteId}`)
    loadQuoteOpsState()
    await loadLineItemDraft()
  } catch (error) {
    quote.value = buildFallbackQuoteDetail()
    loadQuoteOpsState()
    await loadLineItemDraft()
    message.value = `${getErrorMessage(error)} Using local/staging fallback quote so line item draft mode can be reviewed.`
    messageType.value = 'warning'
  } finally {
    loading.value = false
  }
}

const updateQuoteStatus = async (status) => {
  if (!quote.value || status === quote.value.status) return
  if (!allowedStatuses.includes(status)) {
    ElMessage.warning('converted_to_order is blocked in this skeleton UI.')
    return
  }

  try {
    quote.value = await apiClient.patch(`/quotes/${quote.value.id}`, { status })
    message.value = `Quote ${quote.value.quote_number || quote.value.id} updated to ${status}.`
    messageType.value = 'success'
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  }
}

const createDraftOrder = async () => {
  if (!quote.value) return
  if (!canCreateDraftOrder.value) {
    message.value = 'Create Draft Order is available only after the Quote status is accepted.'
    messageType.value = 'warning'
    return
  }

  creatingOrder.value = true
  message.value = ''
  try {
    const result = await createDraftOrderFromQuote(quote.value)
    if (result.item) {
      ElMessage.success(`Draft Order ${result.item.order_number || result.item.id} created. No payment or outbound action was triggered.`)
      router.push(`/admin/orders/${result.item.id}`)
      return
    }

    const errorMessage = getErrorMessage(result.error, 'Could not create a Draft Order from this Quote. Check the safe local backend profile and admin auth fixture.')
    message.value = errorMessage
    messageType.value = 'warning'
    if (/already exists|already|exists|converted_to_order/i.test(errorMessage)) {
      ElMessage.warning('An Order may already exist for this Quote. Opening Order Review.')
      router.push('/admin/orders')
    }
  } finally {
    creatingOrder.value = false
  }
}

const getErrorMessage = (error, fallback = 'Could not load the local/staging Quote detail.') => {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg || item.type).join('; ')
  return fallback
}

const formatMoney = (value, currency = 'AUD') => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency || 'AUD'
  }).format(amount)
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const formatJson = (value) => {
  if (!value || Object.keys(value).length === 0) return 'No snapshot available'
  return JSON.stringify(value, null, 2)
}

onMounted(loadQuote)
</script>

<style scoped>
.admin-quote-detail-page {
  min-height: 100vh;
  padding: 88px 24px 32px;
  background: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid #dee2e6;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #212529;
}

.page-header p {
  max-width: 760px;
  margin: 8px 0 0;
  color: #495057;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #7048e8;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.scope-alert,
.detail-shell {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

.scope-alert {
  margin-bottom: 18px;
}

.detail-shell {
  min-height: 320px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card,
.panel {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.summary-card {
  padding: 18px;
}

.summary-card span,
.summary-card small {
  display: block;
  color: #868e96;
}

.summary-card strong {
  display: block;
  margin: 8px 0 4px;
  font-size: 22px;
  color: #212529;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.panel {
  padding: 18px;
  margin-bottom: 18px;
}

.panel h2 {
  margin: 0 0 14px;
  font-size: 18px;
  color: #212529;
}

.panel-heading-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.panel-heading-row h2 {
  margin-bottom: 6px;
}

.draft-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.editable-line-items-panel {
  border-color: #c3fae8;
  background: #fbfffd;
}

.line-item-draft-summary {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid #c3fae8;
  border-radius: 8px;
  background: #f1fef8;
}

.line-item-draft-summary strong,
.line-item-draft-summary span,
.line-item-draft-summary small {
  color: #087f5b;
}

.line-item-editor-list {
  display: grid;
  gap: 14px;
}

.line-item-editor-row {
  padding: 14px;
  border: 1px solid #d8f5e7;
  border-radius: 8px;
  background: #ffffff;
}

.editor-row-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.line-item-form-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr 180px 160px;
  gap: 12px;
  align-items: end;
}

.line-item-form-grid label,
.wide-field {
  display: grid;
  gap: 6px;
  color: #495057;
  font-size: 13px;
  font-weight: 700;
}

.wide-field {
  margin-top: 12px;
}

dl {
  display: grid;
  gap: 12px;
  margin: 0;
}

dl div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f3f5;
}

dt {
  color: #868e96;
}

dd {
  margin: 0;
  text-align: right;
  color: #212529;
  font-weight: 600;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 700;
}

.field-label.stacked {
  margin-top: 14px;
}

.status-select {
  width: 220px;
}

.control-note {
  margin: 12px 0 0;
  color: #868e96;
  font-size: 13px;
}

.create-order-button {
  margin-top: 14px;
}

.blocked-list {
  margin: 0;
  padding-left: 18px;
  color: #495057;
  line-height: 1.7;
}

pre {
  max-height: 320px;
  overflow: auto;
  margin: 0;
  padding: 14px;
  background: #f1f3f5;
  border-radius: 6px;
  color: #212529;
  white-space: pre-wrap;
  word-break: break-word;
}

.visual-panel {
  overflow: hidden;
}

.visual-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.visual-pair img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.ops-explainer-panel {
  border-color: #d0bfff;
  background: #fffaff;
}

.explanation-block {
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #f1e8ff;
  border-radius: 8px;
  background: #ffffff;
}

.explanation-block h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #5f3dc4;
}

.explanation-block p {
  margin: 0 0 8px;
  color: #343a40;
  line-height: 1.6;
}

.quote-script {
  margin-top: 12px;
  padding: 14px;
  border: 1px solid #e5dbff;
  border-radius: 8px;
  background: #f8f0ff;
  color: #212529;
  line-height: 1.65;
  white-space: pre-line;
}

.ops-basis-list {
  margin-top: 14px;
}

.scene-config-admin-summary {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid #e5dbff;
  border-radius: 8px;
  background: #f8f0ff;
}

.scene-config-admin-summary p,
.scene-config-admin-summary span {
  margin: 0;
  color: #495057;
  line-height: 1.5;
}

:deep(.el-table small) {
  display: block;
  margin-top: 4px;
  color: #868e96;
}

@media (max-width: 900px) {
  .page-header,
  dl div {
    flex-direction: column;
  }

  .summary-grid,
  .panel-grid,
  .line-item-form-grid {
    grid-template-columns: 1fr;
  }

  .panel-heading-row {
    flex-direction: column;
  }

  dd {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .admin-quote-detail-page {
    padding: 80px 14px 24px;
  }
}
</style>
