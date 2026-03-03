<template>
  <div class="wallet-page">
    <NavHeader />
    
    <div class="wallet-container">
      <div class="page-header">
        <h1>我的钱包</h1>
      </div>
      
      <!-- 余额卡片 -->
      <el-card class="balance-card">
        <div class="balance-content">
          <div class="balance-info">
            <p class="balance-label">当前余额</p>
            <h2 class="balance-value">${{ formatAmount(wallet.balance) }}</h2>
          </div>
          
          <div class="balance-actions">
            <el-button type="primary" size="large" @click="withdraw">
              <el-icon><Money /></el-icon>
              提现
            </el-button>
            
            <el-button size="large" @click="showHistory = true">
              <el-icon><List /></el-icon>
              收支明细
            </el-button>
          </div>
        </div>
        
        <div class="balance-stats">
          <div class="stat-item">
            <p class="stat-label">累计收入</p>
            <p class="stat-value income">+${{ formatAmount(stats.total_income) }}</p>
          </div>
          
          <div class="stat-item">
            <p class="stat-label">累计提现</p>
            <p class="stat-value expense">-${{ formatAmount(stats.total_withdraw) }}</p>
          </div>
          
          <div class="stat-item">
            <p class="stat-label">待结算</p>
            <p class="stat-value pending">${{ formatAmount(stats.pending) }}</p>
          </div>
        </div>
      </el-card>
      
      <!-- 收入说明 -->
      <el-card class="info-card">
        <template #header>
          <span>收入说明</span>
        </template>
        
        <div class="income-types">
          <div class="income-type-item">
            <div class="type-icon"><el-icon><Share /></el-icon></div>
            <div class="type-info">
              <h4>分享点击奖励</h4>
              <p>每次有人点击您的分享链接，您可获得 $0.10 奖励</p>
            </div>
          </div>
          
          <div class="income-type-item">
            <div class="type-icon"><el-icon><User /></el-icon></div>
            <div class="type-info">
              <h4>邀请注册奖励</h4>
              <p>邀请好友注册并完成首次派对，您可获得 $5.00 奖励</p>
            </div>
          </div>
          
          <div class="income-type-item">
            <div class="type-icon"><el-icon><ShoppingBag /></el-icon></div>
            <div class="type-info">
              <h4>成交奖励</h4>
              <p>通过您的分享完成派对预订，您可获得订单金额 2% 的奖励</p>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 最近流水 -->
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <span>最近流水</span>
            <el-button type="primary" link @click="showHistory = true">查看全部</el-button>
          </div>
        </template>
        
        <el-empty v-if="recentTransactions.length === 0" description="暂无记录" />
        
        <div v-else class="transaction-list">
          <div
            v-for="tx in recentTransactions"
            :key="tx.id"
            class="transaction-item"
          >
            <div class="tx-icon" :class="tx.type">
              <el-icon>
                <Share v-if="tx.type === 'share_click'" />
                <User v-else-if="tx.type === 'referral'" />
                <ShoppingBag v-else-if="tx.type === 'order'" />
                <Money v-else />
              </el-icon>
            </div>
            
            <div class="tx-info">
              <h4>{{ tx.title }}</h4>
              <p>{{ tx.description }}</p>
              <span class="tx-time">{{ formatDateTime(tx.created_at) }}</span>
            </div>
            
            <div class="tx-amount" :class="tx.amount >= 0 ? 'income' : 'expense'">
              {{ tx.amount >= 0 ? '+' : '' }}${{ formatAmount(Math.abs(tx.amount)) }}
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 全部流水弹窗 -->
    <el-dialog
      v-model="showHistory"
      title="收支明细"
      width="700px"
    >
      <div class="history-filter">
        <el-radio-group v-model="historyFilter" size="small">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="income">收入</el-radio-button>
          <el-radio-button label="expense">支出</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="history-list">
        <div
          v-for="tx in filteredTransactions"
          :key="tx.id"
          class="history-item"
        >
          <div class="history-icon" :class="tx.type">
            <el-icon>
              <Share v-if="tx.type === 'share_click'" />
              <User v-else-if="tx.type === 'referral'" />
              <ShoppingBag v-else-if="tx.type === 'order'" />
              <Money v-else />
            </el-icon>
          </div>
          
          <div class="history-info">
            <h4>{{ tx.title }}</h4>
            <p>{{ tx.description }}</p>
            <span class="history-time">{{ formatDateTime(tx.created_at) }}</span>
          </div>
          
          <div class="history-amount" :class="tx.amount >= 0 ? 'income' : 'expense'">
            {{ tx.amount >= 0 ? '+' : '' }}${{ formatAmount(Math.abs(tx.amount)) }}
          </div>
        </div>
      </div>
      
      <div class="history-pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchTransactions"
        />
      </div>
    </el-dialog>
    
    <!-- 提现弹窗 -->
    <el-dialog
      v-model="showWithdraw"
      title="提现"
      width="500px"
    >
      <el-form :model="withdrawForm" :rules="withdrawRules" ref="withdrawFormRef">
        <el-form-item label="提现金额" prop="amount">
          <el-input-number
            v-model="withdrawForm.amount"
            :min="10"
            :max="wallet.balance"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="提现方式" prop="method">
          <el-radio-group v-model="withdrawForm.method">
            <el-radio label="bank">银行卡</el-radio>
            <el-radio label="paypal">PayPal</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="账户信息" prop="account">
          <el-input
            v-model="withdrawForm.account"
            :placeholder="withdrawForm.method === 'bank' ? '请输入银行卡号' : '请输入PayPal邮箱'"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showWithdraw = false">取消</el-button>
        <el-button type="primary" :loading="withdrawing" @click="confirmWithdraw">确认提现</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { walletAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const wallet = ref({
  balance: 0
})

const stats = ref({
  total_income: 0,
  total_withdraw: 0,
  pending: 0
})

const transactions = ref([])
const recentTransactions = computed(() => transactions.value.slice(0, 5))

const showHistory = ref(false)
const showWithdraw = ref(false)
const historyFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const withdrawFormRef = ref(null)
const withdrawing = ref(false)
const withdrawForm = reactive({
  amount: 10,
  method: 'bank',
  account: ''
})

const withdrawRules = {
  amount: [{ required: true, message: '请输入提现金额', trigger: 'blur' }],
  method: [{ required: true, message: '请选择提现方式', trigger: 'change' }],
  account: [{ required: true, message: '请输入账户信息', trigger: 'blur' }]
}

const filteredTransactions = computed(() => {
  if (!historyFilter.value) return transactions.value
  if (historyFilter.value === 'income') {
    return transactions.value.filter(tx => tx.amount >= 0)
  }
  return transactions.value.filter(tx => tx.amount < 0)
})

const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0.00'
  return parseFloat(amount).toFixed(2)
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const withdraw = () => {
  if (wallet.value.balance < 10) {
    ElMessage.warning('余额不足，最少提现金额为 $10')
    return
  }
  withdrawForm.amount = Math.min(wallet.value.balance, 100)
  showWithdraw.value = true
}

const confirmWithdraw = async () => {
  const valid = await withdrawFormRef.value.validate().catch(() => false)
  if (!valid) return

  withdrawing.value = true
  try {
    await walletAPI.withdraw(withdrawForm)
    ElMessage.success('提现申请已提交，预计1-3个工作日到账')
    showWithdraw.value = false
    fetchWalletData()
  } catch (error) {
    ElMessage.error('提现失败')
  } finally {
    withdrawing.value = false
  }
}

const fetchWalletData = async () => {
  try {
    const res = await walletAPI.getWallet()
    wallet.value = res.wallet || wallet.value
    stats.value = res.stats || stats.value
  } catch (error) {
    console.error('获取钱包数据失败:', error)
  }
}

const fetchTransactions = async () => {
  try {
    const res = await walletAPI.getTransactions({
      page: currentPage.value,
      page_size: pageSize.value
    })
    transactions.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取交易记录失败:', error)
  }
}

onMounted(() => {
  fetchWalletData()
  fetchTransactions()
})
</script>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.wallet-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  margin: 0;
  color: #303133;
}

.balance-card {
  border-radius: 16px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.balance-card :deep(.el-card__body) {
  padding: 32px;
}

.balance-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.balance-value {
  font-size: 48px;
  margin: 0;
  font-weight: bold;
}

.balance-actions {
  display: flex;
  gap: 12px;
}

.balance-actions .el-button {
  padding: 12px 24px;
}

.balance-actions .el-button--primary {
  background: white;
  color: #667eea;
  border: none;
}

.balance-actions .el-button:not(.el-button--primary) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.balance-stats {
  display: flex;
  gap: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-value.income {
  color: #67c23a;
}

.stat-value.expense {
  color: #f56c6c;
}

.stat-value.pending {
  color: #e6a23c;
}

.info-card,
.history-card {
  border-radius: 16px;
  margin-bottom: 24px;
}

.income-types {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.income-type-item {
  display: flex;
  gap: 16px;
}

.type-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 24px;
}

.type-info {
  flex: 1;
}

.type-info h4 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #303133;
}

.type-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-item,
.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.transaction-item:last-child,
.history-item:last-child {
  border-bottom: none;
}

.tx-icon,
.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.tx-icon.share_click,
.history-icon.share_click {
  background: #e6f7ff;
  color: #1890ff;
}

.tx-icon.referral,
.history-icon.referral {
  background: #f6ffed;
  color: #52c41a;
}

.tx-icon.order,
.history-icon.order {
  background: #fff7e6;
  color: #fa8c16;
}

.tx-info,
.history-info {
  flex: 1;
}

.tx-info h4,
.history-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
  color: #303133;
}

.tx-info p,
.history-info p {
  margin: 0 0 4px;
  font-size: 13px;
  color: #606266;
}

.tx-time,
.history-time {
  font-size: 12px;
  color: #909399;
}

.tx-amount,
.history-amount {
  font-size: 16px;
  font-weight: bold;
}

.tx-amount.income,
.history-amount.income {
  color: #67c23a;
}

.tx-amount.expense,
.history-amount.expense {
  color: #f56c6c;
}

.history-filter {
  margin-bottom: 20px;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-pagination {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .wallet-container {
    padding: 20px 16px;
  }
  
  .balance-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .balance-value {
    font-size: 36px;
  }
  
  .balance-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .balance-actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
