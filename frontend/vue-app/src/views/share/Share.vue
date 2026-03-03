<template>
  <div class="share-page" :class="{ 'mobile': isMobile }">
    <!-- 顶部装饰 -->
    <div class="share-header">
      <div class="decoration"></div>
    </div>
    
    <div class="share-container">
      <!-- 活动信息 -->
      <div class="event-info" v-if="event">
        <div class="event-title">
          <span class="label">精彩派对</span>
          <h1>{{ event.name }}</h1>
        </div>
        
        <div class="event-meta" v-if="event.event_date">
          <el-icon><Calendar /></el-icon>
          <span>{{ formatDate(event.event_date) }}</span>
        </div>
      </div>
      
      <!-- 图片展示 -->
      <div class="gallery-section">
        <div class="main-image" v-if="images.length > 0">
          <img :src="currentImage" @click="showPreview = true" />
        </div>
        
        <div class="thumbnail-scroll" v-if="images.length > 1">
          <div
            v-for="(img, index) in images"
            :key="index"
            class="thumb-item"
            :class="{ active: currentImageIndex === index }"
            @click="currentImageIndex = index"
          >
            <img :src="img" />
          </div>
        </div>
      </div>
      
      <!-- 描述 -->
      <div class="description-section" v-if="event?.description">
        <p>{{ event.description }}</p>
      </div>
      
      <!-- CTA区域 -->
      <div class="cta-section">
        <p class="cta-text">想要拥有同款精彩派对？</p>
        
        <div class="cta-buttons">
          <el-button
            type="primary"
            size="large"
            round
            class="download-btn"
            @click="downloadApp"
          >
            <el-icon><Download /></el-icon>
            下载 PartyOnce APP
          </el-button>
          
          <el-button
            size="large"
            round
            class="open-btn"
            @click="openApp"
          >
            <el-icon><Link /></el-icon>
            打开 APP
          </el-button>
        </div>
      </div>
      
      <!-- 品牌标识 -->
      <div class="brand-section">
        <div class="brand-logo">
          <span>PartyOnce</span>
        </div>
        <p class="brand-slogan">让每一个派对都独一无二</p>
      </div>
    </div>
    
    <!-- 图片预览 -->
    <el-dialog
      v-model="showPreview"
      width="100%"
      :show-close="false"
      :fullscreen="isMobile"
      class="preview-dialog"
    >
      <div class="preview-container">
        <img :src="currentImage" />
        
        <div class="preview-nav">
          <button class="nav-btn" @click="prevImage" :disabled="currentImageIndex === 0">
            <el-icon><ArrowLeft /></el-icon>
          </button>
          
          <span class="image-counter">{{ currentImageIndex + 1 }} / {{ images.length }}</span>
          
          <button class="nav-btn" @click="nextImage" :disabled="currentImageIndex === images.length - 1">
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
        
        <button class="close-btn" @click="showPreview = false">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { shareAPI } from '@/api/modules'

const route = useRoute()
const shareCode = route.params.share_code

const loading = ref(true)
const showPreview = ref(false)
const currentImageIndex = ref(0)
const isMobile = ref(false)

const event = ref(null)
const images = ref([])

const currentImage = computed(() => {
  return images.value[currentImageIndex.value] || ''
})

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

const nextImage = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const downloadApp = () => {
  // 记录点击事件
  shareAPI.recordClick(shareCode, { type: 'download' })
  
  // 判断平台
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) {
    // iOS App Store
    window.location.href = 'https://apps.apple.com/app/partynce'
  } else if (/android/.test(ua)) {
    // Google Play
    window.location.href = 'https://play.google.com/store/apps/details?id=com.partynce.app'
  } else {
    // 官网下载页
    window.location.href = '/download'
  }
}

const openApp = () => {
  // 记录点击事件
  shareAPI.recordClick(shareCode, { type: 'open_app' })
  
  // 尝试打开APP
  const scheme = `partynce://share/${shareCode}`
  
  // 使用iframe尝试打开scheme
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = scheme
  document.body.appendChild(iframe)
  
  // 超时后跳转到下载页
  setTimeout(() => {
    document.body.removeChild(iframe)
    ElMessage.info('请先下载 PartyOnce APP')
  }, 2000)
}

const fetchShareData = async () => {
  loading.value = true
  try {
    const res = await shareAPI.getShareData(shareCode)
    event.value = res.event
    images.value = res.images || []
    
    // 记录浏览事件
    shareAPI.recordClick(shareCode, { type: 'view' })
  } catch (error) {
    ElMessage.error('分享内容不存在或已过期')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 检测设备类型
  isMobile.value = /mobile|android|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
  
  fetchShareData()
})
</script>

<style scoped>
.share-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.share-header {
  position: relative;
  height: 200px;
}

.decoration {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.share-container {
  max-width: 600px;
  margin: -100px auto 0;
  padding: 0 20px 40px;
  position: relative;
  z-index: 1;
}

.event-info {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px 20px 0 0;
  padding: 32px;
  text-align: center;
}

.event-title .label {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 12px;
}

.event-title h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.event-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  color: #606266;
  font-size: 14px;
}

.gallery-section {
  background: #fff;
  padding: 20px;
}

.main-image {
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 1;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
}

.thumbnail-scroll {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.thumb-item {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.thumb-item.active {
  border-color: #667eea;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.description-section {
  background: #fff;
  padding: 20px 32px;
  border-top: 1px solid #ebeef5;
}

.description-section p {
  margin: 0;
  color: #606266;
  line-height: 1.8;
  text-align: center;
}

.cta-section {
  background: #fff;
  padding: 32px;
  text-align: center;
  border-radius: 0 0 20px 20px;
}

.cta-text {
  color: #303133;
  font-size: 16px;
  margin-bottom: 20px;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.download-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.open-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.brand-section {
  text-align: center;
  padding: 40px 20px;
  color: white;
}

.brand-logo {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.brand-slogan {
  font-size: 14px;
  opacity: 0.8;
}

/* 预览弹窗样式 */
.preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.preview-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background: #000;
}

.preview-container img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.4);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-counter {
  color: white;
  font-size: 14px;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* 移动端优化 */
.mobile .share-container {
  margin-top: -80px;
  padding: 0 16px 32px;
}

.mobile .event-info {
  padding: 24px;
}

.mobile .event-title h1 {
  font-size: 20px;
}

.mobile .cta-section {
  padding: 24px;
}

@media (max-width: 480px) {
  .share-header {
    height: 150px;
  }
  
  .decoration {
    width: 300px;
    height: 300px;
  }
}
</style>
