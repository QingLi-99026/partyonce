<template>
  <div class="events-page">
    <NavHeader />
    
    <div class="events-container">
      <div class="page-header">
        <div class="header-left">
          <h1>我的活动</h1>
          <p>管理您的派对和活动</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="createEvent">
            <el-icon><Plus /></el-icon>
            创建活动
          </el-button>
        </div>
      </div>
      
      <!-- 状态筛选 -->
      <div class="status-tabs">
        <el-radio-group v-model="statusFilter" size="large">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="upcoming">即将开始</el-radio-button>
          <el-radio-button label="ongoing">进行中</el-radio-button>
          <el-radio-button label="completed">已完成</el-radio-button>
          <el-radio-button label="cancelled">已取消</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 活动列表 -->
      <el-empty v-if="events.length === 0" description="暂无活动" />
      
      <div v-else class="events-list">
        <el-row :gutter="24">
          <el-col
            v-for="event in events"
            :key="event.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card
              class="event-card"
              shadow="hover"
              @click="viewEvent(event.id)"
            >
              <div class="event-cover">
                <img :src="event.cover_image || defaultCover" :alt="event.name" />
                <el-tag
                  :type="statusType(event.status)"
                  class="status-tag"
                  size="small"
                >
                  {{ statusLabel(event.status) }}
                </el-tag>
              </div>
              
              <div class="event-info">
                <h3 class="event-name">{{ event.name }}</h3>
                
                <div class="event-date">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDate(event.event_date) }}</span>
                </div>
                
                <div class="event-location" v-if="event.location">
                  <el-icon><Location /></el-icon>
                  <span>{{ event.location }}</span>
                </div>
                
                <div class="event-meta">
                  <el-tag v-if="event.template_name" size="small" effect="plain">
                    {{ event.template_name }}
                  </el-tag>
                  
                  <span class="guest-count" v-if="event.guest_count">
                    <el-icon><User /></el-icon>
                    {{ event.guest_count }} 人
                  </span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { eventAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const defaultCover = 'https://images.unsplash.com/photo-1530103862676-de3c9c59afbc?w=400'

const events = ref([])
const loading = ref(false)
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const statusType = (status) => {
  const types = {
    upcoming: 'primary',
    ongoing: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const statusLabel = (status) => {
  const labels = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

const createEvent = () => {
  router.push('/templates')
}

const viewEvent = (id) => {
  router.push(`/my/events/${id}`)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchEvents()
}

const fetchEvents = async () => {
  loading.value = true
  try {
    const res = await eventAPI.getEvents({
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusFilter.value
    })
    events.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

watch(statusFilter, () => {
  currentPage.value = 1
  fetchEvents()
})

onMounted(() => {
  fetchEvents()
})
</script>

<style scoped>
.events-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.events-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: #303133;
}

.header-left p {
  color: #909399;
}

.status-tabs {
  margin-bottom: 32px;
}

.events-list {
  margin-bottom: 40px;
}

.event-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 24px;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.event-cover {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.event-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.event-info {
  padding: 20px;
}

.event-name {
  font-size: 18px;
  margin-bottom: 12px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-date,
.event-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.guest-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.pagination-wrapper {
  text-align: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .status-tabs {
    overflow-x: auto;
  }
  
  .status-tabs :deep(.el-radio-group) {
    display: flex;
    flex-wrap: nowrap;
  }
}
</style>
