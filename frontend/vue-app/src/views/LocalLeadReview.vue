<template>
  <div class="lead-review-page app-page app-page--wide">
    <header class="app-page-header lead-header">
      <div>
        <p class="app-eyebrow">Local lead review</p>
        <h1 class="app-page-title">留资与跟进中心</h1>
        <p class="app-page-subtitle">
          运营人员在本地查看报价页生成的咨询记录，完成状态筛选、负责人分配、优先级和下一步动作记录。
          所有修改只写回浏览器 localStorage，不调用后端或任何外部系统。
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="refreshLeads">刷新</el-button>
        <el-button type="primary" @click="router.push('/local-demo')">返回 Local Demo Hub</el-button>
      </div>
    </header>

    <el-alert
      class="app-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Local-only operations：本页不创建订单、不触发付款、不发送消息、不调用 webhook / n8n。"
    />

    <section class="lead-stats app-section">
      <article v-for="item in stats" :key="item.label" class="stat-card app-data-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <section class="lead-toolbar app-toolbar">
      <el-input
        v-model="searchQuery"
        class="search-input"
        clearable
        placeholder="搜索客户姓名或联系方式"
      />
      <el-select v-model="statusFilter" class="status-filter" placeholder="状态">
        <el-option label="全部状态" value="" />
        <el-option label="待处理" value="pending" />
        <el-option label="已联系" value="contacted" />
        <el-option label="已关闭" value="closed" />
      </el-select>
      <el-button @click="router.push('/quote?theme=forest&scene=clearing&package=standard')">
        打开本地报价页
      </el-button>
    </section>

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
                  @update:model-value="updateFollowUp(row._localIndex, { note: $event })"
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
              @change="updateLead(row._localIndex, { status: $event })"
            >
              <el-option label="待处理" value="pending" />
              <el-option label="已联系" value="contacted" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="优先级" width="145">
          <template #default="{ row }">
            <el-select
              :model-value="getFollowUp(row).priority"
              size="small"
              @change="updateFollowUp(row._localIndex, { priority: $event })"
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
              placeholder="Owner"
              @change="updateFollowUp(row._localIndex, { owner: $event })"
            />
          </template>
        </el-table-column>

        <el-table-column label="下一步动作" min-width="220">
          <template #default="{ row }">
            <el-input
              :model-value="getFollowUp(row).nextAction"
              size="small"
              placeholder="例如：电话确认预算"
              @change="updateFollowUp(row._localIndex, { nextAction: $event })"
            />
          </template>
        </el-table-column>

        <el-table-column label="保存状态" width="130">
          <template #default="{ row }">
            <div class="save-cell">
              <el-tag type="success" effect="plain">localStorage</el-tag>
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

const router = useRouter()
const storageKey = 'inquirySubmissions'

const leads = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

const defaultFollowUp = {
  priority: 'Medium',
  owner: '',
  nextAction: '',
  note: '',
  updatedAt: ''
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

const refreshLeads = () => {
  leads.value = readStoredLeads().map(normalizeLead)
}

const persistLeads = (nextLeads) => {
  const clean = nextLeads.map(({ _localIndex, ...lead }) => lead)
  localStorage.setItem(storageKey, JSON.stringify(clean))
  leads.value = clean.map(normalizeLead)
}

const updateLead = (localIndex, patch) => {
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

const updateFollowUp = (localIndex, patch) => {
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

const filteredLeads = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return leads.value.filter((lead) => {
    const statusOk = !statusFilter.value || (lead.status || 'pending') === statusFilter.value
    const queryOk = !query || [
      lead.customerInfo?.name,
      lead.customerInfo?.contact,
      lead.selection?.themeName,
      lead.selection?.packageName,
      getFollowUp(lead).owner,
      getFollowUp(lead).nextAction
    ].some((value) => String(value || '').toLowerCase().includes(query))
    return statusOk && queryOk
  })
})

const stats = computed(() => {
  const total = leads.value.length
  const pending = leads.value.filter((lead) => (lead.status || 'pending') === 'pending').length
  const contacted = leads.value.filter((lead) => lead.status === 'contacted').length
  const high = leads.value.filter((lead) => getFollowUp(lead).priority === 'High').length

  return [
    { label: 'Total Leads', value: total, note: 'localStorage records' },
    { label: 'Pending', value: pending, note: '需要运营处理' },
    { label: 'Contacted', value: contacted, note: '已有联系记录' },
    { label: 'High Priority', value: high, note: '优先跟进' }
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

.table-shell {
  padding: 16px;
}

.customer-cell,
.plan-cell,
.save-cell {
  display: grid;
  gap: 4px;
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
