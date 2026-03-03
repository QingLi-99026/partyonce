<template>
  <div class="partner-status-page">
    <NavHeader />
    <div class="status-container">
      <div class="status-header">
        <h1>申请状态查询</h1>
        <p>输入您的邮箱查询供应商申请状态</p>
      </div>

      <el-card class="status-card" v-if="!checked">
        <el-form :model="queryForm" @submit.prevent="checkStatus">
          <el-form-item>
            <el-input
              v-model="queryForm.email"
              placeholder="请输入申请时填写的邮箱"
              prefix-icon="Message"
              size="large"
            >
              <template #append>
                <el-button type="primary" :loading="loading" @click="checkStatus">
                  查询
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="status-result-card" v-else>
        <div class="status-result">
          <div class="status-icon" :class="statusClass">
            <el-icon :size="64">
              <CircleCheck v-if="application.status === 'approved'" />
              <Timer v-else-if="application.status === 'pending'" />
              <CircleClose v-else />
            </el-icon>
          </div>
          
          <h2 class="status-title">{{ statusTitle }}</h2>
          <p class="status-desc">{{ statusDesc }}</p>

          <div v-if="application.status === 'rejected'" class="reject-reason">
            <el-alert
              :title="'拒绝原因：' + application.reject_reason"
              type="error"
              :closable="false"
              show-icon
            />
          </div>

          <div class="application-info" v-if="application">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="公司名称">
                {{ application.company_name }}
              </el-descriptions-item>
              <el-descriptions-item label="服务类别">
                {{ categoryLabel(application.category) }}
              </el-descriptions-item>
              <el-descriptions-item label="申请时间">
                {{ formatDate(application.created_at) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="status-actions">
            <template v-if="application.status === 'approved'">
              <el-button type="primary" size="large" @click="goToDashboard">
                进入合作伙伴门户
              </el-button>
            </template>
            <template v-else-if="application.status === 'rejected'">
              <el-button type="primary" size="large" @click="reapply">
                重新申请
              </el-button>
            </template>
            <template v-else>
              <el-button @click="checked = false">查询其他申请</el-button>
            </template>
          </div>
        </div>
      </el-card>

      <div class="status-footer">
        <el-link type="primary" @click="goToApply">
          <el-icon><ArrowLeft /></el-icon>
          返回申请页面
        </el-link>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { partnerAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const loading = ref(false)
const checked = ref(false)
const application = ref(null)

const queryForm = reactive({
  email: ''
})

const statusClass = computed(() => {
  if (!application.value) return ''
  return {
    'approved': 'status-approved',
    'pending': 'status-pending',
    'rejected': 'status-rejected'
  }[application.value.status] || ''
})

const statusTitle = computed(() => {
  if (!application.value) return ''
  return {
    'approved': '申请已通过',
    'pending': '审核中',
    'rejected': '申请被拒绝'
  }[application.value.status] || ''
})

const statusDesc = computed(() => {
  if (!application.value) return ''
  return {
    'approved': '恭喜！您的供应商申请已通过审核，现在可以进入合作伙伴门户管理您的业务。',
    'pending': '您的申请正在审核中，通常需要1-3个工作日，请耐心等待。',
    'rejected': '很抱歉，您的申请未通过审核。您可以根据拒绝原因修改后重新申请。'
  }[application.value.status] || ''
})

const categoryLabel = (category) => {
  const labels = {
    venue: '场地租赁',
    catering: '餐饮服务',
    decoration: '装饰布置',
    photography: '摄影摄像',
    entertainment: '娱乐表演',
    other: '其他服务'
  }
  return labels[category] || category
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const checkStatus = async () => {
  if (!queryForm.email) {
    ElMessage.warning('请输入邮箱地址')
    return
  }

  loading.value = true
  try {
    const res = await partnerAPI.checkStatus(queryForm.email)
    application.value = res
    checked.value = true
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '查询失败')
  } finally {
    loading.value = false
  }
}

const goToDashboard = () => {
  router.push('/partner/dashboard')
}

const goToApply = () => {
  router.push('/partner/apply')
}

const reapply = () => {
  router.push('/partner/apply')
}
</script>

<style scoped>
.partner-status-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.status-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 20px;
}

.status-header {
  text-align: center;
  margin-bottom: 40px;
}

.status-header h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 12px;
}

.status-header p {
  color: #909399;
}

.status-card,
.status-result-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.status-result {
  text-align: center;
  padding: 20px;
}

.status-icon {
  margin-bottom: 24px;
}

.status-approved {
  color: #67c23a;
}

.status-pending {
  color: #e6a23c;
}

.status-rejected {
  color: #f56c6c;
}

.status-title {
  font-size: 24px;
  margin-bottom: 12px;
  color: #303133;
}

.status-desc {
  color: #606266;
  margin-bottom: 24px;
}

.reject-reason {
  margin-bottom: 24px;
  text-align: left;
}

.application-info {
  margin: 24px 0;
  text-align: left;
}

.status-actions {
  margin-top: 32px;
}

.status-footer {
  text-align: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .status-container {
    padding: 30px 16px;
  }
}
</style>
