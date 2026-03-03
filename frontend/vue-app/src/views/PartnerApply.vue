<template>
  <div class="partner-apply-page">
    <div class="page-header">
      <h1>供应商入驻申请</h1>
      <p class="subtitle">成为PartyOnce合作伙伴，获取更多客户资源</p>
    </div>

    <el-card class="apply-card">
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef"
        label-position="top"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称" prop="company_name">
              <el-input v-model="form.company_name" placeholder="请输入公司全称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类别" prop="category">
              <el-select v-model="form.category" placeholder="选择业务类别" style="width: 100%">
                <el-option label="场地" value="venue" />
                <el-option label="摄影摄像" value="photo" />
                <el-option label="现场装饰" value="decor" />
                <el-option label="餐饮服务" value="catering" />
                <el-option label="娱乐表演" value="entertainment" />
                <el-option label="设备租赁" value="equipment" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人姓名" prop="contact_name">
              <el-input v-model="form.contact_name" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contact_phone">
              <el-input v-model="form.contact_phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入公司邮箱" />
        </el-form-item>

        <el-form-item label="服务区域" prop="service_area">
          <el-input 
            v-model="form.service_area" 
            type="textarea" 
            :rows="3"
            placeholder="请输入服务区域，如：悉尼CBD、北区、东区等"
          />
        </el-form-item>

        <el-form-item label="ABN（可选）">
          <el-input v-model="form.abn_optional" placeholder="请输入ABN号码（可选）" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="submitForm" :loading="submitting">
            提交申请
          </el-button>
          <el-button size="large" @click="$router.push('/')">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  company_name: '',
  category: '',
  contact_name: '',
  contact_phone: '',
  email: '',
  service_area: '',
  abn_optional: ''
})

const rules = {
  company_name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择业务类别', trigger: 'change' }],
  contact_name: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  contact_phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  service_area: [{ required: true, message: '请输入服务区域', trigger: 'blur' }]
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 调用API提交申请
        const response = await fetch('/api/partners/apply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.token}`
          },
          body: JSON.stringify(form)
        })
        
        if (response.ok) {
          ElMessage.success('申请已提交，请等待审核')
          router.push('/partner/status')
        } else {
          const error = await response.json()
          ElMessage.error(error.detail || '提交失败')
        }
      } catch (error) {
        ElMessage.error('网络错误，请重试')
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style scoped>
.partner-apply-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
}

.apply-card {
  padding: 20px;
}
</style>
