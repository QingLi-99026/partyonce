<template>
  <div class="theme-switcher" :class="{ 'is-scrolled': isScrolled }">
    <div class="theme-switcher-container">
      <div class="theme-label">
        <span class="theme-icon">✨</span>
        <span class="theme-text">选择主题</span>
      </div>
      
      <div class="theme-buttons">
        <button
          v-for="theme in themeList"
          :key="theme.id"
          class="theme-button"
          :class="{ 'is-active': currentTheme === theme.id }"
          @click="switchTheme(theme.id)"
          :style="getButtonStyle(theme.id)"
        >
          <span class="button-icon">{{ theme.icon }}</span>
          <span class="button-text">{{ theme.name }}</span>
          <div v-if="currentTheme === theme.id" class="active-indicator"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getThemeList, getTheme } from '@/themes';

export default {
  name: 'ThemeSwitcher',
  
  props: {
    currentTheme: {
      type: String,
      default: 'space'
    }
  },
  
  data() {
    return {
      themeList: getThemeList(),
      isScrolled: false
    };
  },
  
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    },
    
    switchTheme(themeId) {
      if (themeId !== this.currentTheme) {
        this.$emit('theme-change', themeId);
      }
    },
    
    getButtonStyle(themeId) {
      const theme = getTheme(themeId);
      const isActive = this.currentTheme === themeId;
      
      return {
        '--theme-primary': theme.colors.accent,
        '--theme-glow': isActive ? theme.colors.accent : 'transparent',
        '--theme-bg': isActive ? `${theme.colors.accent}20` : 'transparent'
      };
    }
  }
};
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 12px 0;
  transition: all 0.3s ease;
  background: transparent;
}

.theme-switcher.is-scrolled {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.theme-switcher-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.theme-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.theme-icon {
  font-size: 16px;
}

.theme-buttons {
  display: flex;
  gap: 12px;
}

.theme-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  background: var(--theme-bg, transparent);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.theme-button:hover {
  border-color: var(--theme-primary, rgba(255, 255, 255, 0.4));
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.theme-button.is-active {
  border-color: var(--theme-primary, #fff);
  box-shadow: 0 0 20px var(--theme-glow, rgba(255, 255, 255, 0.3));
}

.button-icon {
  font-size: 16px;
}

.active-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--theme-primary, #fff);
  border-radius: 2px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .theme-switcher {
    top: 60px;
    padding: 8px 0;
  }
  
  .theme-switcher-container {
    padding: 0 16px;
    gap: 12px;
  }
  
  .theme-label {
    display: none;
  }
  
  .theme-button {
    padding: 8px 14px;
    font-size: 12px;
  }
  
  .button-text {
    display: none;
  }
  
  .button-icon {
    font-size: 20px;
  }
}
</style>
