<template>
  <div class="partner-dashboard">
    <NavHeader />
    
    <div class="dashboard-container">
      <div class="dashboard-sidebar">
        <div class="partner-info">
          <el-avatar :size="64" :icon="OfficeBuilding" />
          <h3>{{ partnerInfo.company_name }}</h3>
          <p>{{ categoryLabel(partnerInfo.category) }}</p>
          <el-tag type="success">已认证</el-tag>
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
          <el-menu-item index="/partner/settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="dashboard-content">
        <h1>合作伙伴门户</h1>
        
        <div class="status-cards">
          <!-- 合同状态卡片 -->
          <el-card class="status-card" shadow="hover">
            <div class="card-header">
              <div class="card-icon contract">
                <el-icon><DocumentChecked /></el-icon>
              </div>
              <div class="card-info">
                <h3>合同签署</h3>
                <p :class="contractStatusClass">{{ contractStatusText }}</p>
              </div>
            </div>
            <div class="card-body">
              <p v-if="pendingContracts.length > 0">
                您有 <strong>{{ pendingContracts.length }}</strong> 份待签署合同
              </p>
              <p v-else-if="contracts.length === 0">暂无待签署合同</p>
              <p v-else>所有合同已签署完成</p>
            </div>
            <div class="card-footer">
              <el-button 
                type="primary" 
                @click="$router.push('/partner/contracts')"
                v-if="pendingContracts.length > 0"
              >
                去签合同
              </el-button>
              <el-button 
                @click="$router.push('/partner/contracts')"
                v-else
              >
                查看合同
              </el-button>
            </div>
          </el-card>
          
          <!-- 素材库状态卡片 -->
          <el-card class="status-card" shadow="hover">
            <div class="card-header">
              <div class="card-icon media">
                <el-icon><Picture /></el-icon>
              </div>
              <div class="card-info">
                <h3>素材库</h3>
                <p>{{ mediaCount }} 个素材</p>
              </div>
            </div>
            <div class="card-body">
              <p v-if="mediaCount === 0">
                您还未上传任何素材，建议上传高质量图片和视频展示您的服务
              </p>
              <p v-else-if="mediaCount < 5">
                已上传 {{ mediaCount }} 个素材，建议至少上传 5 个以上
              </p>
              <p v-else>素材库丰富，有助于提升客户信任度</p>
            </div>
            <div class="card-footer">
              <el-button type="primary" @click="$router.push('/partner/media')">
                去上传素材
              </el-button>
            </div>
          </el-card>
          
          <!-- 数据统计卡片 -->
          <el-card class="status-card" shadow="hover">
            <div class="card-header">
              <div class="card-icon stats">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-info">
                <h3>数据概览</h3>
                <p>本月</p>
              </div>
            </div>
            <div class="card-body stats-body">
              <div class="stat-item">
                <span class="stat-value">{{ stats.views }}</span>
                <span class="stat-label">浏览量</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.inquiries }}</span>
                <span class="stat-label">咨询数</span>
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="quick-tips">
          <h2>快速指南</h2>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
              <div class="tip-item">
                <div class="tip-icon">1</div>
                <h4>签署合作合同</h4>
                <p>阅读并签署合作协议，正式成为平台合作伙伴</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8">
              <div class="tip-item">
                <div class="tip-icon">2</div>
                <h4>完善素材库</h4>
                <p>上传高质量作品图片和视频，展示您的专业能力</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8">
              <div class="tip-item">
                <div class="tip-icon">3</div>
                <h4>开始接单</h4>
                <p>等待客户咨询，及时响应，提供优质服务</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { partnerAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const partnerInfo = ref({
  company_name: '示例供应商公司',
  category: 'venue'
})

const contracts = ref([])
const mediaCount = ref(0)
const stats = ref({
  views: 0,
  inquiries: 0
})

const pendingContracts = computed(() => {
  return contracts.value.filter(c => c.status === 'pending')
})

const contractStatusText = computed(() => {
  if (pendingContracts.value.length > 0) return '待签署'
  if (contracts.value.length === 0) return '未开始'
  return '已完成'
})

const contractStatusClass = computed(() => {
  if (pendingContracts.value.length > 0) return 'status-warning'
  if (contracts.value.length === 0) return 'status-info'
  return 'status-success'
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

const fetchDashboardData = async () => {
  try {
    const res = await partnerAPI.getDashboard()
    partnerInfo.value = res.partner_info || partnerInfo.value
    contracts.value = res.contracts || []
    mediaCount.value = res.media_count || 0
    stats.value = res.stats || { views: 0, inquiries: 0 }
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.partner-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.dashboard-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.dashboard-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  padding: 24px 0;
}

.partner-info {
  padding: 0 24px 24px;
  text-align: center;
  border-bottom: 1px solid #ebeef5;
}

.partner-info h3 {
  margin: 12px 0 4px;
  font-size: 18px;
}

.partner-info p {
  color: #909399;
  margin-bottom: 8px;
}

.dashboard-menu {
  border-right: none;
}

.dashboard-content {
  flex: 1;
  padding: 32px;
}

.dashboard-content h1 {
  margin-bottom: 24px;
  font-size: 24px;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.status-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-icon.contract {
  background: #e6f7ff;
  color: #1890ff;
}

.card-icon.media {
  background: #f6ffed;
  color: #52c41a;
}

.card-icon.stats {
  background: #fff7e6;
  color: #fa8c16;
}

.card-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.card-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.status-warning {
  color: #e6a23c;
}

.status-success {
  color: #67c23a;
}

.status-info {
  color: #909399;
}

.card-body {
  margin-bottom: 16px;
  color: #606266;
}

.stats-body {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.card-footer {
  text-align: right;
}

.quick-tips {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.quick-tips h2 {
  margin-bottom: 24px;
  font-size: 20px;
}

.tip-item {
  text-align: center;
}

.tip-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin: 0 auto 16px;
}

.tip-item h4 {
  margin-bottom: 8px;
  font-size: 16px;
}

.tip-item p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .dashboard-sidebar {
    display: none;
  }
  
  .status-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 16px;
  }
}
</style>
