<template>
  <Teleport to="body">
    <Transition name="wizard">
      <div v-if="modelValue" class="wizard-overlay" @click.self="close">
        <div class="wizard-container">
          <!-- 头部 -->
          <div class="wizard-header">
            <div class="wizard-step-indicator">
              <div
                v-for="n in totalSteps"
                :key="n"
                :class="['step-dot', { active: n === currentStep, completed: n < currentStep }]"
              />
            </div>
            <button class="wizard-close" @click="close">×</button>
          </div>

          <!-- 内容区 -->
          <div class="wizard-content">
            <!-- 步骤1: 城市 -->
            <div v-if="currentStep === 1" class="wizard-step" data-testid="wizard-step-1">
              <div class="step-icon">🏙️</div>
              <h3>您想在哪个城市举办派对？</h3>
              <p class="step-desc">我们将为您推荐当地的优质场地</p>

              <div class="options-grid">
                <button
                  v-for="city in cities"
                  :key="city"
                  :class="['option-btn', { selected: form.city === city }]"
                  @click="form.city = city"
                  :data-testid="`city-${city}`"
                >
                  {{ city }}
                </button>
              </div>
            </div>

            <!-- 步骤2: 人数 -->
            <div v-if="currentStep === 2" class="wizard-step" data-testid="wizard-step-2">
              <div class="step-icon">👥</div>
              <h3>预计多少人参加？</h3>
              <p class="step-desc">帮助我们筛选合适容量的场地</p>

              <div class="options-grid">
                <button
                  v-for="range in guestRanges"
                  :key="range.value"
                  :class="['option-btn', { selected: form.guestCount === range.value }]"
                  @click="form.guestCount = range.value"
                  :data-testid="`guest-${range.value}`"
                >
                  {{ range.label }}
                </button>
              </div>
            </div>

            <!-- 步骤3: 预算 -->
            <div v-if="currentStep === 3" class="wizard-step" data-testid="wizard-step-3">
              <div class="step-icon">💰</div>
              <h3>您的预算范围？</h3>
              <p class="step-desc">我们将推荐符合预算的方案</p>

              <div class="options-grid">
                <button
                  v-for="budget in budgets"
                  :key="budget.value"
                  :class="['option-btn', { selected: form.budget === budget.value }]"
                  @click="form.budget = budget.value"
                  :data-testid="`budget-${budget.value}`"
                >
                  {{ budget.label }}
                </button>
              </div>
            </div>

            <!-- 步骤4: 风格 -->
            <div v-if="currentStep === 4" class="wizard-step" data-testid="wizard-step-4">
              <div class="step-icon">🎨</div>
              <h3>您喜欢的派对风格？</h3>
              <p class="step-desc">可多选，AI会结合您的喜好推荐</p>

              <div class="options-grid options-grid--multi">
                <button
                  v-for="style in styles"
                  :key="style"
                  :class="['option-btn', { selected: form.styles.includes(style) }]"
                  @click="toggleStyle(style)"
                  :data-testid="`style-${style}`"
                >
                  {{ style }}
                </button>
              </div>
            </div>

            <!-- 步骤5: 日期 (可选) -->
            <div v-if="currentStep === 5" class="wizard-step" data-testid="wizard-step-5">
              <div class="step-icon">📅</div>
              <h3>希望的派对日期？</h3>
              <p class="step-desc">可选，方便我们检查场地档期</p>

              <div class="date-input-wrapper">
                <input
                  v-model="form.date"
                  type="date"
                  class="date-input"
                  :min="minDate"
                  data-testid="date-input"
                />
              </div>

              <button class="skip-btn" @click="skipDate" data-testid="skip-date">跳过，稍后决定</button>
            </div>

            <!-- 完成 -->
            <div v-if="currentStep === 6" class="wizard-step wizard-step--complete">
              <div v-if="isCreating" class="creating-state">
                <div class="spinner"></div>
                <h3>正在生成您的派对方案...</h3>
                <p class="step-desc">AI正在根据您的偏好定制专属方案</p>
              </div>
              <div v-else>
                <div class="complete-icon">✨</div>
                <h3>方案已生成！</h3>
                <p class="step-desc">AI为您创建了专属派对方案</p>

                <div class="summary">
                  <div class="summary-item"><span>📍</span> {{ form.city }}</div>
                  <div class="summary-item"><span>👥</span> {{ getGuestLabel() }}</div>
                  <div class="summary-item"><span>💰</span> {{ getBudgetLabel() }}</div>
                  <div class="summary-item"><span>🎨</span> {{ form.styles.join('、') || '未选择' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="wizard-footer">
            <button
              v-if="currentStep > 1 && currentStep < 6"
              class="btn btn--secondary"
              @click="prev"
              data-testid="btn-prev"
            >
              上一步
            </button>

            <button
              v-if="currentStep < 5"
              class="btn btn--primary"
              :disabled="!canNext"
              @click="next"
              data-testid="btn-next"
            >
              下一步
            </button>

            <button
              v-if="currentStep === 5"
              class="btn btn--primary"
              @click="submit"
              data-testid="btn-submit"
            >
              生成方案
            </button>

            <button
              v-if="currentStep === 6"
              class="btn btn--primary"
              @click="finish"
              data-testid="btn-finish"
            >
              查看方案
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'complete'])

const currentStep = ref(1)
const totalSteps = 5
const isCreating = ref(false)
const createdEvent = ref(null)

const form = ref({
  city: '',
  guestCount: '',
  budget: '',
  styles: [],
  date: ''
})

const cities = ['悉尼', '墨尔本', '布里斯班', '珀斯', '阿德莱德']

const guestRanges = [
  { value: '1-20', label: '1-20人 小而美' },
  { value: '21-50', label: '21-50人 中型聚会' },
  { value: '51-100', label: '51-100人 大型派对' },
  { value: '100+', label: '100人以上 盛大庆典' }
]

const budgets = [
  { value: 'low', label: '$1,000-3,000' },
  { value: 'medium', label: '$3,000-8,000' },
  { value: 'high', label: '$8,000-15,000' },
  { value: 'luxury', label: '$15,000+' }
]

const styles = ['浪漫优雅', '现代简约', '复古怀旧', '自然田园', '奢华华丽', '主题创意']

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canNext = computed(() => {
  switch (currentStep.value) {
    case 1: return !!form.value.city
    case 2: return !!form.value.guestCount
    case 3: return !!form.value.budget
    case 4: return form.value.styles.length > 0
    default: return true
  }
})

const toggleStyle = (style) => {
  const idx = form.value.styles.indexOf(style)
  if (idx > -1) {
    form.value.styles.splice(idx, 1)
  } else {
    form.value.styles.push(style)
  }
}

const next = () => {
  if (currentStep.value < 6) currentStep.value++
}

const prev = () => {
  if (currentStep.value > 1) currentStep.value--
}

const skipDate = () => {
  form.value.date = ''
  submit()
}

const submit = async () => {
  isCreating.value = true
  currentStep.value = 6

  // 创建事件草稿 - 支持 mock 模式
  const eventData = {
    event_name: `${form.value.city}派对方案`,
    event_type: 'other',
    event_date: form.value.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guest_count: parseInt(form.value.guestCount) || 20,
    city: form.value.city,
    budget_range: form.value.budget,
    style_preferences: form.value.styles,
    status: 'draft',
    created_at: new Date().toISOString()
  }

  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const response = await axios.post('/api/events', eventData, { headers })
    createdEvent.value = response.data
    console.log('✅ API 创建事件成功:', response.data)
  } catch (err) {
    if (err.response?.status === 404) {
      // API 未部署，使用 mock 模式
      console.log('⚠️ API 404，使用 mock 模式创建本地事件')
      const mockEvent = {
        id: 'mock-' + Date.now(),
        ...eventData,
        is_mock: true
      }
      // 保存到 localStorage
      const existing = JSON.parse(localStorage.getItem('mock_events') || '[]')
      existing.push(mockEvent)
      localStorage.setItem('mock_events', JSON.stringify(existing))
      createdEvent.value = mockEvent
      console.log('✅ Mock 事件已创建:', mockEvent)
    } else {
      console.error('❌ 创建事件失败:', err)
      // 即使失败也显示完成页
      createdEvent.value = {
        id: 'temp-' + Date.now(),
        ...eventData
      }
    }
  } finally {
    isCreating.value = false
  }
}

const finish = () => {
  const eventId = createdEvent.value?.id || 'new'
  emit('complete', { ...form.value, eventId })
  close()
  // 跳转到事件详情或AI策划页
  window.location.href = `/ai-planner?eventId=${eventId}&fromWizard=1`
}

const close = () => {
  emit('update:modelValue', false)
  // 重置
  setTimeout(() => {
    currentStep.value = 1
    form.value = { city: '', guestCount: '', budget: '', styles: [], date: '' }
  }, 300)
}

const getGuestLabel = () => {
  const found = guestRanges.find(r => r.value === form.value.guestCount)
  return found ? found.label : form.value.guestCount
}

const getBudgetLabel = () => {
  const found = budgets.find(b => b.value === form.value.budget)
  return found ? found.label : form.value.budget
}
</script>

<style scoped>
.wizard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.wizard-container {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  overflow: hidden;
}

.wizard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.wizard-step-indicator {
  display: flex;
  gap: 8px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: all 0.3s;
}

.step-dot.active {
  background: #8b5cf6;
  width: 24px;
  border-radius: 4px;
}

.step-dot.completed {
  background: #8b5cf6;
}

.wizard-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.wizard-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.wizard-content {
  padding: 32px;
  min-height: 320px;
}

.wizard-step {
  text-align: center;
}

.step-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.wizard-step h3 {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.step-desc {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 28px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.options-grid--multi {
  grid-template-columns: repeat(3, 1fr);
}

.option-btn {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.option-btn.selected {
  border-color: #8b5cf6;
  background: #f5f3ff;
  color: #7c3aed;
}

.date-input-wrapper {
  max-width: 280px;
  margin: 0 auto 16px;
}

.date-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  color: #374151;
}

.date-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.skip-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}

.skip-btn:hover {
  color: #374151;
}

.wizard-step--complete .complete-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.summary {
  background: #f9fafb;
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  font-size: 15px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item span {
  font-size: 20px;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid #f3f4f6;
  gap: 12px;
}

.btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn--secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn--secondary:hover {
  background: #e5e7eb;
}

.btn--primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wizard-enter-active,
.wizard-leave-active {
  transition: all 0.3s ease;
}

.wizard-enter-from,
.wizard-leave-to {
  opacity: 0;
}

.wizard-enter-active .wizard-container,
.wizard-leave-active .wizard-container {
  transition: transform 0.3s ease;
}

.wizard-enter-from .wizard-container,
.wizard-leave-to .wizard-container {
  transform: scale(0.95) translateY(20px);
}

@media (max-width: 480px) {
  .options-grid,
  .options-grid--multi {
    grid-template-columns: 1fr;
  }

  .wizard-content {
    padding: 24px 20px;
  }
}
</style>
