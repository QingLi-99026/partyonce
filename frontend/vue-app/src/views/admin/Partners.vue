<template>
  <div class="admin-partners">
    <NavHeader />
    
    <div class="admin-container">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <h3>管理后台</h3>
        </div>
        <el-menu
          :default-active="$route.path"
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
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="admin-content">
        <div class="content-header">
          <h1>供应商审核</h1>
          <p>Local/staging light closed loop: 查看申请、更新状态、写审核备注，不触发外发通知。</p>
        </div>
        
        <!-- 筛选栏 -->
        <el-card class="filter-card">
          <el-form :inline="true" :model="filterForm">
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="服务类别">
              <el-select v-model="filterForm.category" placeholder="全部类别" clearable>
                <el-option label="场地租赁" value="venue" />
                <el-option label="餐饮服务" value="catering" />
                <el-option label="装饰布置" value="decoration" />
                <el-option label="摄影摄像" value="photography" />
                <el-option label="娱乐表演" value="entertainment" />
                <el-option label="其他服务" value="other" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="搜索">
              <el-input
                v-model="filterForm.keyword"
                placeholder="公司名称/联系人/邮箱"
                clearable
                style="width: 250px"
              >
                <template #append>
                  <el-button :icon="Search" @click="handleSearch" />
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 数据表格 -->
        <el-card class="table-card">
          <el-alert
            class="scope-alert"
            type="info"
            :closable="false"
            show-icon
            :title="`数据来源：${dataSource}`"
            description="本轮后台审核为 local/staging 轻量闭环，不做自动审核、自动派单、合同签署或外发通知。"
          />
          <el-table :data="partners" v-loading="loading" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            
            <el-table-column prop="company_name" label="公司名称" min-width="150" />
            
            <el-table-column prop="category" label="服务类别" width="100">
              <template #default="{ row }">
                <el-tag>{{ categoryLabel(row.category) }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="联系人" min-width="150">
              <template #default="{ row }">
                <div>{{ row.contact_name }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.contact_phone }}</div>
              </template>
            </el-table-column>
            
            <el-table-column prop="email" label="邮箱" min-width="180" />

            <el-table-column prop="review_note" label="审核备注" min-width="180">
              <template #default="{ row }">
                <span>{{ row.review_note || '-' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="service_area" label="服务区域" min-width="150">
              <template #default="{ row }">
                <el-tooltip :content="row.service_area.join(', ')" placement="top">
                  <span>{{ row.service_area.slice(0, 2).join(', ') }}
                    <template v-if="row.service_area.length > 2"> +{{ row.service_area.length - 2 }}</template>
                  </span>
                </el-tooltip>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="created_at" label="申请时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewDetail(row.id)">
                  查看
                </el-button>
                
                <template v-if="row.status === 'pending'">
                  <el-button type="success" link @click="openReview(row, 'approved')">
                    通过
                  </el-button>
                  <el-button type="danger" link @click="openReview(row, 'rejected')">
                    拒绝
                  </el-button>
                </template>
                <el-button type="warning" link @click="openReview(row, row.status)">
                  备注
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 审核对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="更新供应商申请"
      width="500px"
    >
      <p style="margin-bottom: 16px">
        您正在更新供应商 <strong>{{ currentPartner?.company_name }}</strong> 的申请
      </p>
      
      <el-form :model="rejectForm">
        <el-form-item label="审核状态" required>
          <el-select v-model="rejectForm.status" style="width: 100%">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="需补充资料" value="needs_info" />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商分类">
          <el-select v-model="rejectForm.category" style="width: 100%">
            <el-option label="场地租赁" value="venue" />
            <el-option label="餐饮服务" value="catering" />
            <el-option label="装饰布置" value="decoration" />
            <el-option label="摄影摄像" value="photography" />
            <el-option label="娱乐表演" value="entertainment" />
            <el-option label="其他服务" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="rejectForm.review_note"
            type="textarea"
            :rows="4"
            placeholder="请输入运营备注，将展示在 local/staging 状态页"
          />
        </el-form-item>
        <el-form-item v-if="rejectForm.status === 'rejected'" label="拒绝原因">
          <el-input v-model="rejectForm.reason" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmReview">
          保存审核
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import {
  listSupplierApplications,
  updateSupplierApplicationReview
} from '@/services/supplierLightService'
import NavHeader from '@/components/NavHeader.vue'

const router = useRouter()
const loading = ref(false)
const partners = ref([])
const dataSource = ref('not loaded')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filterForm = reactive({
  status: '',
  category: '',
  keyword: ''
})

const rejectDialogVisible = ref(false)
const currentPartner = ref(null)
const submitting = ref(false)
const rejectForm = reactive({
  status: 'pending',
  category: 'other',
  review_note: '',
  reason: ''
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

const statusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    needs_info: 'info'
  }
  return types[status] || 'info'
}

const statusLabel = (status) => {
  const labels = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    needs_info: '需补充资料'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
  fetchPartners()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchPartners()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchPartners()
}

const viewDetail = (id) => {
  router.push(`/admin/partners/${id}`)
}

const openReview = (partner, status) => {
  currentPartner.value = partner
  rejectForm.status = status || partner.status
  rejectForm.category = partner.category || 'other'
  rejectForm.review_note = partner.review_note || ''
  rejectForm.reason = partner.reject_reason || ''
  rejectDialogVisible.value = true
}

const confirmReview = async () => {
  if (rejectForm.status === 'rejected' && !rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  submitting.value = true
  try {
    await updateSupplierApplicationReview(currentPartner.value.id, {
      status: rejectForm.status,
      category: rejectForm.category,
      review_note: rejectForm.review_note,
      reject_reason: rejectForm.reason
    })
    ElMessage.success('已保存 local/staging 审核结果')
    rejectDialogVisible.value = false
    fetchPartners()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const fetchPartners = async () => {
  loading.value = true
  try {
    const res = await listSupplierApplications({
      ...filterForm
    })
    partners.value = res.items || []
    total.value = res.total || 0
    dataSource.value = res.source
  } catch (error) {
    ElMessage.error('获取供应商列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPartners()
})
</script>

<style scoped>
.admin-partners {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.admin-container {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.admin-sidebar {
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

.admin-content {
  flex: 1;
  padding: 24px;
}

.content-header {
  margin-bottom: 24px;
}

.content-header h1 {
  font-size: 24px;
  margin: 0;
}

.content-header p {
  margin: 8px 0 0;
  color: #606266;
}

.scope-alert {
  margin-bottom: 16px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.table-card {
  border-radius: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }
}
</style>
