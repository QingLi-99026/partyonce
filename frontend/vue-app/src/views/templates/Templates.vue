<template>
  <div class="templates-page">
    <NavHeader />
    
    <div class="templates-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>模板库</h1>
        <p>发现精心设计的派对方案，一键开启您的派对之旅</p>
      </div>
      
      <!-- 筛选栏 -->
      <div class="filter-section">
        <el-card class="filter-card">
          <div class="filter-row">
            <div class="filter-group">
              <span class="filter-label">场景：</span>
              <el-radio-group v-model="filters.scene" size="small">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button label="birthday">生日派对</el-radio-button>
                <el-radio-button label="wedding">婚礼派对</el-radio-button>
                <el-radio-button label="corporate">企业活动</el-radio-button>
                <el-radio-button label="baby">宝宝宴</el-radio-button>
                <el-radio-button label="graduation">毕业派对</el-radio-button>
                <el-radio-button label="holiday">节日派对</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-group">
              <span class="filter-label">预算：</span>
              <el-radio-group v-model="filters.budget" size="small">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button label="budget">$500-1500</el-radio-button>
                <el-radio-button label="standard">$1500-3000</el-radio-button>
                <el-radio-button label="luxury">$3000-5000</el-radio-button>
                <el-radio-button label="premium">$5000+</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-group">
              <span class="filter-label">风格：</span>
              <el-radio-group v-model="filters.style" size="small">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button label="elegant">优雅</el-radio-button>
                <el-radio-button label="casual">休闲</el-radio-button>
                <el-radio-button label="luxury">奢华</el-radio-button>
                <el-radio-button label="modern">现代</el-radio-button>
                <el-radio-button label="vintage">复古</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 模板列表 -->
      <div class="templates-list">
        <el-empty v-if="templates.length === 0" description="暂无符合条件的模板" />
        
        <div v-else class="templates-grid">
          <el-card
            v-for="template in templates"
            :key="template.id"
            class="template-card"
            shadow="hover"
            @click="viewDetail(template.id)"
          >
            <div class="template-cover">
              <img :src="template.cover_image || defaultCover" :alt="template.name" />
              <el-tag
                v-if="template.is_free"
                type="success"
                class="free-tag"
                size="small"
              >
                免费
              </el-tag>
            </div>
            
            <div class="template-info">
              <h3 class="template-name">{{ template.name }}</h3>
              
              <div class="template-tags">
                <el-tag size="small" effect="plain">{{ sceneLabel(template.scene) }}</el-tag>
                <el-tag size="small" type="warning" effect="plain">
                  ${{ template.budget_min }}-${{ template.budget_max }}
                </el-tag>
              </div>
              
              <p class="template-desc">{{ template.description }}</p>
              
              <div class="template-footer">
                <div class="includes">
                  <span v-for="item in template.includes?.slice(0, 3)" :key="item">
                    <el-icon><Check /></el-icon>{{ includeLabel(item) }}
                  </span>
                </div>
                <el-button type="primary" size="small">使用模板</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { templateAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const defaultCover = 'https://images.unsplash.com/photo-1530103862676-de3c9c59afbc?w=400'

const templates = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const filters = reactive({
  scene: '',
  budget: '',
  style: ''
})

const sceneLabel = (scene) => {
  const labels = {
    birthday: '生日派对',
    wedding: '婚礼派对',
    corporate: '企业活动',
    baby: '宝宝宴',
    graduation: '毕业派对',
    holiday: '节日派对'
  }
  return labels[scene] || scene
}

const includeLabel = (item) => {
  const labels = {
    venue: '场地',
    catering: '餐饮',
    decoration: '装饰',
    photography: '摄影',
    entertainment: '娱乐'
  }
  return labels[item] || item
}

const viewDetail = (id) => {
  router.push(`/templates/${id}`)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchTemplates()
}

const fetchTemplates = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      ...filters
    }
    const res = await templateAPI.getTemplates(params)
    templates.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    ElMessage.error('获取模板列表失败')
  } finally {
    loading.value = false
  }
}

// 监听筛选变化
watch(filters, () => {
  currentPage.value = 1
  fetchTemplates()
}, { deep: true })

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.templates-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.templates-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
  color: #303133;
}

.page-header p {
  color: #909399;
  font-size: 16px;
}

.filter-section {
  margin-bottom: 32px;
}

.filter-card {
  border-radius: 12px;
}

.filter-row {
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-label {
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.template-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.template-cover {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.template-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.template-card:hover .template-cover img {
  transform: scale(1.05);
}

.free-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.template-info {
  padding: 20px;
}

.template-name {
  font-size: 18px;
  margin-bottom: 12px;
  color: #303133;
}

.template-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.template-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.includes {
  display: flex;
  gap: 12px;
  color: #67c23a;
  font-size: 12px;
}

.includes span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-wrapper {
  margin-top: 40px;
  text-align: center;
}

@media (max-width: 768px) {
  .templates-container {
    padding: 20px 16px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
