<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="420px"
    :close-on-click-modal="false"
    class="login-dialog"
    destroy-on-close
  >
    <div class="login-header">
      <h2>{{ isRegister ? '注册账号' : '欢迎回来' }}</h2>
      <p>{{ isRegister ? '创建您的新账号' : '登录以继续您的派对之旅' }}</p>
    </div>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="login-form"
    >
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          :prefix-icon="Message"
          size="large"
        />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          size="large"
          show-password
        />
      </el-form-item>
      
      <template v-if="isRegister">
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="姓名" prop="fullName">
          <el-input
            v-model="form.fullName"
            placeholder="请输入您的姓名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
      </template>
      
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleSubmit"
          style="width: 100%"
        >
          {{ isRegister ? '立即注册' : '立即登录' }}
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="login-footer">
      <p>
        {{ isRegister ? '已有账号？' : '还没有账号？' }}
        <el-link type="primary" @click="toggleMode">
          {{ isRegister ? '立即登录' : '立即注册' }}
        </el-link>
      </p>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message, Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { userAPI } from '@/api/modules'
import { useUserStore } from '@/store'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const isRegister = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  fullName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ]
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  form.value = { email: '', password: '', confirmPassword: '', fullName: '' }
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  try {
    if (isRegister.value) {
      await userAPI.register({
        email: form.value.email,
        password: form.value.password,
        full_name: form.value.fullName
      })
      ElMessage.success('注册成功，请登录')
      isRegister.value = false
    } else {
      const res = await userAPI.login({
        email: form.value.email,
        password: form.value.password
      })
      userStore.setToken(res.access_token)
      userStore.setUserInfo(res.user)
      ElMessage.success('登录成功')
      dialogVisible.value = false
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 监听登录事件
watch(() => props.visible, (val) => {
  if (val) {
    form.value = { email: '', password: '', confirmPassword: '', fullName: '' }
    isRegister.value = false
  }
})
</script>

<style scoped>
.login-dialog :deep(.el-dialog__header) {
  display: none;
}

.login-dialog :deep(.el-dialog__body) {
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.login-header p {
  color: #909399;
  font-size: 14px;
}

.login-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
}

.login-footer p {
  color: #606266;
  font-size: 14px;
}
</style>