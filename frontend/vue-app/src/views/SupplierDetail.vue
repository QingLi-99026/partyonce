<template>
  <div class="supplier-detail-page">
    <div class="header-bar">
      <button class="back-btn" @click="$router.back()">← 返回列表</button>
      <div class="actions">
        <button class="btn-secondary" @click="editSupplier">✏️ 编辑</button>
        <button class="btn-primary" @click="contactSupplier">📞 联系商家</button>
      </div>
    </div>

    <div v-if="supplier" class="detail-content">
      <!-- 图片画廊 -->
      <div class="gallery-section">
        <div class="main-image">
          <img :src="currentImage || supplier.cover_image_url || '/placeholder-venue.jpg'" :alt="supplier.name" />
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="info-section">
        <div class="title-row">
          <span class="category-badge">{{ supplier.category_level_1 }}</span>
        </div>
        
        <h1>{{ supplier.name }}</h1>
        
        <div class="rating-row">
          <span class="stars">★★★★★</span>
          <span class="rating-text">{{ supplier.rating || 5 }} 分</span>
          <span class="reviews">({{ supplier.review_count || 0 }} 条评价)</span>
        </div>

        <div class="location-row">
          <span>📍 {{ supplier.suburb }}, {{ supplier.city || 'Sydney' }}</span>
        </div>
      </div>

      <!-- 关键信息卡片 -->
      <div class="key-info-grid">
        <div class="info-card">
          <div class="label">价格档位</div>
          <div class="value price">{{ supplier.price_level || '中' }}</div>
        </div>
        
        <div class="info-card">
          <div class="label">容纳人数</div>
          <div class="value">{{ supplier.max_capacity || '不限' }}</div>
        </div>
        
        <div class="info-card">
          <div class="label">服务半径</div>
          <div class="value">{{ supplier.service_radius_km || 10 }}km</div>
        </div>
        
        <div class="info-card">
          <div class="label">周末服务</div>
          <div class="value">{{ supplier.weekend_available ? '✅ 支持' : '❌ 不支持' }}</div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="contact-section">
        <h3>联系方式</h3>
        <div class="contact-list">
          <div class="contact-item">
            <span class="label">联系人：</span>
            <span class="value">{{ supplier.contact_name || '-' }}</span>
          </div>
          
          <div class="contact-item">
            <span class="label">电话：</span>
            <span class="value">{{ supplier.phone || '-' }}</span>
          </div>
          
          <div class="contact-item">
            <span class="label">邮箱：</span>
            <span class="value">{{ supplier.email || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="btn-primary large" @click="requestQuote">📋 获取报价方案</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const supplier = ref({
  name: '悉尼儿童派对中心',
  category_level_1: '场地类',
  suburb: 'North Sydney',
  city: 'Sydney',
  rating: 4.8,
  review_count: 127,
  price_level: '中',
  max_capacity: 50,
  service_radius_km: 20,
  weekend_available: true,
  contact_name: 'Sarah Chen',
  phone: '0412 345 678',
  email: 'sarah@kidsparty.com',
  cover_image_url: 'https://images.unsplash.com/photo-1530103862676-de3c9a59aa38?w=800'
})

const currentImage = ref('')

const editSupplier = () => router.push('/admin/suppliers/1/edit')
const contactSupplier = () => {}
const requestQuote = () => router.push('/quotation')
</script>

<style scoped>
.supplier-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  min-height: 100vh;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #333333;
}

.back-btn {
  padding: 12px 20px;
  background: #f0f0f0;
  border: 2px solid #333333;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  color: #000000;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  border: 2px solid #333333;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
}

.btn-primary {
  background: #7c3aed;
  color: #ffffff;
  border-color: #5b21b6;
}

.btn-secondary {
  background: #f0f0f0;
  color: #000000;
}

.btn-primary.large {
  padding: 18px 36px;
  font-size: 17px;
  width: 100%;
}

/* 图片区 */
.gallery-section {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  border: 3px solid #333333;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.main-image {
  height: 400px;
  background: #e0e0e0;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 信息区 */
.info-section {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 3px solid #333333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.title-row {
  margin-bottom: 12px;
}

.category-badge {
  padding: 6px 14px;
  background: #7c3aed;
  color: #ffffff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 800;
  border: 2px solid #5b21b6;
}

h1 {
  font-size: 26px;
  font-weight: 800;
  color: #000000;
  margin-bottom: 16px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.stars {
  color: #f59e0b;
  font-size: 20px;
  font-weight: 800;
}

.rating-text {
  font-weight: 800;
  font-size: 16px;
  color: #000000;
}

.reviews {
  color: #555555;
  font-weight: 700;
}

.location-row {
  font-size: 16px;
  color: #333333;
  font-weight: 700;
}

/* 信息卡片网格 */
.key-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  border: 3px solid #333333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.info-card .label {
  font-size: 13px;
  color: #555555;
  margin-bottom: 10px;
  font-weight: 700;
}

.info-card .value {
  font-size: 22px;
  font-weight: 800;
  color: #000000;
}

.info-card .value.price {
  color: #059669;
}

/* 联系方式区 */
.contact-section {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 3px solid #333333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.contact-section h3 {
  font-size: 18px;
  font-weight: 800;
  color: #000000;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.contact-list {
  display: grid;
  gap: 14px;
}

.contact-item {
  display: flex;
  padding: 14px;
  background: #f8f8f8;
  border-radius: 8px;
  border: 2px solid #d0d0d0;
}

.contact-item .label {
  font-weight: 800;
  color: #555555;
  min-width: 80px;
}

.contact-item .value {
  font-weight: 700;
  color: #000000;
}

/* 操作区 */
.action-section {
  margin-top: 32px;
}

@media (max-width: 640px) {
  .key-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
