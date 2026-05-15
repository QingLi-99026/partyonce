<template>
  <div class="venues-page">
    <!-- Search Header -->
    <div class="search-header">
      <div class="search-content">
        <h1>{{ t('venues.title') }}</h1>
        <p>{{ t('venues.subtitle') }}</p>
        
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            :placeholder="t('venues.searchPlaceholder')"
            size="large"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">{{ t('venues.search') }}</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <div class="venues-container">
      <!-- Filter Sidebar -->
      <aside class="filter-sidebar">
        <div class="filter-section">
          <h3>{{ t('venues.filters') }}</h3>
          
          <div class="filter-group">
            <label>{{ t('venues.city') }}</label>
            <el-select v-model="filters.city" :placeholder="t('venues.selectCity')" clearable @change="applyFilters">
              <el-option :label="t('venues.cities.sydney')" value="悉尼" />
              <el-option :label="t('venues.cities.melbourne')" value="墨尔本" />
              <el-option :label="t('venues.cities.brisbane')" value="布里斯班" />
              <el-option :label="t('venues.cities.perth')" value="珀斯" />
              <el-option :label="t('venues.cities.adelaide')" value="阿德莱德" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label>{{ t('venues.venueType') }}</label>
            <el-select v-model="filters.venueType" :placeholder="t('venues.selectType')" clearable @change="applyFilters">
              <el-option :label="t('venues.types.hotel')" value="hotel" />
              <el-option :label="t('venues.types.club')" value="club" />
              <el-option :label="t('venues.types.garden')" value="garden" />
              <el-option :label="t('venues.types.art')" value="art" />
              <el-option :label="t('venues.types.restaurant')" value="restaurant" />
              <el-option :label="t('venues.types.rooftop')" value="rooftop" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label>{{ t('venues.capacity') }}</label>
            <el-slider v-model="filters.capacity" range :max="500" @change="applyFilters" />
            <div class="range-label">{{ filters.capacity[0] }} - {{ filters.capacity[1] }} {{ t('venues.people') }}</div>
          </div>
          
          <div class="filter-group">
            <el-checkbox v-model="filters.partnerOnly" @change="applyFilters">
              {{ t('venues.partnerOnly') }}
            </el-checkbox>
          </div>
        </div>
        
        <div class="filter-section">
          <h3>{{ t('venues.amenities') }}</h3>
          <el-checkbox-group v-model="filters.amenities" @change="applyFilters">
            <el-checkbox label="wifi">WiFi</el-checkbox>
            <el-checkbox label="parking">{{ t('venues.amenityLabels.parking') }}</el-checkbox>
            <el-checkbox label="catering">{{ t('venues.amenityLabels.catering') }}</el-checkbox>
            <el-checkbox label="audio">{{ t('venues.amenityLabels.audio') }}</el-checkbox>
            <el-checkbox label="projector">{{ t('venues.amenityLabels.projector') }}</el-checkbox>
            <el-checkbox label="bar">{{ t('venues.amenityLabels.bar') }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </aside>

      <!-- Venue List -->
      <div class="venues-content">
        <div class="venues-toolbar">
          <span>{{ t('venues.foundPrefix') }} {{ filteredVenues.length }} {{ t('venues.foundSuffix') }}</span>
          <el-radio-group v-model="sortBy" size="small" @change="handleSort">
            <el-radio-button label="default">{{ t('venues.sortDefault') }}</el-radio-button>
            <el-radio-button label="price-asc">{{ t('venues.sortPriceAsc') }}</el-radio-button>
            <el-radio-button label="price-desc">{{ t('venues.sortPriceDesc') }}</el-radio-button>
            <el-radio-button label="capacity">{{ t('venues.sortCapacity') }}</el-radio-button>
          </el-radio-group>
        </div>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="6" animated />
        </div>

        <EmptyState
          v-else-if="filteredVenues.length === 0"
          :title="t('venues.emptyTitle')"
          :description="t('venues.emptyDescription')"
          :show-example="true"
          :primary-text="t('venues.viewAll')"
          :secondary-text="t('venues.loadDemo')"
          :tip="t('venues.emptyTip')"
          @primary="clearAllFilters"
          @secondary="loadDemoVenues"
        >
          <template #icon>
            <div style="font-size: 64px">🏢</div>
          </template>
          <template #example>
            <div class="venue-preview-example">
              <div class="venue-image-placeholder"></div>
              <div class="venue-info-placeholder">
                <div class="venue-name">{{ t('venues.sampleVenueName') }}</div>
                <div class="venue-meta">{{ t('venues.cities.sydney') }} · 200 {{ t('venues.people') }}</div>
              </div>
            </div>
          </template>
        </EmptyState>

        <div v-else class="venues-list">
          <div
            v-for="venue in paginatedVenues"
            :key="venue.id"
            class="venue-item"
            @click="$router.push(`/venues/${venue.id}`)"
          >
            <div class="venue-image">
              <img v-if="isChineseLocale" :src="venue.images?.[0] || venue.image_path || 'https://via.placeholder.com/300x200'" :alt="displayVenueName(venue)">
              <div v-else class="venue-english-placeholder">
                <span>🏛️</span>
                <strong>{{ displayVenueName(venue) }}</strong>
              </div>
              <div v-if="venue.is_partner" class="partner-tag">{{ t('venues.partner') }}</div>
            </div>
            
            <div class="venue-details">
              <div class="venue-header">
                <h3>{{ displayVenueName(venue) }}</h3>
                <el-rate v-model="venue.rating" disabled show-score text-color="#ff9900" />
              </div>
              
              <p class="venue-address"><el-icon><Location /></el-icon>{{ displayVenueAddress(venue) }}, {{ displayCity(venue.city) }}</p>
              
              <div class="venue-tags">
                <el-tag v-if="venue.venue_type" size="small">{{ displayVenueType(venue.venue_type) }}</el-tag>
                <el-tag v-if="venue.capacity" size="small" type="success">{{ venue.capacity }} {{ t('venues.people') }}</el-tag>
                <el-tag v-if="venue.is_partner" size="small" type="warning">{{ (venue.discount_rate * 100).toFixed(0) }}% {{ t('venues.discount') }}</el-tag>
                <el-tag v-for="theme in venue.themeFit || []" :key="theme" size="small" type="info">{{ theme }}</el-tag>
              </div>
              
              <p class="venue-desc">{{ displayVenueDescription(venue) }}</p>
              <p v-if="displayRecommendationBasis(venue)" class="venue-basis">{{ displayRecommendationBasis(venue) }}</p>
              
              <div class="venue-footer">
                <div class="venue-price">
                  <span class="price">${{ venue.regular_price || 0 }}</span>
                  <span class="unit">/{{ t('venues.from') }}</span>
                </div>
                <el-button type="primary" size="small">{{ t('venues.viewDetails') }}</el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredVenues.length > 0" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="filteredVenues.length"
            :page-sizes="[8, 16, 24]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Location } from '@element-plus/icons-vue'
import { venueAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import EmptyState from '../components/EmptyState.vue'
import { venueDisplaySeeds } from '@/data/visualAssets'

const { t, locale } = useI18n()
const loading = ref(false)
const searchQuery = ref('')
const venues = ref([])
const currentPage = ref(1)
const pageSize = ref(8)
const sortBy = ref('default')

const filters = ref({
  city: '',
  venueType: '',
  capacity: [0, 500],
  partnerOnly: false,
  amenities: []
})

const isChineseLocale = computed(() => locale.value === 'zh')

// 获取场地列表
const fetchVenues = async () => {
  loading.value = true
  try {
    if (import.meta.env.VITE_VENUE_REMOTE_API !== 'true') {
      venues.value = getMockVenues()
      return
    }
    const params = {}
    if (filters.value.city) params.city = filters.value.city
    if (filters.value.venueType) params.venue_type = filters.value.venueType
    if (filters.value.partnerOnly) params.partner_only = true
    
    const data = await venueAPI.getVenues(params)
    venues.value = data.map(v => ({ ...v, rating: 4.5 }))
  } catch (error) {
    ElMessage.error(t('venues.loadFailed'))
    // 使用模拟数据
    venues.value = getMockVenues()
  } finally {
    loading.value = false
  }
}

// 模拟数据
const getMockVenues = () => {
  const localVenueImages = [
    '/party-assets/venues/restaurant-a/restaurant-a-original.png',
    '/party-assets/venues/restaurant-a/restaurant-a-castle-standard.png',
    '/party-assets/venues/restaurant-a/restaurant-a-space-standard.png',
    '/party-assets/venues/restaurant-a/restaurant-a-forest-standard.png',
    '/party-assets/venues/restaurant-a/restaurant-a-castle-premium.png',
    '/party-assets/venues/restaurant-a/restaurant-a-space-premium.png'
  ]
  const visualVenues = venueDisplaySeeds.map((venue, index) => ({
    id: venue.id,
    name: venue.name,
    address: index === 0 ? 'Restaurant A demo district' : 'Local/staging demo address',
    city: '悉尼',
    venue_type: venue.type,
    capacity: Number(String(venue.capacity).match(/\d+/g)?.at(-1) || 28),
    regular_price: Number(String(venue.priceRange).match(/\d+/g)?.[0] || 900),
    is_partner: true,
    discount_rate: 0.1,
    description: `${venue.note} · ${venue.tables} · ${venue.chairs}`,
    images: [venue.image_path],
    image_path: venue.image_path,
    rating: 4.7,
    themeFit: venue.themeFit,
    recommendationBasis: venue.aiRecommendationRole
  }))
  return [
    ...visualVenues,
    { id: 1, name: '云端宴会厅', address: '123 市中心大道', city: '悉尼', venue_type: '酒店宴会厅', capacity: 200, regular_price: 2500, is_partner: true, discount_rate: 0.15, description: '豪华宴会厅，配备顶级音响灯光系统', images: [localVenueImages[0]], rating: 4.8 },
    { id: 2, name: '海景花园会所', address: '456 海滨路', city: '墨尔本', venue_type: '私人会所', capacity: 150, regular_price: 1800, is_partner: false, description: '私家花园，尽享海景', images: [localVenueImages[1]], rating: 4.6 },
    { id: 3, name: '星空露台', address: '789 高楼路', city: '布里斯班', venue_type: '屋顶露台', capacity: 80, regular_price: 1200, is_partner: true, discount_rate: 0.10, description: '城市夜景尽收眼底', images: [localVenueImages[2]], rating: 4.5 },
    { id: 4, name: '艺术中心', address: '321 文化街', city: '悉尼', venue_type: '艺术空间', capacity: 300, regular_price: 3500, is_partner: false, description: '工业风格艺术空间', images: [localVenueImages[3]], rating: 4.7 },
    { id: 5, name: '绿茵庄园', address: '654 郊区大道', city: '墨尔本', venue_type: '户外花园', capacity: 250, regular_price: 2200, is_partner: true, discount_rate: 0.20, description: '占地5000平的私人庄园', images: [localVenueImages[4]], rating: 4.9 },
    { id: 6, name: '都市酒廊', address: '987 商业街', city: '悉尼', venue_type: '餐厅包场', capacity: 100, regular_price: 1500, is_partner: false, description: '时尚现代的私人酒廊', images: [localVenueImages[5]], rating: 4.4 }
  ]
}

const cityLabels = {
  悉尼: 'sydney',
  墨尔本: 'melbourne',
  布里斯班: 'brisbane',
  珀斯: 'perth',
  阿德莱德: 'adelaide'
}

const venueTypeLabels = {
  酒店宴会厅: 'hotel',
  私人会所: 'club',
  户外花园: 'garden',
  艺术空间: 'art',
  餐厅包场: 'restaurant',
  屋顶露台: 'rooftop',
  restaurant: 'restaurant',
  hotel: 'hotel',
  club: 'club',
  garden: 'garden',
  art: 'art',
  rooftop: 'rooftop'
}

const englishVenueNames = {
  云端宴会厅: 'Cloud Banquet Hall',
  海景花园会所: 'Seaview Garden Club',
  星空露台: 'Skyline Rooftop',
  艺术中心: 'Art Centre',
  绿茵庄园: 'Green Lawn Estate',
  都市酒廊: 'Urban Lounge'
}

function displayCity(city) {
  if (isChineseLocale.value) return city
  const key = cityLabels[city]
  return key ? t(`venues.cities.${key}`) : city
}

function displayVenueType(type) {
  if (isChineseLocale.value) return type
  const key = venueTypeLabels[type]
  return key ? t(`venues.types.${key}`) : type
}

function displayVenueName(venue) {
  if (isChineseLocale.value) return venue.name
  if (englishVenueNames[venue.name]) return englishVenueNames[venue.name]
  if (String(venue.id || '').includes('restaurant-a')) return 'Restaurant A Demo Dining Room'
  return venue.nameEn || venue.name || t('venues.sampleVenueName')
}

function displayVenueAddress(venue) {
  if (isChineseLocale.value) return venue.address
  if (String(venue.address || '').includes('市中心')) return '123 City Centre Avenue'
  if (String(venue.address || '').includes('海滨')) return '456 Seaside Road'
  if (String(venue.address || '').includes('高楼')) return '789 High Street'
  if (String(venue.address || '').includes('文化')) return '321 Culture Street'
  if (String(venue.address || '').includes('郊区')) return '654 Suburban Avenue'
  if (String(venue.address || '').includes('商业')) return '987 Business Street'
  return venue.address || 'Local/staging demo address'
}

function displayVenueDescription(venue) {
  if (isChineseLocale.value) return venue.description
  if (String(venue.id || '').includes('restaurant-a')) {
    return 'Restaurant A sample room for comparing original layout, themed decor layers, and parent-friendly party flow.'
  }
  return t('venues.genericVenueDescription')
}

function displayRecommendationBasis(venue) {
  if (isChineseLocale.value) return venue.recommendationBasis
  return venue.recommendationBasis ? t('venues.recommendationBasis') : ''
}

// 过滤后的场地
const filteredVenues = computed(() => {
  let result = [...venues.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(v => 
      v.name.toLowerCase().includes(query) || 
      v.city.toLowerCase().includes(query)
    )
  }
  
  // 容量过滤
  result = result.filter(v => 
    v.capacity >= filters.value.capacity[0] && 
    v.capacity <= filters.value.capacity[1]
  )
  
  // 排序
  if (sortBy.value === 'price-asc') {
    result.sort((a, b) => (a.regular_price || 0) - (b.regular_price || 0))
  } else if (sortBy.value === 'price-desc') {
    result.sort((a, b) => (b.regular_price || 0) - (a.regular_price || 0))
  } else if (sortBy.value === 'capacity') {
    result.sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
  }
  
  return result
})

// 分页后的场地
const paginatedVenues = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredVenues.value.slice(start, start + pageSize.value)
})

const handleSearch = () => {
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
  fetchVenues()
}

const clearAllFilters = () => {
  filters.value.city = ''
  filters.value.venueType = ''
  filters.value.capacity = [0, 500]
  filters.value.partnerOnly = false
  filters.value.amenities = []
  searchQuery.value = ''
  currentPage.value = 1
  fetchVenues()
}

const loadDemoVenues = () => {
  venues.value = getMockVenues()
  ElMessage.success(t('venues.demoLoaded'))
}

const handleSort = () => {
  currentPage.value = 1
}

const handleSizeChange = () => {
  currentPage.value = 1
}

onMounted(() => {
  fetchVenues()
})
</script>

<style scoped>
.venues-page {
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.search-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px;
  text-align: center;
  color: white;
}

.search-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
}

.search-header p {
  font-size: 16px;
  margin-bottom: 24px;
  opacity: 0.9;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
}

.search-box :deep(.el-input__wrapper) {
  padding-left: 12px;
}

.venues-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

.filter-sidebar {
  position: sticky;
  top: 84px;
  height: fit-content;
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.filter-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #303133;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.filter-group .el-select {
  width: 100%;
}

.range-label {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  text-align: center;
}

.venues-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.venues-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.loading-state {
  padding: 40px;
}

.empty-state {
  padding: 80px 0;
}

.venues-list {
  display: grid;
  gap: 24px;
}

.venue-item {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.venue-item:hover {
  background: #f5f7fa;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.venue-image {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  height: 180px;
}

.venue-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.venue-english-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 18px;
  text-align: center;
  color: #263342;
  background:
    radial-gradient(circle at 20% 18%, rgba(102, 126, 234, 0.22), transparent 26%),
    linear-gradient(135deg, #fff, #edf4ff);
}

.venue-english-placeholder span {
  font-size: 2.4rem;
}

.venue-english-placeholder strong {
  font-size: 1rem;
  line-height: 1.25;
}

.partner-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #67c23a;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.venue-details {
  display: flex;
  flex-direction: column;
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.venue-header h3 {
  font-size: 18px;
  color: #303133;
}

.venue-address {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.venue-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.venue-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.venue-basis {
  margin: 8px 0 0;
  color: #7c3aed;
  font-size: 13px;
  font-weight: 700;
}

.venue-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.venue-price .price {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.venue-price .unit {
  font-size: 14px;
  color: #909399;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* Empty State 示例样式 */
.venue-preview-example {
  display: flex;
  gap: 12px;
  align-items: center;
}

.venue-image-placeholder {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  border-radius: 8px;
}

.venue-info-placeholder {
  flex: 1;
}

.venue-info-placeholder .venue-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.venue-info-placeholder .venue-meta {
  font-size: 12px;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .venues-container {
    grid-template-columns: 1fr;
  }
  
  .filter-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .venue-item {
    grid-template-columns: 1fr;
  }
}
</style>
