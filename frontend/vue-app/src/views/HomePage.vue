<template>
  <div class="home-page" :style="pageStyle">
    <!-- 导航栏 -->
    <nav class="main-nav" :class="{ 'is-scrolled': isScrolled }">
      <div class="nav-container">
        <div class="logo">
          <span class="logo-icon">🎉</span>
          <span class="logo-text">PartyOnce</span>
        </div>
        <div class="nav-links">
          <a href="#themes" class="nav-link">主题</a>
          <a href="#how-it-works" class="nav-link">流程</a>
          <a href="#venues" class="nav-link">场地</a>
        </div>
        <button class="nav-cta">开始策划</button>
      </div>
    </nav>

    <!-- 主题切换条 -->
    <ThemeSwitcher 
      :current-theme="currentTheme" 
      @theme-change="handleThemeChange"
    />

    <!-- 沉浸式Hero -->
    <ImmersiveHero 
      :theme-id="currentTheme"
      @start-planning="handleStartPlanning"
      @explore-themes="scrollToThemes"
      @play-voice="handlePlayVoice"
    />

    <!-- 主题介绍区 -->
    <section id="themes" class="themes-section">
      <div class="section-container">
        <h2 class="section-title" :style="sectionTitleStyle">
          选择你的派对主题
        </h2>
        <p class="section-subtitle" :style="sectionSubtitleStyle">
          三大沉浸式主题世界，每一个都是独一无二的体验
        </p>
        
        <div class="theme-cards">
          <div 
            v-for="theme in themeCards" 
            :key="theme.id"
            class="theme-card"
            :class="{ 'is-active': currentTheme === theme.id }"
            :style="getCardStyle(theme)"
            @click="switchToTheme(theme.id)"
          >
            <div class="card-icon">{{ theme.icon }}</div>
            <h3 class="card-title">{{ theme.name }}</h3>
            <p class="card-description">{{ theme.description }}</p>
            <button class="card-cta" :style="getCardButtonStyle(theme)">
              {{ theme.ctaText }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 流程介绍区 -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-container">
        <h2 class="section-title" :style="sectionTitleStyle">
          简单四步，梦想派对成真
        </h2>
        
        <div class="steps">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-card"
            :style="stepCardStyle"
          >
            <div class="step-number" :style="stepNumberStyle">{{ index + 1 }}</div>
            <div class="step-icon">{{ step.icon }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 场景展示区 -->
    <SceneShowcase 
      :theme-id="currentTheme"
      @select-scene="handleSelectScene"
    />

    <!-- 套餐/价格联动区 -->
    <PackageShowcase 
      :theme-id="currentTheme"
      @select-package="handleSelectPackage"
    />

    <!-- CTA区 -->
    <section class="final-cta">
      <div class="section-container">
        <h2 class="cta-title" :style="ctaTitleStyle">
          准备好开启你的派对之旅了吗？
        </h2>
        <button 
          class="cta-main-button" 
          :style="finalCtaStyle"
          @click="handleFinalCTA"
        >
          <span>{{ currentThemeConfig.ctaText }}</span>
          <span class="cta-arrow">→</span>
        </button>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="footer-logo">🎉 PartyOnce</span>
          <p class="footer-tagline">让每一个派对都独一无二</p>
        </div>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">联系方式</a>
          <a href="#">隐私政策</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import ImmersiveHero from '@/components/ImmersiveHero.vue';
import SceneShowcase from '@/components/SceneShowcase.vue';
import PackageShowcase from '@/components/PackageShowcase.vue';
import { getTheme, getAllThemes } from '@/themes';

export default {
  name: 'HomePage',
  
  components: {
    ThemeSwitcher,
    ImmersiveHero,
    SceneShowcase,
    PackageShowcase
  },
  
  data() {
    return {
      currentTheme: this.$route.query.theme || 'space',
      isScrolled: false,
      
      themeCards: [
        {
          id: 'space',
          name: '星际探险',
          icon: '🚀',
          description: '穿越星河，探索未知的宇宙奥秘，开启一段科幻冒险之旅',
          ctaText: '开启星际任务'
        },
        {
          id: 'castle',
          name: '梦幻城堡',
          icon: '🏰',
          description: '走进童话世界，成为公主或王子，实现童年最美好的梦想',
          ctaText: '进入梦幻城堡'
        },
        {
          id: 'forest',
          name: '森林奇境',
          icon: '🌲',
          description: '踏入神秘森林，与大自然亲密接触，发现隐藏在林间的魔法',
          ctaText: '进入森林秘境'
        }
      ],
      
      steps: [
        {
          icon: '🎯',
          title: '选择主题',
          description: '从三大沉浸式主题中选择你喜欢的派对风格'
        },
        {
          icon: '🤖',
          title: 'AI策划',
          description: '智能助手为你量身定制专属派对方案'
        },
        {
          icon: '🏛️',
          title: '挑选场地',
          description: '浏览精选场地，找到最适合的派对空间'
        },
        {
          icon: '🎊',
          title: '开启派对',
          description: '一切准备就绪，享受难忘的派对时光'
        }
      ]
    };
  },
  
  computed: {
    currentThemeConfig() {
      return getTheme(this.currentTheme);
    },
    
    pageStyle() {
      const theme = this.currentThemeConfig;
      return {
        '--theme-primary': theme.colors.primary,
        '--theme-secondary': theme.colors.secondary,
        '--theme-accent': theme.colors.accent,
        '--theme-highlight': theme.colors.highlight,
        '--theme-text': theme.colors.text,
        '--theme-text-muted': theme.colors.textMuted,
        '--theme-surface': theme.colors.surface,
        background: theme.colors.primary,
        color: theme.colors.text
      };
    },
    
    sectionTitleStyle() {
      return {
        fontFamily: this.currentThemeConfig.fonts.heading,
        color: this.currentThemeConfig.colors.text
      };
    },
    
    sectionSubtitleStyle() {
      return {
        color: this.currentThemeConfig.colors.textMuted
      };
    },
    
    stepCardStyle() {
      return {
        background: this.currentThemeConfig.card.background,
        border: this.currentThemeConfig.card.border,
        borderRadius: this.currentThemeConfig.card.borderRadius,
        boxShadow: this.currentThemeConfig.card.boxShadow
      };
    },
    
    stepNumberStyle() {
      return {
        background: this.currentThemeConfig.colors.accent,
        color: this.currentThemeConfig.colors.primary
      };
    },
    
    ctaTitleStyle() {
      return {
        fontFamily: this.currentThemeConfig.fonts.heading,
        color: this.currentThemeConfig.colors.text
      };
    },
    
    finalCtaStyle() {
      const btn = this.currentThemeConfig.button.primary;
      return {
        background: btn.background,
        color: btn.color,
        boxShadow: btn.boxShadow
      };
    }
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
    
    handleThemeChange(themeId) {
      // 添加切换动画效果
      const app = document.getElementById('app');
      if (app) {
        app.style.opacity = '0.7';
        app.style.transform = 'scale(0.98)';
        app.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
          this.currentTheme = themeId;
          app.style.opacity = '1';
          app.style.transform = 'scale(1)';
        }, 150);
      } else {
        this.currentTheme = themeId;
      }
    },
    
    switchToTheme(themeId) {
      this.currentTheme = themeId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    getCardStyle(theme) {
      const isActive = this.currentTheme === theme.id;
      const themeConfig = getTheme(theme.id);
      
      return {
        background: themeConfig.card.background,
        border: isActive ? `2px solid ${themeConfig.colors.accent}` : themeConfig.card.border,
        borderRadius: themeConfig.card.borderRadius,
        boxShadow: isActive ? `0 0 30px ${themeConfig.colors.accent}40` : themeConfig.card.boxShadow,
        transform: isActive ? 'scale(1.02)' : 'scale(1)'
      };
    },
    
    getCardButtonStyle(theme) {
      const themeConfig = getTheme(theme.id);
      const btn = themeConfig.button.primary;
      return {
        background: btn.background,
        color: btn.color,
        boxShadow: btn.boxShadow
      };
    },
    
    handleStartPlanning(themeId) {
      this.$router.push(`/planner?theme=${themeId}`);
    },
    
    scrollToThemes() {
      document.getElementById('themes').scrollIntoView({ behavior: 'smooth' });
    },
    
    handlePlayVoice(text) {
      console.log('Playing voice:', text);
    },
    
    handleFinalCTA() {
      this.$router.push(`/planner?theme=${this.currentTheme}`);
    },

    handleSelectScene({ theme, scene }) {
      console.log('Selected scene:', theme, scene);
      // 可以跳转到场景详情或策划页面
      this.$router.push(`/planner?theme=${theme}&scene=${encodeURIComponent(scene.name)}`);
    },

    handleSelectPackage({ theme, package: pkg, price }) {
      console.log('Selected package:', theme, pkg, price);
      // 可以跳转到报价页面
      this.$router.push(`/quotation?theme=${theme}&package=${encodeURIComponent(pkg.name)}&price=${price}`);
    }
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  transition: background-color 0.5s ease;
}

/* 导航栏 */
.main-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px 0;
  transition: all 0.3s ease;
  background: transparent;
}

.main-nav.is-scrolled {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.logo-icon {
  font-size: 1.75rem;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: white;
}

.nav-cta {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-cta:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 主题介绍区 */
.themes-section {
  padding: 100px 24px;
  position: relative;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.125rem;
  text-align: center;
  margin-bottom: 60px;
  opacity: 0.8;
}

.theme-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.theme-card {
  padding: 40px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
}

.theme-card:hover {
  transform: translateY(-8px);
}

.card-icon {
  font-size: 4rem;
  margin-bottom: 24px;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--theme-text);
}

.card-description {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 24px;
  color: var(--theme-text-muted);
}

.card-cta {
  padding: 14px 32px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.card-cta:hover {
  transform: translateY(-2px);
}

/* 流程介绍区 */
.how-it-works {
  padding: 100px 24px;
  background: rgba(0, 0, 0, 0.2);
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin-top: 60px;
}

.step-card {
  padding: 40px 32px;
  text-align: center;
  position: relative;
  backdrop-filter: blur(10px);
}

.step-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.step-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--theme-text);
}

.step-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--theme-text-muted);
}

/* CTA区 */
.final-cta {
  padding: 120px 24px;
  text-align: center;
}

.cta-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 40px;
}

.cta-main-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 20px 48px;
  border: none;
  border-radius: 50px;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cta-main-button:hover {
  transform: translateY(-3px) scale(1.02);
}

.cta-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s;
}

.cta-main-button:hover .cta-arrow {
  transform: translateX(4px);
}

/* 页脚 */
.main-footer {
  padding: 60px 24px 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.footer-tagline {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.footer-links {
  display: flex;
  gap: 32px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .themes-section,
  .how-it-works,
  .final-cta {
    padding: 60px 20px;
  }
  
  .theme-cards {
    grid-template-columns: 1fr;
  }
  
  .steps {
    grid-template-columns: 1fr;
  }
  
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
}
</style>
