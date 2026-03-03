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
                  <el-button type="success" link @click="approve(row)">
                    通过
                  </el-button>
                  <el-button type="danger" link @click="reject(row)">
                    拒绝
                  </el-button>
                </template>
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
    
    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝申请"
      width="500px"
    >
      <p style="margin-bottom: 16px">
        您正在拒绝供应商 <strong>{{ currentPartner?.company_name }}</strong> 的申请
      </p>
      
      <el-form :model="rejectForm">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因，将展示给供应商"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { adminAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const router = useRouter()
const loading = ref(false)
const partners = ref([])
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
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const statusLabel = (status) => {
  const labels = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
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

const approve = async (partner) => {
  try {
    await ElMessageBox.confirm(
      `确定要通过 ${partner.company_name} 的供应商申请吗？`,
      '确认通过',
      { type: 'warning' }
    )
    await adminAPI.approvePartner(partner.id)
    ElMessage.success('已通过申请')
    fetchPartners()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const reject = (partner) => {
  currentPartner.value = partner
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
    await adminAPI.rejectPartner(currentPartner.value.id, { reason: rejectForm.reason })
    ElMessage.success('已拒绝申请')
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
    const res = await adminAPI.getPartners({
      page: currentPage.value,
      page_size: pageSize.value,
      ...filterForm
    })
    partners.value = res.items || []
    total.value = res.total || 0
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
