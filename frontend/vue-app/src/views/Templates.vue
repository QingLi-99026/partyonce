<template>
  <div class="templates-page">
    <div class="page-header">
      <h1>派对模板库</h1>
      <p class="subtitle">精选派对策划方案，一键复制，轻松搞定</p>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="filters.scene_type" placeholder="场景类型" clearable @change="fetchTemplates">
            <el-option label="婚礼" value="wedding" />
            <el-option label="生日派对" value="birthday" />
            <el-option label="企业活动" value="corporate" />
            <el-option label="学校活动" value="school" />
            <el-option label="儿童派对" value="kids" />
          </el-select>
        </el-col>
        
        <el-col :span="6">
          <el-select v-model="filters.budget_range" placeholder="预算区间" clearable @change="fetchTemplates">
            <el-option label="$500以下" value="0-500" />
            <el-option label="$500-1000" value="500-1000" />
            <el-option label="$1000-2000" value="1000-2000" />
            <el-option label="$2000以上" value="2000-999999" />
          </el-select>
        </el-col>
        
        <el-col :span="6">
          <el-select v-model="filters.style" placeholder="风格" clearable @change="fetchTemplates">
            <el-option label="优雅精致" value="elegant" />
            <el-option label="轻松休闲" value="casual" />
            <el-option label="创意主题" value="creative" />
            <el-option label="复古经典" value="vintage" />
          </el-select>
        </el-col>
        
        <el-col :span="6" style="text-align: right">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 模板列表 -->
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>

    <el-empty v-else-if="templates.length === 0" description="暂无模板" />

    <el-row v-else :gutter="20" class="template-list">
      <el-col :span="8" v-for="template in templates" :key="template.id">
        <el-card class="template-card" shadow="hover" @click="viewDetail(template)">
          <div class="template-cover">
            <img :src="template.cover_url || '/placeholder-template.jpg'" :alt="template.name" />
            <div class="template-badge" v-if="template.is_free">免费</div>
          </div>
          
          <div class="template-info">
            <h3>{{ template.name }}</h3>
            <div class="template-tags">
              <el-tag size="small">{{ getSceneName(template.scene_type) }}</el-tag>
            </div>
            
            <div class="template-budget">
              <span v-if="template.budget_min && template.budget_max">
                ${{ template.budget_min }} - ${{ template.budget_max }}
              </span>
              <span v-else>预算面议</span>
            </div>
            
            <p class="template-desc">{{ template.description }}</p>
          </div>
          
          <div class="template-actions">
            <el-button type="primary" @click.stop="useTemplate(template)">使用此模板</el-button>
            <el-button text @click.stop="viewDetail(template)">查看详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const templates = ref([])

const filters = reactive({
  scene_type: '',
  budget_range: '',
  style: ''
})

const getSceneName = (type) => {
  const names = {
    wedding: '婚礼',
    birthday: '生日派对',
    corporate: '企业活动',
    school: '学校活动',
    kids: '儿童派对'
  }
  return names[type] || type
}

const fetchTemplates = async () => {
  loading.value = true
  try {
    let url = '/api/templates'
    const params = new URLSearchParams()
    
    if (filters.scene_type) params.append('scene_type', filters.scene_type)
    if (filters.budget_range) {
      const [min, max] = filters.budget_range.split('-')
      params.append('budget_min', min)
      params.append('budget_max', max)
    }
    
    if (params.toString()) url += '?' + params.toString()
    
    const response = await fetch(url)
    if (response.ok) {
      templates.value = await response.json()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取模板失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.scene_type = ''
  filters.budget_range = ''
  filters.style = ''
  fetchTemplates()
}

const viewDetail = (template) => {
  router.push(`/templates/${template.id}`)
}

const useTemplate = (template) => {
  // 保存选中的模板到store，然后跳转到下单页面
  router.push({
    path: '/quotation',
    query: { template_id: template.id }
  })
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.templates-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
}

.filter-card {
  margin-bottom: 30px;
}

.template-list {
  margin-top: 20px;
}

.template-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.template-card:hover {
  transform: translateY(-4px);
}

.template-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 16px;
}

.template-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #67c23a;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.template-info h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.template-tags {
  margin-bottom: 12px;
}

.template-budget {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.template-desc {
  color: #606266;
  font-size: 14px;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-actions {
  display: flex;
  gap: 12px;
}

.loading {
  padding: 60px 0;
}
</style>
