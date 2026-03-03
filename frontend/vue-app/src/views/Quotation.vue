<template>
  <div class="quotation-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon"><el-icon><Document /></el-icon></div>
        <h1>报价单</h1>
        <p>查看费用明细，确认您的派对预算</p>
      </div>
    </div>

    <div class="quotation-container">
      <div class="quotation-layout">
        <!-- Main Content -->
        <div class="main-content">
          <!-- Quote Header Card -->
          <el-card class="quote-header-card">
            <div class="quote-header">
              <div class="quote-info">
                <h2>派对报价单</h2>
                <p class="quote-number">报价单号: {{ quoteNumber }}</p>
                <p class="quote-date">生成日期: {{ currentDate }}</p>
              </div>
              <div class="quote-status">
                <el-tag size="large" :type="statusType">{{ statusText }}</el-tag>
              </div>
            </div>
          </el-card>

          <!-- Venue Section -->
          <el-card v-if="venue" class="section-card">
            <template #header>
              <div class="section-header">
                <span><el-icon><OfficeBuilding /></el-icon> 场地费用</span>
              </div>
            </template>
            
            <div class="item-list">
              <div class="item-row">
                <div class="item-info">
                  <strong>{{ venue.name }}</strong>
                  <p>{{ venue.address }}, {{ venue.city }}</p>
                  <p>容纳人数: {{ venue.capacity }}人</p>
                </div>
                <div class="item-price">
                  <span class="original-price" v-if="venue.is_partner">${{ venue.regular_price }}</span>
                  <span class="final-price">${{ venueFinalPrice }}</span>
                </div>
              </div>
              
              <div v-if="venue.is_partner" class="discount-row">
                <span class="discount-label"><el-icon><Discount /></el-icon> 合作伙伴折扣 ({{ (venue.discount_rate * 100).toFixed(0) }}%)</span>
                <span class="discount-amount">-${{ venueDiscountAmount }}</span>
              </div>
            </div>
          </el-card>

          <!-- Design/Items Section -->
          <el-card v-if="designItems.length > 0" class="section-card">
            <template #header>
              <div class="section-header">
                <span><el-icon><Box /></el-icon> 物料与装饰</span>
                <span class="item-count">{{ designItems.length }} 项</span>
              </div>
            </template>
            
            <div class="item-list">
              <div v-for="(item, index) in designItems" :key="index" class="item-row">
                <div class="item-info">
                  <strong>{{ item.name }}</strong>
                  <p>数量: {{ item.quantity }}</p>
                </div>
                <div class="item-price">
                  <span class="unit-price">${{ item.unitPrice }} × {{ item.quantity }}</span>
                  <span class="final-price">${{ item.totalPrice }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Services Section -->
          <el-card class="section-card">
            <template #header>
              <div class="section-header">
                <span><el-icon><Service /></el-icon> 服务费用</span>
              </div>
            </template>
            
            <div class="item-list">
              <div v-for="(service, index) in services" :key="index" class="item-row">
                <div class="item-info">
                  <el-checkbox v-model="service.selected" @change="recalculateTotal">
                    <strong>{{ service.name }}</strong>
                  </el-checkbox>
                  <p>{{ service.description }}</p>
                </div>
                <div class="item-price">
                  <span class="final-price">${{ service.price }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Labor Section -->
          <el-card class="section-card">
            <template #header>
              <div class="section-header">
                <span><el-icon><User /></el-icon> 人工费用</span>
              </div>
            </template>
            
            <div class="item-list">
              <div v-for="(labor, index) in laborItems" :key="index" class="item-row">
                <div class="item-info">
                  <strong>{{ labor.name }}</strong>
                  <p>{{ labor.description }}</p>
                </div>
                <div class="item-price">
                  <span class="final-price">${{ labor.price }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- Summary Sidebar -->
        <aside class="summary-sidebar">
          <el-card class="summary-card">
            <template #header>
              <div class="summary-header">费用汇总</div>
            </template>

            <div v-if="userInfo" class="user-info-section">
              <div class="user-badge">
                <el-avatar :size="48" :icon="UserFilled" />
                <div class="user-details">
                  <p class="user-name">{{ userInfo.full_name }}</p>
                  <span v-if="userInfo.is_vip" class="vip-badge"><el-icon><Medal /></el-icon> VIP会员</span>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="cost-breakdown">
              <div class="cost-row">
                <span>场地费用</span>
                <span>${{ venueFinalPrice }}</span>
              </div>
              
              <div class="cost-row">
                <span>物料装饰</span>
                <span>${{ designTotal }}</span>
              </div>
              
              <div class="cost-row">
                <span>服务费用</span>
                <span>${{ servicesTotal }}</span>
              </div>
              
              <div class="cost-row">
                <span>人工费用</span>
                <span>${{ laborTotal }}</span>
              </div>

              <el-divider />

              <div class="cost-row subtotal">
                <span>小计</span>
                <span>${{ subtotal }}</span>
              </div>

              <div v-if="totalDiscount > 0" class="discount-section">
                <div class="cost-row discount">
                  <span><el-icon><Discount /></el-icon> 合作伙伴优惠</span>
                  <span>-${{ venueDiscountAmount }}</span>
                </div>
                
                <div v-if="vipDiscountAmount > 0" class="cost-row discount">
                  <span><el-icon><Medal /></el-icon> VIP折扣 ({{ (vipDiscountRate * 100).toFixed(0) }}%)</span>
                  <span>-${{ vipDiscountAmount }}</span>
                </div>
                
                <div class="cost-row total-discount">
                  <span>优惠总计</span>
                  <span>-${{ totalDiscount }}</span>
                </div>
              </div>

              <el-divider />

              <div class="cost-row pre-tax">
                <span>税前金额</span>
                <span>${{ preTaxTotal }}</span>
              </div>

              <div class="cost-row gst">
                <span>GST (10%)</span>
                <span>${{ gstAmount }}</span>
              </div>

              <el-divider />

              <div class="cost-row grand-total">
                <span>总计 (含GST)</span>
                <span class="total-amount">${{ grandTotal }}</span>
              </div>
            </div>

            <el-divider />

            <div class="summary-actions">
              <el-button type="primary" size="large" @click="submitQuotation" :loading="submitting">
                提交报价单
              </el-button>
              
              <el-button size="large" @click="generatePDF">
                <el-icon><Download /></el-icon> 下载PDF
              </el-button>
            </div>
          </el-card>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Document, OfficeBuilding, Box, Service, User,
  Discount, Medal, Download, UserFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { quotationAPI } from '@/api/modules'
import { useUserStore, usePlanStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const planStore = usePlanStore()

// Status
const status = ref('draft')
const statusType = computed(() => {
  const types = { draft: 'info', pending: 'warning', approved: 'success', rejected: 'danger' }
  return types[status.value] || 'info'
})
const statusText = computed(() => {
  const texts = { draft: '草稿', pending: '待确认', approved: '已批准', rejected: '已拒绝' }
  return texts[status.value] || '草稿'
})

// Quote info
const quoteNumber = ref('')
const currentDate = computed(() => new Date().toLocaleDateString('zh-CN'))

// User info
const userInfo = computed(() => userStore.userInfo)
const vipDiscountRate = computed(() => userStore.userInfo?.vip_discount_rate || 0)

// Venue data
const venue = ref(null)

// Design items
const designItems = ref([])

// Services
const services = ref([
  { name: '专业策划服务', description: '全程派对策划与协调', price: 800, selected: true },
  { name: '现场布置服务', description: '专业团队现场布置', price: 500, selected: true },
  { name: '摄影摄像服务', description: '专业摄影师全程跟拍', price: 1200, selected: false },
  { name: 'DJ音响服务', description: '专业DJ与音响设备', price: 800, selected: false }
])

// Labor
const laborItems = ref([
  { name: '布置人员', description: '2人 × 4小时', price: 400 },
  { name: '现场协调', description: '1人 × 8小时', price: 600 },
  { name: '清洁服务', description: '活动结束后清洁', price: 300 }
])

const submitting = ref(false)

// Calculations
const venueDiscountAmount = computed(() => {
  if (!venue.value?.is_partner) return 0
  return Math.round(venue.value.regular_price * venue.value.discount_rate)
})

const venueFinalPrice = computed(() => {
  if (!venue.value) return 0
  return (venue.value.regular_price || 0) - venueDiscountAmount.value
})

const designTotal = computed(() => {
  return designItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
})

const servicesTotal = computed(() => {
  return services.value.filter(s => s.selected).reduce((sum, s) => sum + s.price, 0)
})

const laborTotal = computed(() => {
  return laborItems.value.reduce((sum, item) => sum + item.price, 0)
})

const subtotal = computed(() => {
  return venueFinalPrice.value + designTotal.value + servicesTotal.value + laborTotal.value
})

const vipDiscountAmount = computed(() => {
  if (!userInfo.value?.is_vip || vipDiscountRate.value === 0) return 0
  const applicableAmount = servicesTotal.value + laborTotal.value
  return Math.round(applicableAmount * vipDiscountRate.value)
})

const totalDiscount = computed(() => {
  return venueDiscountAmount.value + vipDiscountAmount.value
})

const preTaxTotal = computed(() => {
  return subtotal.value - vipDiscountAmount.value
})

const gstAmount = computed(() => {
  return Math.round(preTaxTotal.value * 0.1)
})

const grandTotal = computed(() => {
  return preTaxTotal.value + gstAmount.value
})

const recalculateTotal = () => {}

const generateQuoteNumber = () => {
  const prefix = 'POQ'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${date}-${random}`
}

const loadData = () => {
  quoteNumber.value = generateQuoteNumber()

  const planVenue = planStore.currentPlan?.venue
  if (planVenue) {
    venue.value = planVenue
  } else {
    venue.value = {
      name: '云端宴会厅',
      address: '123 市中心大道',
      city: '悉尼',
      capacity: 200,
      regular_price: 2500,
      is_partner: true,
      discount_rate: 0.15
    }
  }

  const design = planStore.currentPlan?.design
  if (design?.objects) {
    const itemCounts = {}
    design.objects.forEach(obj => {
      itemCounts[obj.type] = (itemCounts[obj.type] || 0) + 1
    })

    const itemPrices = {
      round_table: 50, rect_table: 60, chair: 10, sofa: 200,
      chandelier: 300, spotlight: 80, led_strip: 40, fairy_lights: 25,
      flower_centerpiece: 80, flower_arch: 500, potted_plant: 60, flower_wall: 800,
      stage: 2000, backdrop: 600, screen: 1500, podium: 150
    }

    const itemNames = {
      round_table: '圆桌', rect_table: '长桌', chair: '椅子', sofa: '沙发',
      chandelier: '吊灯', spotlight: '射灯', led_strip: 'LED灯带', fairy_lights: '串灯',
      flower_centerpiece: '桌花', flower_arch: '花拱门', potted_plant: '绿植', flower_wall: '花墙',
      stage: '舞台', backdrop: '背景板', screen: 'LED屏', podium: '演讲台'
    }

    designItems.value = Object.entries(itemCounts).map(([type, count]) => ({
      name: itemNames[type] || type,
      type: type,
      quantity: count,
      unitPrice: itemPrices[type] || 0,
      totalPrice: (itemPrices[type] || 0) * count
    }))
  }
}

const submitQuotation = async () => {
  submitting.value = true
  
  const quotationData = {
    quote_number: quoteNumber.value,
    venue: venue.value,
    design_items: designItems.value,
    services: services.value.filter(s => s.selected),
    labor: laborItems.value,
    subtotal: subtotal.value,
    discounts: { partner: venueDiscountAmount.value, vip: vipDiscountAmount.value },
    pre_tax_total: preTaxTotal.value,
    gst: gstAmount.value,
    grand_total: grandTotal.value
  }

  try {
    await quotationAPI.generateQuotation(quotationData)
    ElMessage.success('报价单提交成功')
    status.value = 'pending'
    router.push('/orders')
  } catch (error) {
    ElMessage.success('报价单已提交（演示模式）')
    status.value = 'pending'
    setTimeout(() => router.push('/orders'), 1500)
  } finally {
    submitting.value = false
  }
}

const generatePDF = () => {
  const printWindow = window.open('', '_blank')
  const content = `
    <html>
    <head>
      <title>报价单 ${quoteNumber.value}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .header { border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h3 { color: #667eea; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
        .total { font-size: 24px; font-weight: bold; color: #f56c6c; margin-top: 30px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PartyOnce 报价单</h1>
        <p>报价单号: ${quoteNumber.value}</p>
        <p>日期: ${currentDate.value}</p>
      </div>
      
      <div class="section">
        <h3>场地费用</h3>
        <div class="item">
          <span>${venue.value?.name}</span>
          <span>$${venueFinalPrice.value}</span>
        </div>
      </div>

      <div class="section">
        <h3>费用汇总</h3>
        <div class="item"><span>小计</span><span>$${subtotal.value}</span></div>
        <div class="item"><span>GST (10%)</span><span>$${gstAmount.value}</span></div>
      </div>

      <div class="total">总计: $${grandTotal.value}</div>
    </body>
    </html>
  `
  printWindow.document.write(content)
  printWindow.document.close()
  printWindow.print()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.quotation-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
}

.page-header p {
  font-size: 16px;
  opacity: 0.9;
}

.quotation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.quotation-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 30px;
}

.quote-header-card {
  margin-bottom: 24px;
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.quote-info h2 {
  margin-bottom: 8px;
  color: #303133;
}

.quote-number, .quote-date {
  color: #909399;
  font-size: 14px;
  margin-bottom: 4px;
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.section-header .el-icon {
  margin-right: 8px;
}

.item-count {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.item-info strong {
  display: block;
  margin-bottom: 4px;
  color: #303133;
}

.item-info p {
  font-size: 13px;
  color: #909399;
  margin: 2px 0;
}

.item-price {
  text-align: right;
}

.original-price {
  display: block;
  text-decoration: line-through;
  color: #909399;
  font-size: 14px;
}

.final-price {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.unit-price {
  display: block;
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.discount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f0f9eb;
  border-radius: 8px;
  margin-top: 12px;
}

.discount-label {
  color: #67c23a;
  font-size: 14px;
}

.discount-amount {
  color: #67c23a;
  font-weight: bold;
}

.summary-sidebar {
  position: sticky;
  top: 84px;
  height: fit-content;
}

.summary-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.summary-header {
  font-size: 18px;
  font-weight: bold;
}

.user-info-section {
  margin-bottom: 16px;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.cost-breakdown {
  margin: 16px 0;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #606266;
}

.cost-row.subtotal {
  font-weight: bold;
  color: #303133;
  font-size: 16px;
}

.cost-row.discount {
  color: #67c23a;
}

.cost-row.total-discount {
  font-weight: bold;
  color: #67c23a;
  padding-top: 8px;
  border-top: 1px dashed #dcdfe6;
}

.cost-row.pre-tax {
  font-size: 16px;
  color: #303133;
}

.cost-row.gst {
  color: #606266;
}

.cost-row.grand-total {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  padding-top: 8px;
}

.total-amount {
  color: #f56c6c;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-actions .el-button {
  width: 100%;
}

@media (max-width: 1024px) {
  .quotation-layout {
    grid-template-columns: 1fr;
  }
  
  .summary-sidebar {
    position: static;
  }
}
</style>
