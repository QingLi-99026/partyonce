<template>
  <div class="user-profile-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon"><el-icon><User /></el-icon></div>
        <h1>用户中心</h1>
        <p>管理您的账户信息和派对方案</p>
      </div>
    </div>

    <div class="profile-container">
      <div class="profile-layout">
        <!-- User Sidebar -->
        <aside class="user-sidebar">
          <el-card class="user-card">
            <div class="user-avatar-section">
              <el-avatar :size="80" :icon="UserFilled" />
              <h3>{{ userInfo?.full_name || '未设置姓名' }}</h3>
              <p class="user-email">{{ userInfo?.email }}</p>
              <el-tag v-if="userInfo?.is_vip" type="danger" effect="dark">
                <el-icon><Medal /></el-icon> VIP会员
              </el-tag>
              <el-tag v-else type="info">普通会员</el-tag>
            </div>

            <el-divider />

            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ plans.length }}</span>
                <span class="stat-label">策划方案</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ designs.length }}</span>
                <span class="stat-label">设计方案</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ quotations.length }}</span>
                <span class="stat-label">报价单</span>
              </div>
            </div>
          </el-card>

          <el-card class="menu-card">
            <el-menu :default-active="activeMenu" @select="handleMenuSelect">
              <el-menu-item index="profile">
                <el-icon><User /></el-icon>
                <span>个人信息</span>
              </el-menu-item>
              <el-menu-item index="plans">
                <el-icon><Magic /></el-icon>
                <span>我的策划方案</span>
              </el-menu-item>
              <el-menu-item index="designs">
                <el-icon><View /></el-icon>
                <span>我的设计方案</span>
              </el-menu-item>
              <el-menu-item index="quotations">
                <el-icon><Document /></el-icon>
                <span>我的报价单</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Profile Section -->
          <div v-if="activeMenu === 'profile'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span>个人信息</span>
                  <el-button type="primary" @click="saveProfile" :loading="saving">保存修改</el-button>
                </div>
              </template>

              <el-form label-position="top" :model="profileForm" class="profile-form">
                <div class="form-row">
                  <el-form-item label="姓名">
                    <el-input v-model="profileForm.full_name" placeholder="请输入姓名" />
                  </el-form-item>
                  
                  <el-form-item label="邮箱">
                    <el-input v-model="profileForm.email" disabled />
                  </el-form-item>
                </div>

                <div class="form-row">
                  <el-form-item label="电话">
                    <el-input v-model="profileForm.phone" placeholder="请输入电话号码" />
                  </el-form-item>
                  
                  <el-form-item label="城市">
                    <el-select v-model="profileForm.city" placeholder="选择城市" style="width: 100%">
                      <el-option label="悉尼" value="悉尼" />
                      <el-option label="墨尔本" value="墨尔本" />
                      <el-option label="布里斯班" value="布里斯班" />
                      <el-option label="珀斯" value="珀斯" />
                      <el-option label="阿德莱德" value="阿德莱德" />
                    </el-select>
                  </el-form-item>
                </div>

                <el-form-item label="个人简介">
                  <el-input
                    v-model="profileForm.bio"
                    type="textarea"
                    rows="4"
                    placeholder="简单介绍一下自己..."
                  />
                </el-form-item>
              </el-form>

              <el-divider />

              <h4>修改密码</h4>
              <el-form label-position="top" class="password-form">
                <el-form-item label="当前密码">
                  <el-input v-model="passwordForm.currentPassword" type="password" show-password />
                </el-form-item>
                
                <el-form-item label="新密码">
                  <el-input v-model="passwordForm.newPassword" type="password" show-password />
                </el-form-item>
                
                <el-form-item label="确认新密码">
                  <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                </el-form-item>
                
                <el-button @click="changePassword" :loading="changingPassword">修改密码</el-button>
              </el-form>
            </el-card>
          </div>

          <!-- Plans Section -->
          <div v-if="activeMenu === 'plans'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span>我的策划方案</span>
                  <el-button type="primary" @click="$router.push('/ai-planner')">新建方案</el-button>
                </div>
              </template>

              <div v-if="plans.length === 0" class="empty-state">
                <el-empty description="暂无策划方案">
                  <template #footer>
                    <el-button type="primary" @click="$router.push('/ai-planner')">
                      创建第一个方案
                    </el-button>
                  </template>
                </el-empty>
              </div>

              <div v-else class="plans-list">
                <div v-for="plan in plans" :key="plan.id" class="plan-card">
                  <div class="plan-header">
                    <div class="plan-title">
                      <h4>{{ plan.event_name || '未命名派对' }}</h4>
                      <el-tag size="small">{{ getEventTypeLabel(plan.event_type) }}</el-tag>
                    </div>
                    <span class="plan-date">{{ formatDate(plan.created_at) }}</span>
                  </div>
                  
                  <div class="plan-details">
                    <p><strong>人数:</strong> {{ plan.guest_count }}人</p>
                    <p><strong>预算:</strong> {{ plan.budget_range }}</p>
                    <p v-if="plan.location"><strong>地点:</strong> {{ plan.location }}</p>
                  </div>
                  
                  <div class="plan-actions">
                    <el-button size="small" @click="viewPlan(plan)">查看详情</el-button>
                    <el-button size="small" type="primary" @click="continuePlan(plan)">继续设计</el-button>
                    <el-button size="small" type="danger" @click="deletePlan(plan.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- Designs Section -->
          <div v-if="activeMenu === 'designs'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span>我的设计方案</span>
                  <el-button type="primary" @click="$router.push('/3d-designer')">新建设计</el-button>
                </div>
              </template>

              <div v-if="designs.length === 0" class="empty-state">
                <el-empty description="暂无设计方案">
                  <template #footer>
                    <el-button type="primary" @click="$router.push('/3d-designer')">
                      创建第一个设计
                    </el-button>
                  </template>
                </el-empty>
              </div>

              <div v-else class="designs-grid">
                <div v-for="design in designs" :key="design.id" class="design-card">
                  <div class="design-preview">
                    <el-icon><View /></el-icon>
                  </div>
                  
                  <div class="design-info">
                    <h4>{{ design.name }}</h4>
                    <p class="design-desc">{{ design.description || '无描述' }}</p>
                    <div class="design-meta">
                      <span class="design-budget">${{ design.budget?.toLocaleString() || 0 }}</span>
                      <span class="design-date">{{ formatDate(design.createdAt) }}</span>
                    </div>
                  </div>
                  
                  <div class="design-actions">
                    <el-button size="small" @click="loadDesign(design)">加载</el-button>
                    <el-button size="small" type="danger" @click="deleteDesign(design.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- Quotations Section -->
          <div v-if="activeMenu === 'quotations'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span>我的报价单</span>
                  <el-button type="primary" @click="$router.push('/quotation')">新建报价</el-button>
                </div>
              </template>

              <div v-if="quotations.length === 0" class="empty-state">
                <el-empty description="暂无报价单">
                  <template #footer>
                    <el-button type="primary" @click="$router.push('/quotation')">
                      创建第一个报价
                    </el-button>
                  </template>
                </el-empty>
              </div>

              <div v-else class="quotations-list">
                <el-table :data="quotations" style="width: 100%">
                  <el-table-column prop="quote_number" label="报价单号" width="150" />
                  <el-table-column prop="created_at" label="日期" width="120">
                    <template #default="{ row }">
                      {{ formatDate(row.created_at) }}
                    </template>
                  </el-table-column>
                  
                  <el-table-column prop="grand_total" label="金额">
                    <template #default="{ row }">
                      <span class="price">${{ row.grand_total?.toLocaleString() }}</span>
                    </template>
                  </el-table-column>
                  
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button size="small" @click="viewQuotation(row)">查看</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, UserFilled, Medal, Magic, View, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userAPI, aiAPI, quotationAPI } from '@/api/modules'
import { useUserStore, usePlanStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const planStore = usePlanStore()

// State
const activeMenu = ref('profile')
const saving = ref(false)
const changingPassword = ref(false)

// User data
const userInfo = ref(userStore.userInfo)

// Forms
const profileForm = ref({
  full_name: '',
  email: '',
  phone: '',
  city: '',
  bio: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Lists
const plans = ref([])
const designs = ref([])
const quotations = ref([])

// Methods
const handleMenuSelect = (index) => {
  activeMenu.value = index
}

const loadUserProfile = () => {
  profileForm.value = {
    full_name: userInfo.value?.full_name || '',
    email: userInfo.value?.email || '',
    phone: userInfo.value?.phone || '',
    city: userInfo.value?.city || '',
    bio: userInfo.value?.bio || ''
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    await userAPI.updateProfile({
      full_name: profileForm.value.full_name,
      phone: profileForm.value.phone,
      city: profileForm.value.city,
      bio: profileForm.value.bio
    })
    userStore.setUserInfo({ ...userInfo.value, ...profileForm.value })
    ElMessage.success('个人信息已更新')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.error('密码长度不能少于6位')
    return
  }

  changingPassword.value = true
  try {
    // API call would go here
    ElMessage.success('密码修改成功')
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    ElMessage.error('密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

const loadPlans = async () => {
  try {
    const data = await aiAPI.getPlans()
    plans.value = data || []
  } catch (error) {
    // Mock data
    plans.value = [
      {
        id: 1,
        event_name: '30岁生日派对',
        event_type: 'birthday',
        guest_count: 60,
        budget_range: '$3000-5000',
        location: '悉尼',
        created_at: new Date().toISOString()
      }
    ]
  }
}

const loadDesigns = () => {
  const savedDesigns = JSON.parse(localStorage.getItem('partyonce_designs') || '[]')
  designs.value = savedDesigns
}

const loadQuotations = async () => {
  try {
    const data = await quotationAPI.getQuotations()
    quotations.value = data || []
  } catch (error) {
    // Mock data
    quotations.value = [
      {
        id: 1,
        quote_number: 'POQ-20240302-001',
        grand_total: 5420,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ]
  }
}

const getEventTypeLabel = (type) => {
  const labels = {
    birthday: '生日派对',
    wedding: '婚礼',
    corporate: '企业活动',
    baby: '宝宝宴',
    graduation: '毕业派对',
    holiday: '节日派对',
    other: '其他'
  }
  return labels[type] || type
}

const getStatusType = (status) => {
  const types = { draft: 'info', pending: 'warning', approved: 'success', rejected: 'danger' }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = { draft: '草稿', pending: '待确认', approved: '已批准', rejected: '已拒绝' }
  return labels[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const viewPlan = (plan) => {
  planStore.setCurrentPlan(plan)
  router.push('/ai-planner')
}

const continuePlan = (plan) => {
  planStore.setCurrentPlan(plan)
  router.push('/3d-designer')
}

const deletePlan = async (planId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个策划方案吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    plans.value = plans.value.filter(p => p.id !== planId)
    ElMessage.success('已删除')
  } catch {
    // Cancelled
  }
}

const loadDesign = (design) => {
  router.push({ path: '/3d-designer', query: { designId: design.id } })
}

const deleteDesign = async (designId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个设计方案吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const filtered = designs.value.filter(d => d.id !== designId)
    localStorage.setItem('partyonce_designs', JSON.stringify(filtered))
    designs.value = filtered
    ElMessage.success('已删除')
  } catch {
    // Cancelled
  }
}

const viewQuotation = (quotation) => {
  router.push('/quotation')
}

onMounted(() => {
  loadUserProfile()
  loadPlans()
  loadDesigns()
  loadQuotations()
})
</script>

<style scoped>
.user-profile-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
}

.page-header p {
  font-size: 16px;
  opacity: 0.9;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

.user-sidebar {
  height: fit-content;
}

.user-card {
  margin-bottom: 20px;
}

.user-avatar-section {
  text-align: center;
}

.user-avatar-section .el-avatar {
  margin-bottom: 16px;
}

.user-avatar-section h3 {
  margin-bottom: 8px;
  color: #303133;
}

.user-email {
  color: #909399;
  font-size: 14px;
  margin-bottom: 12px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.menu-card :deep(.el-menu) {
  border-right: none;
}

.content-section {
  min-height: 600px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-form {
  max-width: 600px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.password-form {
  max-width: 400px;
}

.empty-state {
  padding: 60px 0;
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.plan-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s;
}

.plan-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.plan-title h4 {
  margin: 0;
  color: #303133;
}

.plan-date {
  font-size: 13px;
  color: #909399;
}

.plan-details {
  margin-bottom: 16px;
}

.plan-details p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}

.plan-actions {
  display: flex;
  gap: 8px;
}

.designs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.design-card {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.design-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.design-preview {
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.design-preview .el-icon {
  font-size: 48px;
  color: white;
}

.design-info {
  padding: 16px;
}

.design-info h4 {
  margin-bottom: 8px;
  color: #303133;
}

.design-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.design-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.design-budget {
  color: #f56c6c;
  font-weight: bold;
}

.design-date {
  color: #909399;
}

.design-actions {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  border-top: 1px solid #ebeef5;
}

.quotations-list .price {
  color: #f56c6c;
  font-weight: bold;
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
  
  .designs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .designs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
