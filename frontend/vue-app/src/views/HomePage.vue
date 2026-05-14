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
          <a href="#themes" class="nav-link">{{ $t('home.navThemes') }}</a>
          <a href="#how-it-works" class="nav-link">{{ $t('home.navProcess') }}</a>
          <a href="#venues" class="nav-link">{{ $t('home.navVenues') }}</a>
        </div>
        <div class="nav-actions">
          <LanguageSwitcher />
          <button class="nav-cta">{{ $t('home.navCta') }}</button>
        </div>
      </div>
    </nav>

    <section
      class="investor-hero"
      :style="{ backgroundImage: `linear-gradient(90deg, rgba(42, 23, 38, 0.78), rgba(126, 71, 96, 0.48), rgba(255, 230, 238, 0.24)), url(${investorHero.image})` }"
    >
      <div class="investor-hero-content">
        <span class="investor-kicker">{{ $t('home.kicker') }}</span>
        <h1 class="investor-title">{{ $t('home.title') }}</h1>
        <p class="investor-copy">
          {{ $t('home.intro') }}
        </p>

        <div class="investor-actions">
          <button
            v-for="action in investorActions"
            :key="action.label"
            class="investor-action"
            :class="{ 'is-primary': action.primary }"
            @click="goTo(action.to)"
          >
            <span>{{ action.icon }}</span>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>

      <div class="investor-visual-stack">
        <img :src="investorHero.image" :alt="investorHero.alt" class="hero-mockup-image">
        <div class="visual-stack-meta">
          <span>{{ $t('home.visualMeta') }}</span>
          <strong>{{ $t('home.visualMetaStrong') }}</strong>
        </div>
      </div>
    </section>

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
          {{ $t('home.themesTitle') }}
        </h2>
        <p class="section-subtitle" :style="sectionSubtitleStyle">
          {{ $t('home.themesSubtitle') }}
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
            <img
              v-if="theme.image"
              class="theme-card-image"
              :src="theme.image"
              :alt="theme.nameEn || theme.name"
              loading="lazy"
            >
            <div class="card-icon">{{ theme.icon }}</div>
            <h3 class="card-title">{{ theme.name }}</h3>
            <span class="card-title-en">{{ theme.nameEn }}</span>
            <p class="card-description">{{ theme.description }}</p>
            <button class="card-cta" :style="getCardButtonStyle(theme)">
              {{ theme.ctaText }}
            </button>
          </div>
        </div>

        <div class="investor-asset-panel">
          <div class="asset-panel-header">
            <span class="asset-kicker">{{ $t('home.assetKicker') }}</span>
            <h3 class="asset-panel-title">{{ $t('home.assetTitle') }}</h3>
            <p class="asset-panel-copy">
              {{ $t('home.assetCopy') }}
            </p>
          </div>

          <div class="asset-grid">
            <a
              v-for="asset in visualAssetsForTheme"
              :key="asset.id"
              class="asset-card"
              :href="asset.preview_url || asset.image_path"
              target="_blank"
              rel="noopener noreferrer"
              :style="getAssetCardStyle(asset)"
            >
              <div class="asset-preview" :class="`asset-preview-${asset.theme}`">
                <img :src="asset.image_path" :alt="asset.title" loading="lazy">
                <span class="asset-type">{{ formatAssetType(asset.asset_type) }}</span>
                <span class="asset-theme-icon">{{ getAssetThemeIcon(asset.theme) }}</span>
              </div>
              <div class="asset-body">
                <span class="asset-tier">{{ formatTier(asset.tier) }}</span>
                <h4>{{ asset.title }}</h4>
                <p>{{ asset.description }}</p>
              </div>
            </a>
          </div>
        </div>

        <div class="restoration-grid">
          <article class="restoration-panel">
            <div class="asset-panel-header">
              <span class="asset-kicker">{{ $t('home.packageKicker') }}</span>
              <h3 class="asset-panel-title">{{ $t('home.packageTitle') }}</h3>
              <p class="asset-panel-copy">{{ $t('home.packageCopy') }}</p>
            </div>
            <div class="mini-visual-grid">
              <div v-for="item in packageVisualsForTheme" :key="item.id" class="mini-visual-card">
                <img :src="item.image_path" :alt="item.title">
                <div>
                  <strong>{{ formatTier(item.tierLabel) }} · {{ item.priceHint }}</strong>
                  <span>{{ item.scope }}</span>
                </div>
              </div>
            </div>
          </article>

          <article class="restoration-panel">
            <div class="asset-panel-header">
              <span class="asset-kicker">{{ $t('home.restaurantKicker') }}</span>
              <h3 class="asset-panel-title">{{ $t('home.restaurantTitle') }}</h3>
              <p class="asset-panel-copy">{{ $t('home.restaurantCopy') }}</p>
            </div>
            <div class="mini-visual-grid">
              <div v-for="item in restaurantVisualsForTheme" :key="item.id" class="mini-visual-card">
                <img :src="item.image_path" :alt="item.title">
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.decorationLayer }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 流程介绍区 -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-container">
        <h2 class="section-title" :style="sectionTitleStyle">
          {{ $t('home.stepsTitle') }}
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
          {{ $t('home.finalTitle') }}
        </h2>
        <button 
          class="cta-main-button" 
          :style="finalCtaStyle"
          @click="handleFinalCTA"
        >
          <span>{{ currentThemeCtaText }}</span>
          <span class="cta-arrow">→</span>
        </button>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="footer-logo">🎉 PartyOnce</span>
          <p class="footer-tagline">{{ $t('home.footerTagline') }}</p>
        </div>
        <div class="footer-links">
          <a href="#">{{ $t('home.about') }}</a>
          <a href="#">{{ $t('home.contact') }}</a>
          <a href="#">{{ $t('home.privacy') }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import ImmersiveHero from '@/components/ImmersiveHero.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import SceneShowcase from '@/components/SceneShowcase.vue';
import PackageShowcase from '@/components/PackageShowcase.vue';
import { getTheme } from '@/themes';
import { getRestaurantAVisuals, getThemePackageVisuals, getVisualAssetsByTheme } from '@/data/visualAssets';

export default {
  name: 'HomePage',
  
  components: {
    ThemeSwitcher,
    ImmersiveHero,
    LanguageSwitcher,
    SceneShowcase,
    PackageShowcase
  },
  
  data() {
    return {
      currentTheme: this.$route.query.theme || 'castle',
      isScrolled: false,
      investorHero: {
        image: '/party-assets/investor-hero/immersive-homepage-hero.png',
        alt: 'PartyOnce immersive visual homepage hero'
      }
    };
  },
  
  computed: {
    themeCards() {
      return [
        {
          id: 'space',
          name: this.$t('themes.space.name'),
          nameEn: this.$t('themes.space.nameEn'),
          icon: '🚀',
          image: '/party-assets/themes/space-explorer.png',
          description: this.$t('themes.space.description'),
          ctaText: this.$t('home.themeCta.space')
        },
        {
          id: 'castle',
          name: this.$t('themes.castle.name'),
          nameEn: this.$t('themes.castle.nameEn'),
          icon: '🏰',
          image: '/party-assets/themes/castle-princess-full.png',
          description: this.$t('themes.castle.description'),
          ctaText: this.$t('home.themeCta.castle')
        },
        {
          id: 'forest',
          name: this.$t('themes.forest.name'),
          nameEn: this.$t('themes.forest.nameEn'),
          icon: '🌲',
          image: '/party-assets/themes/forest-adventure-full.png',
          description: this.$t('themes.forest.description'),
          ctaText: this.$t('home.themeCta.forest')
        }
      ];
    },

    investorActions() {
      return [
        {
          icon: '🎨',
          label: this.$t('home.planYourself'),
          to: '/themes',
          primary: true
        },
        {
          icon: '🤖',
          label: this.$t('home.aiRecommend'),
          to: '/ai-voice-intake',
          primary: false
        }
      ];
    },

    steps() {
      return [
        {
          icon: '🎯',
          title: this.$t('steps.chooseTheme.title'),
          description: this.$t('steps.chooseTheme.description')
        },
        {
          icon: '🤖',
          title: this.$t('steps.aiPlan.title'),
          description: this.$t('steps.aiPlan.description')
        },
        {
          icon: '🏛️',
          title: this.$t('steps.venue.title'),
          description: this.$t('steps.venue.description')
        },
        {
          icon: '🎊',
          title: this.$t('steps.party.title'),
          description: this.$t('steps.party.description')
        }
      ];
    },

    currentThemeConfig() {
      return getTheme(this.currentTheme);
    },

    currentThemeCtaText() {
      return this.$t(`home.themeCta.${this.currentTheme}`);
    },

    visualAssetsForTheme() {
      return getVisualAssetsByTheme(this.currentTheme);
    },

    packageVisualsForTheme() {
      return getThemePackageVisuals(this.currentTheme);
    },

    restaurantVisualsForTheme() {
      return getRestaurantAVisuals(this.currentTheme);
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
      const slugs = {
        castle: 'castle-princess',
        space: 'space-explorer',
        forest: 'forest-adventure'
      };
      this.$router.push(`/themes/${slugs[themeId] || 'castle-princess'}`);
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

    getAssetCardStyle(asset) {
      const themeConfig = asset.theme === 'all' ? this.currentThemeConfig : getTheme(asset.theme);
      return {
        borderColor: `${themeConfig.colors.accent}55`,
        boxShadow: `0 16px 45px ${themeConfig.colors.accent}22`
      };
    },

    getAssetThemeIcon(theme) {
      const icons = {
        space: '🚀',
        castle: '👑',
        forest: '🌲',
        all: '🎛️'
      };
      return icons[theme] || '✨';
    },

    formatAssetType(type) {
      const labels = {
        theme_world: 'Theme world',
        theme_effect: 'Theme effect',
        dining_layout: 'Dining layout',
        theme_switcher: 'Theme switcher',
        package_matrix: 'Package matrix',
        app_display_mockup: 'App mockup'
      };
      return labels[type] || type;
    },

    formatTier(tier) {
      const normalized = String(tier || '').trim().toLowerCase();
      const labels = {
        basic: this.$t('tiers.basic'),
        standard: this.$t('tiers.standard'),
        premium: this.$t('tiers.premium')
      };
      return labels[normalized] || tier;
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

    goTo(path) {
      this.$router.push(path);
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

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
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

.investor-hero {
  min-height: 92vh;
  padding: 132px 24px 72px;
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(360px, 0.72fr);
  gap: 48px;
  align-items: center;
  background-size: cover;
  background-position: center top;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.investor-hero-content {
  max-width: 720px;
  margin-left: max(0px, calc((100vw - 1200px) / 2));
}

:global([dir='rtl']) .investor-hero-content {
  margin-left: 0;
  margin-right: max(0px, calc((100vw - 1200px) / 2));
}

.investor-kicker {
  display: inline-flex;
  margin-bottom: 18px;
  color: #00f0ff;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

.investor-title {
  margin: 0;
  color: #fff;
  font-size: clamp(2.8rem, 6vw, 5.4rem);
  line-height: 1.02;
  font-weight: 900;
}

.investor-copy {
  max-width: 620px;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: clamp(1rem, 1.7vw, 1.25rem);
  line-height: 1.75;
}

.investor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 34px;
}

.investor-action {
  min-width: 168px;
  min-height: 54px;
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  backdrop-filter: blur(14px);
  transition: transform 0.22s ease, background 0.22s ease;
}

.investor-action:hover {
  transform: translateY(-2px);
}

.investor-action.is-primary {
  color: #03111a;
  border-color: rgba(0, 240, 255, 0.65);
  background: linear-gradient(135deg, #00f0ff, #31b7ff);
  box-shadow: 0 14px 36px rgba(0, 212, 255, 0.34);
}

.investor-visual-stack {
  width: min(100%, 460px);
  justify-self: end;
  margin-right: max(0px, calc((100vw - 1200px) / 2));
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  overflow: hidden;
  background: rgba(4, 8, 20, 0.64);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.46);
  backdrop-filter: blur(18px);
}

.hero-mockup-image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: top center;
}

.visual-stack-meta {
  padding: 18px 20px 20px;
}

.visual-stack-meta span {
  display: block;
  color: #00f0ff;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.visual-stack-meta strong {
  display: block;
  margin-top: 8px;
  color: #fff;
  font-size: 1.05rem;
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
  overflow: hidden;
  padding: 0 0 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
}

.theme-card:hover {
  transform: translateY(-8px);
}

.theme-card-image {
  width: 100%;
  height: 220px;
  display: block;
  object-fit: cover;
  object-position: top center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.card-icon {
  width: 72px;
  height: 72px;
  margin: -36px auto 20px;
  display: grid;
  place-items: center;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.42);
  font-size: 4rem;
  backdrop-filter: blur(12px);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 28px 4px;
  color: var(--theme-text);
}

.card-title-en {
  display: block;
  margin-bottom: 14px;
  color: var(--theme-accent);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.card-description {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 32px 24px;
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

.investor-asset-panel {
  margin-top: 56px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(16px);
}

.asset-panel-header {
  max-width: 760px;
  margin-bottom: 28px;
}

.asset-kicker {
  display: inline-flex;
  margin-bottom: 10px;
  color: var(--theme-accent);
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.asset-panel-title {
  margin: 0 0 10px;
  color: var(--theme-text);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
}

.asset-panel-copy {
  color: var(--theme-text-muted);
  line-height: 1.7;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.asset-card {
  overflow: hidden;
  min-height: 310px;
  color: var(--theme-text);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.24);
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.asset-card:hover {
  transform: translateY(-6px);
}

.asset-preview {
  position: relative;
  min-height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  overflow: hidden;
}

.asset-preview img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.asset-type,
.asset-theme-icon {
  position: relative;
  z-index: 1;
  margin: 18px;
}

.asset-type {
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.32);
  font-size: 0.75rem;
  font-weight: 700;
}

.asset-theme-icon {
  font-size: 3rem;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
}

.asset-body {
  padding: 18px;
}

.asset-tier {
  color: var(--theme-accent);
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
}

.asset-body h4 {
  margin: 8px 0 10px;
  font-size: 1.08rem;
}

.asset-body p {
  margin: 0;
  color: var(--theme-text-muted);
  font-size: 0.92rem;
  line-height: 1.55;
}

.restoration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 22px;
}

.restoration-panel {
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  background: rgba(0, 0, 0, 0.24);
}

.mini-visual-grid {
  display: grid;
  gap: 14px;
}

.mini-visual-card {
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 14px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
}

.mini-visual-card img {
  width: 112px;
  height: 78px;
  border-radius: 12px;
  object-fit: cover;
  object-position: top center;
}

.mini-visual-card strong,
.mini-visual-card span {
  display: block;
}

.mini-visual-card strong {
  color: var(--theme-text);
  font-size: 0.98rem;
}

.mini-visual-card span {
  margin-top: 5px;
  color: var(--theme-text-muted);
  font-size: 0.84rem;
  line-height: 1.45;
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
  .investor-hero {
    min-height: auto;
    padding: 118px 18px 54px;
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .investor-hero-content {
    margin-left: 0;
  }

  .investor-title {
    font-size: 2.6rem;
  }

  .investor-visual-stack {
    width: 100%;
    margin-right: 0;
  }

  .nav-links {
    display: none;
  }

  .nav-container {
    padding: 0 14px;
  }

  .nav-actions {
    gap: 8px;
  }

  .nav-cta {
    padding: 9px 14px;
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
