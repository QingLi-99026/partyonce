<template>
  <div class="partner-status-page">
    <div class="page-header">
      <h1>入驻申请状态</h1>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="!partnerInfo" class="no-data">
      <el-empty description="您还没有提交入驻申请">
        <el-button type="primary" @click="$router.push('/partner/apply')">立即申请</el-button>
      </el-empty>
    </div>

    <el-card v-else class="status-card">
      <div class="status-header">
        <div class="company-info">
          <h2>{{ partnerInfo.company_name }}</h2>
          <p>{{ getCategoryName(partnerInfo.category) }}</p>
        </div>
        <el-tag :type="getStatusType(partnerInfo.status)" size="large">
          {{ getStatusName(partnerInfo.status) }}
        </el-tag>
      </div>

      <el-divider />

      <!-- 审核中 -->
      <div v-if="partnerInfo.status === 'pending'" class="status-detail">
        <el-result icon="info" title="审核中" sub-title="您的申请正在审核中，请耐心等待">
          <template #extra>
            <p>通常需要 1-3 个工作日</p>
          </template>
        </el-result>
      </div>

      <!-- 已通过 -->
      <div v-if="partnerInfo.status === 'approved'" class="status-detail">
        <el-result icon="success" title="审核通过" sub-title="恭喜！您已成为PartyOnce合作伙伴">
          <template #extra>
            <el-button type="primary" @click="$router.push('/partner/dashboard')">进入供应商中心</el-button>
          </template>
        </el-result>
      </div>

      <!-- 已拒绝 -->
      <div v-if="partnerInfo.status === 'rejected'" class="status-detail">
        <el-result icon="error" title="审核未通过" :sub-title="rejectionReason || '您的申请未通过审核'">
          <template #extra>
            <el-button type="primary" @click="$router.push('/partner/apply')">重新申请</el-button>
          </template>
        </el-result>
      </div>

      <div class="info-section">
        <h4>申请信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="联系人">{{ partnerInfo.contact_name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ partnerInfo.contact_phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ partnerInfo.email }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDate(partnerInfo.created_at) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const loading = ref(true)
const partnerInfo = ref(null)
const rejectionReason = ref('')

const getCategoryName = (category) => {
  const names = {
    venue: '场地',
    photo: '摄影摄像',
    decor: '现场装饰',
    catering: '餐饮服务',
    entertainment: '娱乐表演',
    equipment: '设备租赁',
    other: '其他'
  }
  return names[category] || category
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    suspended: 'info'
  }
  return types[status] || ''
}

const getStatusName = (status) => {
  const names = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    suspended: '已暂停'
  }
  return names[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchStatus = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/partners/me', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      partnerInfo.value = await response.json()
    } else if (response.status === 404) {
      partnerInfo.value = null
    } else {
      ElMessage.error('获取状态失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatus()
})
</script>

<style scoped>
.partner-status-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.status-card {
  padding: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-info h2 {
  margin: 0 0 8px;
}

.company-info p {
  color: #909399;
  margin: 0;
}

.status-detail {
  padding: 40px 0;
}

.info-section {
  margin-top: 30px;
}

.info-section h4 {
  margin-bottom: 16px;
}

.loading, .no-data {
  padding: 60px 0;
}
</style>
