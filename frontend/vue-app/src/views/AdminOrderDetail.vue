<template>
  <div class="admin-order-detail-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Party Event / 派对活动 · Stage 2 local-only</p>
        <h1>{{ order?.order_number || 'Order Detail' }}</h1>
        <p>
          Admin Order Detail skeleton for local/staging review. It tries the safe local backend Order API first,
          then falls back to browser localStorage mock records without triggering external systems.
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="router.push('/admin/orders')">Back to Order Review</el-button>
        <el-button type="primary" @click="router.push('/admin/quotes')">Quote Review</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="`Local/staging UI skeleton. Data source: ${dataSource}. Payment, webhook/n8n, outbound messaging, supplier dispatch, and contracts remain blocked.`"
    />

    <el-alert
      v-if="fallbackNotice"
      class="scope-alert"
      type="info"
      :closable="true"
      show-icon
      :title="fallbackNotice"
      @close="fallbackNotice = ''"
    />

    <section v-loading="loading" class="detail-shell">
      <el-empty
        v-if="!order"
        description="This local Order skeleton record is not available."
      >
        <el-button type="primary" @click="router.push('/admin/orders')">Back to Order Review</el-button>
      </el-empty>

      <template v-else>
        <section class="summary-grid" aria-label="Order detail summary">
          <article class="summary-card">
            <span>Status</span>
            <strong>{{ order.status }}</strong>
            <small>Operational skeleton state</small>
          </article>
          <article class="summary-card">
            <span>Total</span>
            <strong>{{ formatMoney(order.total_amount, order.currency) }}</strong>
            <small>Deposit {{ formatMoney(order.deposit_amount, order.currency) }}</small>
          </article>
          <article class="summary-card">
            <span>Deposit</span>
            <strong>{{ order.deposit_status }}</strong>
            <small>Read-only until payment stage</small>
          </article>
          <article class="summary-card">
            <span>External Systems</span>
            <strong>Blocked</strong>
            <small>No payment or outbound action</small>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Customer</h2>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{{ order.customer.name }}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{{ order.customer.contact }}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{{ order.customer.phone }}</dd>
              </div>
            </dl>
          </article>

          <article class="panel">
            <h2>Linked Quote</h2>
            <dl>
              <div>
                <dt>Quote</dt>
                <dd>{{ order.quote.quote_number }}</dd>
              </div>
              <div>
                <dt>Quote Status</dt>
                <dd>{{ order.quote.status }}</dd>
              </div>
              <div>
                <dt>Lead</dt>
                <dd>{{ order.quote.lead_id }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Event</h2>
            <dl>
              <div>
                <dt>Date</dt>
                <dd>{{ formatDate(order.event.date) }}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{{ order.event.location }}</dd>
              </div>
              <div>
                <dt>Theme</dt>
                <dd>{{ order.event.theme }}</dd>
              </div>
              <div>
                <dt>Package</dt>
                <dd>{{ order.event.package_tier }}</dd>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>{{ order.event.guest_count }}</dd>
              </div>
            </dl>
          </article>

          <article class="panel visual-panel">
            <h2>Visual Delivery Context</h2>
            <div class="visual-pair">
              <img :src="orderVisualContext.packageVisual.image_path" :alt="orderVisualContext.packageVisual.title">
              <img :src="orderVisualContext.restaurant.image_path" :alt="orderVisualContext.restaurant.title">
            </div>
            <dl>
              <div>
                <dt>Venue</dt>
                <dd>{{ orderVisualContext.primaryVenue.name }} · {{ orderVisualContext.primaryVenue.capacity }}</dd>
              </div>
              <div>
                <dt>Rendering</dt>
                <dd>{{ orderVisualContext.restaurant.title }}</dd>
              </div>
              <div>
                <dt>Supplier Roles</dt>
                <dd>{{ orderVisualContext.suppliers.map((item) => item.operationsRole).join(' / ') }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Order Controls</h2>
            <label class="field-label" for="order-status-select">Status</label>
            <el-select
              id="order-status-select"
              class="status-select"
              :model-value="order.status"
              @change="updateStatus"
            >
              <el-option v-for="status in orderStatuses" :key="status" :label="status" :value="status" />
            </el-select>
            <p class="control-note">
              `deposit_paid` is intentionally unavailable here because payment has not entered scope.
            </p>
            <label class="field-label stacked" for="order-event-date">Event Date</label>
            <el-input
              id="order-event-date"
              v-model="opsForm.event_date"
              placeholder="YYYY-MM-DD or local event date"
            />
            <label class="field-label stacked" for="order-event-location">Event Location</label>
            <el-input
              id="order-event-location"
              v-model="opsForm.event_location"
              placeholder="Event address or venue"
            />
            <label class="field-label stacked" for="order-owner">Owner</label>
            <el-input
              id="order-owner"
              v-model="opsForm.owner"
              placeholder="Local/staging owner"
            />
          </article>
        </section>

        <section class="panel-grid">
          <PartySceneSummary
            title="Unified AI / Scene / 3D Order Context"
            audience="admin"
            :scene-config="orderPartySceneConfig"
            :visual-context="orderVisualContext"
            :recommendation-text="orderPackageExplanation.whyRecommend"
          />
          <SocialRewardsPanel
            mode="admin"
            title="Order social rewards status"
            :customer-id="order?.customer?.id || 'customer-local-41'"
            :order-id="order?.id || ''"
            :order-number="order?.order_number || ''"
          />
        </section>

        <section class="panel-grid">
          <article class="panel ops-explainer-panel">
            <h2>Ops Pricing Explanation</h2>
            <div class="scene-config-admin-summary">
              <strong>party_scene_config</strong>
              <p>{{ orderSceneConfigSummary.layout }}</p>
              <span>{{ orderSceneConfigSummary.decor }}</span>
            </div>
            <p class="body-text">
              {{ orderPackageExplanation.positioning }}
            </p>
            <div class="explanation-block">
              <h3>客户为什么适合这个套餐</h3>
              <p>{{ orderPackageExplanation.customerFit }}</p>
              <p>{{ orderPackageExplanation.whyRecommend }}</p>
            </div>
            <div class="explanation-block">
              <h3>价格由哪些部分构成</h3>
              <ul class="blocked-list">
                <li v-for="item in orderPriceBasis" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="explanation-block">
              <h3>{{ orderUpgradeExplanation.title }}</h3>
              <ul class="blocked-list">
                <li v-for="item in orderUpgradeExplanation.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </article>

          <article class="panel ops-explainer-panel">
            <h2>Customer Explanation Script</h2>
            <p class="control-note">
              用于订单跟进时解释报价依据；本段只显示在后台，不会外发。
            </p>
            <div class="quote-script">
              {{ orderCustomerScript }}
            </div>
            <dl class="ops-basis-list">
              <div>
                <dt>Venue / 场地</dt>
                <dd>{{ orderVisualContext.primaryVenue.name }} · {{ orderVisualContext.primaryVenue.priceRange }}</dd>
              </div>
              <div>
                <dt>Rendering / 渲染</dt>
                <dd>{{ orderVisualContext.restaurant.title }}</dd>
              </div>
              <div>
                <dt>Suppliers / 供应商</dt>
                <dd>{{ orderVisualContext.suppliers.map((item) => `${item.name} · ${item.categoryLabel || item.category} · ${item.priceRange}`).join(' / ') }}</dd>
              </div>
              <div>
                <dt>Decor / 装饰</dt>
                <dd>{{ orderVisualContext.packageVisual.scope }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Next Action</h2>
            <el-input
              v-model="opsForm.next_action"
              placeholder="Example: confirm deposit wording after payment stage is approved"
            />
            <h3>Internal Note</h3>
            <el-input
              v-model="opsForm.internal_note"
              type="textarea"
              :rows="5"
              maxlength="800"
              show-word-limit
              placeholder="Record operational context. Not visible to customer."
            />
            <el-button class="save-button" type="primary" plain @click="saveOrderOperations">
              Save Order Ops Fields
            </el-button>
            <p class="control-note">
              Saves only local/staging Order skeleton fields. No Stripe, payment, webhook/n8n, or outbound message is triggered.
            </p>
          </article>

          <article class="panel">
            <h2>Blocked Actions & Alerts</h2>
            <ul class="blocked-list alerts-list">
              <li v-for="item in orderOpsAlerts" :key="item">{{ item }}</li>
            </ul>
            <ul class="blocked-list">
              <li v-for="action in blockedOrderActions" :key="action">{{ action }}</li>
            </ul>
          </article>
        </section>

        <section class="panel-grid">
          <article class="panel">
            <h2>Status Flow</h2>
            <ol class="status-flow">
              <li v-for="step in order.status_flow" :key="step.status" :class="{ complete: step.completed }">
                <strong>{{ step.status }}</strong>
                <span>{{ step.label }}</span>
              </li>
            </ol>
          </article>

          <article class="panel">
            <h2>Standardized Line Items</h2>
            <el-table :data="order.line_items" row-key="name" style="width: 100%">
              <el-table-column label="Type" width="170">
                <template #default="{ row }">
                  <strong>{{ row.type_label_zh || row.type }}</strong>
                  <small>{{ row.customer_label }}</small>
                </template>
              </el-table-column>
              <el-table-column label="Item / Basis" min-width="260">
                <template #default="{ row }">
                  <span>{{ row.name }}</span>
                  <small>{{ row.description }}</small>
                </template>
              </el-table-column>
              <el-table-column label="Amount" width="150" align="right">
                <template #default="{ row }">{{ formatMoney(row.amount, order.currency) }}</template>
              </el-table-column>
              <el-table-column label="Amount Basis / Edit Hint" min-width="300">
                <template #default="{ row }">
                  <span>{{ row.amount_basis }}</span>
                  <small>{{ row.admin_edit_hint }}</small>
                </template>
              </el-table-column>
            </el-table>
            <p class="control-note">
              Deposit placeholder:
              {{ formatMoney(orderLineItemSummary.deposit_placeholder, order.currency) }}.
              This is readiness-only and does not create payment.
            </p>
          </article>
        </section>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { blockedOrderActions, orderStatuses } from '@/mock/adminOrders'
import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets'
import { getPackageExplanation, getUpgradeExplanation } from '@/data/packageExplanation'
import { normalizeQuoteLineItems, summarizeQuoteLineItems } from '@/data/quoteLineItems'
import { buildPartySceneConfig, summarizePartySceneConfig } from '@/data/partySceneConfig'
import PartySceneSummary from '@/components/PartySceneSummary.vue'
import SocialRewardsPanel from '@/components/SocialRewardsPanel.vue'
import {
  ORDER_SOURCE_API,
  ORDER_SOURCE_STATIC_PREVIEW_FALLBACK,
  fetchAdminOrderDetail,
  updateAdminOrderOperations,
  updateAdminOrderStatus
} from '@/services/adminOrderService'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(false)
const dataSource = ref('loading')
const fallbackNotice = ref('')
const opsForm = ref({
  event_date: '',
  event_location: '',
  owner: '',
  next_action: '',
  internal_note: ''
})

const orderOpsAlerts = computed(() => {
  if (!order.value) return ['Order detail is still loading.']
  const alerts = []
  if (order.value.status === 'pending_deposit') {
    alerts.push('pending_deposit is a business status only. Stripe payment is still blocked.')
  }
  if (!order.value.event?.date || order.value.event.date === '-') alerts.push('Missing event date.')
  if (!order.value.event?.location || order.value.event.location === '-') alerts.push('Missing event location.')
  if (!String(opsForm.value.owner || '').trim()) alerts.push('No local/staging owner assigned.')
  if (!String(opsForm.value.next_action || '').trim()) alerts.push('Next action is empty.')
  if (!String(opsForm.value.internal_note || '').trim()) alerts.push('Internal note is empty.')
  return alerts.length ? alerts : ['No active operations alert.']
})

const orderVisualContext = computed(() => getVisualContext(
  normalizeThemeId(order.value?.event?.theme || order.value?.theme),
  normalizeTierId(order.value?.event?.package_tier || order.value?.package_tier)
))
const orderPackageTier = computed(() => normalizeTierId(order.value?.event?.package_tier || order.value?.package_tier))
const orderPackageExplanation = computed(() => getPackageExplanation(orderPackageTier.value))
const orderUpgradeExplanation = computed(() => getUpgradeExplanation(orderPackageTier.value))
const orderPartySceneConfig = computed(() => order.value?.party_scene_config || order.value?.selection_snapshot?.party_scene_config || buildPartySceneConfig({}, {
  theme: orderVisualContext.value.packageVisual.theme,
  tier: orderPackageTier.value,
  visualContext: orderVisualContext.value,
  reasonHeadline: orderPackageExplanation.value.whyRecommend
}))
const orderSceneConfigSummary = computed(() => summarizePartySceneConfig(orderPartySceneConfig.value))
const orderLineItemSummary = computed(() => summarizeQuoteLineItems(normalizeQuoteLineItems(order.value?.line_items)))
const orderPriceBasis = computed(() => {
  const context = orderVisualContext.value
  const explanation = orderPackageExplanation.value
  return [
    `套餐层级：${explanation.label} · ${explanation.positioning}`,
    `装饰项：${context.packageVisual.scope}`,
    `餐厅 / 场地：${context.primaryVenue.name} · ${context.primaryVenue.priceRange}`,
    `渲染范围：${context.restaurant.decorationLayer}`,
    ...context.suppliers.map((supplier) => `供应商：${supplier.name} (${supplier.categoryLabel || supplier.category}) · ${supplier.priceRange} · ${supplier.responsibility || supplier.operationsRole}`),
    ...explanation.priceDrivers.map((driver) => `价格驱动：${driver}`),
    ...orderLineItemSummary.value.groups.map((group) => `${group.labelZh}：${formatMoney(group.amount, order.value?.currency)} · ${group.description}`)
  ].filter(Boolean)
})
const orderCustomerScript = computed(() => {
  const context = orderVisualContext.value
  const explanation = orderPackageExplanation.value
  return [
    `当前订单沿用 ${context.packageVisual.title}，因为${explanation.whyRecommend}`,
    `${explanation.customerFit}`,
    `价格主要来自 ${context.primaryVenue.name} 场地样板、${context.packageVisual.scope}、${context.suppliers.map((item) => item.categoryLabel || item.category).join(' / ')} 供应商建议和现场布置人工。`,
    `${explanation.quoteExplanation}`,
    `${orderUpgradeExplanation.value.title}：${orderUpgradeExplanation.value.items.join('；')}`
  ].join('\n\n')
})

const syncOpsForm = () => {
  opsForm.value = {
    event_date: order.value?.event?.date && order.value.event.date !== '-' ? order.value.event.date : '',
    event_location: order.value?.event?.location && order.value.event.location !== '-' ? order.value.event.location : '',
    owner: order.value?.owner_label || order.value?.owner || '',
    next_action: order.value?.next_action || '',
    internal_note: order.value?.internal_note || ''
  }
}

const loadOrder = async () => {
  loading.value = true
  fallbackNotice.value = ''
  try {
    const result = await fetchAdminOrderDetail(route.params.orderId)
    order.value = result.item
    if (order.value) order.value.line_items = normalizeQuoteLineItems(order.value.line_items)
    dataSource.value = result.source
    syncOpsForm()
    if (result.source === ORDER_SOURCE_STATIC_PREVIEW_FALLBACK) {
      fallbackNotice.value = 'Static Preview mode: this Order Detail uses browser fallback data by design to avoid remote API auth noise. Auth guard remains active; no production data is requested.'
    } else if (result.source !== ORDER_SOURCE_API) {
      fallbackNotice.value = 'Local backend Order detail API is unavailable, so this page is using fallback mock data.'
    }
  } finally {
    loading.value = false
  }
}

const saveOrderOperations = async () => {
  if (!order.value) return
  const result = await updateAdminOrderOperations(order.value, {
    event_date: opsForm.value.event_date || null,
    event_location: opsForm.value.event_location || null,
    owner_label: opsForm.value.owner || null,
    next_action: opsForm.value.next_action || null,
    internal_note: opsForm.value.internal_note
  }, dataSource.value)
  if (!result.item) {
    ElMessage.error('Could not save Order operations fields.')
    return
  }
  order.value = result.item
  if (order.value) order.value.line_items = normalizeQuoteLineItems(order.value.line_items)
  dataSource.value = result.source
  syncOpsForm()
  if (result.source !== ORDER_SOURCE_API) {
    fallbackNotice.value = 'Operations fields used fallback mock storage because the local backend API was unavailable.'
  }
  ElMessage.success('Order operations fields saved. No external action was triggered.')
}

const updateStatus = async (status) => {
  if (!order.value || status === order.value.status) return
  const result = await updateAdminOrderStatus(order.value, status, dataSource.value)
  if (!result.item) {
    ElMessage.error('Could not update this Order skeleton record.')
    return
  }
  order.value = result.item
  if (order.value) order.value.line_items = normalizeQuoteLineItems(order.value.line_items)
  dataSource.value = result.source
  syncOpsForm()
  if (result.source !== ORDER_SOURCE_API) {
    fallbackNotice.value = 'Status update used fallback mock storage because the local backend API was unavailable.'
  }
  ElMessage.success(`${order.value.order_number} updated to ${status}. No external action was triggered.`)
}

const formatMoney = (value, currency = 'AUD') => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency || 'AUD'
  }).format(amount)
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString()
}

onMounted(loadOrder)
</script>

<style scoped>
.admin-order-detail-page {
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
  color: #2b8a3e;
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
}

.panel h2 {
  margin: 0 0 14px;
  font-size: 18px;
  color: #212529;
}

.panel h3 {
  margin: 18px 0 8px;
  font-size: 15px;
  color: #343a40;
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
  width: 240px;
}

.save-button {
  margin-top: 14px;
}

.control-note,
.body-text {
  margin: 12px 0 0;
  color: #495057;
  line-height: 1.6;
}

.blocked-list,
.status-flow {
  margin: 0;
  padding-left: 20px;
  color: #495057;
}

.blocked-list li,
.status-flow li {
  margin-bottom: 10px;
}

.alerts-list {
  margin-bottom: 18px;
  color: #b7791f;
}

.status-flow li {
  color: #868e96;
}

.status-flow li.complete {
  color: #2b8a3e;
}

.status-flow strong {
  display: block;
  color: inherit;
}

.status-flow span {
  display: block;
  margin-top: 3px;
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
  border-color: #c3fae8;
  background: #fbfffd;
}

.explanation-block {
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #d8f5e5;
  border-radius: 8px;
  background: #ffffff;
}

.explanation-block h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #087f5b;
}

.explanation-block p {
  margin: 0 0 8px;
  color: #343a40;
  line-height: 1.6;
}

.quote-script {
  margin-top: 12px;
  padding: 14px;
  border: 1px solid #c3fae8;
  border-radius: 8px;
  background: #ebfbee;
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
  border: 1px solid #c3fae8;
  border-radius: 8px;
  background: #ebfbee;
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
  .panel-grid {
    grid-template-columns: 1fr;
  }

  dd {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .admin-order-detail-page {
    padding: 80px 14px 24px;
  }
}
</style>
