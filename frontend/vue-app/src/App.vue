<template>
  <div id="app" :lang="locale" :dir="direction">
    <NavHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
    <LoginModal v-model:visible="showLogin" />
  </div>
</template>

<script setup>
import { computed, onMounted, provide, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import NavHeader from './components/NavHeader.vue'
import AppFooter from './components/AppFooter.vue'
import LoginModal from './components/LoginModal.vue'
import { getLocaleDirection } from './i18n'

const showLogin = ref(false)
provide('showLogin', showLogin)

const { locale } = useI18n()
const direction = computed(() => getLocaleDirection(locale.value))

const syncLocaleAttributes = () => {
  document.documentElement.lang = locale.value
  document.documentElement.dir = direction.value

  const appRoot = document.getElementById('app')
  if (appRoot) {
    appRoot.setAttribute('lang', locale.value)
    appRoot.setAttribute('dir', direction.value)
  }
}

watchEffect(() => {
  syncLocaleAttributes()
})

onMounted(() => {
  syncLocaleAttributes()
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 64px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #f5f7fa;
}
</style>
