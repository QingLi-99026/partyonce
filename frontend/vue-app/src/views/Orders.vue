<template>
  <div class="orders-page">
    <div class="page-header">
      <h1>我的订单</h1>
      <p class="subtitle">查看和管理您的所有订单</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">全部订单</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card pending">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待处理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card processing">
          <div class="stat-value">{{ stats.processing }}</div>
          <div class="stat-label">进行中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card completed">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchQuery"
            placeholder="搜索订单号或场地"
            clearable
            @clear="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-col>
        
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="订单状态" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="进行中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-col>
        
        <el-col :span="6">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleSearch"
          />
        </el-col>
        
        <el-col :span="8" style="text-align: right">
          <el-button type="primary" @click="$router.push('/venues')">
            <el-icon><Plus /></el-icon> 创建新订单
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="orders-card">
      <el-empty v-if="filteredOrders.length === 0" description="暂无订单" />

      <div v-else class="order-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-item">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号: {{ order.order_number }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <el-tag :type="getStatusType(order.status)" size="large">
              {{ getStatusName(order.status) }}
            </el-tag>
          </div>

          <div class="order-content">
            <div class="venue-info"
              <img :src="order.venue_image || '/placeholder-venue.jpg'" class="venue-image" />
              <div class="venue-details">
                <h4>{{ order.venue_name }}</h4>
                <p><el-icon><Location /></el-icon> {{ order.venue_address }}</p>
                <p><el-icon><Calendar /></el-icon> {{ formatDate(order.event_date) }} | {{ order.event_type }}</p>
                <p><el-icon><User /></el-icon> {{ order.guest_count }} 人</p>
              </div>
            </div>

            <div class="order-summary">
              <div class="summary-row">
                <span>场地费用</span>
                <span>${{ order.venue_cost }}</span>
              </div>
              <div class="summary-row" v-if="order.service_cost > 0">
                <span>服务费用</span>
                <span>${{ order.service_cost }}</span>
              </div>
              <div class="summary-row" v-if="order.discount > 0">
                <span>优惠</span>
                <span class="discount">-${{ order.discount }}</span>
              </div>
              <el-divider />
              <div class="summary-row total">
                <span>订单总额</span>
                <span class="total-price">${{ order.total_amount }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-timeline">
              <el-steps :active="getStepIndex(order.status)" finish-status="success" simple>
                <el-step title="提交" />
                <el-step title="确认" />
                <el-step title="筹备" />
                <el-step title="完成" />
              </el-steps>
            </div>

            <div class="order-actions">
              <el-button type="primary" @click="viewOrder(order)">查看详情</el-button>
              <el-button v-if="order.status === 'pending'" @click="payOrder(order)">立即支付</el-button>
              <el-button v-if="order.status === 'pending'" type="danger" plain @click="cancelOrder(order)">取消</el-button>
              <el-button v-if="order.status === 'completed'" @click="reviewOrder(order)">评价</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="filteredOrders.length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalOrders"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="800px">
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.order_number }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDateTime(selectedOrder.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(selectedOrder.status)">{{ getStatusName(selectedOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="活动日期">{{ formatDate(selectedOrder.event_date) }}</el-descriptions-item>
          <el-descriptions-item label="活动类型">{{ selectedOrder.event_type }}</el-descriptions-item>
          <el-descriptions-item label="预计人数">{{ selectedOrder.guest_count }} 人</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ selectedOrder.contact_name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedOrder.contact_phone }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 24px">费用明细</h4>
        <el-table :data="selectedOrder.items" style="width: 100%">
          <el-table-column prop="name" label="项目" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="quantity" label="数量" align="center" />
          <el-table-column prop="price" label="金额" align="right">
            <template #default="{ row }">${{ row.price }}</template>
          </el-table-column>
        </el-table>

        <div class="detail-total">
          <span>订单总额: </span>
          <span class="total-amount">${{ selectedOrder.total_amount }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Location, Calendar, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 统计数据
const stats = ref({
  total: 12,
  pending: 2,
  processing: 3,
  completed: 7
})

// 筛选条件
const searchQuery = ref('')
const filterStatus = ref('')
const dateRange = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(12)

// 弹窗
const detailDialogVisible = ref(false)
const selectedOrder = ref(null)

// 订单数据
const orders = ref([
  {
    id: 1,
    order_number: 'ORD-20260301-0001',
    created_at: '2026-03-01T10:30:00',
    status: 'pending',
    event_date: '2026-06-15',
    event_type: '婚礼',
    guest_count: 120,
    venue_name: '云端宴会厅',
    venue_address: '123 市中心大道, 悉尼',
    venue_image: '',
    venue_cost: 2500,
    service_cost: 1500,
    discount: 375,
    total_amount: 3625,
    contact_name: '张三',
    contact_phone: '+61 400 000 001',
    items: [
      { name: '场地租赁', description: '云端宴会厅 - 全天', quantity: 1, price: 2500 },
      { name: '餐饮服务', description: '自助餐 x 120人', quantity: 120, price: 1200 },
      { name: '合作折扣', description: '15%优惠', quantity: 1, price: -375 }
    ]
  },
  {
    id: 2,
    order_number: 'ORD-20260228-0002',
    created_at: '2026-02-28T14:20:00',
    status: 'confirmed',
    event_date: '2026-05-20',
    event_type: '生日派对',
    guest_count: 50,
    venue_name: '海边草坪',
    venue_address: '45 海滨大道, 悉尼',
    venue_image: '',
    venue_cost: 1800,
    service_cost: 800,
    discount: 0,
    total_amount: 2860,
    contact_name: '李四',
    contact_phone: '+61 400 000 002',
    items: [
      { name: '场地租赁', description: '海边草坪 - 全天', quantity: 1, price: 1800 },
      { name: '现场布置', description: '主题装饰', quantity: 1, price: 500 },
      { name: 'GST', description: '税费 10%', quantity: 1, price: 260 }
    ]
  },
  {
    id: 3,
    order_number: 'ORD-20260225-0003',
    created_at: '2026-02-25T09:00:00',
    status: 'completed',
    event_date: '2026-03-01',
    event_type: '企业年会',
    guest_count: 200,
    venue_name: '城市屋顶',
    venue_address: '78 商业广场, 悉尼',
    venue_image: '',
    venue_cost: 1500,
    service_cost: 2000,
    discount: 150,
    total_amount: 3685,
    contact_name: '王五',
    contact_phone: '+61 400 000 003',
    items: [
      { name: '场地租赁', description: '城市屋顶 - 全天', quantity: 1, price: 1500 },
      { name: '餐饮服务', description: '鸡尾酒会 x 200人', quantity: 200, price: 1600 },
      { name: '音响设备', description: '专业音响租赁', quantity: 1, price: 400 },
      { name: '合作折扣', description: '10%优惠', quantity: 1, price: -150 },
      { name: 'GST', description: '税费 10%', quantity: 1, price: 335 }
    ]
  }
])

// 过滤后的订单
const filteredOrders = computed(() => {
  let result = orders.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(order =>
      order.order_number.toLowerCase().includes(query) ||
      order.venue_name.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(order => order.status === filterStatus.value)
  }

  // 日期过滤
  if (dateRange.value) {
    const [start, end] = dateRange.value
    result = result.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= start && orderDate <= end
    })
  }

  return result
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    confirmed: 'primary',
    processing: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || ''
}

const getStatusName = (status) => {
  const names = {
    pending: '待处理',
    confirmed: '已确认',
    processing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return names[status] || status
}

const getStepIndex = (status) => {
  const steps = { pending: 1, confirmed: 2, processing: 3, completed: 4, cancelled: 0 }
  return steps[status] || 0
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const viewOrder = (order) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
}

const payOrder = (order) => {
  ElMessage.success(`支付订单: ${order.order_number}`)
}

const cancelOrder = (order) => {
  ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = 'cancelled'
    ElMessage.success('订单已取消')
  })
}

const reviewOrder = (order) => {
  ElMessage.info(`评价订单: ${order.order_number}`)
}

onMounted(() => {
  // 加载订单数据
})
</script>

<style scoped>
.orders-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-card.pending {
  background: linear-gradient(135deg, #fff7e6 0%, #fff 100%);
}

.stat-card.processing {
  background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);
}

.stat-card.completed {
  background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.orders-card {
  min-height: 400px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.order-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.order-number {
  font-weight: 600;
  color: #303133;
}

.order-date {
  color: #909399;
  font-size: 14px;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 20px;
}

.venue-info {
  display: flex;
  gap: 16px;
}

.venue-image {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f7fa;
}

.venue-details h4 {
  margin: 0 0 8px;
  font-size: 16px;
}

.venue-details p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}

.order-summary {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: #606266;
  font-size: 14px;
}

.summary-row.discount {
  color: #67c23a;
}

.summary-row.total {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-top: 8px;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

.order-timeline {
  flex: 1;
  max-width: 400px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 30px;
  justify-content: flex-end;
}

.order-detail {
  padding: 10px 0;
}

.detail-total {
  text-align: right;
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
}

.total-amount {
  color: #f56c6c;
  font-size: 24px;
  margin-left: 8px;
}

@media (max-width: 1024px) {
  .order-content {
    grid-template-columns: 1fr;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 16px;
  }
  
  .order-timeline {
    max-width: 100%;
    width: 100%;
  }
}
</style>
