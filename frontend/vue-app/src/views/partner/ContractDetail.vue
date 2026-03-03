<template>
  <div class="contract-detail-page">
    <NavHeader />
    
    <div class="detail-container">
      <div class="detail-sidebar">
        <div class="sidebar-header">
          <h3>合作伙伴中心</h3>
        </div>
        <el-menu
          :default-active="'/partner/contracts'"
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
      
      <div class="detail-content">
        <el-page-header @back="goBack" :title="contract.title || '合同详情'" />
        
        <el-skeleton :rows="10" animated v-if="loading" />
        
        <template v-else>
          <div class="contract-meta">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="合同编号">{{ contract.id }}</el-descriptions-item>
              <el-descriptions-item label="版本">{{ contract.version }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="statusType">{{ statusLabel }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="发布日期">{{ formatDate(contract.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="更新日期">{{ formatDate(contract.updated_at) }}</el-descriptions-item>
              <el-descriptions-item v-if="contract.signed_at" label="签署日期">
                {{ formatDate(contract.signed_at) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          
          <el-card class="contract-content-card">
            <div class="contract-content" v-html="contract.content"></div>
          </el-card>
          
          <div class="sign-section" v-if="contract.status === 'pending'">
            <el-card>
              <div class="sign-form">
                <el-checkbox v-model="hasRead">
                  我已仔细阅读并理解上述合同内容
                </el-checkbox>
                
                <el-checkbox v-model="agreed" style="margin-top: 12px">
                  我同意遵守合同中的所有条款和条件
                </el-checkbox>
                
                <div class="sign-actions">
                  <el-button
                    type="primary"
                    size="large"
                    :loading="signing"
                    :disabled="!canSign"
                    @click="confirmSign"
                  >
                    <el-icon><EditPen /></el-icon>
                    确认签署合同
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
          
          <div class="signed-section" v-else-if="contract.status === 'signed'">
            <el-alert
              title="合同已签署"
              type="success"
              description="您已成功签署此合同，合同已生效。"
              show-icon
              :closable="false"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { partnerAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const route = useRoute()
const router = useRouter()
const contractId = route.params.id

const loading = ref(true)
const signing = ref(false)
const hasRead = ref(false)
const agreed = ref(false)

const contract = ref({
  id: '',
  title: '',
  version: '',
  content: '',
  status: '',
  created_at: '',
  updated_at: '',
  signed_at: null
})

const statusType = computed(() => {
  const types = {
    pending: 'warning',
    signed: 'success',
    expired: 'info'
  }
  return types[contract.value.status] || 'info'
})

const statusLabel = computed(() => {
  const labels = {
    pending: '待签署',
    signed: '已签署',
    expired: '已过期'
  }
  return labels[contract.value.status] || contract.value.status
})

const canSign = computed(() => hasRead.value && agreed.value)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const goBack = () => {
  router.push('/partner/contracts')
}

const confirmSign = async () => {
  if (!canSign.value) {
    ElMessage.warning('请先阅读并同意合同条款')
    return
  }

  try {
    await ElMessageBox.confirm(
      '签署后合同将立即生效，您确定要签署此合同吗？',
      '确认签署',
      {
        confirmButtonText: '确认签署',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    signing.value = true
    await partnerAPI.signContract(contractId)
    ElMessage.success('合同签署成功！')
    contract.value.status = 'signed'
    contract.value.signed_at = new Date().toISOString()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.detail || '签署失败')
    }
  } finally {
    signing.value = false
  }
}

const fetchContract = async () => {
  loading.value = true
  try {
    const res = await partnerAPI.getContract(contractId)
    contract.value = res
  } catch (error) {
    ElMessage.error('获取合同详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchContract()
})
</script>

<style scoped>
.contract-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.detail-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.detail-sidebar {
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

.detail-content {
  flex: 1;
  padding: 32px;
  max-width: 900px;
}

.contract-meta {
  margin: 24px 0;
}

.contract-content-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.contract-content {
  line-height: 1.8;
  color: #303133;
}

.contract-content :deep(h1) {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.contract-content :deep(h2) {
  font-size: 18px;
  margin: 24px 0 12px;
  color: #303133;
}

.contract-content :deep(p) {
  margin-bottom: 12px;
  text-align: justify;
}

.contract-content :deep(ul, ol) {
  margin-left: 20px;
  margin-bottom: 16px;
}

.sign-section {
  margin-top: 24px;
}

.sign-form {
  padding: 16px;
}

.sign-actions {
  margin-top: 24px;
  text-align: center;
}

.signed-section {
  margin-top: 24px;
}

@media (max-width: 1024px) {
  .detail-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .detail-content {
    padding: 16px;
  }
}
</style>
