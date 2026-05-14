<template>
  <div class="suppliers-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="location-input">
        <input 
          v-model="searchLocation" 
          placeholder="All Sydney demo areas · 可输入 North Sydney"
          @keyup.enter="searchNearby"
        />
        <button @click="getCurrentLocation">📍 定位</button>
      </div>
      
      <div class="filters">
        <select v-model="filterCategory" @change="searchNearby">
          <option value="">全部分类</option>
          <option value="场地类">场地类</option>
          <option value="florist">花艺 / 桌花</option>
          <option value="balloon_decorator">气球 / 拱门</option>
          <option value="cake_dessert">蛋糕 / 甜品台</option>
          <option value="kids_entertainment">儿童娱乐</option>
          <option value="photography">摄影 / 记录</option>
          <option value="setup_service">搭建 / 现场执行</option>
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
        <div ref="mapContainer" class="map-container">
          <div class="map-placeholder">
            <span class="map-kicker">Local/staging supplier board</span>
            <h2>供应商与场地不是实时地图</h2>
            <p>
              当前 Preview 展示的是可演示的本地 fixture：场地、花艺、气球、蛋糕、儿童娱乐、摄影和搭建角色。
              不会真实联系供应商，也不会发送消息。
            </p>
            <div class="role-grid">
              <span v-for="role in supplierRoles" :key="role">{{ role }}</span>
            </div>
          </div>
        </div>
        <div class="map-controls">
          <button @click="zoomIn">+</button>
          <button @click="zoomOut">-</button>
          <button @click="resetMap">重置</button>
        </div>
      </div>

      <!-- 右侧列表 -->
      <div class="list-section">
        <div class="results-header">
          <span>找到 {{ suppliers.length }} 个供应商 · {{ dataSource }}</span>
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
              <img :src="supplier.cover_image_url || '/party-assets/packages/package-tier-matrix.png'" :alt="supplier.name" />
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
              <div v-if="supplier.service_tags?.length" class="supplier-tags">
                <span v-for="tag in supplier.service_tags.slice(0, 4)" :key="tag">{{ tag }}</span>
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
import { listSupplierDisplayItems } from '@/services/supplierLightService'

const router = useRouter()
const mapContainer = ref(null)

const searchLocation = ref('')
const filterCategory = ref('')
const filterPrice = ref('')
const weekendOnly = ref(false)
const sortBy = ref('distance')
const suppliers = ref([])
const selectedId = ref(null)
const dataSource = ref('not loaded')

const sortedSuppliers = computed(() => suppliers.value)
const supplierRoles = computed(() => {
  const labels = suppliers.value.map((supplier) => supplier.category_level_1 || supplier.category).filter(Boolean)
  return Array.from(new Set(labels)).slice(0, 8)
})

const formatPrice = (level) => {
  const map = { '低': '$', '中': '$$', '高': '$$$', '豪华': '$$$$' }
  return map[level] || level
}

onMounted(() => {
  searchNearby()
})

const selectSupplier = (s) => {
  selectedId.value = s.supplier_id
  router.push(`/suppliers/${s.supplier_id}`)
}

const searchNearby = async () => {
  const result = await listSupplierDisplayItems({
    category: filterCategory.value,
    suburb: searchLocation.value.trim(),
    price_level: filterPrice.value
  })
  dataSource.value = result.source
  suppliers.value = result.items
}
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
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.18), transparent 28%),
    radial-gradient(circle at 80% 24%, rgba(14, 165, 233, 0.16), transparent 26%),
    linear-gradient(135deg, #f8fafc, #eef2ff);
}

.map-placeholder {
  width: min(78%, 680px);
  padding: 28px;
  border: 2px solid rgba(51, 51, 51, 0.18);
  border-radius: 16px;
  background: rgba(255,255,255,0.88);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12);
}

.map-kicker {
  display: inline-flex;
  margin-bottom: 10px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.map-placeholder h2 {
  margin: 0 0 10px;
  color: #111827;
  font-size: 28px;
}

.map-placeholder p {
  margin: 0 0 18px;
  color: #475569;
  line-height: 1.7;
}

.role-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-grid span {
  padding: 8px 10px;
  border-radius: 999px;
  background: #ede9fe;
  color: #5b21b6;
  font-weight: 800;
  font-size: 12px;
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

.supplier-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.supplier-tags span {
  padding: 4px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .content-split {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 1fr;
  }
}
</style>
