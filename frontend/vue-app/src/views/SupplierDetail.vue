<template>
  <div class="supplier-detail-page">
    <!-- 头部返回栏 -->
    <div class="header-bar">
      <button class="back-btn" @click="$router.back()">← 返回列表</button>
      <div class="actions">
        <button class="btn-secondary" @click="editSupplier">✏️ 编辑</button>
        <button class="btn-primary" @click="contactSupplier">📞 联系商家</button>
      </div>
    </div>

    <div v-if="supplier" class="detail-content">
      <!-- 顶部图片画廊 -->
      <div class="gallery-section">
        <div class="main-image">
          <img :src="currentImage || supplier.cover_image_url || '/placeholder-venue.jpg'" :alt="supplier.name" />
          <div class="image-nav" v-if="galleryImages.length > 1">
            <button @click="prevImage">‹</button>
            <span>{{ currentImageIndex + 1 }} / {{ galleryImages.length }}</span>
            <button @click="nextImage">›</button>
          </div>
        </div>
        <div class="thumbnail-list" v-if="galleryImages.length > 1">
          <img 
            v-for="(img, idx) in galleryImages" 
            :key="idx"
            :src="img" 
            :class="{ active: idx === currentImageIndex }"
            @click="selectImage(idx)"
          />
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="info-section">
        <div class="title-row">
          <span class="category-badge">{{ supplier.category_level_1 }}</span>
          <span v-if="supplier.category_level_2" class="sub-category">{{ supplier.category_level_2 }}</span>
        </div>
        
        <h1>{{ supplier.name }}</h1>
        
        <div class="rating-row">
          <span class="stars">{{ '★'.repeat(Math.floor(supplier.rating || 5)) }}</span>
          <span class="rating-text">{{ supplier.rating || 5 }} 分</span>
          <span class="reviews">({{ supplier.review_count || 0 }} 条评价)</span>
          <span :class="['cooperation-badge', supplier.cooperation_status]">{{ supplier.cooperation_status || '正式合作' }}</span>
        </div>

        <div class="location-row">
          <span class="location-icon">📍</span>
          <span>{{ supplier.address || supplier.suburb }}, {{ supplier.city || 'Sydney' }}</span>
          <a v-if="supplier.lat && supplier.lng" 
             :href="`https://maps.google.com/?q=${supplier.lat},${supplier.lng}`" 
             target="_blank"
             class="map-link">查看地图 →</a>
        </div>
      </div>

      <!-- 标签区域 -->
      <div class="tags-section" v-if="supplier.service_tags?.length">
        <h3>服务标签</h3>
        <div class="tags-list">
          <span v-for="tag in supplier.service_tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="tags-section" v-if="supplier.style_tags?.length">
        <h3>风格标签</h3>
        <div class="tags-list">
          <span v-for="tag in supplier.style_tags" :key="tag" class="tag style">{{ tag }}</span>
        </div>
      </div>

      <!-- 关键信息卡片 -->
      <div class="key-info-grid">
        <div class="info-card">
          <div class="label">价格档位</div>
          <div class="value price">{{ formatPrice(supplier.price_level) }}</div>
          <div v-if="supplier.min_order_amount" class="sub">最低 ${{ supplier.min_order_amount }}</div>
        </div>
        
        <div class="info-card">
          <div class="label">容纳人数</div>
          <div class="value">{{ supplier.max_capacity || '不限' }}</div>
          <div class="sub">{{ supplier.max_capacity ? '人' : '' }}</div>
        </div>
        
        <div class="info-card">
          <div class="label">服务范围</div>
          <div class="value">{{ supplier.service_radius_km || 10 }}km</div>
          <div class="sub">半径内</div>
        </div>
        
        <div class="info-card">
          <div class="label">周末服务</div>
          <div class="value">{{ supplier.weekend_available ? '✅ 支持' : '❌ 不支持' }}</div>
          <div v-if="supplier.urgent_order_supported" class="sub urgent">⚡ 支持急单</div>
        </div>
      </div>

      <!-- 营业时间 -->
      <div class="business-hours-section" v-if="supplier.business_hours">
        <h3>营业时间</h3>
        <div class="hours-list">
          <div v-for="(time, day) in formattedBusinessHours" :key="day" class="hour-row">
            <span class="day">{{ day }}</span>
            <span class="time">{{ time }}</span>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="contact-section">
        <h3>联系方式</h3>
        <div class="contact-list">
          <div v-if="supplier.contact_name" class="contact-item">
            <span class="icon">👤</span>
            <span>{{ supplier.contact_name }}</span>
          </div>
          
          <div v-if="supplier.phone" class="contact-item">
            <span class="icon">📞</span>
            <a :href="`tel:${supplier.phone}`">{{ supplier.phone }}</a>
          </div>
          
          <div v-if="supplier.whatsapp" class="contact-item">
            <span class="icon">💬</span>
            <span>WhatsApp: {{ supplier.whatsapp }}</span>
          </div>
          
          <div v-if="supplier.email" class="contact-item">
            <span class="icon">✉️</span>
            <a :href="`mailto:${supplier.email}`">{{ supplier.email }}</a>
          </div>
        </div>
      </div>

      <!-- 资质信息 -->
      <div class="credentials-section">
        <h3>资质信息</h3>
        <div class="credential-list">
          <div class="credential-item">
            <span class="label">保险状态：</span>
            <span :class="['status', supplier.insurance_status]">{{ supplier.insurance_status || '待定' }}</span>
          </div>
          
          <div v-if="supplier.abn" class="credential-item">
            <span class="label">ABN：</span>
            <span>{{ supplier.abn }}</span>
          </div>
          
          <div v-if="supplier.company_name" class="credential-item">
            <span class="label">公司名：</span>
            <span>{{ supplier.company_name }}</span>
          </div>
          
          <div class="credential-item">
            <span class="label">开票支持：</span>
            <span>{{ supplier.invoice_supported ? '✅ 支持' : '❌ 不支持' }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="btn-primary large" @click="requestQuote">
          📋 获取报价方案
        </button>
        <button class="btn-secondary large" @click="addToPlan">
          ➕ 加入派对方案
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else class="loading">
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const supplierId = route.params.id

const supplier = ref(null)
const currentImageIndex = ref(0)

// 画廊图片
const galleryImages = computed(() => {
  const images = []
  if (supplier.value?.cover_image_url) {
    images.push(supplier.value.cover_image_url)
  }
  if (supplier.value?.gallery_images?.length) {
    images.push(...supplier.value.gallery_images)
  }
  // 如果没有图片，使用占位图
  if (images.length === 0) {
    images.push('/placeholder-venue.jpg')
  }
  return images
})

const currentImage = computed(() => galleryImages.value[currentImageIndex.value])

// 格式化营业时间
const formattedBusinessHours = computed(() => {
  if (!supplier.value?.business_hours) return {}
  const days = {
    'mon': '周一',
    'tue': '周二',
    'wed': '周三',
    'thu': '周四',
    'fri': '周五',
    'sat': '周六',
    'sun': '周日'
  }
  const result = {}
  for (const [key, label] of Object.entries(days)) {
    if (supplier.value.business_hours[key]) {
      result[label] = supplier.value.business_hours[key]
    }
  }
  return result
})

// 格式化价格
const formatPrice = (level) => {
  const map = { '低': '$ 经济', '中': '$$ 中等', '高': '$$$ 高端', '豪华': '$$$$ 豪华' }
  return map[level] || level || '未设置'
}

// 图片切换
const selectImage = (idx) => currentImageIndex.value = idx
const prevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}
const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.value.length
}

// 获取供应商详情
const fetchSupplier = async () => {
  try {
    const response = await axios.get(`/api/suppliers/${supplierId}`)
    supplier.value = response.data
  } catch (err) {
    console.error('Failed to fetch supplier:', err)
    // 使用 mock 数据
    supplier.value = getMockSupplier()
  }
}

// Mock 数据
const getMockSupplier = () => ({
  supplier_id: parseInt(supplierId),
  name: '悉尼儿童派对中心 - 北区旗舰店',
  category_level_1: '场地类',
  category_level_2: '儿童乐园',
  contact_name: 'Sarah Chen',
  phone: '0412 345 678',
  whatsapp: '0412 345 678',
  email: 'sarah@kidspartysyd.com',
  address: '123 Miller St, North Sydney',
  suburb: 'North Sydney',
  city: 'Sydney',
  lat: -33.8320,
  lng: 151.2075,
  service_radius_km: 20,
  service_tags: ['生日派对', '儿童友好', '包场', '室内', '主题布置'],
  style_tags: ['现代', '色彩丰富', '安全'],
  price_level: '中',
  min_order_amount: 450,
  max_capacity: 50,
  business_hours: {
    'mon': '9:00-17:00',
    'tue': '9:00-17:00',
    'wed': '9:00-17:00',
    'thu': '9:00-17:00',
    'fri': '9:00-20:00',
    'sat': '9:00-20:00',
    'sun': '10:00-18:00'
  },
  weekend_available: true,
  urgent_order_supported: true,
  insurance_status: '有',
  abn: '12345678901',
  company_name: 'Kids Party Sydney Pty Ltd',
  invoice_supported: true,
  rating: 4.8,
  review_count: 127,
  cooperation_status: '正式合作',
  cover_image_url: 'https://images.unsplash.com/photo-1530103862676-de3c9a59aa38?w=800',
  gallery_images: [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800'
  ],
  notes: '专注儿童派对10年，提供一站式服务'
})

// 操作
const editSupplier = () => {
  router.push(`/admin/suppliers/${supplierId}/edit`)
}

const contactSupplier = () => {
  if (supplier.value?.phone) {
    window.location.href = `tel:${supplier.value.phone}`
  }
}

const requestQuote = () => {
  router.push({
    path: '/quotation',
    query: { supplier_id: supplierId }
  })
}

const addToPlan = () => {
  alert('已添加到派对方案')
}

onMounted(() => {
  fetchSupplier()
})
</script>

<style scoped>
.supplier-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #8b5cf6;
  color: white;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-primary.large, .btn-secondary.large {
  padding: 16px 32px;
  font-size: 16px;
  flex: 1;
}

.gallery-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.main-image {
  position: relative;
  height: 400px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-nav {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0,0,0,0.7);
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
}

.image-nav button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid white;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

.thumbnail-list {
  display: flex;
  gap: 8px;
  padding: 12px;
  overflow-x: auto;
}

.thumbnail-list img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.thumbnail-list img.active {
  opacity: 1;
  border: 2px solid #8b5cf6;
}

.info-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.title-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.category-badge {
  padding: 4px 12px;
  background: #e0e6ff;
  color: #4c51bf;
  border-radius: 20px;
  font-size: 12px;
}

.sub-category {
  padding: 4px 12px;
  background: #f3f4f6;
  color: #666;
  border-radius: 20px;
  font-size: 12px;
}

h1 {
  font-size: 24px;
  margin-bottom: 12px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stars {
  color: #fbbf24;
  font-size: 18px;
}

.rating-text {
  font-weight: 600;
}

.reviews {
  color: #888;
}

.cooperation-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  margin-left: auto;
}

.cooperation-badge.正式合作 {
  background: #d1fae5;
  color: #059669;
}

.cooperation-badge.试合作 {
  background: #fef3c7;
  color: #d97706;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.location-icon {
  font-size: 18px;
}

.map-link {
  margin-left: auto;
  color: #8b5cf6;
  text-decoration: none;
}

.tags-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tags-section h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #666;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 14px;
  background: #f3f4f6;
  border-radius: 20px;
  font-size: 13px;
}

.tag.style {
  background: #ede9fe;
  color: #7c3aed;
}

.key-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.info-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-card .label {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.info-card .value {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.info-card .value.price {
  color: #059669;
}

.info-card .sub {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.info-card .sub.urgent {
  color: #dc2626;
}

.business-hours-section,
.contact-section,
.credentials-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.business-hours-section h3,
.contact-section h3,
.credentials-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #666;
}

.hours-list {
  display: grid;
  gap: 8px;
}

.hour-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.hour-row .day {
  color: #666;
}

.contact-list {
  display: grid;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.contact-item .icon {
  font-size: 20px;
}

.contact-item a {
  color: #8b5cf6;
  text-decoration: none;
}

.credential-list {
  display: grid;
  gap: 12px;
}

.credential-item {
  display: flex;
  gap: 8px;
}

.credential-item .label {
  color: #666;
  min-width: 100px;
}

.status.有 {
  color: #059669;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #888;
}

@media (max-width: 640px) {
  .key-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-section {
    flex-direction: column;
  }
}
</style>
