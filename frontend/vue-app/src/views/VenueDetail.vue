<template>
  <div v-if="venue" class="venue-detail-page">
    <!-- Image Gallery -->
    <div class="image-gallery">
      <div class="main-image">
        <img :src="currentImage || venue.images?.[0]" :alt="venue.name">
      </div>
      <div class="thumbnail-list">
        <img
          v-for="(img, idx) in venue.images || []"
          :key="idx"
          :src="img"
          :class="{ active: currentImage === img }"
          @click="currentImage = img"
        >
      </div>
    </div>

    <div class="detail-container">
      <!-- Main Info -->
      <div class="main-info">
        <div class="venue-header">
          <div class="title-section">
            <h1>{{ venue.name }}</h1>
            <div class="badges">
              <el-tag v-if="venue.venue_type">{{ venue.venue_type }}</el-tag>
              <el-tag v-if="venue.is_partner" type="success">合作伙伴</el-tag>
              <el-tag v-if="venue.discount_rate" type="warning">{{ (venue.discount_rate * 100).toFixed(0) }}% 优惠</el-tag>
            </div>
          </div>
          <el-rate v-model="venueRating" disabled show-score />
        </div>

        <div class="info-section">
          <h3>场地介绍</h3>
          <p>{{ venue.description }}</p>
        </div>

        <div class="info-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="地址">
              <el-icon><Location /></el-icon>
              {{ venue.address }}, {{ venue.city }}, {{ venue.postcode }}
            </el-descriptions-item>
            <el-descriptions-item label="容纳人数">
              <el-icon><User /></el-icon> {{ venue.capacity }} 人
            </el-descriptions-item>
            <el-descriptions-item label="场地类型">{{ venue.venue_type }}</el-descriptions-item>
            <el-descriptions-item label="价格区间">{{ venue.price_range }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="info-section">
          <h3>设施服务</h3>
          <div class="amenities-list">
            <div v-for="amenity in venue.amenities || []" :key="amenity" class="amenity-item">
              <el-icon><Check /></el-icon>
              <span>{{ amenity }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>位置地图</h3>
          <div class="map-placeholder">
            <el-icon><MapLocation /></el-icon>
            <p>地图加载中... ({{ venue.latitude }}, {{ venue.longitude }})</p>
          </div>
        </div>
      </div>

      <!-- Booking Sidebar -->
      <aside class="booking-sidebar">
        <div class="price-card">
          <div class="price-display">
            <span class="currency">$</span>
            <span class="amount">{{ venue.regular_price }}</span>
            <span class="unit">/起</span>
          </div>
          
          <div v-if="venue.is_partner" class="discount-info">
            <el-tag type="success" size="small"><el-icon><Discount /></el-icon> 合作伙伴优惠 {{ (venue.discount_rate * 100).toFixed(0) }}%</el-tag>
          </div>
          
          <el-divider />
          
          <div class="booking-form">
            <el-form label-position="top">
              <el-form-item label="活动日期">
                <el-date-picker
                  v-model="bookingForm.date"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
              
              <el-form-item label="预计人数">
                <el-input-number
                  v-model="bookingForm.guestCount"
                  :min="10"
                  :max="venue.capacity"
                  style="width: 100%"
                />
              </el-form-item>
              
              <el-form-item label="联系人姓名">
                <el-input v-model="bookingForm.contactName" placeholder="请输入姓名" />
              </el-form-item>
              
              <el-form-item label="联系电话">
                <el-input v-model="bookingForm.contactPhone" placeholder="请输入电话" />
              </el-form-item>
              
              <el-form-item label="备注需求">
                <el-input
                  v-model="bookingForm.notes"
                  type="textarea"
                  rows="3"
                  placeholder="请描述您的特殊需求..."
                />
              </el-form-item>
            </el-form>
            
            <el-button type="primary" size="large" style="width: 100%" @click="handleBooking">
              立即预订
            </el-button>
            
            <el-button size="large" style="width: 100%; margin-top: 12px" @click="handleQuote">
              获取报价
            </el-button>
          </div>
        </div>

        <div class="contact-card">
          <h4>联系场地</h4>
          <p><el-icon><Phone /></el-icon> {{ venue.contact_phone }}</p>
          <p><el-icon><Message /></el-icon> {{ venue.contact_email }}</p>
          <p v-if="venue.website"><el-icon><Link /></el-icon> <a :href="venue.website" target="_blank">访问官网</a></p>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="loading-container">
    <el-skeleton :rows="10" animated />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Location, User, Check, MapLocation, Discount, Phone, Message, Link } from '@element-plus/icons-vue'
import { venueAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const venue = ref(null)
const currentImage = ref('')
const venueRating = ref(4.5)

const bookingForm = ref({
  date: '',
  guestCount: 50,
  contactName: '',
  contactPhone: '',
  notes: ''
})

const fetchVenueDetail = async () => {
  try {
    const data = await venueAPI.getVenue(route.params.id)
    venue.value = { ...data, rating: 4.5 }
    currentImage.value = venue.value.images?.[0] || ''
  } catch (error) {
    // 使用模拟数据
    venue.value = {
      id: route.params.id,
      name: '云端宴会厅',
      address: '123 市中心大道',
      city: '悉尼',
      postcode: '2000',
      venue_type: '酒店宴会厅',
      capacity: 200,
      regular_price: 2500,
      price_range: '高',
      is_partner: true,
      discount_rate: 0.15,
      description: '云端宴会厅位于悉尼市中心，拥有无柱式设计，可容纳200人。配备顶级音响灯光系统，专业舞台，是举办婚礼、企业年会、生日派对的理想场所。场地提供一站式策划服务，让您的派对省心省力。',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'
      ],
      amenities: ['免费WiFi', '停车位', '餐饮配套', '专业音响', 'LED大屏', '舞台灯光', '化妆间', 'VIP休息室'],
      latitude: -33.8688,
      longitude: 151.2093,
      contact_phone: '+61 2 1234 5678',
      contact_email: 'events@cloudbanquet.com',
      website: 'https://example.com'
    }
    currentImage.value = venue.value.images[0]
  }
}

const handleBooking = () => {
  if (!bookingForm.value.date) {
    ElMessage.warning('请选择活动日期')
    return
  }
  if (!bookingForm.value.contactName || !bookingForm.value.contactPhone) {
    ElMessage.warning('请填写联系人信息')
    return
  }
  ElMessage.success('预订申请已提交，我们将尽快联系您')
}

const handleQuote = () => {
  router.push('/quotation')
}

onMounted(fetchVenueDetail)
</script>

<style scoped>
.venue-detail-page {
  padding-bottom: 60px;
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.image-gallery {
  background: #000;
}

.main-image {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumbnail-list {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: #1a1a1a;
  overflow-x: auto;
}

.thumbnail-list img {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s;
}

.thumbnail-list img:hover,
.thumbnail-list img.active {
  opacity: 1;
  box-shadow: 0 0 0 2px #409EFF;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;
}

.main-info {
  min-width: 0;
}

.venue-header {
  margin-bottom: 30px;
}

.title-section h1 {
  font-size: 32px;
  margin-bottom: 12px;
}

.badges {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.info-section {
  margin-bottom: 40px;
}

.info-section h3 {
  font-size: 20px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409EFF;
  display: inline-block;
}

.info-section p {
  line-height: 1.8;
  color: #606266;
}

.amenities-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.amenity-item .el-icon {
  color: #67c23a;
}

.map-placeholder {
  height: 300px;
  background: #f5f7fa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.map-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.booking-sidebar {
  position: sticky;
  top: 84px;
  height: fit-content;
}

.price-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.price-display {
  margin-bottom: 12px;
}

.price-display .currency {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.price-display .amount {
  font-size: 36px;
  font-weight: bold;
  color: #f56c6c;
}

.price-display .unit {
  font-size: 14px;
  color: #909399;
}

.discount-info {
  margin-bottom: 8px;
}

.contact-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.contact-card h4 {
  margin-bottom: 16px;
  font-size: 16px;
}

.contact-card p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #606266;
}

.contact-card a {
  color: #409EFF;
  text-decoration: none;
}

@media (max-width: 1024px) {
  .detail-container {
    grid-template-columns: 1fr;
  }
  
  .booking-sidebar {
    position: static;
  }
}
</style>