<template>
  <div class="inquiry-list-page" :style="pageStyle">
    <!-- 导航栏 -->
    <nav class="page-nav">
      <button class="back-btn" @click="goHome">
        <span>←</span> 返回首页
      </button>
      <h1 class="page-title">我的咨询记录</h1>
    </nav>

    <!-- 咨询列表 -->
    <main class="inquiry-list">
      <div class="container">
        <!-- 空状态 -->
        <div v-if="inquiries.length === 0" class="empty-state">
          <div class="empty-icon">📞</div>
          <h2>暂无咨询记录</h2>
          <p>您可以在报价页提交咨询，我们的策划师将尽快与您联系</p>
          <button class="btn-primary" @click="goHome">去浏览主题</button>
        </div>

        <!-- 统计卡片 -->
        <div v-else class="stats-bar">
          <div class="stat-item">
            <span class="stat-number">{{ inquiries.length }}</span>
            <span class="stat-label">总咨询</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ pendingCount }}</span>
            <span class="stat-label">待处理</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ contactedCount }}</span>
            <span class="stat-label">已联系</span>
          </div>
        </div>

        <!-- 咨询卡片列表 -->
        <div v-if="inquiries.length > 0" class="inquiries-list">
          <div 
            v-for="(inquiry, index) in inquiries" 
            :key="index"
            class="inquiry-card"
            :style="cardStyle"
          >
            <!-- 状态标签 -->
            <div class="status-badge" :class="`status-${inquiry.status}`">
              {{ getStatusText(inquiry.status) }}
            </div>

            <!-- 客户信息 -->
            <div class="customer-section">
              <div class="customer-name">{{ inquiry.customerInfo.name }}</div>
              <div class="customer-contact">{{ inquiry.customerInfo.contact }}</div>
              <div class="event-date">
                <span>📅</span> {{ inquiry.customerInfo.preferredDate }}
              </div>
            </div>

            <!-- 方案信息 -->
            <div class="plan-section">
              <div class="plan-item">
                <span class="plan-icon">{{ getThemeIcon(inquiry.selection.themeId) }}</span>
                <span>{{ inquiry.selection.themeName }}</span>
              </div>
              <div class="plan-item">
                <span>{{ inquiry.selection.sceneName }}</span>
              </div>
              <div class="plan-item">
                <span>{{ inquiry.selection.packageName }}</span>
              </div>
            </div>

            <!-- 价格 -->
            <div class="price-section">
              <span class="price-label">预估总价</span>
              <span class="price-value" :style="priceStyle">
                {{ formatPrice(inquiry.pricing.finalTotal) }}
              </span>
            </div>

            <!-- 时间和操作 -->
            <div class="card-footer">
              <span class="submit-time">{{ formatTime(inquiry.submitTime) }}</span>
              <div class="actions">
                <button class="btn-view" @click.stop="viewDetail(inquiry, index)">
                  查看详情
                </button>
                <select 
                  class="status-select" 
                  v-model="inquiry.status"
                  @change="updateStatus(index, inquiry.status)"
                >
                  <option value="pending">待处理</option>
                  <option value="contacted">已联系</option>
                  <option value="closed">已关闭</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 详情抽屉 -->
    <div v-if="selectedInquiry" class="detail-drawer" @click.self="closeDetail">
      <div class="drawer-content" :style="drawerStyle">
        <div class="drawer-header">
          <h2>咨询详情</h2>
          <button class="close-btn" @click="closeDetail">×</button>
        </div>

        <div class="drawer-body">
          <!-- 状态 -->
          <div class="detail-section">
            <h3>当前状态</h3>
            <div class="status-display" :class="`status-${selectedInquiry.status}`">
              {{ getStatusText(selectedInquiry.status) }}
            </div>
          </div>

          <!-- 客户信息 -->
          <div class="detail-section">
            <h3>客户信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="item-label">姓名</span>
                <span class="item-value">{{ selectedInquiry.customerInfo.name }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">联系方式</span>
                <span class="item-value">{{ selectedInquiry.customerInfo.contact }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">活动日期</span>
                <span class="item-value">{{ selectedInquiry.customerInfo.preferredDate }}</span>
              </div>
            </div>
            <div class="detail-item full" v-if="selectedInquiry.customerInfo.notes">
              <span class="item-label">备注</span>
              <span class="item-value notes">{{ selectedInquiry.customerInfo.notes }}</span>
            </div>
          </div>

          <!-- 方案选择 -->
          <div class="detail-section">
            <h3>方案选择</h3>
            <div class="plan-detail">
              <div class="plan-row">
                <span class="plan-label">主题</span>
                <span class="plan-value">
                  {{ getThemeIcon(selectedInquiry.selection.themeId) }} 
                  {{ selectedInquiry.selection.themeName }}
                </span>
              </div>
              <div class="plan-row">
                <span class="plan-label">场景</span>
                <span class="plan-value">{{ selectedInquiry.selection.sceneName }}</span>
              </div>
              <div class="plan-row">
                <span class="plan-label">套餐</span>
                <span class="plan-value">{{ selectedInquiry.selection.packageName }}</span>
              </div>
              <div class="plan-row" v-if="selectedInquiry.selection.addons.length > 0">
                <span class="plan-label">附加项</span>
                <span class="plan-value">
                  {{ selectedInquiry.selection.addons.map(a => a.name).join('、') }}
                </span>
              </div>
            </div>
          </div>

          <!-- 价格明细 -->
          <div class="detail-section">
            <h3>价格明细</h3>
            <div class="price-detail">
              <div class="price-row">
                <span>套餐基础价</span>
                <span>{{ formatPrice(selectedInquiry.pricing.packagePrice) }}</span>
              </div>
              <div class="price-row">
                <span>场景基础费</span>
                <span>{{ formatPrice(selectedInquiry.pricing.sceneFee) }}</span>
              </div>
              <div class="price-row" v-if="selectedInquiry.pricing.addonsTotal > 0">
                <span>附加项</span>
                <span>{{ formatPrice(selectedInquiry.pricing.addonsTotal) }}</span>
              </div>
              <div class="price-row total">
                <span>预估总价</span>
                <span class="total-price">{{ formatPrice(selectedInquiry.pricing.finalTotal) }}</span>
              </div>
            </div>
          </div>

          <!-- 提交信息 -->
          <div class="detail-section">
            <h3>提交信息</h3>
            <div class="detail-item">
              <span class="item-label">提交时间</span>
              <span class="item-value">{{ formatDateTime(selectedInquiry.submitTime) }}</span>
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <button class="btn-delete" @click="deleteInquiry(selectedIndex)">
            删除记录
          </button>
          <button 
            class="btn-contact" 
            v-if="selectedInquiry.status === 'pending'"
            @click="markContacted(selectedIndex)"
          >
            标记已联系
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InquiryList',
  
  data() {
    return {
      inquiries: [],
      selectedInquiry: null,
      selectedIndex: -1
    };
  },
  
  computed: {
    pageStyle() {
      return {
        background: 'linear-gradient(180deg, #0a1628 0%, #1a0b2e 50%, #0d1b2a 100%)',
        color: '#ffffff',
        minHeight: '100vh'
      };
    },
    
    cardStyle() {
      return {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px'
      };
    },
    
    priceStyle() {
      return {
        color: '#ffd700',
        fontWeight: 700
      };
    },
    
    drawerStyle() {
      return {
        background: '#0a1628',
        borderLeft: '1px solid rgba(0, 212, 255, 0.3)'
      };
    },
    
    pendingCount() {
      return this.inquiries.filter(i => i.status === 'pending').length;
    },
    
    contactedCount() {
      return this.inquiries.filter(i => i.status === 'contacted').length;
    }
  },
  
  mounted() {
    this.loadInquiries();
  },
  
  methods: {
    loadInquiries() {
      const saved = localStorage.getItem('inquirySubmissions');
      if (saved) {
        try {
          this.inquiries = JSON.parse(saved);
        } catch (e) {
          console.error('读取咨询记录失败:', e);
        }
      }
    },
    
    getThemeIcon(themeId) {
      const icons = { space: '🚀', castle: '🏰', forest: '🌲' };
      return icons[themeId] || '✨';
    },
    
    getStatusText(status) {
      const texts = {
        pending: '待处理',
        contacted: '已联系',
        closed: '已关闭'
      };
      return texts[status] || status;
    },
    
    formatPrice(price) {
      return '$' + price.toLocaleString();
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
      }
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小时前`;
      }
      return date.toLocaleDateString('zh-CN');
    },
    
    formatDateTime(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN');
    },
    
    viewDetail(inquiry, index) {
      this.selectedInquiry = inquiry;
      this.selectedIndex = index;
    },
    
    closeDetail() {
      this.selectedInquiry = null;
      this.selectedIndex = -1;
    },
    
    updateStatus(index, newStatus) {
      this.inquiries[index].status = newStatus;
      localStorage.setItem('inquirySubmissions', JSON.stringify(this.inquiries));
    },
    
    markContacted(index) {
      this.inquiries[index].status = 'contacted';
      localStorage.setItem('inquirySubmissions', JSON.stringify(this.inquiries));
      if (this.selectedInquiry) {
        this.selectedInquiry.status = 'contacted';
      }
    },
    
    deleteInquiry(index) {
      if (confirm('确定要删除这条咨询记录吗？')) {
        this.inquiries.splice(index, 1);
        localStorage.setItem('inquirySubmissions', JSON.stringify(this.inquiries));
        this.closeDetail();
      }
    },
    
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.inquiry-list-page {
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-nav {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  margin-right: 20px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.empty-state p {
  opacity: 0.7;
  margin-bottom: 24px;
}

.btn-primary {
  padding: 14px 32px;
  background: #00d4ff;
  border: none;
  border-radius: 25px;
  color: #0a1628;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-item {
  flex: 1;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #00d4ff;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* 咨询卡片 */
.inquiries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inquiry-card {
  padding: 20px;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-contacted {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
}

.status-closed {
  background: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.customer-section {
  margin-bottom: 16px;
}

.customer-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.customer-contact {
  font-size: 0.875rem;
  opacity: 0.7;
  margin-bottom: 8px;
}

.event-date {
  font-size: 0.875rem;
  opacity: 0.8;
}

.plan-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.plan-icon {
  font-size: 1rem;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.price-label {
  font-size: 0.875rem;
  opacity: 0.7;
}

.price-value {
  font-size: 1.5rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-time {
  font-size: 0.8125rem;
  opacity: 0.6;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-view {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 0.8125rem;
  cursor: pointer;
}

.status-select {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 0.8125rem;
  cursor: pointer;
}

/* 详情抽屉 */
.detail-drawer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-content {
  width: 100%;
  max-width: 480px;
  height: 100%;
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-header h2 {
  font-size: 1.5rem;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.drawer-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 0.875rem;
  opacity: 0.6;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-display {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-item.full {
  flex-direction: column;
  gap: 8px;
}

.item-label {
  opacity: 0.6;
  font-size: 0.875rem;
}

.item-value {
  font-weight: 500;
}

.item-value.notes {
  opacity: 0.8;
  line-height: 1.6;
}

.plan-detail {
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 12px;
}

.plan-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.plan-row:last-child {
  border-bottom: none;
}

.plan-label {
  opacity: 0.6;
  font-size: 0.875rem;
}

.price-detail {
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.price-row.total {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  padding-top: 16px;
}

.total-price {
  color: #ffd700;
  font-size: 1.25rem;
  font-weight: 700;
}

.drawer-footer {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
}

.drawer-footer button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-delete {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.btn-contact {
  background: #00d4ff;
  color: #0a1628;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .stats-bar {
    flex-direction: column;
  }
  
  .drawer-content {
    max-width: 100%;
  }
}
</style>
