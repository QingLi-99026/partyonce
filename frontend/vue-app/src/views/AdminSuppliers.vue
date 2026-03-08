<template>
  <div class="admin-suppliers-page">
    <div class="page-header">
      <h1>🏪 供应商管理后台</h1>
      <button class="btn-primary" @click="showAddModal = true">➕ 新增供应商</button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="number">4</div>
        <div class="label">全部供应商</div>
      </div>
      <div class="stat-card">
        <div class="number" style="color: #059669">3</div>
        <div class="label">正式合作</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <input v-model="searchKeyword" placeholder="搜索供应商名称..." />
      <select v-model="filterCategory">
        <option value="">全部分类</option>
        <option value="场地类">场地类</option>
        <option value="物料类">物料类</option>
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
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in suppliers" :key="s.supplier_id">
            <td class="supplier-name">
              <img :src="s.cover_image_url || '/placeholder.jpg'" class="avatar" />
              <div class="info">
                <div class="name">{{ s.name }}</div>
              </div>
            </td>
            <td>
              <span class="category-tag">{{ s.category_level_1 }}</span>
            </td>
            <td>{{ s.suburb }}</td>
            <td>{{ s.contact_name || '-' }}</td>
            <td class="actions">
              <button @click="viewDetail(s)">查看</button>
              <button @click="editSupplier(s)">编辑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const suppliers = ref([
  {
    supplier_id: 1,
    name: '悉尼儿童派对中心',
    category_level_1: '场地类',
    suburb: 'North Sydney',
    contact_name: 'Sarah Chen',
    cover_image_url: 'https://images.unsplash.com/photo-1530103862676-de3c9a59aa38?w=200'
  },
  {
    supplier_id: 2,
    name: 'Manly海滨派对屋',
    category_level_1: '场地类',
    suburb: 'Manly',
    contact_name: 'Mike Wilson',
    cover_image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200'
  }
])

const viewDetail = (s) => router.push(`/suppliers/${s.supplier_id}`)
const editSupplier = (s) => router.push(`/admin/suppliers/${s.supplier_id}/edit`)
</script>

<style scoped>
.admin-suppliers-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 3px solid #333333;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 800;
  color: #000000;
}

.btn-primary {
  padding: 12px 24px;
  background: #7c3aed;
  color: #ffffff;
  border: 2px solid #5b21b6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
}

/* 统计卡片 */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  border: 3px solid #333333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-card .number {
  font-size: 32px;
  font-weight: 800;
  color: #000000;
  margin-bottom: 6px;
}

.stat-card .label {
  color: #555555;
  font-size: 14px;
  font-weight: 700;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar input,
.filter-bar select {
  padding: 12px 16px;
  border: 2px solid #333333;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  color: #000000;
  font-weight: 600;
}

/* 表格 */
.table-container {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid #333333;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.suppliers-table {
  width: 100%;
  border-collapse: collapse;
}

.suppliers-table th {
  background: #f0f0f0;
  padding: 16px;
  text-align: left;
  font-weight: 800;
  color: #000000;
  font-size: 14px;
  border-bottom: 3px solid #333333;
}

.suppliers-table td {
  padding: 16px;
  border-bottom: 2px solid #e0e0e0;
  color: #000000;
  font-weight: 600;
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
  border: 2px solid #333333;
}

.supplier-name .name {
  font-weight: 800;
  color: #000000;
}

.category-tag {
  padding: 6px 12px;
  background: #ede9fe;
  color: #5b21b6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid #7c3aed;
}

.actions button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 2px solid #333333;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
  font-weight: 700;
  color: #000000;
}

.actions button:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
