<template>
  <div class="admin-suppliers-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1>🏪 供应商管理后台</h1>
      <button class="btn-primary" @click="showAddModal = true">
        ➕ 新增供应商
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="number">{{ stats.total }}</div>
        <div class="label">全部供应商</div>
      </div>
      <div class="stat-card">
        <div class="number" style="color: #059669">{{ stats.active }}</div>
        <div class="label">正式合作</div>
      </div>
      <div class="stat-card">
        <div class="number" style="color: #d97706">{{ stats.pending }}</div>
        <div class="label">待开发/试合作</div>
      </div>
      <div class="stat-card">
        <div class="number" style="color: #dc2626">{{ stats.frozen }}</div>
        <div class="label">已冻结</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <input 
        v-model="searchKeyword" 
        placeholder="搜索供应商名称..."
        @input="filterSuppliers"
      />
      
      <select v-model="filterCategory" @change="filterSuppliers">
        <option value="">全部分类</option>
        <option value="场地类">场地类</option>
        <option value="物料类">物料类</option>
        <option value="搭建类">搭建类</option>
        <option value="现场服务类">现场服务类</option>
        <option value="餐饮类">餐饮类</option>
        <option value="物流类">物流类</option>
      </select>
      
      <select v-model="filterStatus" @change="filterSuppliers">
        <option value="">全部状态</option>
        <option value="正式合作">正式合作</option>
        <option value="试合作">试合作</option>
        <option value="待开发">待开发</option>
        <option value="冻结">冻结</option>
      </select>
      
      <select v-model="filterPriority" @change="filterSuppliers">
        <option value="">全部优先级</option>
        <option value="A">A级</option>
        <option value="B">B级</option>
        <option value="C">C级</option>
      </select>
    </div>

    <!-- 供应商表格 -->
    <div class="table-container">
      <table class="suppliers-table">
        <thead>
          <tr>
            <th>供应商</th>
            <th>分类</th>
            <th>区域</th>
            <th>联系人</th>
            <th>状态</th>
            <th>优先级</th>
            <th>评分</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredSuppliers" :key="s.supplier_id">
            <td class="supplier-name">
              <img :src="s.cover_image_url || '/placeholder.jpg'" class="avatar" />
              <div class="info">
                <div class="name">{{ s.name }}</div>
                <div v-if="s.service_tags?.length" class="tags">
                  {{ s.service_tags.slice(0, 2).join(' · ') }}
                </div>
              </div>
            </td>
            <td>
              <span :class="['category-tag', s.category_level_1]">{{ s.category_level_1 }}</span>
              <div v-if="s.category_level_2" class="sub-category">{{ s.category_level_2 }}</div>
            </td>
            <td>{{ s.suburb }}</td>
            <td>
              <div>{{ s.contact_name || '-' }}</div>
              <div class="phone">{{ s.phone || '-' }}</div>
            </td>
            <td>
              <select 
                v-model="s.cooperation_status" 
                @change="updateStatus(s)"
                :class="['status-select', s.cooperation_status]"
              >
                <option value="待开发">待开发</option>
                <option value="试合作">试合作</option>
                <option value="正式合作">正式合作</option>
                <option value="冻结">冻结</option>
              </select>
            </td>
            <td>
              <select v-model="s.priority_level" @change="updatePriority(s)">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </td>
            <td>
              <div class="rating">
                <span class="stars">{{ '★'.repeat(Math.floor(s.rating || 5)) }}</span>
                <span>{{ s.rating || 5 }}</span>
              </div>
              <div class="reviews">{{ s.review_count || 0 }} 评价</div>
            </td>
            <td class="actions">
              <button @click="viewDetail(s)" title="查看">👁️</button>
              <button @click="editSupplier(s)" title="编辑">✏️</button>
              <button @click="confirmDelete(s)" title="删除">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ showEditModal ? '编辑供应商' : '新增供应商' }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-section">
            <h3>基本信息</h3>
            <div class="form-row">
              <div class="form-group">
                <label>供应商名称 *</label>
                <input v-model="form.name" placeholder="输入供应商名称" />
              </div>
              <div class="form-group">
                <label>联系人</label>
                <input v-model="form.contact_name" placeholder="联系人姓名" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>一级分类 *</label>
                <select v-model="form.category_level_1">
                  <option value="场地类">场地类</option>
                  <option value="物料类">物料类</option>
                  <option value="搭建类">搭建类</option>
                  <option value="现场服务类">现场服务类</option>
                  <option value="餐饮类">餐饮类</option>
                  <option value="物流类">物流类</option>
                </select>
              </div>
              <div class="form-group">
                <label>二级分类</label>
                <input v-model="form.category_level_2" placeholder="例如：儿童乐园" />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>联系方式</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>电话</label>
                <input v-model="form.phone" placeholder="0412 345 678" />
              </div>
              <div class="form-group">
                <label>WhatsApp</label>
                <input v-model="form.whatsapp" placeholder="WhatsApp号码" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>邮箱</label>
                <input v-model="form.email" placeholder="email@example.com" />
              </div>
              <div class="form-group">
                <label>微信</label>
                <input v-model="form.wechat" placeholder="微信号" />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>地址信息</h3>
            
            <div class="form-group full">
              <label>详细地址</label>
              <input v-model="form.address" placeholder="街道地址" />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>区/Suburb *</label>
                <input v-model="form.suburb" placeholder="例如：North Sydney" />
              </div>
              <div class="form-group">
                <label>服务半径 (km)</label>
                <input v-model.number="form.service_radius_km" type="number" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>纬度</label>
                <input v-model.number="form.lat" type="number" step="0.0001" />
              </div>
              <div class="form-group">
                <label>经度</label>
                <input v-model.number="form.lng" type="number" step="0.0001" />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>服务信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>价格档位</label>
                <select v-model="form.price_level">
                  <option value="低">$ 经济</option>
                  <option value="中">$$ 中等</option>
                  <option value="高">$$$ 高端</option>
                  <option value="豪华">$$$$ 豪华</option>
                </select>
              </div>
              <div class="form-group">
                <label>容纳人数</label>
                <input v-model.number="form.max_capacity" type="number" placeholder="50" />
              </div>
            </div>
            
            <div class="form-group full">
              <label>服务标签（逗号分隔）</label>
              <input v-model="form.service_tags" placeholder="生日派对, 儿童友好, 包场, 室内" />
            </div>
            
            <div class="form-group full">
              <label>风格标签（逗号分隔）</label>
              <input v-model="form.style_tags" placeholder="现代, 色彩丰富, 安全" />
            </div>
          </div>
          
          <div class="form-section">
            <h3>图片</h3>
            
            <div class="form-group full">
              <label>封面图URL</label>
              <input v-model="form.cover_image_url" placeholder="https://..." />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveSupplier" :disabled="!form.name">
            {{ showEditModal ? '保存修改' : '创建供应商' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 数据
const suppliers = ref([])
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const filterPriority = ref('')

// 弹窗状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingId = ref(null)

// 表单
const defaultForm = {
  name: '',
  category_level_1: '场地类',
  category_level_2: '',
  contact_name: '',
  phone: '',
  whatsapp: '',
  email: '',
  wechat: '',
  address: '',
  suburb: 'Sydney',
  lat: null,
  lng: null,
  service_radius_km: 10,
  price_level: '中',
  max_capacity: null,
  service_tags: '',
  style_tags: '',
  cover_image_url: ''
}

const form = ref({ ...defaultForm })

// 统计
const stats = computed(() => {
  return {
    total: suppliers.value.length,
    active: suppliers.value.filter(s => s.cooperation_status === '正式合作').length,
    pending: suppliers.value.filter(s => ['待开发', '试合作'].includes(s.cooperation_status)).length,
    frozen: suppliers.value.filter(s => s.cooperation_status === '冻结').length
  }
})

// 筛选后的供应商
const filteredSuppliers = computed(() => {
  return suppliers.value.filter(s => {
    // 关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      const matchName = s.name?.toLowerCase().includes(keyword)
      const matchContact = s.contact_name?.toLowerCase().includes(keyword)
      const matchPhone = s.phone?.includes(keyword)
      if (!matchName && !matchContact && !matchPhone) return false
    }
    
    // 分类筛选
    if (filterCategory.value && s.category_level_1 !== filterCategory.value) return false
    
    // 状态筛选
    if (filterStatus.value && s.cooperation_status !== filterStatus.value) return false
    
    // 优先级筛选
    if (filterPriority.value && s.priority_level !== filterPriority.value) return false
    
    return true
  })
})

// 获取供应商列表
const fetchSuppliers = async () => {
  try {
    const response = await axios.get('/api/suppliers?limit=100')
    suppliers.value = response.data
  } catch (err) {
    console.error('Failed to fetch suppliers:', err)
    // 使用 mock 数据
    suppliers.value = getMockSuppliers()
  }
}

// Mock 数据
const getMockSuppliers = () => [
  {
    supplier_id: 1,
    name: '悉尼儿童派对中心 - 北区旗舰店',
    category_level_1: '场地类',
    category_level_2: '儿童乐园',
    contact_name: 'Sarah Chen',
    phone: '0412 345 678',
    suburb: 'North Sydney',
    cooperation_status: '正式合作',
    priority_level: 'A',
    rating: 4.8,
    review_count: 127,
    service_tags: ['生日派对', '儿童友好', '包场'],
    cover_image_url: 'https://images.unsplash.com/photo-1530103862676-de3c9a59aa38?w=200'
  },
  {
    supplier_id: 2,
    name: 'Manly海滨派对屋',
    category_level_1: '场地类',
    category_level_2: '海滨活动空间',
    contact_name: 'Mike Wilson',
    phone: '0423 456 789',
    suburb: 'Manly',
    cooperation_status: '正式合作',
    priority_level: 'A',
    rating: 4.6,
    review_count: 89,
    service_tags: ['海滨派对', '生日派对', '户外活动'],
    cover_image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200'
  },
  {
    supplier_id: 3,
    name: '气球魔术师',
    category_level_1: '物料类',
    category_level_2: '气球装饰',
    contact_name: 'Lisa Wang',
    phone: '0456 789 012',
    suburb: 'Auburn',
    cooperation_status: '正式合作',
    priority_level: 'A',
    rating: 4.9,
    review_count: 234,
    service_tags: ['气球装饰', '送货上门', '主题定制'],
    cover_image_url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=200'
  },
  {
    supplier_id: 4,
    name: '小主持人 Emily',
    category_level_1: '现场服务类',
    category_level_2: '派对主持',
    contact_name: 'Emily Zhang',
    phone: '0433 222 111',
    suburb: 'Mobile',
    cooperation_status: '试合作',
    priority_level: 'B',
    rating: 5.0,
    review_count: 56,
    service_tags: ['儿童主持', '派对游戏', '双语'],
    cover_image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200'
  }
]

// 操作
const viewDetail = (s) => {
  router.push(`/suppliers/${s.supplier_id}`)
}

const editSupplier = (s) => {
  editingId.value = s.supplier_id
  form.value = {
    name: s.name,
    category_level_1: s.category_level_1,
    category_level_2: s.category_level_2 || '',
    contact_name: s.contact_name || '',
    phone: s.phone || '',
    whatsapp: s.whatsapp || '',
    email: s.email || '',
    wechat: s.wechat || '',
    address: s.address || '',
    suburb: s.suburb,
    lat: s.lat,
    lng: s.lng,
    service_radius_km: s.service_radius_km || 10,
    price_level: s.price_level || '中',
    max_capacity: s.max_capacity,
    service_tags: (s.service_tags || []).join(', '),
    style_tags: (s.style_tags || []).join(', '),
    cover_image_url: s.cover_image_url || ''
  }
  showEditModal.value = true
}

const saveSupplier = async () => {
  try {
    const data = {
      ...form.value,
      service_tags: form.value.service_tags.split(',').map(t => t.trim()).filter(Boolean),
      style_tags: form.value.style_tags.split(',').map(t => t.trim()).filter(Boolean)
    }
    
    if (showEditModal.value) {
      // 更新
      await axios.put(`/api/suppliers/${editingId.value}`, data)
      const idx = suppliers.value.findIndex(s => s.supplier_id === editingId.value)
      if (idx > -1) suppliers.value[idx] = { ...suppliers.value[idx], ...data }
    } else {
      // 创建
      const response = await axios.post('/api/suppliers', data)
      suppliers.value.push({ supplier_id: response.data.supplier_id, ...data, rating: 5, review_count: 0 })
    }
    
    closeModal()
    alert('保存成功！')
  } catch (err) {
    console.error('Save failed:', err)
    alert('保存失败，请重试')
  }
}

const confirmDelete = (s) => {
  if (confirm(`确定要删除 "${s.name}" 吗？`)) {
    deleteSupplier(s.supplier_id)
  }
}

const deleteSupplier = async (id) => {
  try {
    await axios.delete(`/api/suppliers/${id}`)
    suppliers.value = suppliers.value.filter(s => s.supplier_id !== id)
    alert('删除成功！')
  } catch (err) {
    console.error('Delete failed:', err)
    alert('删除失败')
  }
}

const updateStatus = async (s) => {
  // 实际应该调用 API
  console.log('Status updated:', s.supplier_id, s.cooperation_status)
}

const updatePriority = async (s) => {
  console.log('Priority updated:', s.supplier_id, s.priority_level)
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingId.value = null
  form.value = { ...defaultForm }
}

const filterSuppliers = () => {
  // 筛选逻辑在 computed 中自动处理
}

onMounted(() => {
  fetchSuppliers()
})
</script>

<style scoped>
.admin-suppliers-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
}

.btn-primary {
  padding: 10px 20px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stat-card .number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-card .label {
  color: #888;
  font-size: 14px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar input,
.filter-bar select {
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 180px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.suppliers-table {
  width: 100%;
  border-collapse: collapse;
}

.suppliers-table th {
  background: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #666;
  font-size: 13px;
}

.suppliers-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.supplier-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.supplier-name .avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.supplier-name .info .name {
  font-weight: 600;
  margin-bottom: 4px;
}

.supplier-name .info .tags {
  font-size: 12px;
  color: #888;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #e0e6ff;
  color: #4c51bf;
  border-radius: 4px;
  font-size: 12px;
}

.category-tag.物料类 {
  background: #d1fae5;
  color: #059669;
}

.category-tag.现场服务类 {
  background: #fef3c7;
  color: #d97706;
}

.category-tag.餐饮类 {
  background: #fce7f3;
  color: #db2777;
}

.sub-category {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.phone {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.status-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 13px;
}

.status-select.正式合作 {
  background: #d1fae5;
  color: #059669;
}

.status-select.试合作 {
  background: #fef3c7;
  color: #d97706;
}

.status-select.待开发 {
  background: #f3f4f6;
  color: #666;
}

.status-select.冻结 {
  background: #fee2e2;
  color: #dc2626;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating .stars {
  color: #fbbf24;
}

.reviews {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 10px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.actions button:hover {
  background: #e5e7eb;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.form-group label::after {
  content: '';
}

.form-group label:has(+ [required])::after {
  content: ' *';
  color: #dc2626;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #8b5cf6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f3f4f6;
}

.modal-footer .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .suppliers-table {
    font-size: 12px;
  }
  
  .suppliers-table th,
  .suppliers-table td {
    padding: 8px;
  }
}
</style>
