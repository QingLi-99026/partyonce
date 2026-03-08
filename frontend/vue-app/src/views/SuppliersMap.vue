<template>
  <div class="suppliers-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="location-input">
        <input 
          v-model="searchLocation" 
          placeholder="输入区名或地址，例如：North Sydney"
          @keyup.enter="searchNearby"
        />
        <button @click="getCurrentLocation">📍 定位</button>
      </div>
      
      <div class="filters">
        <select v-model="filterCategory" @change="searchNearby">
          <option value="">全部分类</option>
          <option value="场地类">场地类</option>
          <option value="物料类">物料类</option>
          <option value="搭建类">搭建类</option>
          <option value="现场服务类">现场服务类</option>
          <option value="餐饮类">餐饮类</option>
        </select>
        
        <select v-model="filterPrice" @change="searchNearby">
          <option value="">全部价格</option>
          <option value="低">$ 经济</option>
          <option value="中">$$ 中等</option>
          <option value="高">$$$ 高端</option>
        </select>
        
        <label class="checkbox">
          <input type="checkbox" v-model="weekendOnly" @change="searchNearby" />
          仅周末可服务
        </label>
      </div>
    </div>

    <!-- 地图 + 列表 -->
    <div class="content-split">
      <!-- 左侧地图 -->
      <div class="map-section">
        <div ref="mapContainer" class="map-container"></div>
        <div class="map-controls">
          <button @click="zoomIn">+</button>
          <button @click="zoomOut">-</button>
          <button @click="resetMap">重置</button>
        </div>
      </div>

      <!-- 右侧列表 -->
      <div class="list-section">
        <div class="results-header">
          <span>找到 {{ suppliers.length }} 个供应商</span>
          <select v-model="sortBy">
            <option value="distance">距离最近</option>
            <option value="rating">评分最高</option>
            <option value="price_asc">价格从低到高</option>
          </select>
        </div>

        <div class="suppliers-list">
          <div 
            v-for="supplier in sortedSuppliers" 
            :key="supplier.supplier_id"
            class="supplier-card"
            :class="{ active: selectedId === supplier.supplier_id }"
            @click="selectSupplier(supplier)"
          >
            <div class="card-image">
              <img :src="supplier.cover_image_url || '/placeholder-venue.jpg'" :alt="supplier.name" />
              <span class="distance-badge">{{ supplier.distance_km }}km</span>
            </div>
            
            <div class="card-info">
              <div class="category-tag">{{ supplier.category_level_1 }}</div>
              <h3>{{ supplier.name }}</h3>
              
              <div class="rating">
                <span class="stars">★★★★★</span>
                <span>{{ supplier.rating }} ({{ supplier.review_count }})</span>
              </div>
              
              <div class="location">📍 {{ supplier.suburb }}</div>
              
              <div class="footer">
                <span class="price">{{ formatPrice(supplier.price_level) }}</span>
                <span v-if="supplier.max_capacity">容纳 {{ supplier.max_capacity }} 人</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mapContainer = ref(null)

const searchLocation = ref('North Sydney')
const filterCategory = ref('')
const filterPrice = ref('')
const weekendOnly = ref(false)
const sortBy = ref('distance')
const suppliers = ref([])
const selectedId = ref(null)

const sortedSuppliers = computed(() => suppliers.value)

const formatPrice = (level) => {
  const map = { '低': '$', '中': '$$', '高': '$$$', '豪华': '$$$$' }
  return map[level] || level
}

const getMockSuppliers = () => [
  {
    supplier_id: 1,
    name: '悉尼儿童派对中心',
    category_level_1: '场地类',
    suburb: 'North Sydney',
    rating: 4.8,
    review_count: 127,
    price_level: '中',
    max_capacity: 50,
    distance_km: 0.5,
    cover_image_url: 'https://images.unsplash.com/photo-1530103862676-de3c9a59aa38?w=400'
  },
  {
    supplier_id: 2,
    name: 'Manly海滨派对屋',
    category_level_1: '场地类',
    suburb: 'Manly',
    rating: 4.6,
    review_count: 89,
    price_level: '高',
    max_capacity: 80,
    distance_km: 8.2,
    cover_image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400'
  }
]

onMounted(() => {
  suppliers.value = getMockSuppliers()
})

const selectSupplier = (s) => {
  selectedId.value = s.supplier_id
  router.push(`/suppliers/${s.supplier_id}`)
}

const searchNearby = () => {
  // 筛选逻辑
}

const getCurrentLocation = () => {}
const zoomIn = () => {}
const zoomOut = () => {}
const resetMap = () => {}
</script>

<style scoped>
.suppliers-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: #ffffff;
}

.search-bar {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #c0c0c0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.location-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 2px solid #a0a0a0;
  border-radius: 10px;
  margin-bottom: 16px;
  background: #ffffff;
}

.location-input input {
  flex: 1;
  border: none;
  font-size: 16px;
  outline: none;
  color: #1a1a1a;
  background: transparent;
}

.location-input input::placeholder {
  color: #666666;
}

.location-input button {
  padding: 10px 18px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filters select {
  padding: 10px 16px;
  border: 2px solid #a0a0a0;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  color: #1a1a1a;
  font-weight: 500;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1a1a1a;
  font-weight: 600;
  padding: 10px 16px;
  background: #f0f0f0;
  border-radius: 8px;
  border: 2px solid #a0a0a0;
}

.content-split {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  height: calc(100vh - 200px);
}

.map-section {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #c0c0c0;
  background: #f5f5f5;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.map-container {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
}

.map-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-controls button {
  width: 40px;
  height: 40px;
  background: #ffffff;
  border: 2px solid #a0a0a0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.list-section {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #c0c0c0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.results-header {
  padding: 16px 20px;
  border-bottom: 2px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
}

.results-header span {
  font-weight: 700;
  color: #1a1a1a;
  font-size: 15px;
}

.results-header select {
  padding: 8px 14px;
  border: 2px solid #a0a0a0;
  border-radius: 6px;
  background: #ffffff;
  color: #1a1a1a;
  font-weight: 600;
}

.suppliers-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #ffffff;
}

.supplier-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 14px;
  background: #ffffff;
  border: 2px solid #d0d0d0;
}

.supplier-card:hover {
  border-color: #7c3aed;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
}

.supplier-card.active {
  background: #f3e8ff;
  border: 2px solid #7c3aed;
}

.card-image {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #e0e0e0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.distance-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0,0,0,0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #ede9fe;
  color: #5b21b6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.card-info h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a1a;
  line-height: 1.4;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
  margin-bottom: 6px;
  font-weight: 600;
}

.stars {
  color: #f59e0b;
  font-weight: 700;
}

.location {
  font-size: 13px;
  color: #444;
  margin-bottom: 8px;
  font-weight: 600;
}

.footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #333;
  font-weight: 700;
}

.price {
  color: #059669;
  font-weight: 700;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .content-split {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 1fr;
  }
}
</style>
