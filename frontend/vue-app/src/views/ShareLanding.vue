<template>
  <div class="share-landing-page">
    <!-- 顶部导航 -->
    <header class="landing-header">
      <div class="logo">🎉 PartyOnce</div>
    </header>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="error" class="error">
      <el-result icon="error" title="分享链接失效" sub-title="该分享内容已不存在或已过期">
        <template #extra>
          <el-button type="primary" @click="goHome">去首页看看</el-button>
        </template>
      </el-result>
    </div>

    <template v-else>
      <!-- 内容展示区 -->
      <div class="content-section">
        <!-- 图片轮播 -->
        <div class="image-gallery" v-if="contentImages.length > 0">
          <img :src="contentImages[currentImage]" class="main-image" />
          <div class="image-dots" v-if="contentImages.length > 1">
            <span 
              v-for="(img, idx) in contentImages" 
              :key="idx"
              :class="{ active: currentImage === idx }"
              @click="currentImage = idx"
            />
          </div>
        </div>

        <!-- 内容信息 -->
        <div class="content-info">
          <h1>{{ contentTitle }}</h1>
          
          <div class="content-tags" v-if="contentTags.length > 0">
            <el-tag v-for="tag in contentTags" :key="tag" size="small">{{ tag }}</el-tag>
          </div>

          <p class="content-desc">{{ contentDescription }}</p>

          <div class="content-meta" v-if="contentMeta">
            <div class="meta-item" v-if="contentMeta.budget">
              <span class="meta-label">预算</span>
              <span class="meta-value">{{ contentMeta.budget }}</span>
            </div>
            <div class="meta-item" v-if="contentMeta.people">
              <span class="meta-label">人数</span>
              <span class="meta-value">{{ contentMeta.people }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA区域 -->
      <div class="cta-section">
        <div class="cta-content">
          <h3>想要同款派对？</h3>
          <p>下载PartyOnce APP，一键预约专业策划服务</p>
          
          <div class="cta-buttons">
            <!-- 已安装APP -->
            <el-button 
              v-if="isAppInstalled" 
              type="primary" 
              size="large"
              @click="openApp"
            >
              在APP中打开
            </el-button>

            <!-- 未安装APP -->
            <template v-else>
              <el-button type="primary" size="large" @click="downloadApp">
                📱 下载APP
              </el-button>
              
              <el-button size="large" @click="goHome">
                先浏览网站
              </el-button>
            </template>
          </div>
        </div>

        <!-- 二维码 -->
        <div class="qr-section" v-if="!isAppInstalled">
          <p>扫码下载</p>
          <div class="qr-placeholder">
            <!-- 实际应用中生成二维码 -->
            <div class="qr-code">QR</div>
          </div>
        </div>
      </div>

      <!-- 推荐内容 -->
      <div class="recommend-section" v-if="recommendations.length > 0">
        <h3>更多推荐</h3>
        <div class="recommend-list">
          <div 
            v-for="item in recommendations" 
            :key="item.id"
            class="recommend-item"
            @click="goToShare(item.share_code)"
          >
            <img :src="item.cover" />
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>

      <!-- 页脚 -->
      <footer class="landing-footer">
        <p>© 2026 PartyOnce. All rights reserved.</p>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const shareCode = route.params.share_code

const loading = ref(true)
const error = ref(false)
const isAppInstalled = ref(false)
const currentImage = ref(0)

const contentTitle = ref('')
const contentDescription = ref('')
const contentImages = ref([])
const contentTags = ref([])
const contentMeta = ref({})
const recommendations = ref([])

// 检测是否已安装APP
const checkAppInstalled = () => {
  // 通过尝试打开URL scheme检测
  // 实际实现较复杂，这里简化处理
  const ua = navigator.userAgent.toLowerCase()
  // 如果是从APP内嵌浏览器打开，则认为已安装
  isAppInstalled.value = ua.includes('partyonce') || false
}

const fetchShareContent = async () => {
  try {
    const response = await fetch(`/s/${shareCode}`)
    
    if (!response.ok) {
      error.value = true
      return
    }
    
    const data = await response.json()
    
    // 解析内容
    const content = data.content || {}
    contentTitle.value = content.name || content.template_name || '精彩派对案例'
    contentDescription.value = content.description || '来看看这个精心策划的派对方案吧！'
    contentImages.value = content.cover_url ? [content.cover_url] : ['/placeholder.jpg']
    contentTags.value = [content.scene_type || '派对'].filter(Boolean)
    contentMeta.value = {
      budget: content.budget_min ? `$${content.budget_min} - $${content.budget_max}` : null,
      people: content.default_guest_count ? `${content.default_guest_count}人` : null
    }
  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const openApp = () => {
  // 打开APP的deeplink
  window.location.href = `partyonce://share/${shareCode}`
}

const downloadApp = () => {
  // 跳转下载页面
  window.location.href = 'https://partyonce.au/download'
}

const goHome = () => {
  router.push('/')
}

const goToShare = (code) => {
  window.location.href = `/s/${code}`
}

onMounted(() => {
  checkAppInstalled()
  fetchShareContent()
})
</script>

<style scoped>
.share-landing-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.landing-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
  text-align: center;
}

.logo {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.loading, .error {
  padding: 100px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.content-section {
  background: white;
  padding: 20px;
}

.image-gallery {
  position: relative;
  margin-bottom: 20px;
}

.main-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
}

.image-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.image-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dcdfe6;
  cursor: pointer;
}

.image-dots span.active {
  background: #409eff;
}

.content-info h1 {
  font-size: 24px;
  margin-bottom: 12px;
}

.content-tags {
  margin-bottom: 12px;
}

.content-tags .el-tag {
  margin-right: 8px;
}

.content-desc {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
}

.content-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  color: #909399;
  font-size: 12px;
}

.meta-value {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.cta-section {
  background: white;
  margin: 12px 0;
  padding: 30px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cta-content h3 {
  margin: 0 0 8px;
}

.cta-content p {
  color: #909399;
  margin: 0 0 20px;
}

.cta-buttons {
  display: flex;
  gap: 12px;
}

.qr-section {
  text-align: center;
}

.qr-section p {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
}

.qr-code {
  width: 100px;
  height: 100px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 12px;
  color: #909399;
}

.recommend-section {
  background: white;
  padding: 20px;
  margin-bottom: 12px;
}

.recommend-section h3 {
  margin-bottom: 16px;
}

.recommend-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.recommend-item {
  flex-shrink: 0;
  width: 120px;
  text-align: center;
  cursor: pointer;
}

.recommend-item img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.recommend-item span {
  font-size: 12px;
  color: #606266;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.landing-footer {
  background: white;
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}

@media (max-width: 768px) {
  .cta-section {
    flex-direction: column;
    text-align: center;
  }
  
  .qr-section {
    margin-top: 20px;
  }
}
</style>
