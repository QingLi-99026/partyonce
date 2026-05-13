<template>
  <div class="admin-orders-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Party Event / 派对活动 · Stage 2 local-only</p>
        <h1>Order Review</h1>
        <p>
          Admin Order Queue skeleton for local/staging review. It tries the safe local backend Order API first,
          then falls back to browser localStorage mock records without blocking the demo.
        </p>
      </div>
      <div class="header-actions">
        <el-button :loading="loading" @click="loadOrders">Refresh</el-button>
        <el-button @click="resetOrders">Reset Fallback Data</el-button>
        <el-button type="primary" @click="router.push('/admin/quotes')">Quote Review</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="`Local/staging UI skeleton. Data source: ${dataSource}. No Stripe/payment, webhook/n8n, or outbound messages.`"
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

    <section class="stats-grid" aria-label="Order review summary">
      <article class="stat-card">
        <span>Total Orders</span>
        <strong>{{ orders.length }}</strong>
        <small>{{ dataSource }}</small>
      </article>
      <article class="stat-card">
        <span>Visible</span>
        <strong>{{ filteredOrders.length }}</strong>
        <small>After filters</small>
      </article>
      <article class="stat-card">
        <span>Next Actions</span>
        <strong>{{ nextActionCount }}</strong>
        <small>Manual follow-ups</small>
      </article>
      <article class="stat-card">
        <span>External Systems</span>
        <strong>Blocked</strong>
        <small>No payment or outbound action</small>
      </article>
    </section>

    <section class="toolbar" aria-label="Order filters">
      <el-input
        v-model="searchQuery"
        class="search-input"
        clearable
        placeholder="Search order, customer, quote, theme, venue, or next action"
        @keyup.enter="loadOrders"
      />
      <el-select v-model="statusFilter" class="status-filter" placeholder="Status" @change="loadOrders">
        <el-option label="All statuses" value="" />
        <el-option v-for="status in orderStatuses" :key="status" :label="status" :value="status" />
      </el-select>
      <el-input
        v-model="ownerFilter"
        class="owner-filter"
        clearable
        placeholder="Filter owner"
        @keyup.enter="loadOrders"
        @change="loadOrders"
      />
      <el-input
        v-model="nextActionFilter"
        class="next-action-filter"
        clearable
        placeholder="Filter next action"
        @keyup.enter="loadOrders"
        @change="loadOrders"
      />
      <el-select v-model="riskFilter" class="status-filter wide-filter" placeholder="Ops alerts">
        <el-option label="All orders" value="" />
        <el-option label="Pending deposit" value="pending_deposit_state" />
        <el-option label="Missing event date" value="missing_event_date" />
        <el-option label="Missing location" value="missing_location" />
        <el-option label="Missing next action" value="missing_next_action" />
      </el-select>
      <el-button @click="clearFilters">Clear</el-button>
    </section>

    <section class="bulk-panel" aria-label="Order bulk operations">
      <div class="bulk-summary">
        <strong>{{ selectedOrders.length }} selected</strong>
        <span>Bulk operations update local/staging Order skeleton fields only.</span>
      </div>
      <el-input
        v-model="bulkOwner"
        class="bulk-input"
        clearable
        placeholder="Owner"
        :disabled="selectedOrders.length === 0 || bulkLoading"
      />
      <el-input
        v-model="bulkNextAction"
        class="bulk-input wide-bulk-input"
        clearable
        placeholder="Next action"
        :disabled="selectedOrders.length === 0 || bulkLoading"
      />
      <el-select
        v-model="bulkStatus"
        class="bulk-status"
        placeholder="Status"
        :disabled="selectedOrders.length === 0 || bulkLoading"
      >
        <el-option v-for="status in orderStatuses" :key="status" :label="status" :value="status" />
      </el-select>
      <el-button :disabled="!canApplyOrderOps" :loading="bulkLoading" @click="applyBulkOrderOps">
        Apply Owner / Next Action
      </el-button>
      <el-button type="warning" plain :disabled="!canApplyOrderStatus" :loading="bulkLoading" @click="applyBulkOrderStatus">
        Apply Status
      </el-button>
    </section>

    <section class="table-shell">
      <el-empty
        v-if="filteredOrders.length === 0"
        description="No local Order skeleton records match the current filters."
      >
        <el-button type="primary" @click="resetOrders">Reload Demo Orders</el-button>
      </el-empty>

      <el-table
        v-else
        v-loading="loading"
        :data="filteredOrders"
        row-key="id"
        style="width: 100%"
        @selection-change="selectedOrders = $event"
      >
        <el-table-column type="selection" width="48" />

        <el-table-column label="Order" min-width="190">
          <template #default="{ row }">
            <div class="order-cell">
              <strong>{{ row.order_number }}</strong>
              <span>ID {{ row.id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Customer" min-width="220">
          <template #default="{ row }">
            <div class="order-cell">
              <strong>{{ row.customer.name }}</strong>
              <span>{{ row.customer.contact }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="160">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Ops Alerts" min-width="230">
          <template #default="{ row }">
            <div class="alert-cell">
              <el-tag
                v-for="item in orderExceptions(row)"
                :key="item.code"
                :type="item.type"
                effect="plain"
              >
                {{ item.label }}
              </el-tag>
              <span v-if="orderExceptions(row).length === 0">No active alert</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Event" min-width="240">
          <template #default="{ row }">
            <div class="order-cell">
              <strong>{{ row.event.theme }} · {{ row.event.package_tier }}</strong>
              <span>{{ formatDate(row.event.date) }} · {{ row.event.location }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Visual Context" min-width="260">
          <template #default="{ row }">
            <div class="visual-cell">
              <img :src="orderVisual(row).restaurant.image_path" :alt="orderVisual(row).restaurant.title">
              <div>
                <strong>{{ orderVisual(row).restaurant.title }}</strong>
                <span>{{ orderVisual(row).suppliers.map((item) => item.name).join(' / ') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Amount" width="150" align="right">
          <template #default="{ row }">
            <div class="amount-cell">
              <strong>{{ formatMoney(row.total_amount, row.currency) }}</strong>
              <span>Deposit {{ formatMoney(row.deposit_amount, row.currency) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Next Action" min-width="260">
          <template #default="{ row }">
            <div class="order-cell">
              <strong>{{ row.owner }}</strong>
              <span class="next-action">{{ row.next_action }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status Update" min-width="210">
          <template #default="{ row }">
            <el-select
              :model-value="row.status"
              size="small"
              @change="updateStatus(row, $event)"
            >
              <el-option v-for="status in orderStatuses" :key="status" :label="status" :value="status" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="Action" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="router.push(`/admin/orders/${row.id}`)">View</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { orderStatuses } from '@/mock/adminOrders'
import { getVisualContext } from '@/data/visualAssets'
import {
  ORDER_SOURCE_API,
  ORDER_SOURCE_FALLBACK,
  fetchAdminOrders,
  resetAdminOrderFallback,
  updateAdminOrderOperations,
  updateAdminOrderStatus
} from '@/services/adminOrderService'

const router = useRouter()
const orders = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const ownerFilter = ref('')
const nextActionFilter = ref('')
const riskFilter = ref('')
const loading = ref(false)
const dataSource = ref('loading')
const fallbackNotice = ref('')
const selectedOrders = ref([])
const bulkOwner = ref('')
const bulkNextAction = ref('')
const bulkStatus = ref('')
const bulkLoading = ref(false)

const canApplyOrderOps = computed(() => {
  return selectedOrders.value.length > 0 && !bulkLoading.value && (
    bulkOwner.value.trim() || bulkNextAction.value.trim()
  )
})

const canApplyOrderStatus = computed(() => {
  return selectedOrders.value.length > 0 && !bulkLoading.value && orderStatuses.includes(bulkStatus.value)
})

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return orders.value.filter((order) => {
    const matchesStatus = !statusFilter.value || order.status === statusFilter.value
    const matchesOwner = !ownerFilter.value.trim() || String(order.owner || '').toLowerCase().includes(ownerFilter.value.trim().toLowerCase())
    const matchesNextAction = !nextActionFilter.value.trim() || String(order.next_action || '').toLowerCase().includes(nextActionFilter.value.trim().toLowerCase())
    const matchesRisk = !riskFilter.value || orderExceptions(order).some((item) => item.code === riskFilter.value)
    if (!query) return matchesStatus && matchesOwner && matchesNextAction && matchesRisk
    const haystack = [
      order.id,
      order.order_number,
      order.status,
      order.customer?.name,
      order.customer?.contact,
      order.customer?.phone,
      order.quote?.quote_number,
      order.quote?.lead_id,
      order.event?.theme,
      order.event?.package_tier,
      order.event?.location,
      order.next_action,
      order.internal_note,
      order.owner
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesStatus && matchesOwner && matchesNextAction && matchesRisk && haystack.includes(query)
  })
})

const nextActionCount = computed(() => orders.value.filter((order) => Boolean(order.next_action)).length)

const orderExceptions = (order) => {
  const exceptions = []
  if (order.status === 'pending_deposit') {
    exceptions.push({ code: 'pending_deposit_state', label: 'Business deposit pending', type: 'warning' })
  }
  if (!order.event?.date || order.event.date === '-') {
    exceptions.push({ code: 'missing_event_date', label: 'Missing event date', type: 'danger' })
  }
  if (!order.event?.location || order.event.location === '-') {
    exceptions.push({ code: 'missing_location', label: 'Missing location', type: 'danger' })
  }
  if (!String(order.next_action || '').trim()) {
    exceptions.push({ code: 'missing_next_action', label: 'No next action', type: 'warning' })
  }
  return exceptions
}

const loadOrders = async () => {
  loading.value = true
  fallbackNotice.value = ''
  try {
    const params = { limit: 100, offset: 0 }
    if (statusFilter.value) params.status = statusFilter.value
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
    if (ownerFilter.value.trim()) params.owner = ownerFilter.value.trim()
    if (nextActionFilter.value.trim()) params.next_action = nextActionFilter.value.trim()
    const result = await fetchAdminOrders(params)
    orders.value = result.items
    dataSource.value = result.source
    if (result.source === ORDER_SOURCE_FALLBACK) {
      fallbackNotice.value = 'Local backend Order API is unavailable, so the queue is using fallback mock data.'
    }
  } finally {
    loading.value = false
  }
}

const resetOrders = () => {
  orders.value = resetAdminOrderFallback()
  dataSource.value = ORDER_SOURCE_FALLBACK
  fallbackNotice.value = 'Fallback mock data was reset in browser localStorage.'
  ElMessage.success('Fallback Order demo records reloaded.')
}

const updateStatus = async (order, status) => {
  if (status === order.status) return
  const result = await updateAdminOrderStatus(order, status, dataSource.value)
  if (!result.item) {
    ElMessage.error('Could not update the Order skeleton record.')
    return
  }
  const index = orders.value.findIndex((item) => item.id === order.id)
  if (index !== -1) orders.value[index] = result.item
  dataSource.value = result.source
  if (result.source !== ORDER_SOURCE_API) {
    fallbackNotice.value = 'Status update used fallback mock storage because the local backend API was unavailable.'
  }
  ElMessage.success(`${order.order_number} updated to ${status}. No external action was triggered.`)
}

const updateOrderRow = (orderId, updatedOrder) => {
  const index = orders.value.findIndex((item) => item.id === orderId)
  if (index !== -1) orders.value[index] = updatedOrder
}

const applyBulkOrderOps = async () => {
  if (!canApplyOrderOps.value) return
  const patch = {}
  if (bulkOwner.value.trim()) patch.owner_label = bulkOwner.value.trim()
  if (bulkNextAction.value.trim()) patch.next_action = bulkNextAction.value.trim()
  await runBulkOrderUpdate(patch, 'Order owner / next action updated')
}

const applyBulkOrderStatus = async () => {
  if (!canApplyOrderStatus.value) return
  try {
    await ElMessageBox.confirm(
      `Update ${selectedOrders.value.length} Order skeleton record(s) to ${bulkStatus.value}? This does not change payment or deposit status.`,
      'Confirm bulk Order status update',
      { type: 'warning', confirmButtonText: 'Apply Status', cancelButtonText: 'Cancel' }
    )
  } catch (error) {
    return
  }
  await runBulkOrderUpdate({ status: bulkStatus.value }, `Order status updated to ${bulkStatus.value}`)
}

const runBulkOrderUpdate = async (patch, successMessage) => {
  bulkLoading.value = true
  let successCount = 0
  try {
    for (const order of selectedOrders.value) {
      const result = await updateAdminOrderOperations(order, patch, dataSource.value)
      if (!result.item) throw new Error('Could not update the Order skeleton record.')
      updateOrderRow(order.id, result.item)
      dataSource.value = result.source
      successCount += 1
    }
    if (dataSource.value !== ORDER_SOURCE_API) {
      fallbackNotice.value = 'Bulk update used fallback mock storage because the local backend API was unavailable.'
    }
    ElMessage.success(`${successMessage}: ${successCount} record(s). No external action was triggered.`)
  } catch (error) {
    ElMessage.error(`${successCount} updated before stop: ${error.message || 'Bulk update failed.'}`)
  } finally {
    bulkLoading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  ownerFilter.value = ''
  nextActionFilter.value = ''
  riskFilter.value = ''
  loadOrders()
}

const normalizeThemeId = (value = '') => {
  const normalized = String(value).toLowerCase()
  if (normalized.includes('castle')) return 'castle'
  if (normalized.includes('forest')) return 'forest'
  return 'space'
}

const normalizeTierId = (value = '') => {
  const normalized = String(value).toLowerCase()
  if (normalized.includes('premium') || normalized.includes('尊享')) return 'premium'
  if (normalized.includes('basic') || normalized.includes('基础')) return 'basic'
  return 'standard'
}

const orderVisual = (order) => getVisualContext(
  normalizeThemeId(order.event?.theme || order.theme),
  normalizeTierId(order.event?.package_tier || order.package_tier)
)

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

const statusTagType = (status) => {
  const typeMap = {
    draft: 'info',
    pending_deposit: 'warning',
    confirmed: 'success',
    in_progress: '',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

onMounted(loadOrders)
</script>

<style scoped>
.admin-orders-page {
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
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.scope-alert,
.stats-grid,
.toolbar,
.bulk-panel,
.table-shell {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

.scope-alert {
  margin-bottom: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card,
.table-shell,
.toolbar {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.bulk-panel {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.bulk-summary {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 210px;
}

.bulk-summary strong {
  color: #212529;
}

.bulk-summary span {
  color: #868e96;
  font-size: 12px;
}

.bulk-input {
  width: 180px;
}

.wide-bulk-input {
  width: 240px;
}

.bulk-status {
  width: 170px;
}

.stat-card {
  padding: 18px;
}

.stat-card span,
.stat-card small {
  display: block;
  color: #868e96;
}

.stat-card strong {
  display: block;
  margin: 8px 0 4px;
  font-size: 24px;
  color: #212529;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
  padding: 14px;
}

.search-input {
  max-width: 520px;
}

.status-filter {
  width: 190px;
}

.owner-filter {
  width: 180px;
}

.next-action-filter {
  width: 210px;
}

.wide-filter {
  width: 220px;
}

.table-shell {
  padding: 16px;
}

.order-cell,
.amount-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.order-cell strong,
.amount-cell strong {
  color: #212529;
}

.order-cell span,
.amount-cell span,
.next-action {
  color: #868e96;
  font-size: 13px;
}

.alert-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.alert-cell span {
  color: #868e96;
  font-size: 12px;
}

.visual-cell {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 10px;
  align-items: center;
}

.visual-cell img {
  width: 72px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  object-position: top center;
}

.visual-cell strong,
.visual-cell span {
  display: block;
}

.visual-cell span {
  margin-top: 3px;
  color: #868e96;
  font-size: 12px;
  line-height: 1.35;
}

@media (max-width: 900px) {
  .page-header,
  .toolbar,
  .bulk-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-input,
  .status-filter,
  .owner-filter,
  .next-action-filter,
  .wide-filter {
    width: 100%;
    max-width: none;
  }

  .bulk-input,
  .wide-bulk-input,
  .bulk-status {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .admin-orders-page {
    padding: 80px 14px 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
