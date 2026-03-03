<template>
  <el-header class="nav-header">
    <div class="header-content">
      <div class="logo" @click="$router.push('/')">
        <el-icon><Party-</el-icon>
        <span>PartyOnce</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="nav-menu"
        mode="horizontal"
        :ellipsis="false"
        router
      >
        <el-menu-item index="/"><el-icon><HomeFilled /></el-icon>首页</el-menu-item>
        <el-menu-item index="/venues"><el-icon><OfficeBuilding /></el-icon>场地</el-menu-item>
        <el-menu-item index="/ai-planner"><el-icon><Magic /></el-icon>AI策划</el-menu-item>
        <el-menu-item index="/3d-designer"><el-icon><View /></el-icon>3D设计</el-menu-item>
        <el-menu-item index="/quotation"><el-icon><Document /></el-icon>报价</el-menu-item>
      </el-menu>
      
      <div class="user-actions">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.userInfo.full_name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="/user"><el-icon><User /></el-icon>个人中心</el-dropdown-item>
                <el-dropdown-item command="/orders"><el-icon><List /></el-icon>我的订单</el-dropdown-item>
                <el-dropdown-item divided command="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="showLogin">登录 / 注册</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const showLoginModal = inject('showLogin')

const showLogin = () => {
  showLoginModal.value = true
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
    })
  } else {
    router.push(command)
  }
}
</script>

<style scoped>
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 64px;
  padding: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  cursor: pointer;
}

.nav-menu {
  flex: 1;
  margin: 0 40px;
  border-bottom: none;
}

.nav-menu .el-menu-item {
  font-size: 15px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>