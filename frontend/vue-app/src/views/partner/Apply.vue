<template>
  <div class="partner-apply-page">
    <NavHeader />
    <div class="apply-container">
      <div class="apply-header">
        <h1>成为 PartyOnce 合作伙伴</h1>
        <p>加入我们的供应商网络，为您的业务带来更多机会</p>
      </div>
      
      <el-card class="apply-form-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12">
              <el-form-item label="公司名称" prop="company_name">
                <el-input
                  v-model="form.company_name"
                  placeholder="请输入公司名称"
                  prefix-icon="OfficeBuilding"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="服务类别" prop="category">
                <el-select
                  v-model="form.category"
                  placeholder="请选择服务类别"
                  style="width: 100%"
                >
                  <el-option label="场地租赁" value="venue" />
                  <el-option label="餐饮服务" value="catering" />
                  <el-option label="装饰布置" value="decoration" />
                  <el-option label="摄影摄像" value="photography" />
                  <el-option label="娱乐表演" value="entertainment" />
                  <el-option label="其他服务" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12">
              <el-form-item label="联系人姓名" prop="contact_name">
                <el-input
                  v-model="form.contact_name"
                  placeholder="请输入联系人姓名"
                  prefix-icon="User"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="联系电话" prop="contact_phone">
                <el-input
                  v-model="form.contact_phone"
                  placeholder="请输入联系电话"
                  prefix-icon="Phone"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="电子邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入电子邮箱"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item label="服务区域" prop="service_area">
            <el-checkbox-group v-model="form.service_area">
              <el-checkbox label="悉尼">悉尼</el-checkbox>
              <el-checkbox label="墨尔本">墨尔本</el-checkbox>
              <el-checkbox label="布里斯班">布里斯班</el-checkbox>
              <el-checkbox label="珀斯">珀斯</el-checkbox>
              <el-checkbox label="阿德莱德">阿德莱德</el-checkbox>
              <el-checkbox label="堪培拉">堪培拉</el-checkbox>
              <el-checkbox label="黄金海岸">黄金海岸</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="ABN (可选)">
            <el-input
              v-model="form.abn_optional"
              placeholder="请输入ABN（澳大利亚商业编号）"
              prefix-icon="Document"
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="agreed">
              我已阅读并同意
              <el-link type="primary" @click.prevent="showTerms">《供应商服务协议》</el-link>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              :disabled="!agreed"
              @click="submitApplication"
              style="width: 100%"
            >
              提交申请
            </el-button>
          </el-form-item>

          <div class="form-footer">
            <p>已有账号？<el-link type="primary" @click="checkStatus">查询申请状态</el-link></p>
          </div>
        </el-form>
      </el-card>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { partnerAPI } from '@/api/modules'
import NavHeader from '@/components/NavHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const agreed = ref(false)

const form = reactive({
  company_name: '',
  category: '',
  contact_name: '',
  contact_phone: '',
  email: '',
  service_area: [],
  abn_optional: ''
})

const rules = {
  company_name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择服务类别', trigger: 'change' }
  ],
  contact_name: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^[\d\s\-\+\(\)]{8,20}$/, message: '请输入有效的电话号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  service_area: [
    { required: true, message: '请至少选择一个服务区域', trigger: 'change', type: 'array' }
  ]
}

const submitApplication = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await partnerAPI.apply(form)
    ElMessage.success('申请提交成功！我们会尽快审核')
    router.push('/partner/status')
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const checkStatus = () => {
  router.push('/partner/status')
}

const showTerms = () => {
  // 显示服务协议弹窗
  ElMessage.info('服务协议内容')
}
</script>

<style scoped>
.partner-apply-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 64px;
}

.apply-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px;
}

.apply-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.apply-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
}

.apply-header p {
  font-size: 16px;
  opacity: 0.9;
}

.apply-form-card {
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .apply-container {
    padding: 30px 16px;
  }
  
  .apply-header h1 {
    font-size: 28px;
  }
}
</style>
