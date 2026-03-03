<template>
  <div class="wallet-page">
    <div class="page-header">
      <h1>我的钱包</h1>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else>
      <!-- 余额卡片 -->
      <el-card class="balance-card">
        <div class="balance-header">
          <div>
            <p class="balance-label">当前余额</p>
            <p class="balance-amount">${{ wallet.balance?.toFixed(2) || '0.00' }}</p>
          </div>
          <el-button type="primary" size="large" disabled>
            提现（即将上线）
          </el-button>
        </div>

        <el-divider />

        <div class="balance-stats">
          <div class="stat-item">
            <p class="stat-label">累计收益</p>
            <p class="stat-value">${{ wallet.total_earned?.toFixed(2) || '0.00' }}</p>
          </div>
          <div class="stat-item">
            <p class="stat-label">累计提现</p>
            <p class="stat-value">${{ wallet.total_withdrawn?.toFixed(2) || '0.00' }}</p>
          </div>
        </div>
      </el-card>

      <!-- 收益说明 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>💰 收益规则</span>
          </div>
        </template>

        <ul class="rule-list">
          <li>
            <span class="rule-event">分享点击</span>
            <span class="rule-amount">+$0.20</span>
            <span class="rule-note">（每日上限10次）</span>
          </li>
          <li>
            <span class="rule-event">好友注册</span>
            <span class="rule-amount">+$2.00</span>
          </li>
          <li>
            <span class="rule-event">成交奖励</span>
            <span class="rule-amount">+$20.00</span>
            <span class="rule-note">（每单限一次）</span>
          </li>
        </ul>
      </el-card>

      <!-- 流水明细 -->
      <el-card class="ledger-card">
        <template #header>
          <div class="card-header">
            <span>📋 流水明细</span>
          </div>
        </template>

        <el-empty v-if="ledger.length === 0" description="暂无流水记录" />

        <el-timeline v-else class="ledger-timeline">
          <el-timeline-item
            v-for="item in ledger"
            :key="item.id"
            :type="item.amount > 0 ? 'success' : 'warning'"
          >
            <div class="ledger-item">
              <div class="ledger-info">
                <p class="ledger-reason">{{ getReasonText(item.reason) }}</p>
                <p class="ledger-time">{{ formatDate(item.created_at) }}</p>
              </div>
              <div class="ledger-amount" :class="{ positive: item.amount > 0 }">
                {{ item.amount > 0 ? '+' : '' }}${{ item.amount?.toFixed(2) }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>

        <el-pagination
          v-if="ledger.length > 0"
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchLedger"
          class="pagination"
        />
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const loading = ref(true)
const wallet = ref({
  balance: 0,
  total_earned: 0,
  total_withdrawn: 0
})
const ledger = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getReasonText = (reason) => {
  const texts = {
    'click_bonus': '分享点击奖励',
    'signup_bonus': '好友注册奖励',
    'deposit_bonus': '成交奖励',
    'withdraw': '提现'
  }
  return texts[reason] || reason
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const fetchWallet = async () => {
  try {
    const response = await fetch('/api/wallet', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      wallet.value = await response.json()
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchLedger = async () => {
  try {
    const response = await fetch(`/api/wallet/ledger?page=${page.value}&limit=${pageSize.value}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      ledger.value = data
      // total.value = data.total || 0
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  await Promise.all([fetchWallet(), fetchLedger()])
  loading.value = false
})
</script>

<style scoped>
.wallet-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
}

.balance-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 8px;
}

.balance-amount {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
}

.balance-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin: 0 0 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.info-card, .ledger-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rule-list li {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.rule-list li:last-child {
  border-bottom: none;
}

.rule-event {
  width: 100px;
  font-weight: 500;
}

.rule-amount {
  color: #67c23a;
  font-weight: bold;
  font-size: 18px;
  margin-right: 12px;
}

.rule-note {
  color: #909399;
  font-size: 12px;
}

.ledger-timeline {
  padding: 20px 0;
}

.ledger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ledger-reason {
  margin: 0 0 4px;
  font-weight: 500;
}

.ledger-time {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.ledger-amount {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.ledger-amount.positive {
  color: #67c23a;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}

.loading {
  padding: 60px 0;
}
</style>
