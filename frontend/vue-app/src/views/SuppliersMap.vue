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

const searchNearby = () => {}
const getCurrentLocation = () => {}
const zoomIn = () => {}
const zoomOut = () => {}
const resetMap = () => {}
</script>

<style scoped>
/* ========== 全局背景：纯白，无灰色蒙版 ========== */
.suppliers-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: #ffffff;
  min-height: 100vh;
}

/* ========== 搜索栏：白底 + 深灰边框 ========== */
.search-bar {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #333333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 20px;
}

.location-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 2px solid #333333;
  border-radius: 10px;
  margin-bottom: 16px;
  background: #ffffff;
}

.location-input input {
  flex: 1;
  border: none;
  font-size: 16px;
  outline: none;
  color: #000000;
  background: transparent;
  font-weight: 500;
}

.location-input input::placeholder {
  color: #666666;
}

.location-input button {
  padding: 12px 20px;
  background: #7c3aed;
  color: white;
  border: 2px solid #5b21b6;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
}

/* ========== 筛选器：深边框 + 黑字 ========== */
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filters select {
  padding: 12px 16px;
  border: 2px solid #333333;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  color: #000000;
  font-weight: 600;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #000000;
  font-weight: 700;
  padding: 12px 16px;
  background: #f0f0f0;
  border-radius: 8px;
  border: 2px solid #333333;
}

/* ========== 主内容区：清晰分割 ========== */
.content-split {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  height: calc(100vh - 200px);
}

/* ========== 地图区：深边框 + 明显阴影 ========== */
.map-section {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid #333333;
  background: #e0e0e0;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.map-container {
  width: 100%;
  height: 100%;
  background: #d0d0d0;
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
  width: 44px;
  height: 44px;
  background: #ffffff;
  border: 2px solid #333333;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
  color: #000000;
}

/* ========== 列表区：深边框 + 层次清晰 ========== */
.list-section {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid #333333;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

/* 列表头部：深灰底 + 黑字 */
.results-header {
  padding: 16px 20px;
  border-bottom: 3px solid #333333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e8e8e8;
}

.results-header span {
  font-weight: 800;
  color: #000000;
  font-size: 16px;
}

.results-header select {
  padding: 10px 16px;
  border: 2px solid #333333;
  border-radius: 6px;
  background: #ffffff;
  color: #000000;
  font-weight: 700;
  font-size: 14px;
}

/* 列表内容区 */
.suppliers-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #ffffff;
}

/* ========== 供应商卡片：深边框 + 高对比度 ========== */
.supplier-card {
  display: flex;
  gap: 16px;
  padding: 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
  background: #ffffff;
  border: 3px solid #555555;
}

.supplier-card:hover {
  border-color: #7c3aed;
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.25);
}

.supplier-card.active {
  background: #f3e8ff;
  border: 3px solid #7c3aed;
}

/* 图片区 */
.card-image {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #333333;
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
  background: #000000;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid #ffffff;
}

/* 信息区：纯黑字 + 粗体 */
.card-info {
  flex: 1;
  min-width: 0;
}

.category-tag {
  display: inline-block;
  padding: 5px 12px;
  background: #7c3aed;
  color: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 8px;
  border: 1px solid #5b21b6;
}

.card-info h3 {
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 10px;
  color: #000000;
  line-height: 1.3;
}

.rating {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #000000;
  margin-bottom: 8px;
  font-weight: 700;
}

.stars {
  color: #f59e0b;
  font-weight: 800;
  font-size: 16px;
}

.location {
  font-size: 14px;
  color: #333333;
  margin-bottom: 10px;
  font-weight: 700;
}

.footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #000000;
  font-weight: 800;
}

.price {
  color: #059669;
  font-weight: 800;
  font-size: 15px;
}

@media (max-width: 1024px) {
  .content-split {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 1fr;
  }
}
</style>
