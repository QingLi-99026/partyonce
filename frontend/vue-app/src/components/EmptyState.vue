<template>
  <div class="empty-state" data-testid="empty-state">
    <div class="empty-illustration">
      <slot name="icon">
        <div class="default-icon">📦</div>
      </slot>
    </div>
    
    <h3 class="empty-title">{{ title }}</h3>
    
    <p class="empty-desc">{{ description }}</p>
    
    <!-- 示例卡片 -->
    <div v-if="showExample" class="example-card">
      <div class="example-preview">
        <slot name="example">
          <div class="default-example">
            <div class="example-line"></div>
            <div class="example-line short"></div>
            <div class="example-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </slot>
      </div>
      <div class="example-label">示例</div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="empty-actions">
      <slot name="actions">
        <el-button v-if="primaryAction" type="primary" size="large" @click="$emit('primary')" data-testid="empty-primary-btn">
          <el-icon v-if="primaryIcon"><component :is="primaryIcon" /></el-icon>
          {{ primaryText }}
        </el-button>
        
        <el-button v-if="secondaryAction" size="large" @click="$emit('secondary')" data-testid="empty-secondary-btn">
          {{ secondaryText }}
        </el-button>
      </slot>
    </div>
    
    <!-- 提示语 -->
    <p v-if="tip" class="empty-tip">💡 {{ tip }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '开始创建您的第一个项目吧' },
  showExample: { type: Boolean, default: true },
  primaryAction: { type: Boolean, default: true },
  primaryText: { type: String, default: '一键开始' },
  primaryIcon: String,
  secondaryAction: { type: Boolean, default: false },
  secondaryText: { type: String, default: '导入Demo' },
  tip: String
})

defineEmits(['primary', 'secondary'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}

.empty-illustration {
  margin-bottom: 24px;
}

.default-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 320px;
}

.example-card {
  position: relative;
  width: 100%;
  max-width: 280px;
  background: white;
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  transition: all 0.3s;
}

.example-card:hover {
  border-color: #d1d5db;
  background: #fafafa;
}

.example-label {
  position: absolute;
  top: -10px;
  left: 16px;
  padding: 4px 12px;
  background: #8b5cf6;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
}

.default-example {
  opacity: 0.5;
}

.example-line {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  margin-bottom: 10px;
}

.example-line.short {
  width: 60%;
}

.example-dots {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.example-dots span {
  width: 32px;
  height: 32px;
  background: #e5e7eb;
  border-radius: 50%;
}

.empty-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.empty-actions :deep(.el-button) {
  min-width: 140px;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
}

.empty-tip {
  margin-top: 20px;
  font-size: 14px;
  color: #6b7280;
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 12px;
}
</style>
