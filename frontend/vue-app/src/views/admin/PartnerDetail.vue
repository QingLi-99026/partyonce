<template>
  <div class="partner-detail-page">
    <NavHeader />
    
    <div class="detail-container">
      <div class="detail-sidebar">
        <div class="sidebar-header">
          <h3>管理后台</h3>
        </div>
        <el-menu
          :default-active="'/admin/partners'"
          class="admin-menu"
          router
        >
          <el-menu-item index="/admin/partners">
            <el-icon><OfficeBuilding /></el-icon>
            <span>供应商管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/templates">
            <el-icon><Collection /></el-icon>
            <span>模板管理</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="detail-content">
        <el-page-header @back="goBack" title="供应商详情" />
        
        <el-skeleton :rows="10" animated v-if="loading" />
        
        <template v-else>
          <!-- 基本信息 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>入驻信息</span>
                <el-tag :type="statusType">{{ statusLabel }}</el-tag>
              </div>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="公司名称">{{ partner.company_name }}</el-descriptions-item>
              <el-descriptions-item label="服务类别">{{ categoryLabel(partner.category) }}</el-descriptions-item>
              <el-descriptions-item label="联系人">{{ partner.contact_name }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ partner.contact_phone }}</el-descriptions-item>
              <el-descriptions-item label="电子邮箱">{{ partner.email }}</el-descriptions-item>
              <el-descriptions-item label="ABN">{{ partner.abn_optional || '-' }}</el-descriptions-item>
              <el-descriptions-item label="服务区域" :span="2">
                <el-tag v-for="area in partner.service_area" :key="area" style="margin-right: 8px">
                  {{ area }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="申请时间">{{ formatDate(partner.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDate(partner.updated_at) }}</el-descriptions-item>
            </el-descriptions>
            
            <div v-if="partner.status === 'rejected'" class="reject-info">
              <el-alert
                :title="`拒绝原因：${partner.reject_reason}`"
                type="error"
                :closable="false"
                show-icon
              />
            </div>
          </el-card>
          
          <!-- 合同状态 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>合同状态</span>
              </div>
            </template>
            
            <el-empty v-if="contracts.length === 0" description="暂无合同" />
            
            <el-timeline v-else>
              <el-timeline-item
                v-for="contract in contracts"
                :key="contract.id"
                :type="contract.status === 'signed' ? 'success' : 'warning'"
                :timestamp="formatDate(contract.signed_at || contract.created_at)"
              >
                <div class="timeline-content">
                  <h4>{{ contract.title }} (v{{ contract.version }})</h4>
                  <el-tag :type="contract.status === 'signed' ? 'success' : 'warning'">
                    {{ contract.status === 'signed' ? '已签署' : '待签署' }}
                  </el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
          
          <!-- 素材列表 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>素材库</span>
                <el-tag>{{ mediaList.length }} 个素材</el-tag>
              </div>
            </template>
            
            <el-empty v-if="mediaList.length === 0" description="暂无素材" />
            
            <div v-else class="media-preview-list">
              <div
                v-for="media in mediaList.slice(0, 8)"
                :key="media.id"
                class="media-preview-item"
                @click="previewMedia(media)"
              >
                <img v-if="media.type === 'image'" :src="media.url" />
                <div v-else class="video-preview">
                  <img :src="media.thumbnail || media.url" />
                  <div class="video-icon"><el-icon><VideoPlay /></el-icon></div>
                </div>
              </div>
            </div>
          </el-card>
          
          <!-- 操作按钮 -->
          <div class="action-buttons" v-if="partner.status === 'pending'">
            <el-button type="success" size="large" @click="approve">
              <el-icon><CircleCheck /></el-icon>
              通过申请
            </el-button>
            <el-button type="danger" size="large" @click="reject">
              <el-icon><CircleClose /></el-icon>
              拒绝申请
            </el-button>
          </div>
        </template>
      </div>
    </div>
    
    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝申请"
      width="500px"
    >
      <el-form :model="rejectForm">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="confirmReject">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="素材预览"
      width="800px"
      center
    >
      <div class="preview-content">
        <img
          v-if="previewItem?.type === 'image'"
          :src="previewItem?.url"
          style="max-width: 100%; max-height: 600px"
        />
        <video
          v-else
          :src="previewItem?.url"
          controls
          style="max-width: 100%; max-height: 600px"
        ></video>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const route = useRoute()
const router = useRouter()
const partnerId = route.params.id

const loading = ref(true)
const partner = ref({
  company_name: '',
  category: '',
  contact_name: '',
  contact_phone: '',
  email: '',
  abn_optional: '',
  service_area: [],
  status: '',
  created_at: '',
  updated_at: '',
  reject_reason: ''
})
const contracts = ref([])
const mediaList = ref([])

const rejectDialogVisible = ref(false)
const submitting = ref(false)
const rejectForm = reactive({
  reason: ''
})

const previewDialogVisible = ref(false)
const previewItem = ref(null)

const statusType = computed(() => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[partner.value.status] || 'info'
})

const statusLabel = computed(() => {
  const labels = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return labels[partner.value.status] || partner.value.status
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

const goBack = () => {
  router.push('/admin/partners')
}

const approve = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要通过 ${partner.value.company_name} 的供应商申请吗？`,
      '确认通过',
      { type: 'warning' }
    )
    await adminAPI.approvePartner(partnerId)
    ElMessage.success('已通过申请')
    fetchPartnerDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const reject = () => {
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  submitting.value = true
  try {
    await adminAPI.rejectPartner(partnerId, { reason: rejectForm.reason })
    ElMessage.success('已拒绝申请')
    rejectDialogVisible.value = false
    fetchPartnerDetail()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const previewMedia = (item) => {
  previewItem.value = item
  previewDialogVisible.value = true
}

const fetchPartnerDetail = async () => {
  loading.value = true
  try {
    const res = await adminAPI.getPartnerDetail(partnerId)
    partner.value = res.partner || partner.value
    contracts.value = res.contracts || []
    mediaList.value = res.media || []
  } catch (error) {
    ElMessage.error('获取供应商详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPartnerDetail()
})
</script>

<style scoped>
.partner-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.detail-container {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.detail-sidebar {
  width: 240px;
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

.admin-menu {
  border-right: none;
}

.detail-content {
  flex: 1;
  padding: 24px;
  max-width: 1000px;
}

.info-card {
  margin-top: 24px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reject-info {
  margin-top: 20px;
}

.section-card {
  margin-top: 20px;
  border-radius: 12px;
}

.timeline-content h4 {
  margin: 0 0 8px;
  font-size: 16px;
}

.media-preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.media-preview-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.media-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
}

.action-buttons {
  margin-top: 32px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
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
