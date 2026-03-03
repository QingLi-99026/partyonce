<template>
  <div class="template-detail-page">
    <NavHeader />
    
    <div class="detail-container">
      <el-skeleton :rows="10" animated v-if="loading" />
      
      <template v-else>
        <!-- 头部信息 -->
        <div class="detail-header">
          <el-breadcrumb separator="/>"
            <el-breadcrumb-item :to="{ path: '/templates' }">模板库</el-breadcrumb-item>
            <el-breadcrumb-item>{{ template.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="detail-content">
          <!-- 左侧预览 -->
          <div class="preview-section">
            <div class="main-preview">
              <img :src="currentImage || template.cover_image" :alt="template.name" />
            </div>
            
            <div class="thumbnail-list" v-if="template.images?.length > 1">
              <div
                v-for="(img, index) in template.images"
                :key="index"
                class="thumbnail-item"
                :class="{ active: currentImage === img }"
                @click="currentImage = img"
              >
                <img :src="img" />
              </div>
            </div>
          </div>
          
          <!-- 右侧信息 -->
          <div class="info-section">
            <div class="info-header">
              <h1>{{ template.name }}</h1>
              
              <div class="info-tags">
                <el-tag>{{ sceneLabel(template.scene) }}</el-tag>
                <el-tag v-if="template.is_free" type="success">免费</el-tag>
              </div>
            </div>
            
            <div class="budget-info">
              <span class="budget-label">预算区间</span>
              <span class="budget-value">${{ template.budget_min }} - ${{ template.budget_max }}</span>
            </div>
            
            <div class="description">
              <h3>模板简介</h3>
              <p>{{ template.description }}</p>
            </div>
            
            <div class="includes-section">
              <h3>包含内容</h3>
              <ul class="includes-list">
                <li v-for="item in template.includes" :key="item">
                  <el-icon><Check /></el-icon>
                  <span>{{ includeLabel(item) }}</span>
                </li>
              </ul>
            </div>
            
            <div class="action-section">
              <el-button type="primary" size="large" @click="useTemplate">
                <el-icon><Magic /></el-icon>
                使用该模板
              </el-button>
              
              <el-button size="large" @click="viewSimilar">
                <el-icon><View /></el-icon>
                相似模板
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 推荐模板 -->
        <div class="recommend-section" v-if="similarTemplates.length > 0">
          <h2>推荐模板</h2>
          
          <div class="recommend-grid">
            <el-card
              v-for="item in similarTemplates"
              :key="item.id"
              class="recommend-card"
              shadow="hover"
              @click="$router.push(`/templates/${item.id}`)"
            >
              <img :src="item.cover_image" />
              <div class="recommend-info">
                <h4>{{ item.name }}</h4>
                <p>${{ item.budget_min }} - ${{ item.budget_max }}</p>
              </div>
            </el-card>
          </div>
        </div>
      </template>
    </div>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { templateAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const router = useRouter()
const templateId = route.params.id

const loading = ref(true)
const currentImage = ref('')
const template = ref({
  id: '',
  name: '',
  scene: '',
  cover_image: '',
  images: [],
  budget_min: 0,
  budget_max: 0,
  is_free: false,
  description: '',
  includes: []
})
const similarTemplates = ref([])

const sceneLabel = (scene) => {
  const labels = {
    birthday: '生日派对',
    wedding: '婚礼派对',
    corporate: '企业活动',
    baby: '宝宝宴',
    graduation: '毕业派对',
    holiday: '节日派对'
  }
  return labels[scene] || scene
}

const includeLabel = (item) => {
  const labels = {
    venue: '精选场地布置',
    catering: '专业餐饮服务',
    decoration: '精美装饰布置',
    photography: '全程摄影摄像',
    entertainment: '娱乐活动策划'
  }
  return labels[item] || item
}

const useTemplate = () => {
  router.push({
    path: '/ai-planner',
    query: { template: templateId }
  })
}

const viewSimilar = () => {
  router.push({
    path: '/templates',
    query: { scene: template.value.scene }
  })
}

const fetchTemplateDetail = async () => {
  loading.value = true
  try {
    const res = await templateAPI.getTemplate(templateId)
    template.value = res
    currentImage.value = res.cover_image
    similarTemplates.value = res.similar || []
  } catch (error) {
    ElMessage.error('获取模板详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTemplateDetail()
})
</script>

<style scoped>
.template-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 20px;
}

.detail-header {
  margin-bottom: 24px;
}

.detail-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
}

.preview-section {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.main-preview {
  aspect-ratio: 16/10;
  overflow: hidden;
}

.main-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  gap: 12px;
  padding: 16px;
  overflow-x: auto;
}

.thumbnail-item {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.thumbnail-item.active {
  border-color: #409eff;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.info-header {
  margin-bottom: 24px;
}

.info-header h1 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #303133;
}

.info-tags {
  display: flex;
  gap: 8px;
}

.budget-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 12px;
  margin-bottom: 24px;
}

.budget-label {
  color: #606266;
  font-size: 14px;
}

.budget-value {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.description {
  margin-bottom: 24px;
}

.description h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #303133;
}

.description p {
  color: #606266;
  line-height: 1.8;
}

.includes-section {
  margin-bottom: 32px;
}

.includes-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #303133;
}

.includes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.includes-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.includes-list li:last-child {
  border-bottom: none;
}

.includes-list li .el-icon {
  color: #67c23a;
}

.action-section {
  display: flex;
  gap: 16px;
}

.action-section .el-button {
  flex: 1;
}

.recommend-section {
  margin-top: 48px;
}

.recommend-section h2 {
  font-size: 24px;
  margin-bottom: 24px;
  color: #303133;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.recommend-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.recommend-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.recommend-info {
  padding: 16px;
}

.recommend-info h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-info p {
  margin: 0;
  color: #f56c6c;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .recommend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .detail-container {
    padding: 16px;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .recommend-grid {
    grid-template-columns: 1fr;
  }
}
</style>
