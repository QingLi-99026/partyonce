<template>
  <div class="partner-media">
    <NavHeader />
    
    <div class="media-container">
      <div class="media-sidebar">
        <div class="sidebar-header">
          <h3>合作伙伴中心</h3>
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
        </el-menu>
      </div>
      
      <div class="media-content">
        <div class="content-header">
          <div class="header-left">
            <h1>素材库</h1>
            <p>管理您的作品图片和视频</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="showUploadDialog = true">
              <el-icon><Upload /></el-icon>
              上传素材
            </el-button>
          </div>
        </div>
        
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterType" size="small">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="image">图片</el-radio-button>
            <el-radio-button label="video">视频</el-radio-button>
          </el-radio-group>
          
          <el-radio-group v-model="filterStatus" size="small" style="margin-left: 16px">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="public">公开</el-radio-button>
            <el-radio-button label="private">私密</el-radio-button>
          </el-radio-group>
        </div>
        
        <el-empty v-if="filteredMedia.length === 0" description="暂无素材" />
        
        <div v-else class="media-grid">
          <el-card
            v-for="item in filteredMedia"
            :key="item.id"
            class="media-card"
            shadow="hover"
            :body-style="{ padding: 0 }"
          >
            <div class="media-thumbnail" @click="previewMedia(item)">
              <img v-if="item.type === 'image'" :src="item.url" :alt="item.name" />
              <div v-else class="video-thumbnail">
                <img :src="item.thumbnail || item.url" />
                <div class="video-overlay">
                  <el-icon :size="32"><VideoPlay /></el-icon>
                </div>
                <div class="video-duration">{{ formatDuration(item.duration) }}</div>
              </div>
              
              <el-tag
                :type="item.visibility === 'public' ? 'success' : 'info'"
                size="small"
                class="visibility-tag"
              >
                {{ item.visibility === 'public' ? '公开' : '私密' }}
              </el-tag>
            </div>
            
            <div class="media-info">
              <p class="media-name" :title="item.name">{{ item.name }}</p>
              <p class="media-meta">{{ formatFileSize(item.size) }} · {{ formatDate(item.created_at) }}</p>
            </div>
            
            <div class="media-actions">
              <el-button
                type="primary"
                link
                size="small"
                @click="toggleVisibility(item)"
              >
                {{ item.visibility === 'public' ? '设为私密' : '设为公开' }}
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click="deleteMedia(item)"
              >
                删除
              </el-button>
            </div>
          </el-card>
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
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传素材"
      width="600px"
      destroy-on-close
    >
      <el-tabs v-model="uploadType">
        <el-tab-pane label="上传图片" name="image">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :show-file-list="false"
            accept="image/*"
            class="upload-area"
          >
            <el-icon class="upload-icon"><Picture /></el-icon>
            <div class="upload-text">点击或拖拽图片到此处上传</div>
            <div class="upload-hint">支持 JPG、PNG、GIF 格式，单张不超过 10MB</div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="上传视频" name="video">
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
            <div class="upload-text">点击或拖拽视频到此处上传</div>
            <div class="upload-hint">视频限制：≤60秒，≤100MB，支持 MP4 格式</div>
          </el-upload>
        </el-tab-pane>
      </el-tabs>
      
      <div v-if="selectedFile" class="selected-file">
        <p><strong>已选择：</strong>{{ selectedFile.name }}</p>
        <p>大小：{{ formatFileSize(selectedFile.size) }}</p>
        
        <el-form-item label="可见性" style="margin-top: 16px">
          <el-radio-group v-model="uploadVisibility">
            <el-radio label="public">公开（所有用户可见）</el-radio>
            <el-radio label="private">私密（仅自己可见）</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="uploading"
          :disabled="!selectedFile"
          @click="confirmUpload"
        >
          开始上传
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      :title="previewItem?.name"
      width="800px"
      destroy-on-close
      center
    >
      <div class="preview-content">
        <img
          v-if="previewItem?.type === 'image'"
          :src="previewItem?.url"
          style="max-width: 100%; max-height: 600px"
        />
        <video
          v-else-if="previewItem?.type === 'video'"
          :src="previewItem?.url"
          controls
          style="max-width: 100%; max-height: 600px"
        ></video>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { partnerAPI, uploadAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const mediaList = ref([])
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const showUploadDialog = ref(false)
const uploadType = ref('image')
const selectedFile = ref(null)
const uploadVisibility = ref('public')
const uploading = ref(false)

const showPreviewDialog = ref(false)
const previewItem = ref(null)

const filteredMedia = computed(() => {
  let result = mediaList.value
  
  if (filterType.value) {
    result = result.filter(item => item.type === filterType.value)
  }
  
  if (filterStatus.value) {
    result = result.filter(item => item.visibility === filterStatus.value)
  }
  
  return result
})

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const handleImageChange = (file) => {
  selectedFile.value = file.raw
}

const handleVideoChange = (file) => {
  selectedFile.value = file.raw
  
  // 检查视频大小和时长
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

const confirmUpload = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    // 1. 获取 presign URL
    const presignRes = await uploadAPI.getPresignUrl({
      filename: selectedFile.value.name,
      content_type: selectedFile.value.type
    })

    // 2. 直传到存储
    await fetch(presignRes.presign_url, {
      method: 'PUT',
      body: selectedFile.value,
      headers: {
        'Content-Type': selectedFile.value.type
      }
    })

    // 3. 通知后端上传完成
    await partnerAPI.addMedia({
      file_key: presignRes.file_key,
      name: selectedFile.value.name,
      type: uploadType.value,
      size: selectedFile.value.size,
      visibility: uploadVisibility.value
    })

    ElMessage.success('上传成功！')
    showUploadDialog.value = false
    selectedFile.value = null
    fetchMediaList()
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const toggleVisibility = async (item) => {
  try {
    const newVisibility = item.visibility === 'public' ? 'private' : 'public'
    await partnerAPI.updateMedia(item.id, { visibility: newVisibility })
    item.visibility = newVisibility
    ElMessage.success('设置已更新')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteMedia = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除此素材吗？', '确认删除', {
      type: 'warning'
    })
    await partnerAPI.deleteMedia(item.id)
    ElMessage.success('删除成功')
    fetchMediaList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const previewMedia = (item) => {
  previewItem.value = item
  showPreviewDialog.value = true
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchMediaList()
}

const fetchMediaList = async () => {
  try {
    const res = await partnerAPI.getMediaList({
      page: currentPage.value,
      page_size: pageSize.value
    })
    mediaList.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取素材列表失败:', error)
  }
}

onMounted(() => {
  fetchMediaList()
})
</script>

<style scoped>
.partner-media {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.media-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.media-sidebar {
  width: 260px;
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

.dashboard-menu {
  border-right: none;
}

.media-content {
  flex: 1;
  padding: 32px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h1 {
  margin-bottom: 8px;
  font-size: 24px;
}

.header-left p {
  color: #909399;
}

.filter-bar {
  margin-bottom: 24px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.media-card {
  border-radius: 12px;
  overflow: hidden;
}

.media-thumbnail {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
  cursor: pointer;
}

.media-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.media-thumbnail:hover img {
  transform: scale(1.05);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  color: white;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.visibility-tag {
  position: absolute;
  top: 8px;
  left: 8px;
}

.media-info {
  padding: 12px;
}

.media-name {
  margin: 0 0 4px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-meta {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.media-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 12px 12px;
}

.pagination-wrapper {
  margin-top: 32px;
  text-align: center;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  padding: 40px;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.selected-file {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

@media (max-width: 1024px) {
  .media-sidebar {
    display: none;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .media-content {
    padding: 16px;
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
