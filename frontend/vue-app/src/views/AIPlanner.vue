<template>
  <div class="ai-planner-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon"><el-icon><MagicStick /></el-icon></div>
        <h1>AI 智能派对策划</h1>
        <p>告诉AI您的需求，让智能算法为您生成专属派对方案</p>
      </div>
    </div>

    <div class="planner-container">
      <!-- Input Form -->
      <div v-if="!generatedPlans.length" class="input-section">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>填写派对需求</span>
              <el-button type="text" @click="fillDemoData">使用示例数据</el-button>
            </div>
          </template>
          
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="planner-form"
          >
            <div class="form-row">
              <el-form-item label="派对类型" prop="eventType" class="form-col">
                <el-select v-model="form.eventType" placeholder="选择派对类型" style="width: 100%">
                  <el-option label="生日派对" value="birthday" />
                  <el-option label="婚礼" value="wedding" />
                  <el-option label="企业年会" value="corporate" />
                  <el-option label="宝宝宴" value="baby" />
                  <el-option label="毕业派对" value="graduation" />
                  <el-option label="节日派对" value="holiday" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="派对名称" prop="eventName" class="form-col">
                <el-input v-model="form.eventName" placeholder="给您的派对起个名字" />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="预计人数" prop="guestCount" class="form-col">
                <el-input-number v-model="form.guestCount" :min="5" :max="1000" style="width: 100%" />
              </el-form-item>
              
              <el-form-item label="预算范围" prop="budgetRange" class="form-col">
                <el-select v-model="form.budgetRange" placeholder="选择预算" style="width: 100%">
                  <el-option label="$500 - $1,000" value="500-1000" />
                  <el-option label="$1,000 - $3,000" value="1000-3000" />
                  <el-option label="$3,000 - $5,000" value="3000-5000" />
                  <el-option label="$5,000 - $10,000" value="5000-10000" />
                  <el-option label="$10,000+" value="10000+" />
                </el-select>
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="期望日期" prop="preferredDate" class="form-col">
                <el-date-picker
                  v-model="form.preferredDate"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
              
              <el-form-item label="城市/地区" prop="location" class="form-col">
                <el-input v-model="form.location" placeholder="如：悉尼市中心" />
              </el-form-item>
            </div>
            
            <el-form-item label="派对风格偏好" prop="stylePreferences">
              <el-checkbox-group v-model="form.stylePreferences">
                <el-checkbox-button label="elegant">优雅经典</el-checkbox-button>
                <el-checkbox-button label="modern">现代简约</el-checkbox-button>
                <el-checkbox-button label="vintage">复古怀旧</el-checkbox-button>
                <el-checkbox-button label="nature">自然清新</el-checkbox-button>
                <el-checkbox-button label="luxury">奢华高端</el-checkbox-button>
                <el-checkbox-button label="casual">轻松随意</el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="特殊需求/备注" prop="specialRequests">
              <el-input
                v-model="form.specialRequests"
                type="textarea"
                rows="4"
                placeholder="请描述您的特殊需求，如主题、色调、餐饮要求、娱乐活动等..."
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="generating"
                @click="generatePlans"
                style="width: 100%"
              >
                <span v-if="!generating"><el-icon><Magic /></el-icon> AI生成策划方案</span>
                <span v-else>AI正在为您规划...({{ progress }}%)</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- Generated Plans -->
      <div v-else class="results-section">
        <div class="results-header">
          <h2>🎉 AI为您生成了 3 个派对方案</h2>
          <el-button @click="resetForm">重新生成</el-button>
        </div>
        
        <div class="plans-grid">
          <div
            v-for="(plan, index) in generatedPlans"
            :key="index"
            class="plan-card"
            :class="{ selected: selectedPlan === index }"
            @click="selectedPlan = index"
          >
            <div class="plan-header">
              <div class="plan-number">方案 {{ index + 1 }}</div>
              <div v-if="selectedPlan === index" class="selected-badge">已选择</div>
            </div>
            
            <div class="plan-content">
              <h3>{{ plan.name }}</h3>
              <p class="plan-desc">{{ plan.description }}</p>
              
              <div class="plan-section">
                <h4>🎯 主题概念</h4>
                <p>{{ plan.theme }}</p>
              </div>
              
              <div class="plan-section">
                <h4>🎨 色彩方案</h4>
                <div class="color-palette">
                  <span
                    v-for="color in plan.colors"
                    :key="color"
                    class="color-dot"
                    :style="{ background: color }"
                  ></span>
                </div>
              </div>
              
              <div class="plan-section">
                <h4>📍 推荐场地</h4>
                <div class="venue-recommendations">
                  <div v-for="venue in plan.venues" :key="venue.name" class="venue-item">
                    <strong>{{ venue.name }}</strong> - {{ venue.type }}
                    <p>{{ venue.reason }}</p>
                  </div>
                </div>
              </div>
              
              <div class="plan-section">
                <h4>🍽️ 餐饮建议</h4>
                <p>{{ plan.catering }}</p>
              </div>
              
              <div class="plan-section">
                <h4>🎪 活动安排</h4>
                <ul>
                  <li v-for="(activity, i) in plan.activities" :key="i">{{ activity }}</li>
                </ul>
              </div>
              
              <div class="plan-section">
                <h4>💰 预算估算</h4>
                <div class="budget-breakdown">
                  <div v-for="(cost, key) in plan.budget" :key="key" class="budget-item">
                    <span>{{ key }}:</span>
                    <span class="cost">${{ cost }}</span>
                  </div>
                  <div class="budget-total">
                    <span>总计:</span>
                    <span class="cost">${{ plan.totalBudget }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="actions-bar">
          <el-button size="large" @click="resetForm">重新生成</el-button>
          <el-button
            type="primary"
            size="large"
            :disabled="selectedPlan === null"
            @click="confirmPlan"
          >
            确认选择并继续
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { aiAPI } from '@/api/modules'
import { usePlanStore } from '@/store'

const router = useRouter()
const planStore = usePlanStore()
const formRef = ref(null)
const generating = ref(false)
const progress = ref(0)
const generatedPlans = ref([])
const selectedPlan = ref(null)

const form = ref({
  eventType: '',
  eventName: '',
  guestCount: 50,
  budgetRange: '',
  preferredDate: '',
  location: '',
  stylePreferences: [],
  specialRequests: ''
})

const rules = {
  eventType: [{ required: true, message: '请选择派对类型', trigger: 'change' }],
  eventName: [{ required: true, message: '请输入派对名称', trigger: 'blur' }],
  guestCount: [{ required: true, message: '请输入预计人数', trigger: 'blur' }],
  budgetRange: [{ required: true, message: '请选择预算范围', trigger: 'change' }]
}

const fillDemoData = () => {
  form.value = {
    eventType: 'birthday',
    eventName: '30岁生日派对',
    guestCount: 60,
    budgetRange: '3000-5000',
    preferredDate: '',
    location: '悉尼',
    stylePreferences: ['elegant', 'modern'],
    specialRequests: '希望有现场DJ和舞蹈区域，菜品以海鲜为主，需要拍照背景墙'
  }
}

const generatePlans = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  generating.value = true
  progress.value = 0

  // 模拟进度
  const interval = setInterval(() => {
    progress.value += Math.random() * 15
    if (progress.value >= 100) progress.value = 100
  }, 300)

  try {
    // 调用API
    const res = await aiAPI.generatePlan({
      event_type: form.value.eventType,
      event_name: form.value.eventName,
      guest_count: form.value.guestCount,
      budget_range: form.value.budgetRange,
      preferred_date: form.value.preferredDate,
      location_preference: form.value.location,
      style_preferences: form.value.stylePreferences,
      special_requests: form.value.specialRequests
    })

    generatedPlans.value = res.plans || getMockPlans()
    planStore.setCurrentPlan({
      ...form.value,
      plans: generatedPlans.value
    })
  } catch (error) {
    // 使用模拟数据
    generatedPlans.value = getMockPlans()
  } finally {
    clearInterval(interval)
    generating.value = false
    progress.value = 100
  }
}

const getMockPlans = () => {
  return [
    {
      name: '星光晚宴',
      description: '优雅的现代风格派对，融合金属与玻璃元素，打造高级感的视觉体验',
      theme: '以星空为灵感，运用深蓝色调搭配金色点缀，营造浪漫而神秘的氛围',
      colors: ['#1a1a2e', '#16213e', '#e94560', '#ffd700'],
      venues: [
        { name: '云端宴会厅', type: '酒店宴会厅', reason: '高挑天花板适合星空主题灯光设计' },
        { name: '星空露台', type: '屋顶露台', reason: '真实星空视野，自然氛围' }
      ],
      catering: '海鲜自助 + 精致甜点台，推荐生蚝、龙虾、三文鱼，配合香槟和特调鸡尾酒',
      activities: ['宾客签到墙拍照', '生日许愿仪式', '切蛋糕仪式', '自由舞蹈时间', '抽奖环节'],
      budget: { 场地: 2500, 餐饮: 1800, 装饰: 800, 音响灯光: 600, 其他: 300 },
      totalBudget: 6000
    },
    {
      name: '花园派对',
      description: '自然清新的户外派对，充满绿植和鲜花，轻松惬意的氛围',
      theme: '英式花园风格，大量使用鲜花、绿植、藤编元素，营造田园诗意',
      colors: ['#2d5016', '#87c38f', '#f9e79f', '#f5f5dc'],
      venues: [
        { name: '海景花园会所', type: '私人会所', reason: '私家花园，绿意盎然' },
        { name: '绿茵庄园', type: '户外花园', reason: '5000平大草坪，适合户外派对' }
      ],
      catering: '野餐风格自助餐，三明治、沙拉、水果、起泡酒，户外BBQ区',
      activities: ['户外游戏区', '花园拍照', '午后茶歇', '草坪音乐会', '篝火晚会'],
      budget: { 场地: 1800, 餐饮: 1500, 装饰: 1200, 音响: 400, 其他: 500 },
      totalBudget: 5400
    },
    {
      name: '都市摩登',
      description: '时尚前卫的工业风派对，适合追求个性的年轻群体',
      theme: 'Loft工业风，裸露砖墙、金属管道、霓虹灯，展现城市现代感',
      colors: ['#2c3e50', '#95a5a6', '#e74c3c', '#ecf0f1'],
      venues: [
        { name: '艺术中心', type: '艺术空间', reason: '工业风装修，空间灵活' },
        { name: '都市酒廊', type: '私人酒廊', reason: '现代设计，氛围时尚' }
      ],
      catering: '融合料理 + 创意鸡尾酒，分子料理小食、手工汉堡、精酿啤酒',
      activities: ['DJ现场打碟', '霓虹灯拍照区', '调酒表演', '舞蹈比赛', '午夜烟花'],
      budget: { 场地: 2200, 餐饮: 1600, 装饰: 900, 音响DJ: 1000, 其他: 400 },
      totalBudget: 6100
    }
  ]
}

const resetForm = () => {
  generatedPlans.value = []
  selectedPlan.value = null
  formRef.value?.resetFields()
}

const confirmPlan = () => {
  if (selectedPlan.value === null) {
    ElMessage.warning('请先选择一个方案')
    return
  }
  
  planStore.setCurrentPlan({
    ...planStore.currentPlan,
    selectedPlanIndex: selectedPlan.value
  })
  
  ElMessage.success('方案已保存，跳转到3D设计器')
  router.push('/3d-designer')
}
</script>

<style scoped>
.ai-planner-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px;
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

.planner-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.input-card {
  border-radius: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.planner-form {
  max-width: 800px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-col {
  margin-bottom: 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.results-header h2 {
  font-size: 24px;
  color: #303133;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.plan-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

.plan-card.selected {
  border-color: #409EFF;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.plan-number {
  font-weight: bold;
}

.selected-badge {
  background: white;
  color: #409EFF;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.plan-content {
  padding: 20px;
}

.plan-content h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #303133;
}

.plan-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.6;
}

.plan-section {
  margin-bottom: 20px;
}

.plan-section h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: #409EFF;
}

.plan-section p,
.plan-section ul {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.plan-section ul {
  padding-left: 20px;
}

.color-palette {
  display: flex;
  gap: 8px;
}

.color-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
}

.venue-item {
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.venue-item:last-child {
  border-bottom: none;
}

.venue-item p {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.budget-breakdown {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.budget-total {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #dcdfe6;
  font-weight: bold;
  font-size: 16px;
}

.cost {
  color: #f56c6c;
}

.actions-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 1024px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>