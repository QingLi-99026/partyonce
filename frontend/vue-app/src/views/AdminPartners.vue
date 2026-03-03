<template>
  <div class="admin-partners">
    <div class="page-header">
      <h1>供应商审核</h1>
    </div>

    <el-card>
      <!-- 筛选 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterStatus" @change="fetchPartners">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="pending">待审核</el-radio-button>
          <el-radio-button label="approved">已通过</el-radio-button>
          <el-radio-button label="rejected">已拒绝</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 列表 -->
      <el-table :data="partners" v-loading="loading">
        <el-table-column prop="company_name" label="公司名称" />
        <el-table-column prop="category" label="类别">
          <template #default="{ row }">{{ getCategoryName(row.category) }}</template>
        </el-table-column>
        
        <el-table-column prop="contact_name" label="联系人" />
        
        <el-table-column prop="contact_phone" label="电话" />
        
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="申请时间">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'" 
              type="success" 
              size="small"
              @click="approvePartner(row)"
            >通过</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="danger" 
              size="small"
              @click="rejectPartner(row)"
            >拒绝</el-button>
            <el-button v-else text size="small" disabled>已处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 拒绝原因弹窗 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="500px">
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请输入拒绝原因"
      />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const loading = ref(false)
const partners = ref([])
const filterStatus = ref('')
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentPartner = ref(null)

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
    pending: '待审核',
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

const fetchPartners = async () => {
  loading.value = true
  try {
    let url = '/api/admin/partners'
    if (filterStatus.value) {
      url += `?status=${filterStatus.value}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      partners.value = await response.json()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const approvePartner = async (row) => {
  try {
    await ElMessageBox.confirm('确定通过该供应商申请？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await fetch(`/api/admin/partners/${row.id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      ElMessage.success('审核通过')
      fetchPartners()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const rejectPartner = (row) => {
  currentPartner.value = row
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  try {
    const response = await fetch(`/api/admin/partners/${currentPartner.value.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({ reason: rejectReason.value })
    })
    
    if (response.ok) {
      ElMessage.success('已拒绝')
      rejectDialogVisible.value = false
      fetchPartners()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchPartners()
})
</script>

<style scoped>
.admin-partners {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.filter-bar {
  margin-bottom: 20px;
}
</style>
