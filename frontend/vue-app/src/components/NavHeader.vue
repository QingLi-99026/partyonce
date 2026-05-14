<template>
  <el-header class="nav-header">
    <div class="header-content">
      <div class="logo" @click="$router.push('/')">
        <el-icon><Present /></el-icon>
        <span>PartyOnce</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="nav-menu"
        mode="horizontal"
        :ellipsis="false"
        router
      >
        <el-menu-item index="/"><el-icon><HomeFilled /></el-icon>{{ t('nav.home') }}</el-menu-item>
        <el-menu-item index="/venues"><el-icon><OfficeBuilding /></el-icon>{{ t('nav.venues') }}</el-menu-item>
        <el-menu-item index="/ai-voice-intake"><el-icon><MagicStick /></el-icon>{{ t('nav.aiGuide') }}</el-menu-item>
        <el-menu-item index="/experimental/party-3d"><el-icon><View /></el-icon>{{ t('nav.party3d') }}</el-menu-item>
        <el-menu-item index="/ai-planner"><el-icon><MagicStick /></el-icon>{{ t('nav.aiPlanner') }}</el-menu-item>
        <el-menu-item index="/3d-designer"><el-icon><View /></el-icon>{{ t('nav.designer3d') }}</el-menu-item>
        <el-menu-item index="/quotation"><el-icon><Document /></el-icon>{{ t('nav.quote') }}</el-menu-item>
        <el-menu-item index="/suppliers">{{ t('nav.suppliers') }}</el-menu-item>
        <el-menu-item index="/partner/apply">{{ t('nav.partnerApply') }}</el-menu-item>
        <el-menu-item index="/partner/status">{{ t('nav.partnerStatus') }}</el-menu-item>
        <el-menu-item index="/my/inquiries">{{ t('nav.myInquiries') }}</el-menu-item>
        <el-menu-item index="/my/quotes">{{ t('nav.myQuotes') }}</el-menu-item>
        <el-menu-item index="/my/orders">{{ t('nav.myOrders') }}</el-menu-item>
        <el-menu-item index="/my/rewards">{{ t('nav.myRewards') }}</el-menu-item>
        <el-menu-item index="/investor-demo">{{ t('nav.investorDemo') }}</el-menu-item>
        <el-menu-item index="/local-demo">{{ t('nav.localDemo') }}</el-menu-item>
        <el-menu-item index="/admin/local-leads">{{ t('nav.leadReview') }}</el-menu-item>
        <el-menu-item index="/admin/quotes">{{ t('nav.quoteReview') }}</el-menu-item>
        <el-menu-item index="/admin/orders">{{ t('nav.orderReview') }}</el-menu-item>
        <el-menu-item index="/admin/social-rewards">{{ t('nav.rewardsReview') }}</el-menu-item>
        <el-menu-item index="/admin/notifications/dry-run">{{ t('nav.notifyDryRun') }}</el-menu-item>
        <el-menu-item index="/admin/partners">{{ t('nav.partnerReview') }}</el-menu-item>
      </el-menu>
      
      <div class="user-actions">
        <LanguageSwitcher compact />
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.userInfo.full_name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="/user"><el-icon><User /></el-icon>{{ t('nav.profile') }}</el-dropdown-item>
                <el-dropdown-item command="/my/inquiries"><el-icon><List /></el-icon>{{ t('nav.myInquiries') }}</el-dropdown-item>
                <el-dropdown-item command="/my/quotes"><el-icon><Document /></el-icon>{{ t('nav.myQuotes') }}</el-dropdown-item>
                <el-dropdown-item command="/my/orders"><el-icon><List /></el-icon>{{ t('nav.myOrders') }}</el-dropdown-item>
                <el-dropdown-item command="/my/rewards"><el-icon><Present /></el-icon>{{ t('nav.myRewards') }}</el-dropdown-item>
                <el-dropdown-item command="bootstrap-customer"><el-icon><User /></el-icon>{{ t('nav.localCustomer') }}</el-dropdown-item>
                <el-dropdown-item divided command="logout"><el-icon><SwitchButton /></el-icon>{{ t('nav.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button plain @click="bootstrapCustomer">{{ t('nav.localCustomer') }}</el-button>
          <el-button type="primary" @click="showLogin">{{ t('nav.login') }}</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessageBox, ElMessage } from 'element-plus'
import { bootstrapLocalCustomerFixture } from '@/services/customerExperienceService'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import {
  ArrowDown,
  Document,
  HomeFilled,
  List,
  MagicStick,
  OfficeBuilding,
  Present,
  SwitchButton,
  User,
  UserFilled,
  View
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const showLoginModal = inject('showLogin')
const { t } = useI18n()

const showLogin = () => {
  showLoginModal.value = true
}

const bootstrapCustomer = () => {
  const fixture = bootstrapLocalCustomerFixture()
  userStore.logout()
  userStore.setUserInfo(fixture)
  ElMessage.success(t('nav.localCustomerReady'))
  router.push('/my/quotes')
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm(t('nav.logoutConfirm'), t('nav.logout'), {
      confirmButtonText: t('nav.confirm'),
      cancelButtonText: t('nav.cancel'),
      type: 'warning'
    }).then(() => {
      userStore.logout()
      ElMessage.success(t('nav.loggedOut'))
      router.push('/')
    })
  } else if (command === 'bootstrap-customer') {
    bootstrapCustomer()
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
  gap: 10px;
  flex-shrink: 0;
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

:global([dir='rtl']) .user-info,
:global([dir='rtl']) .logo {
  flex-direction: row-reverse;
}
</style>
