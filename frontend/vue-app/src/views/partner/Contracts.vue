<template>
  <div class="partner-contracts">
    <NavHeader />
    
    <div class="contracts-container">
      <div class="contracts-sidebar">
        <div class="sidebar-header">
          <h3>合作伙伴中心</h3>
        </div>
        <el-menu
          :default-active="$route.path"
          class="dashboard-menu"
          router
        >
          <el-menu-item index="/partner/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/partner/contracts">
            <el-icon><Document /></el-icon>
            <span>合同中心</span>
          </el-menu-item>
          <el-menu-item index="/partner/media">
            <el-icon><Picture /></el-icon>
            <span>素材库</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="contracts-content">
        <div class="content-header">
          <h1>合同中心</h1>
          <p>查看并签署合作协议</p>
        </div>
        
        <el-empty v-if="contracts.length === 0" description="暂无合同" />
        
        <div v-else class="contracts-list">
          <el-card
            v-for="contract in contracts"
            :key="contract.id"
            class="contract-card"
            shadow="hover"
          >
            <div class="contract-header">
              <div class="contract-title">
                <h3>{{ contract.title }}</h3>
                <p class="contract-version">版本 {{ contract.version }}</p>
              </div>
              <el-tag :type="statusType(contract.status)">
                {{ statusLabel(contract.status) }}
              </el-tag>
            </div>
            
            <div class="contract-info">
              <p><strong>发布日期：</strong>{{ formatDate(contract.created_at) }}</p>
              <p v-if="contract.signed_at"><strong>签署日期：</strong>{{ formatDate(contract.signed_at) }}</p>
              <p class="contract-summary">{{ contract.summary }}</p>
            </div>
            
            <div class="contract-actions">
              <el-button @click="viewContract(contract.id)">
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button
                v-if="contract.status === 'pending'"
                type="primary"
                @click="signContract(contract.id)"
              >
                <el-icon><Edit /></el-icon>
                确认签署
              </el-button>
              <el-button
                v-else-if="contract.status === 'signed'"
                type="success"
                plain
                disabled
              >
                <el-icon><CircleCheck /></el-icon>
                已签署
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { partnerAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const router = useRouter()
const contracts = ref([])

const statusType = (status) => {
  const types = {
    pending: 'warning',
    signed: 'success',
    expired: 'info'
  }
  return types[status] || 'info'
}

const statusLabel = (status) => {
  const labels = {
    pending: '待签署',
    signed: '已签署',
    expired: '已过期'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const viewContract = (id) => {
  router.push(`/partner/contracts/${id}`)
}

const signContract = (id) => {
  router.push(`/partner/contracts/${id}`)
}

const fetchContracts = async () => {
  try {
    const res = await partnerAPI.getContracts()
    contracts.value = res || []
  } catch (error) {
    console.error('获取合同列表失败:', error)
  }
}

onMounted(() => {
  fetchContracts()
})
</script>

<style scoped>
.partner-contracts {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.contracts-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.contracts-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  padding: 24px 0;
}

.sidebar-header {
  padding: 0 24px 24px;
  border-bottom: 1px solid #ebeef5;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
}

.dashboard-menu {
  border-right: none;
}

.contracts-content {
  flex: 1;
  padding: 32px;
}

.content-header {
  margin-bottom: 32px;
}

.content-header h1 {
  margin-bottom: 8px;
  font-size: 24px;
}

.content-header p {
  color: #909399;
}

.contracts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contract-card {
  border-radius: 12px;
}

.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.contract-title h3 {
  margin: 0 0 4px;
  font-size: 18px;
}

.contract-version {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.contract-info {
  margin-bottom: 16px;
}

.contract-info p {
  margin: 0 0 8px;
  color: #606266;
}

.contract-summary {
  color: #909399 !important;
  font-size: 14px;
  line-height: 1.6;
  margin-top: 12px !important;
}

.contract-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .contracts-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .contracts-content {
    padding: 16px;
  }
  
  .contract-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .contract-actions {
    flex-direction: column;
  }
}
</style>
