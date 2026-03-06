<template>
  <div class="home-page">
    <!-- Quick Start Section - 3 Entry Cards -->
    <QuickStartCards />
    
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>让每一个派对都独一无二</h1>
        <p>AI智能策划 · 精选场地 · 3D设计 · 一站式派对服务</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/ai-planner')">
            <el-icon><Magic /></el-icon>
            AI策划派对
          </el-button>
          <el-button size="large" @click="$router.push('/venues')">
            <el-icon><OfficeBuilding /></el-icon>
            浏览场地
          </el-button>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number">500+</div>
          <div class="stat-label">精选场地</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">10k+</div>
          <div class="stat-label">成功派对</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">98%</div>
          <div class="stat-label">满意度</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2>我们的服务</h2>
        <p>从策划到执行，全程智能辅助</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card" @click="$router.push('/ai-planner')">
          <div class="feature-icon"><el-icon><Magic /></el-icon></div>
          <h3>AI智能策划</h3>
          <p>只需输入您的需求，AI即刻生成专属派对方案，包含场地、布置、餐饮等全方位建议。</p>
        </div>
        
        <div class="feature-card" @click="$router.push('/venues')">
          <div class="feature-icon blue"><el-icon><OfficeBuilding /></el-icon></div>
          <h3>精选场地</h3>
          <p>严选500+优质场地，涵盖酒店、会所、户外等多种类型，满足不同规模派对需求。</p>
        </div>
        
        <div class="feature-card" @click="$router.push('/3d-designer')">
          <div class="feature-icon purple"><el-icon><View /></el-icon></div>
          <h3>3D场景设计</h3>
          <p>可视化派对布置效果，实时调整桌椅、灯光、装饰，提前预览完美派对。</p>
        </div>
        
        <div class="feature-card" @click="$router.push('/quotation')">
          <div class="feature-icon green"><el-icon><Document /></el-icon></div>
          <h3>智能报价</h3>
          <p>根据您的需求自动生成详细报价单，费用透明，支持在线支付和分期付款。</p>
        </div>
      </div>
    </section>

    <!-- Popular Venues Section -->
    <section class="venues-section">
      <div class="section-header">
        <h2>热门场地</h2>
        <p>精选最受欢迎的派对场地</p>
      </div>
      
      <div class="venues-grid">
        <div 
          v-for="venue in popularVenues" 
          :key="venue.id" 
          class="venue-card"
          @click="$router.push(`/venues/${venue.id}`)"
        >
          <div class="venue-image">
            <img :src="venue.image" :alt="venue.name">
            <div v-if="venue.isPartner" class="partner-badge">合作伙伴</div>
          </div>
          <div class="venue-info">
            <h3>{{ venue.name }}</h3>
            <p class="venue-location"><el-icon><Location /></el-icon>{{ venue.city }}</p>
            <div class="venue-meta">
              <span><el-icon><User /></el-icon>{{ venue.capacity }}人</span>
              <span class="venue-price">${{ venue.price }}/起</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section-footer">
        <el-button type="primary" plain @click="$router.push('/venues')">
          查看全部场地 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>准备好开始您的派对了吗？</h2>
        <p>立即使用AI策划，让梦想派对成为现实</p>
        <el-button type="primary" size="large" @click="$router.push('/ai-planner')">
          免费开始策划
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QuickStartCards from '../components/QuickStartCards.vue'

const popularVenues = ref([
  { id: 1, name: '云端宴会厅', city: '悉尼', capacity: 200, price: '2,500', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400', isPartner: true },
  { id: 2, name: '海景花园会所', city: '墨尔本', capacity: 150, price: '1,800', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400', isPartner: false },
  { id: 3, name: '星空露台', city: '布里斯班', capacity: 80, price: '1,200', image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400', isPartner: true },
  { id: 4, name: '艺术中心', city: '悉尼', capacity: 300, price: '3,500', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', isPartner: false }
])
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: 700;
}

.hero-content p {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 80px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.features-section {
  padding: 80px 20px;
  background: #fff;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 36px;
  margin-bottom: 12px;
  color: #303133;
}

.section-header p {
  font-size: 16px;
  color: #909399;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-card {
  padding: 40px 24px;
  border-radius: 16px;
  background: #f8f9fa;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.feature-icon.blue { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.feature-icon.purple { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
.feature-icon.purple .el-icon { color: #764ba2; }
.feature-icon.green { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.feature-icon.green .el-icon { color: #27ae60; }

.feature-icon .el-icon {
  font-size: 28px;
  color: white;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #303133;
}

.feature-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.venues-section {
  padding: 80px 20px;
  background: #f5f7fa;
}

.venues-grid {
  max-width: 1200px;
  margin: 0 auto 40px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.venue-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.venue-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

.venue-image {
  position: relative;
  height: 180px;
}

.venue-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.partner-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #67c23a;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.venue-info {
  padding: 16px;
}

.venue-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.venue-location {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.venue-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.venue-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
}

.venue-price {
  color: #f56c6c !important;
  font-weight: bold;
}

.section-footer {
  text-align: center;
}

.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100px 20px;
  text-align: center;
  color: white;
}

.cta-content h2 {
  font-size: 36px;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

@media (max-width: 1024px) {
  .features-grid,
  .venues-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 32px;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 24px;
  }
  
  .features-grid,
  .venues-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>