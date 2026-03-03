<template>
  <div class="partner-dashboard">
    <div class="dashboard-header">
      <h1>供应商中心</h1>
      <p>欢迎，{{ partnerInfo?.company_name }}</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-info">
            <p class="stat-label">合同状态</p>
            <p class="stat-value">{{ contractStatus }}</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card"
003e
          <div class="stat-icon">🖼️</div>
          <div class="stat-info">
            <p class="stat-label">素材数量</p>
            <p class="stat-value">{{ mediaCount }}</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <p class="stat-label">评分</p>
            <p class="stat-value">{{ partnerInfo?.score || '-' }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="action-row">
      <el-col :span="12">
        <el-card class="action-card">
          <h3>📄 合同管理</h3>
          <p>查看并管理您的合作协议</p>
          <el-button type="primary" @click="$router.push('/partner/contracts')">
            去签合同
          </el-button>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="action-card">
          <h3>🖼️ 素材管理</h3>
          <p>上传和管理您的展示素材</p>
          <el-button type="primary" @click="$router.push('/partner/media')">
            去上传素材
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const partnerInfo = ref(null)
const contractStatus = ref('未签署')
const mediaCount = ref(0)

onMounted(async () => {
  try {
    const response = await fetch('/api/partners/me', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      partnerInfo.value = await response.json()
      mediaCount.value = partnerInfo.value.media_count || 0
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
.partner-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  font-size: 40px;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin: 0 0 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.action-row {
  margin-top: 20px;
}

.action-card {
  text-align: center;
  padding: 40px 20px;
}

.action-card h3 {
  margin-bottom: 12px;
}

.action-card p {
  color: #909399;
  margin-bottom: 20px;
}
</style>
