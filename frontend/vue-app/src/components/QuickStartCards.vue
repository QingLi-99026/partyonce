<template>
  <div class="quick-start-section">
    <div class="section-header">
      <h2>快速开始</h2>
      <p>选择适合您的方式，30秒开启派对策划</p>
    </div>
    
    <div class="entry-cards">
      <!-- 快速开始 - 模板最短路径 -->
      <div class="entry-card entry-card--quick" @click="$router.push('/templates')" data-testid="entry-quick">
        <div class="entry-badge">最快</div>
        <div class="entry-icon">
          <el-icon><Timer /></el-icon>
        </div>
        <h3>快速开始</h3>
        <p>使用精选模板，一键生成派对方案</p>
        <div class="entry-meta">2分钟完成</div>
        <el-button type="primary" class="entry-btn">选择模板</el-button>
      </div>
      
      <!-- AI策划 - 问答式 -->
      <div class="entry-card entry-card--ai" @click="startWizard" data-testid="entry-ai">
        <div class="entry-badge entry-badge--hot">推荐</div>
        <div class="entry-icon">
          <el-icon><Magic /></el-icon>
        </div>
        <h3>AI 智能策划</h3>
        <p>回答5个简单问题，AI为您定制方案</p>
        <div class="entry-meta">3-5分钟</div>
        <el-button type="primary" class="entry-btn">开始问答</el-button>
      </div>
      
      <!-- 3D设计 - 高级入口 -->
      <div class="entry-card entry-card--3d" @click="$router.push('/3d-designer')" data-testid="entry-3d">
        <div class="entry-icon">
          <el-icon><View /></el-icon>
        </div>
        <h3>3D 场景设计</h3>
        <p>可视化布置效果，拖拽调整细节</p>
        <div class="entry-meta">高级功能</div>
        <el-button class="entry-btn">进入设计</el-button>
      </div>
    </div>
    
    <!-- 轻量 Wizard 弹窗 -->
    <QuickWizard v-model="showWizard" @complete="onWizardComplete" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import QuickWizard from './QuickWizard.vue'

const router = useRouter()
const showWizard = ref(false)

const startWizard = () => {
  showWizard.value = true
}

const onWizardComplete = (data) => {
  // 完成后跳转到 AI Planner 或结果页
  router.push({
    path: '/ai-planner',
    query: { ...data, fromWizard: '1' }
  })
}
</script>

<style scoped>
.quick-start-section {
  padding: 80px 20px;
  background: linear-gradient(180deg, #f8f9fa 0%, #fff 100%);
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.section-header p {
  font-size: 18px;
  color: #909399;
}

.entry-cards {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.entry-card {
  position: relative;
  padding: 40px 32px;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.entry-card:hover {
  transform: translateY(-8px);
}

.entry-card--quick {
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
}

.entry-card--quick:hover {
  border-color: #3b82f6;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
}

.entry-card--ai {
  background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
}

.entry-card--ai:hover {
  border-color: #8b5cf6;
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
}

.entry-card--3d {
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
}

.entry-card--3d:hover {
  border-color: #10b981;
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15);
}

.entry-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: #3b82f6;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
}

.entry-badge--hot {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
}

.entry-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 32px;
}

.entry-card--quick .entry-icon {
  background: #3b82f6;
  color: white;
}

.entry-card--ai .entry-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
}

.entry-card--3d .entry-icon {
  background: #10b981;
  color: white;
}

.entry-card h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.entry-card p {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 16px;
  min-height: 48px;
}

.entry-meta {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(255,255,255,0.8);
  border-radius: 20px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 20px;
}

.entry-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .entry-cards {
    grid-template-columns: 1fr;
  }
  
  .section-header h2 {
    font-size: 28px;
  }
}
</style>
