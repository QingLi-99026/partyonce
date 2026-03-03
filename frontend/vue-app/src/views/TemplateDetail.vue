<template>
  <div class="template-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="!template" class="error">
      <el-empty description="模板不存在" />
    </div>

    <div v-else class="template-content">
      <!-- 头部信息 -->
      <div class="template-header">
        <img :src="template.cover_url || '/placeholder.jpg'" class="cover-image" />
        <div class="header-info">
          <div class="tags">
            <el-tag>{{ getSceneName(template.scene_type) }}</el-tag>
            <el-tag v-if="template.is_free" type="success">免费</el-tag>
          </div>
          
          <h1>{{ template.name }}</h1>
          
          <p class="budget">
            预算区间：<span v-if="template.budget_min && template.budget_max">
              ${{ template.budget_min }} - ${{ template.budget_max }}
            </span>
            <span v-else>面议</span>
          </p>
          
          <p class="description">{{ template.description }}</p>
          
          <el-button type="primary" size="large" @click="useTemplate">
            使用此模板
          </el-button>
        </div>
      </div>

      <!-- 物料清单 -->
      <el-card v-if="template.bom?.length > 0" class="bom-card">
        <template #header>
          <span>📦 包含物料</span>
        </template>
        
        <el-table :data="template.bom" :border="true">
          <el-table-column prop="item_name" label="物品名称" />
          <el-table-column prop="qty" label="数量" width="100" align="center" />
          <el-table-column prop="category" label="分类" />
          <el-table-column prop="cost_estimate" label="预估成本">
            <template #default="{ row }">${{ row.cost_estimate }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const templateId = route.params.id

const loading = ref(true)
const template = ref(null)

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

const fetchTemplate = async () => {
  try {
    const response = await fetch(`/api/templates/${templateId}`)
    if (response.ok) {
      template.value = await response.json()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取模板失败')
  } finally {
    loading.value = false
  }
}

const useTemplate = () => {
  router.push({
    path: '/quotation',
    query: { template_id: templateId }
  })
}

onMounted(() => {
  fetchTemplate()
})
</script>

<style scoped>
.template-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading, .error {
  padding: 100px 0;
}

.template-header {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.cover-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.tags {
  margin-bottom: 16px;
}

.tags .el-tag {
  margin-right: 8px;
}

.header-info h1 {
  font-size: 28px;
  margin-bottom: 16px;
}

.budget {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}

.description {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 24px;
  flex: 1;
}

.bom-card {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .template-header {
    grid-template-columns: 1fr;
  }
}
</style>
