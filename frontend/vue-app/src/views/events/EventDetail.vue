<template>
  <div class="event-detail-page">
    <NavHeader />
    
    <div class="detail-container">
      <el-skeleton :rows="10" animated v-if="loading" />
      
      <template v-else>
        <!-- 页面头部 -->
        <div class="detail-header">
          <el-breadcrumb separator="/>"
            <el-breadcrumb-item :to="{ path: '/my/events' }">我的活动</el-breadcrumb-item>
            <el-breadcrumb-item>{{ event.name }}</el-breadcrumb-item>
          </el-breadcrumb>
          
          <div class="header-actions">
            <el-tag :type="statusType">{{ statusLabel }}</el-tag>
          </div>
        </div>
        
        <!-- 基本信息卡片 -->
        <el-card class="info-card">
          <div class="event-main-info">
            <div class="event-cover">
              <img :src="event.cover_image || defaultCover" :alt="event.name" />
            </div>
            
            <div class="event-details">
              <h1>{{ event.name }}</h1>
              
              <el-descriptions :column="1">
                <el-descriptions-item label="活动日期">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDateTime(event.event_date) }}
                </el-descriptions-item>
                
                <el-descriptions-item label="活动地点" v-if="event.location">
                  <el-icon><Location /></el-icon>
                  {{ event.location }}
                </el-descriptions-item>
                
                <el-descriptions-item label="预计人数" v-if="event.guest_count">
                  <el-icon><User /></el-icon>
                  {{ event.guest_count }} 人
                </el-descriptions-item>
                
                <el-descriptions-item label="使用模板" v-if="event.template_name">
                  <el-tag effect="plain">{{ event.template_name }}</el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
        
        <!-- 主要内容区 -->
        <el-row :gutter="24" class="main-content">
          <el-col :xs="24" :lg="16">
            <!-- 拍照指南 -->
            <el-card class="section-card">
              <template #header>
                <div class="card-header">
                  <span><el-icon><Camera /></el-icon> 拍照指南</span>
                </div>
              </template>
              
              <div class="photo-guide">
                <div class="guide-section">
                  <h4>推荐机位</h4>
                  <ul class="guide-list">
                    <li v-for="(position, index) in photoGuide.positions" :key="index">
                      <strong>{{ position.name }}</strong>
                      <p>{{ position.desc }}</p>
                    </li>
                  </ul>
                </div>
                
                <div class="guide-section">
                  <h4>必拍清单</h4>
                  <ul class="checklist">
                    <li v-for="(item, index) in photoGuide.checklist" :key="index">
                      <el-checkbox v-model="item.checked">{{ item.name }}</el-checkbox>
                    </li>
                  </ul>
                </div>
              </div>
            </el-card>
            
            <!-- 活动相册 -->
            <el-card class="section-card">
              <template #header>
                <div class="card-header">
                  <span><el-icon><Picture /></el-icon> 活动相册</span>
                  <el-tag>{{ photos.length }} 张照片</el-tag>
                </div>
              </template>
              
              <el-empty v-if="photos.length === 0" description="还没有照片">
                <template #description>
                  <p>上传活动照片，记录美好瞬间</p>
                </template>
              </el-empty>
              
              <div v-else class="photo-grid">
                <div
                  v-for="photo in photos"
                  :key="photo.id"
                  class="photo-item"
                  @click="previewPhoto(photo)"
                >
                  <img :src="photo.url" />
                </div>
              </div>
              
              <div class="section-actions">
                <el-button @click="showUploadPhotoDialog">
                  <el-icon><Upload /></el-icon>
                  上传照片
                </el-button>
                
                <el-button @click="showUploadVideoDialog">
                  <el-icon><VideoCamera /></el-icon>
                  上传视频
                </el-button>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :lg="8">
            <!-- 快捷操作 -->
            <el-card class="action-card">
              <template #header>
                <span>快捷操作</span>
              </template>
              
              <div class="action-list">
                <el-button
                  type="primary"
                  size="large"
                  @click="generateSharePack"
                  :loading="generating"
                >
                  <el-icon><Share /></el-icon>
                  生成分享包
                </el-button>
                
                <el-button size="large" @click="showUploadPhotoDialog">
                  <el-icon><Picture /></el-icon>
                  上传照片
                </el-button>
                
                <el-button size="large" @click="showUploadVideoDialog">
                  <el-icon><VideoCamera /></el-icon>
                  上传视频
                </el-button>
                
                <el-button size="large" @click="editEvent">
                  <el-icon><Edit /></el-icon>
                  编辑活动
                </el-button>
                
                <el-button size="large" type="danger" plain @click="cancelEvent"
                >
                  <el-icon><CircleClose /></el-icon>
                  取消活动
                </el-button>
              </div>
            </el-card>
            
            <!-- 分享记录 -->
            <el-card class="stats-card">
              <template #header>
                <span>分享统计</span>
              </template>
              
              <div class="stats-list">
                <div class="stat-item">
                  <span class="stat-label">分享次数</span>
                  <span class="stat-value">{{ stats.share_count || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">点击次数</span>
                  <span class="stat-value">{{ stats.click_count || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">照片数量</span>
                  <span class="stat-value">{{ photos.length }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </div>
    
    <!-- 上传照片对话框 -->
    <el-dialog v-model="uploadPhotoVisible" title="上传照片" width="500px">
      <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handlePhotoChange"
        :show-file-list="false"
        accept="image/*"
        class="upload-area"
      >
        <el-icon class="upload-icon"><Picture /></el-icon>
        <div class="upload-text">点击或拖拽照片到此处</div>
      </el-upload>
      
      <template #footer>
        <el-button @click="uploadPhotoVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="confirmUploadPhoto">
          上传
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 上传视频对话框 -->
    <el-dialog v-model="uploadVideoVisible" title="上传视频" width="500px">
      <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleVideoChange"
        :show-file-list="false"
        accept="video/*"
        class="upload-area"
      >
        <el-icon class="upload-icon"><VideoCamera /></el-icon>
        <div class="upload-text">点击或拖拽视频到此处</div>
        <div class="upload-hint">视频限制：≤60秒，≤100MB</div>
      </el-upload>
      
      <template #footer>
        <el-button @click="uploadVideoVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="confirmUploadVideo">
          上传
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 预览图片 -->
    <el-dialog v-model="previewVisible" title="预览" width="800px" center>
      <img :src="previewUrl" style="max-width: 100%; max-height: 600px" />
    </el-dialog>
    
    <!-- 分享包结果 -->
    <el-dialog v-model="shareResultVisible" title="分享包已生成" width="500px">
      <div class="share-result">
        <p>您的分享链接已生成：</p>
        
        <el-input v-model="shareUrl" readonly>
          <template #append>
            <el-button @click="copyShareUrl">复制</el-button>
          </template>
        </el-input>
        
        <div class="share-qrcode">
          <p>或扫描二维码访问：</p>
          <!-- 这里可以集成二维码生成 -->
          <div class="qrcode-placeholder">二维码</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { eventAPI, uploadAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id
const defaultCover = 'https://images.unsplash.com/photo-1530103862676-de3c9c59afbc?w=400'

const loading = ref(true)
const generating = ref(false)
const uploading = ref(false)

const event = ref({
  id: '',
  name: '',
  event_date: '',
  location: '',
  guest_count: 0,
  template_name: '',
  cover_image: '',
  status: ''
})

const photos = ref([])
const stats = ref({})

const photoGuide = ref({
  positions: [
    { name: '入口迎宾区', desc: '拍摄宾客到达时的自然状态' },
    { name: '主舞台', desc: '记录重要时刻和表演' },
    { name: '用餐区', desc: '捕捉用餐氛围和互动' },
    { name: '合影区', desc: '拍摄集体照和互动瞬间' }
  ],
  checklist: [
    { name: '宾客到场签到', checked: false },
    { name: '开场致辞', checked: false },
    { name: '切蛋糕/启动仪式', checked: false },
    { name: '游戏互动环节', checked: false },
    { name: '大合影', checked: false },
    { name: '精彩瞬间抓拍', checked: false }
  ]
})

const uploadPhotoVisible = ref(false)
const uploadVideoVisible = ref(false)
const previewVisible = ref(false)
const shareResultVisible = ref(false)
const previewUrl = ref('')
const shareUrl = ref('')
const selectedFile = ref(null)

const statusType = computed(() => {
  const types = {
    upcoming: 'primary',
    ongoing: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return types[event.value.status] || 'info'
})

const statusLabel = computed(() => {
  const labels = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[event.value.status] || event.value.status
})

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const showUploadPhotoDialog = () => {
  selectedFile.value = null
  uploadPhotoVisible.value = true
}

const showUploadVideoDialog = () => {
  selectedFile.value = null
  uploadVideoVisible.value = true
}

const handlePhotoChange = (file) => {
  selectedFile.value = file.raw
}

const handleVideoChange = (file) => {
  selectedFile.value = file.raw
  
  // 检查视频大小
  if (file.raw.size > 100 * 1024 * 1024) {
    ElMessage.warning('视频大小不能超过100MB')
    selectedFile.value = null
    return
  }
  
  // 检查视频时长
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.onloadedmetadata = () => {
    URL.revokeObjectURL(video.src)
    if (video.duration > 60) {
      ElMessage.warning('视频时长不能超过60秒')
      selectedFile.value = null
    }
  }
  video.src = URL.createObjectURL(file.raw)
}

const confirmUploadPhoto = async () => {
  if (!selectedFile.value) return
  await uploadFile('image')
}

const confirmUploadVideo = async () => {
  if (!selectedFile.value) return
  await uploadFile('video')
}

const uploadFile = async (type) => {
  uploading.value = true
  try {
    const presignRes = await uploadAPI.getPresignUrl({
      filename: selectedFile.value.name,
      content_type: selectedFile.value.type
    })

    await fetch(presignRes.presign_url, {
      method: 'PUT',
      body: selectedFile.value,
      headers: { 'Content-Type': selectedFile.value.type }
    })

    await eventAPI.addMedia(eventId, {
      file_key: presignRes.file_key,
      type: type,
      name: selectedFile.value.name,
      size: selectedFile.value.size
    })

    ElMessage.success('上传成功！')
    uploadPhotoVisible.value = false
    uploadVideoVisible.value = false
    fetchEventDetail()
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const previewPhoto = (photo) => {
  previewUrl.value = photo.url
  previewVisible.value = true
}

const generateSharePack = async () => {
  generating.value = true
  try {
    const res = await eventAPI.generateSharePack(eventId)
    shareUrl.value = `${window.location.origin}/s/${res.share_code}`
    shareResultVisible.value = true
  } catch (error) {
    ElMessage.error('生成分享包失败')
  } finally {
    generating.value = false
  }
}

const copyShareUrl = () => {
  navigator.clipboard.writeText(shareUrl.value)
  ElMessage.success('链接已复制')
}

const editEvent = () => {
  router.push(`/my/events/${eventId}/edit`)
}

const cancelEvent = async () => {
  try {
    await ElMessageBox.confirm('确定要取消此活动吗？', '确认', { type: 'warning' })
    await eventAPI.cancelEvent(eventId)
    ElMessage.success('活动已取消')
    fetchEventDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const fetchEventDetail = async () => {
  loading.value = true
  try {
    const res = await eventAPI.getEvent(eventId)
    event.value = res.event || event.value
    photos.value = res.photos || []
    stats.value = res.stats || {}
  } catch (error) {
    ElMessage.error('获取活动详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEventDetail()
})
</script>

<style scoped>
.event-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.info-card {
  border-radius: 16px;
  margin-bottom: 24px;
}

.event-main-info {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
}

.event-cover {
  border-radius: 12px;
  overflow: hidden;
}

.event-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-details h1 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #303133;
}

.main-content {
  margin-top: 24px;
}

.section-card {
  border-radius: 16px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .el-icon {
  margin-right: 8px;
}

.photo-guide {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.guide-section h4 {
  margin-bottom: 16px;
  color: #303133;
}

.guide-list {
  list-style: none;
  padding: 0;
}

.guide-list li {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.guide-list li strong {
  display: block;
  margin-bottom: 4px;
  color: #303133;
}

.guide-list li p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.checklist {
  list-style: none;
  padding: 0;
}

.checklist li {
  margin-bottom: 12px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-item:hover img {
  transform: scale(1.05);
}

.section-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.action-card {
  border-radius: 16px;
  margin-bottom: 24px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-list .el-button {
  justify-content: flex-start;
}

.action-list .el-icon {
  margin-right: 8px;
}

.stats-card {
  border-radius: 16px;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.stat-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  padding: 60px;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.share-result {
  text-align: center;
}

.share-qrcode {
  margin-top: 24px;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  margin: 16px auto;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

@media (max-width: 1024px) {
  .event-main-info {
    grid-template-columns: 1fr;
  }
  
  .event-cover {
    max-height: 300px;
  }
  
  .photo-guide {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-container {
    padding: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
