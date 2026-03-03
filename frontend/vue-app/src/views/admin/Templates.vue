<template>
  <div class="admin-templates">
    <NavHeader />
    
    <div class="admin-container">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <h3>管理后台</h3>
        </div>
        <el-menu
          :default-active="$route.path"
          class="admin-menu"
          router
        >
          <el-menu-item index="/admin/partners">
            <el-icon><OfficeBuilding /></el-icon>
            <span>供应商管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/templates">
            <el-icon><Collection /></el-icon>
            <span>模板管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="admin-content">
        <div class="content-header">
          <div class="header-left">
            <h1>模板管理</h1>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="showCreateDialog">
              <el-icon><Plus /></el-icon>
              新建模板
            </el-button>
          </div>
        </div>
        
        <!-- 筛选栏 -->
        <el-card class="filter-card">
          <el-form :inline="true" :model="filterForm">
            <el-form-item label="场景">
              <el-select v-model="filterForm.scene" placeholder="全部场景" clearable>
                <el-option label="生日派对" value="birthday" />
                <el-option label="婚礼派对" value="wedding" />
                <el-option label="企业活动" value="corporate" />
                <el-option label="宝宝宴" value="baby" />
                <el-option label="毕业派对" value="graduation" />
                <el-option label="节日派对" value="holiday" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="预算">
              <el-select v-model="filterForm.budget" placeholder="全部预算" clearable>
                <el-option label="经济型 ($500-1500)" value="budget" />
                <el-option label="标准型 ($1500-3000)" value="standard" />
                <el-option label="豪华型 ($3000-5000)" value="luxury" />
                <el-option label="至尊型 ($5000+)" value="premium" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
                <el-option label="已上架" value="active" />
                <el-option label="已下架" value="inactive" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="搜索">
              <el-input
                v-model="filterForm.keyword"
                placeholder="模板名称"
                clearable
                style="width: 200px"
              >
                <template #append>
                  <el-button :icon="Search" @click="handleSearch" />
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 数据表格 -->
        <el-card class="table-card">
          <el-table :data="templates" v-loading="loading" stripe>
            <el-table-column label="封面" width="100">
              <template #default="{ row }">
                <el-image
                  :src="row.cover_image"
                  :preview-src-list="[row.cover_image]"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 8px"
                />
              </template>
            </el-table-column>
            
            <el-table-column prop="name" label="模板名称" min-width="150" />
            
            <el-table-column prop="scene" label="场景" width="100">
              <template #default="{ row }">
                <el-tag>{{ sceneLabel(row.scene) }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="预算区间" width="150">
              <template #default="{ row }">
                ${{ row.budget_min }} - ${{ row.budget_max }}
              </template>
            </el-table-column>
            
            <el-table-column label="是否免费" width="100">
              <template #default="{ row }">
                <el-tag :type="row.is_free ? 'success' : 'info'">
                  {{ row.is_free ? '免费' : '付费' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                  {{ row.status === 'active' ? '已上架' : '已下架' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="created_at" label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="editTemplate(row)">
                  编辑
                </el-button>
                
                <el-button
                  :type="row.status === 'active' ? 'warning' : 'success'"
                  link
                  @click="toggleStatus(row)"
                >
                  {{ row.status === 'active' ? '下架' : '上架' }}
                </el-button>
                
                <el-button type="danger" link @click="deleteTemplate(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑模板' : '新建模板'"
      width="700px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        
        <el-form-item label="场景" prop="scene">
          <el-select v-model="form.scene" placeholder="请选择场景" style="width: 100%">
            <el-option label="生日派对" value="birthday" />
            <el-option label="婚礼派对" value="wedding" />
            <el-option label="企业活动" value="corporate" />
            <el-option label="宝宝宴" value="baby" />
            <el-option label="毕业派对" value="graduation" />
            <el-option label="节日派对" value="holiday" />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预算下限" prop="budget_min">
              <el-input-number v-model="form.budget_min" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预算上限" prop="budget_max">
              <el-input-number v-model="form.budget_max" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="封面图片">
          <el-upload
            class="cover-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleCoverChange"
            accept="image/*"
          >
            <img v-if="form.cover_image" :src="form.cover_image" class="cover-preview" />
            <div v-else class="cover-placeholder">
              <el-icon><Plus /></el-icon>
              <div>点击上传封面</div>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="是否免费">
          <el-radio-group v-model="form.is_free">
            <el-radio :label="true">免费</el-radio>
            <el-radio :label="false">付费</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="包含内容">
          <el-checkbox-group v-model="form.includes">
            <el-checkbox label="venue">场地</el-checkbox>
            <el-checkbox label="catering">餐饮</el-checkbox>
            <el-checkbox label="decoration">装饰</el-checkbox>
            <el-checkbox label="photography">摄影</el-checkbox>
            <el-checkbox label="entertainment">娱乐</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="模板描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入模板描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminAPI, uploadAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'

const loading = ref(false)
const templates = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filterForm = reactive({
  scene: '',
  budget: '',
  status: '',
  keyword: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const form = reactive({
  name: '',
  scene: '',
  budget_min: 500,
  budget_max: 1500,
  cover_image: '',
  is_free: true,
  includes: [],
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  scene: [{ required: true, message: '请选择场景', trigger: 'change' }],
  budget_min: [{ required: true, message: '请输入预算下限', trigger: 'blur' }],
  budget_max: [{ required: true, message: '请输入预算上限', trigger: 'blur' }]
}

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

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
  fetchTemplates()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchTemplates()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchTemplates()
}

const showCreateDialog = () => {
  isEdit.value = false
  currentId.value = null
  Object.assign(form, {
    name: '',
    scene: '',
    budget_min: 500,
    budget_max: 1500,
    cover_image: '',
    is_free: true,
    includes: [],
    description: ''
  })
  dialogVisible.value = true
}

const editTemplate = (row) => {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(form, {
    name: row.name,
    scene: row.scene,
    budget_min: row.budget_min,
    budget_max: row.budget_max,
    cover_image: row.cover_image,
    is_free: row.is_free,
    includes: row.includes || [],
    description: row.description || ''
  })
  dialogVisible.value = true
}

const handleCoverChange = async (file) => {
  try {
    const presignRes = await uploadAPI.getPresignUrl({
      filename: file.name,
      content_type: file.raw.type
    })

    await fetch(presignRes.presign_url, {
      method: 'PUT',
      body: file.raw,
      headers: { 'Content-Type': file.raw.type }
    })

    form.cover_image = presignRes.file_key
    ElMessage.success('封面上传成功')
  } catch (error) {
    ElMessage.error('封面上传失败')
  }
}

const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await adminAPI.updateTemplate(currentId.value, form)
    } else {
      await adminAPI.createTemplate(form)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchTemplates()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '上架' : '下架'
  
  try {
    await ElMessageBox.confirm(`确定要${actionText}此模板吗？`, '确认', { type: 'warning' })
    await adminAPI.updateTemplate(row.id, { status: newStatus })
    ElMessage.success(`${actionText}成功`)
    fetchTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const deleteTemplate = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此模板吗？删除后不可恢复！', '确认删除', { type: 'warning' })
    await adminAPI.deleteTemplate(row.id)
    ElMessage.success('删除成功')
    fetchTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const fetchTemplates = async () => {
  loading.value = true
  try {
    const res = await adminAPI.getTemplates({
      page: currentPage.value,
      page_size: pageSize.value,
      ...filterForm
    })
    templates.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    ElMessage.error('获取模板列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.admin-templates {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.admin-container {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.admin-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  padding: 24px 0;
}

.sidebar-header {
  padding: 0 24px 24px;
  border-bottom: 1px solid #ebeef5;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
}

.admin-menu {
  border-right: none;
}

.admin-content {
  flex: 1;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h1 {
  margin: 0;
  font-size: 24px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.table-card {
  border-radius: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 120px;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.cover-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
