<template>
  <div class="venues-page">
    <!-- Search Header -->
    <div class="search-header">
      <div class="search-content">
        <h1>探索精选场地</h1>
        <p>发现适合您派对的完美场地</p>
        
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索场地名称、城市..."
            size="large"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <div class="venues-container">
      <!-- Filter Sidebar -->
      <aside class="filter-sidebar">
        <div class="filter-section">
          <h3>筛选条件</h3>
          
          <div class="filter-group">
            <label>城市</label>
            <el-select v-model="filters.city" placeholder="选择城市" clearable @change="applyFilters">
              <el-option label="悉尼" value="悉尼" />
              <el-option label="墨尔本" value="墨尔本" />
              <el-option label="布里斯班" value="布里斯班" />
              <el-option label="珀斯" value="珀斯" />
              <el-option label="阿德莱德" value="阿德莱德" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label>场地类型</label>
            <el-select v-model="filters.venueType" placeholder="选择类型" clearable @change="applyFilters">
              <el-option label="酒店宴会厅" value="hotel" />
              <el-option label="私人会所" value="club" />
              <el-option label="户外花园" value="garden" />
              <el-option label="艺术空间" value="art" />
              <el-option label="餐厅包场" value="restaurant" />
              <el-option label="屋顶露台" value="rooftop" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label>容纳人数</label>
            <el-slider v-model="filters.capacity" range :max="500" @change="applyFilters" />
            <div class="range-label">{{ filters.capacity[0] }} - {{ filters.capacity[1] }} 人</div>
          </div>
          
          <div class="filter-group">
            <el-checkbox v-model="filters.partnerOnly" @change="applyFilters">
              仅显示合作伙伴
            </el-checkbox>
          </div>
        </div>
        
        <div class="filter-section">
          <h3>设施服务</h3>
          <el-checkbox-group v-model="filters.amenities" @change="applyFilters">
            <el-checkbox label="wifi">WiFi</el-checkbox>
            <el-checkbox label="parking">停车位</el-checkbox>
            <el-checkbox label="catering">餐饮服务</el-checkbox>
            <el-checkbox label="audio">音响设备</el-checkbox>
            <el-checkbox label="projector">投影仪</el-checkbox>
            <el-checkbox label="bar">吧台</el-checkbox>
          </el-checkbox-group>
        </div>
      </aside>

      <!-- Venue List -->
      <div class="venues-content">
        <div class="venues-toolbar">
          <span>共找到 {{ filteredVenues.length }} 个场地</span>
          <el-radio-group v-model="sortBy" size="small" @change="handleSort">
            <el-radio-button label="default">默认</el-radio-button>
            <el-radio-button label="price-asc">价格从低到高</el-radio-button>
            <el-radio-button label="price-desc">价格从高到低</el-radio-button>
            <el-radio-button label="capacity">容量</el-radio-button>
          </el-radio-group>
        </div>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="6" animated />
        </div>

        <div v-else-if="filteredVenues.length === 0" class="empty-state">
          <el-empty description="没有找到符合条件的场地" />
        </div>

        <div v-else class="venues-list">
          <div
            v-for="venue in paginatedVenues"
            :key="venue.id"
            class="venue-item"
            @click="$router.push(`/venues/${venue.id}`)"
          >
            <div class="venue-image">
              <img :src="venue.images?.[0] || 'https://via.placeholder.com/300x200'" :alt="venue.name">
              <div v-if="venue.is_partner" class="partner-tag">合作伙伴</div>
            </div>
            
            <div class="venue-details">
              <div class="venue-header">
                <h3>{{ venue.name }}</h3>
                <el-rate v-model="venue.rating" disabled show-score text-color="#ff9900" />
              </div>
              
              <p class="venue-address"><el-icon><Location /></el-icon>{{ venue.address }}, {{ venue.city }}</p>
              
              <div class="venue-tags">
                <el-tag v-if="venue.venue_type" size="small">{{ venue.venue_type }}</el-tag>
                <el-tag v-if="venue.capacity" size="small" type="success">{{ venue.capacity }}人</el-tag>
                <el-tag v-if="venue.is_partner" size="small" type="warning">{{ (venue.discount_rate * 100).toFixed(0) }}%优惠</el-tag>
              </div>
              
              <p class="venue-desc">{{ venue.description }}</p>
              
              <div class="venue-footer">
                <div class="venue-price">
                  <span class="price">${{ venue.regular_price || 0 }}</span>
                  <span class="unit">/起</span>
                </div>
                <el-button type="primary" size="small">查看详情</el-button>
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

// 获取场地列表
const fetchVenues = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.city) params.city = filters.value.city
    if (filters.value.venueType) params.venue_type = filters.value.venueType
    if (filters.value.partnerOnly) params.partner_only = true
    
    const data = await venueAPI.getVenues(params)
    venues.value = data.map(v => ({ ...v, rating: 4.5 }))
  } catch (error) {
    ElMessage.error('获取场地列表失败')
    // 使用模拟数据
    venues.value = getMockVenues()
  } finally {
    loading.value = false
  }
}

// 模拟数据
const getMockVenues = () => {
  return [
    { id: 1, name: '云端宴会厅', address: '123 市中心大道', city: '悉尼', venue_type: '酒店宴会厅', capacity: 200, regular_price: 2500, is_partner: true, discount_rate: 0.15, description: '豪华宴会厅，配备顶级音响灯光系统', images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400'], rating: 4.8 },
    { id: 2, name: '海景花园会所', address: '456 海滨路', city: '墨尔本', venue_type: '私人会所', capacity: 150, regular_price: 1800, is_partner: false, description: '私家花园，尽享海景', images: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400'], rating: 4.6 },
    { id: 3, name: '星空露台', address: '789 高楼路', city: '布里斯班', venue_type: '屋顶露台', capacity: 80, regular_price: 1200, is_partner: true, discount_rate: 0.10, description: '城市夜景尽收眼底', images: ['https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400'], rating: 4.5 },
    { id: 4, name: '艺术中心', address: '321 文化街', city: '悉尼', venue_type: '艺术空间', capacity: 300, regular_price: 3500, is_partner: false, description: '工业风格艺术空间', images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'], rating: 4.7 },
    { id: 5, name: '绿茵庄园', address: '654 郊区大道', city: '墨尔本', venue_type: '户外花园', capacity: 250, regular_price: 2200, is_partner: true, discount_rate: 0.20, description: '占地5000平的私人庄园', images: ['https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400'], rating: 4.9 },
    { id: 6, name: '都市酒廊', address: '987 商业街', city: '悉尼', venue_type: '餐厅包场', capacity: 100, regular_price: 1500, is_partner: false, description: '时尚现代的私人酒廊', images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'], rating: 4.4 }
  ]
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