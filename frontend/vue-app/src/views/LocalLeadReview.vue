<template>
  <div class="lead-review-page app-page app-page--wide">
    <header class="app-page-header lead-header">
      <div>
        <p class="app-eyebrow">Local lead review</p>
        <h1 class="app-page-title">留资与跟进中心</h1>
        <p class="app-page-subtitle">
          运营人员查看报价页生成的咨询记录，完成状态筛选、负责人分配、优先级和下一步动作记录。
          默认使用浏览器 localStorage；Backend Skeleton 模式只调用本地 /api/leads 骨架接口。
        </p>
      </div>
      <div class="header-actions">
        <el-button :loading="isLoading" @click="refreshLeads">刷新</el-button>
        <el-button type="primary" @click="router.push('/local-demo')">返回 Local Demo Hub</el-button>
      </div>
    </header>

    <el-alert
      class="app-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="modeNotice"
    />

    <section class="lead-stats app-section">
      <article v-for="item in stats" :key="item.label" class="stat-card app-data-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <section class="lead-toolbar app-toolbar">
      <el-radio-group v-model="leadMode" class="mode-toggle" @change="refreshLeads">
        <el-radio-button label="local">LocalStorage</el-radio-button>
        <el-radio-button label="backend">Backend Skeleton</el-radio-button>
      </el-radio-group>
      <el-input
        v-model="searchQuery"
        class="search-input"
        clearable
        placeholder="搜索客户、联系方式、主题、负责人或下一步动作"
      />
      <el-select v-model="statusFilter" class="status-filter" placeholder="状态">
        <el-option label="全部状态" value="" />
        <el-option v-for="status in leadStatuses" :key="status.value" :label="status.label" :value="status.value" />
      </el-select>
      <el-select v-model="priorityFilter" class="status-filter" placeholder="优先级">
        <el-option label="全部优先级" value="" />
        <el-option label="High" value="High" />
        <el-option label="Medium" value="Medium" />
        <el-option label="Low" value="Low" />
      </el-select>
      <el-select v-model="exceptionFilter" class="status-filter wide-filter" placeholder="异常">
        <el-option label="全部 Lead" value="" />
        <el-option label="缺少联系方式" value="missing_contact" />
        <el-option label="没有下一步动作" value="missing_next_action" />
        <el-option label="高优先级" value="high_priority" />
        <el-option label="需关闭原因" value="needs_close_reason" />
      </el-select>
      <el-button @click="router.push('/quote?theme=forest&scene=clearing&package=standard')">
        打开本地报价页
      </el-button>
      <el-button
        v-if="isBackendMode"
        type="success"
        plain
        :loading="isSyncing"
        @click="syncLocalToBackend"
      >
        同步本地 Lead 到 Backend Skeleton
      </el-button>
    </section>

    <el-alert
      v-if="backendMessage"
      class="app-alert"
      :type="backendMessageType"
      :closable="true"
      show-icon
      :title="backendMessage"
      @close="backendMessage = ''"
    />

    <section class="app-data-card table-shell">
      <el-empty
        v-if="leads.length === 0"
        description="暂无本地咨询记录。可先从 Local Demo Hub 生成样例，或从报价页保存咨询。"
      >
        <el-button type="primary" @click="router.push('/local-demo')">去生成本地样例</el-button>
      </el-empty>

      <el-table
        v-else
        :data="filteredLeads"
        empty-text="当前筛选条件下暂无 Lead"
        row-key="_localIndex"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expanded-lead">
              <div class="expanded-grid">
                <div>
                  <h3>客户备注</h3>
                  <p>{{ row.customerInfo?.notes || '暂无客户备注' }}</p>
                </div>
                <div>
                  <h3>方案明细</h3>
                  <p>{{ row.selection?.themeName || '-' }} / {{ row.selection?.sceneName || '-' }} / {{ row.selection?.packageName || '-' }}</p>
                  <p v-if="row.selection?.addons?.length">附加项：{{ row.selection.addons.map((item) => item.name).join('、') }}</p>
                </div>
              </div>
              <label class="note-field">
                <span>跟进备注</span>
                <el-input
                  :model-value="getFollowUp(row).note"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  placeholder="记录沟通结果、预算确认、风险或客户偏好"
                  @update:model-value="updateFollowUp(row, { note: $event })"
                />
              </label>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="客户" min-width="190">
          <template #default="{ row }">
            <div class="customer-cell">
              <strong>{{ row.customerInfo?.name || '-' }}</strong>
              <span>{{ row.customerInfo?.contact || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="主题 / 套餐" min-width="210">
          <template #default="{ row }">
            <div class="plan-cell">
              <strong>{{ row.selection?.themeName || '-' }}</strong>
              <span>{{ row.selection?.packageName || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.pricing?.finalTotal) }}</template>
        </el-table-column>

        <el-table-column label="提交时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.submitTime) }}</template>
        </el-table-column>

        <el-table-column label="状态" width="145">
          <template #default="{ row }">
            <el-select
              :model-value="row.status || 'pending'"
              size="small"
              @change="updateLead(row, { status: $event })"
            >
              <el-option v-for="status in leadStatuses" :key="status.value" :label="status.label" :value="status.value" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="异常提示" min-width="210">
          <template #default="{ row }">
            <div class="exception-cell">
              <el-tag
                v-for="item in leadExceptions(row)"
                :key="item.code"
                :type="item.type"
                effect="plain"
              >
                {{ item.label }}
              </el-tag>
              <span v-if="leadExceptions(row).length === 0">无明显异常</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="优先级" width="145">
          <template #default="{ row }">
            <el-select
              :model-value="getFollowUp(row).priority"
              size="small"
              @change="updateFollowUp(row, { priority: $event })"
            >
              <el-option label="High" value="High" />
              <el-option label="Medium" value="Medium" />
              <el-option label="Low" value="Low" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="负责人" min-width="150">
          <template #default="{ row }">
            <el-input
              :model-value="getFollowUp(row).owner"
              size="small"
              :placeholder="isBackendMode ? 'Owner user ID' : 'Owner'"
              @change="updateFollowUp(row, { owner: $event })"
            />
          </template>
        </el-table-column>

        <el-table-column label="下一步动作" min-width="220">
          <template #default="{ row }">
            <el-input
              :model-value="getFollowUp(row).nextAction"
              size="small"
              placeholder="例如：电话确认预算"
              @change="updateFollowUp(row, { nextAction: $event })"
            />
          </template>
        </el-table-column>

        <el-table-column label="保存状态" width="130">
          <template #default="{ row }">
            <div class="save-cell">
              <el-tag :type="isBackendMode ? 'warning' : 'success'" effect="plain">
                {{ isBackendMode ? 'backend skeleton' : 'localStorage' }}
              </el-tag>
              <small>{{ formatShortTime(getFollowUp(row).updatedAt) }}</small>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const storageKey = 'inquirySubmissions'

const leads = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const exceptionFilter = ref('')
const leadMode = ref('local')
const isLoading = ref(false)
const isSyncing = ref(false)
const backendMessage = ref('')
const backendMessageType = ref('info')

const defaultFollowUp = {
  priority: 'Medium',
  owner: '',
  nextAction: '',
  note: '',
  updatedAt: ''
}

const leadStatuses = [
  { label: '新线索', value: 'new' },
  { label: '待处理', value: 'pending' },
  { label: '已联系', value: 'contacted' },
  { label: '已确认需求', value: 'qualified' },
  { label: '无效线索', value: 'unqualified' },
  { label: '已转报价', value: 'converted_to_quote' },
  { label: '已关闭', value: 'closed' }
]

const isBackendMode = computed(() => leadMode.value === 'backend')

const modeNotice = computed(() => {
  if (isBackendMode.value) {
    return 'Backend Skeleton：本页只调用本地 /api/leads 骨架接口；不创建报价、不创建订单、不触发付款或外部自动化。'
  }
  return 'Local-only operations：本页只写浏览器 localStorage；不创建订单、不触发付款、不发送消息、不调用外部自动化。'
})

const setBackendMessage = (message, type = 'info') => {
  backendMessage.value = message
  backendMessageType.value = type
}

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' }
  if (userStore.token) {
    headers.Authorization = `Bearer ${userStore.token}`
  }
  return headers
}

const requestLeadApi = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = payload?.detail || `Backend skeleton request failed (${response.status})`
    throw new Error(Array.isArray(detail) ? detail.map((item) => item.msg).join('；') : detail)
  }
  return payload
}

const readStoredLeads = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    ElMessage.warning('本地 Lead 数据格式异常，已按空列表处理')
    return []
  }
}

const normalizeLead = (lead, index) => ({
  ...lead,
  _localIndex: index,
  status: lead.status || 'pending',
  followUp: {
    ...defaultFollowUp,
    ...(lead.followUp || {})
  }
})

const normalizeBackendLead = (lead, index) => ({
  _backendId: lead.id,
  _localIndex: index,
  customerInfo: {
    name: lead.customer?.name || '',
    contact: lead.customer?.contact || '',
    preferredDate: lead.preferred_event_date || '',
    notes: lead.intake_notes || ''
  },
  selection: lead.selection_snapshot || {},
  pricing: lead.pricing_snapshot || {},
  submitTime: lead.submitted_at,
  status: lead.status || 'new',
  followUp: {
    ...defaultFollowUp,
    priority: lead.priority || 'Medium',
    owner: lead.owner_user_id ? String(lead.owner_user_id) : '',
    nextAction: lead.follow_up_summary?.next_action || '',
    note: lead.follow_up_summary?.latest_note || '',
    updatedAt: lead.follow_up_summary?.updated_at || lead.updated_at || ''
  }
})

const refreshLocalLeads = () => {
  leads.value = readStoredLeads().map(normalizeLead)
}

const refreshBackendLeads = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams()
    if (statusFilter.value) params.set('status', statusFilter.value)
    const query = searchQuery.value.trim()
    if (query) params.set('search', query)
    params.set('limit', '100')
    params.set('offset', '0')

    const payload = await requestLeadApi(`/api/leads?${params.toString()}`)
    leads.value = Array.isArray(payload.items) ? payload.items.map(normalizeBackendLead) : []
    setBackendMessage('Backend skeleton lead queue 已刷新。', 'success')
  } catch (error) {
    leads.value = []
    setBackendMessage(`${error.message}。请确认已登录 admin / manager，并且本地 backend 正在运行。`, 'warning')
  } finally {
    isLoading.value = false
  }
}

const refreshLeads = () => {
  if (isBackendMode.value) {
    refreshBackendLeads()
    return
  }
  refreshLocalLeads()
}

const persistLeads = (nextLeads) => {
  const clean = nextLeads.map(({ _localIndex, ...lead }) => lead)
  localStorage.setItem(storageKey, JSON.stringify(clean))
  leads.value = clean.map(normalizeLead)
}

const updateBackendLead = async (lead, patch) => {
  if (!lead._backendId) return
  const payload = { ...patch }
  if ('owner' in payload) {
    const owner = String(payload.owner || '').trim()
    delete payload.owner
    payload.owner_user_id = owner ? Number(owner) : null
    if (owner && Number.isNaN(payload.owner_user_id)) {
      ElMessage.warning('Backend Skeleton 的负责人需要填写数字 owner_user_id')
      return
    }
  }
  if ('nextAction' in payload) {
    payload.next_action = payload.nextAction
    delete payload.nextAction
  }

  try {
    const updated = await requestLeadApi(`/api/leads/${lead._backendId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
    const index = leads.value.findIndex((item) => item._backendId === lead._backendId)
    if (index >= 0) {
      leads.value[index] = normalizeBackendLead(updated, index)
    }
    setBackendMessage('Backend skeleton lead 已更新。', 'success')
  } catch (error) {
    setBackendMessage(`${error.message}。本次更新未保存到 backend skeleton。`, 'warning')
  }
}

const updateLead = (leadOrIndex, patch) => {
  if (isBackendMode.value) {
    updateBackendLead(leadOrIndex, patch)
    return
  }
  const localIndex = leadOrIndex?._localIndex ?? leadOrIndex
  const next = readStoredLeads()
  if (!next[localIndex]) return
  next[localIndex] = {
    ...next[localIndex],
    ...patch,
    followUp: {
      ...defaultFollowUp,
      ...(next[localIndex].followUp || {}),
      updatedAt: new Date().toISOString()
    }
  }
  persistLeads(next)
}

const updateFollowUp = (leadOrIndex, patch) => {
  if (isBackendMode.value) {
    updateBackendLead(leadOrIndex, patch)
    return
  }
  const localIndex = leadOrIndex?._localIndex ?? leadOrIndex
  const next = readStoredLeads()
  if (!next[localIndex]) return
  next[localIndex] = {
    ...next[localIndex],
    followUp: {
      ...defaultFollowUp,
      ...(next[localIndex].followUp || {}),
      ...patch,
      updatedAt: new Date().toISOString()
    }
  }
  persistLeads(next)
}

const getFollowUp = (lead) => ({
  ...defaultFollowUp,
  ...(lead.followUp || {})
})

const hasContact = (lead) => {
  const contact = String(lead.customerInfo?.contact || '').trim()
  return contact && contact !== '-'
}

const leadExceptions = (lead) => {
  const followUp = getFollowUp(lead)
  const exceptions = []
  if (!hasContact(lead)) {
    exceptions.push({ code: 'missing_contact', label: '缺少联系方式', type: 'danger' })
  }
  if (!String(followUp.nextAction || '').trim() && !['closed', 'converted_to_quote'].includes(lead.status)) {
    exceptions.push({ code: 'missing_next_action', label: '没有下一步动作', type: 'warning' })
  }
  if (followUp.priority === 'High') {
    exceptions.push({ code: 'high_priority', label: '高优先级', type: 'danger' })
  }
  if (['closed', 'unqualified'].includes(lead.status) && !String(followUp.note || '').trim()) {
    exceptions.push({ code: 'needs_close_reason', label: '需关闭原因', type: 'warning' })
  }
  return exceptions
}

const mapLocalLeadToBackendPayload = (lead) => ({
  customer: {
    name: lead.customerInfo?.name || 'Unknown customer',
    contact: lead.customerInfo?.contact || 'unknown'
  },
  preferred_event_date: lead.customerInfo?.preferredDate || '',
  intake_notes: lead.customerInfo?.notes || '',
  selection: lead.selection || {},
  pricing_snapshot: lead.pricing || {},
  source: 'local_demo'
})

const syncLocalToBackend = async () => {
  const localLeads = readStoredLeads()
  if (!localLeads.length) {
    setBackendMessage('没有可同步的 localStorage Lead。', 'info')
    return
  }

  isSyncing.value = true
  let successCount = 0
  try {
    for (const localLead of localLeads) {
      await requestLeadApi('/api/leads', {
        method: 'POST',
        body: JSON.stringify(mapLocalLeadToBackendPayload(localLead))
      })
      successCount += 1
    }
    setBackendMessage(`已同步 ${successCount} 条 localStorage Lead 到 backend skeleton。`, 'success')
    await refreshBackendLeads()
  } catch (error) {
    setBackendMessage(`已同步 ${successCount} 条后停止：${error.message}`, 'warning')
  } finally {
    isSyncing.value = false
  }
}

const filteredLeads = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return leads.value.filter((lead) => {
    const statusOk = !statusFilter.value || (lead.status || 'pending') === statusFilter.value
    const followUp = getFollowUp(lead)
    const priorityOk = !priorityFilter.value || followUp.priority === priorityFilter.value
    const exceptionOk = !exceptionFilter.value || leadExceptions(lead).some((item) => item.code === exceptionFilter.value)
    const queryOk = !query || [
      lead.customerInfo?.name,
      lead.customerInfo?.contact,
      lead.selection?.themeName,
      lead.selection?.packageName,
      followUp.owner,
      followUp.nextAction,
      followUp.note
    ].some((value) => String(value || '').toLowerCase().includes(query))
    return statusOk && priorityOk && exceptionOk && queryOk
  })
})

const stats = computed(() => {
  const total = leads.value.length
  const pending = leads.value.filter((lead) => (lead.status || 'pending') === 'pending').length
  const contacted = leads.value.filter((lead) => lead.status === 'contacted').length
  const high = leads.value.filter((lead) => getFollowUp(lead).priority === 'High').length
  const exceptions = leads.value.filter((lead) => leadExceptions(lead).length > 0).length

  return [
    { label: 'Total Leads', value: total, note: 'localStorage records' },
    { label: 'Pending', value: pending, note: '需要运营处理' },
    { label: 'High Priority', value: high, note: '优先跟进' },
    { label: 'Exceptions', value: exceptions, note: `${contacted} contacted / 需复核异常` }
  ]
})

const formatMoney = (value) => {
  const amount = Number(value || 0)
  return `$${amount.toLocaleString()}`
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

const formatShortTime = (value) => {
  if (!value) return 'not edited'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'not edited'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(refreshLeads)
</script>

<style scoped>
.lead-header {
  align-items: flex-start;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.lead-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px;
}

.stat-card span {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
}

.stat-card p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.search-input {
  width: min(420px, 100%);
}

.status-filter {
  width: 180px;
}

.wide-filter {
  width: 210px;
}

.mode-toggle {
  flex-shrink: 0;
}

.table-shell {
  padding: 16px;
}

.customer-cell,
.plan-cell,
.save-cell {
  display: grid;
  gap: 4px;
}

.exception-cell {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.exception-cell span {
  color: var(--text-secondary);
  font-size: 12px;
}

.customer-cell span,
.plan-cell span,
.save-cell small {
  color: var(--text-secondary);
  font-size: 12px;
}

.expanded-lead {
  padding: 16px 28px 22px;
  background: #fffdf9;
}

.expanded-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 18px;
}

.expanded-lead h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.expanded-lead p {
  margin: 0 0 6px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.note-field {
  display: grid;
  gap: 8px;
}

.note-field span {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .lead-header {
    flex-direction: column;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .lead-stats,
  .expanded-grid {
    grid-template-columns: 1fr;
  }
}
</style>
