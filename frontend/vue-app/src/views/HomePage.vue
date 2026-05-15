<template>
  <div class="home-page" :style="pageStyle">
    <section class="investor-hero">
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
        <img
          v-if="isChineseLocale"
          :src="investorHero.image"
          :alt="investorHero.alt"
          class="hero-mockup-image"
        >
        <div v-else class="hero-mockup-placeholder">
          <span class="hero-placeholder-icon">🎉</span>
          <strong>{{ $t('home.heroMockupFallbackTitle') }}</strong>
          <p>{{ $t('home.heroMockupFallbackCopy') }}</p>
        </div>
        <div class="visual-stack-meta">
          <span>{{ $t('home.visualMeta') }}</span>
          <strong>{{ $t('home.visualMetaStrong') }}</strong>
        </div>
      </div>
    </section>

    <!-- 沉浸式Hero -->
    <ImmersiveHero
      v-if="isChineseLocale"
      :theme-id="currentTheme"
      @start-planning="handleStartPlanning"
      @explore-themes="scrollToThemes"
      @play-voice="handlePlayVoice"
    />
    <section v-if="isChineseLocale && voiceGuidanceTheme" class="theme-listen-followup">
      <div class="theme-listen-card">
        <span class="asset-kicker">{{ $t('home.themeListen.kicker') }}</span>
        <h2>{{ $t(`themes.${voiceGuidanceTheme}.name`) }}</h2>
        <p>{{ $t(`home.themeListen.${voiceGuidanceTheme}`) }}</p>
        <div class="theme-listen-actions">
          <button class="localized-card-button" @click="continueWithVoiceTheme">
            {{ $t('home.themeListen.continue') }}
          </button>
          <button class="localized-card-button" @click="scrollToThemes">
            {{ $t('home.themeListen.switchTheme') }}
          </button>
          <button class="localized-card-button" @click="goTo('/ai-voice-intake')">
            {{ $t('home.themeListen.aiRecommend') }}
          </button>
        </div>
      </div>
    </section>
    <section v-if="!isChineseLocale" class="english-theme-hero">
      <div class="section-container english-theme-hero-grid">
        <div>
          <span class="asset-kicker">{{ $t('home.englishThemeHeroKicker') }}</span>
          <h2 class="section-title english-theme-title">{{ $t('home.englishThemeHeroTitle') }}</h2>
          <p class="section-subtitle english-theme-copy">{{ $t('home.englishThemeHeroCopy') }}</p>
        </div>
        <div class="english-theme-hero-actions">
          <button class="localized-card-button" @click="goTo('/themes/castle-princess')">
            {{ $t('home.assetFallbackCards.castle.cta') }}
          </button>
          <button class="localized-card-button" @click="goTo('/themes')">
            {{ $t('home.navThemes') }}
          </button>
          <button class="localized-card-button" @click="goTo('/quote')">
            {{ $t('quote.entry') }}
          </button>
        </div>
      </div>
    </section>

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
              v-if="theme.image && isChineseLocale"
              class="theme-card-image"
              :src="theme.image"
              :alt="theme.nameEn || theme.name"
              loading="lazy"
            >
            <div v-else class="theme-card-image-placeholder">
              <span>{{ theme.icon }}</span>
              <strong>{{ theme.nameEn || theme.name }}</strong>
            </div>
            <div class="card-icon">{{ theme.icon }}</div>
            <h3 class="card-title">{{ theme.name }}</h3>
            <span class="card-title-en">{{ theme.nameEn }}</span>
            <p class="card-description">{{ theme.description }}</p>
            <button class="card-cta" :style="getCardButtonStyle(theme)">
              {{ theme.ctaText }}
            </button>
          </div>
        </div>

        <div v-if="isChineseLocale" class="investor-asset-panel">
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

        <div v-else class="investor-asset-panel english-asset-panel">
          <div class="asset-panel-header">
            <span class="asset-kicker">{{ $t('home.assetFallbackKicker') }}</span>
            <h3 class="asset-panel-title">{{ $t('home.assetFallbackTitle') }}</h3>
            <p class="asset-panel-copy">
              {{ $t('home.assetFallbackCopy') }}
            </p>
          </div>

          <div class="localized-card-grid">
            <article v-for="asset in englishAssetCards" :key="asset.title" class="localized-info-card">
              <span class="localized-card-icon">{{ asset.icon }}</span>
              <h3>{{ asset.title }}</h3>
              <p>{{ asset.copy }}</p>
              <button class="localized-card-button" @click="goTo(asset.to)">{{ asset.cta }}</button>
            </article>
          </div>
        </div>

        <div v-if="isChineseLocale" class="restoration-grid">
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

        <div v-else class="restoration-grid english-restoration-grid">
          <article class="restoration-panel">
            <div class="asset-panel-header">
              <span class="asset-kicker">{{ $t('home.packageFallbackKicker') }}</span>
              <h3 class="asset-panel-title">{{ $t('home.packageFallbackTitle') }}</h3>
              <p class="asset-panel-copy">{{ $t('home.packageFallbackCopy') }}</p>
            </div>
            <div class="localized-card-grid compact-localized-grid">
              <article v-for="pkg in englishPackageAssetCards" :key="pkg.title" class="localized-info-card">
                <span class="localized-tier">{{ pkg.tier }}</span>
                <h3>{{ pkg.title }}</h3>
                <p>{{ pkg.copy }}</p>
              </article>
            </div>
          </article>

          <article class="restoration-panel">
            <div class="asset-panel-header">
              <span class="asset-kicker">{{ $t('home.restaurantFallbackKicker') }}</span>
              <h3 class="asset-panel-title">{{ $t('home.restaurantFallbackTitle') }}</h3>
              <p class="asset-panel-copy">{{ $t('home.restaurantFallbackCopy') }}</p>
            </div>
            <div class="localized-card-grid compact-localized-grid">
              <article v-for="scene in englishRestaurantAssetCards" :key="scene.title" class="localized-info-card">
                <span class="localized-card-icon">{{ scene.icon }}</span>
                <h3>{{ scene.title }}</h3>
                <p>{{ scene.copy }}</p>
              </article>
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
      v-if="isChineseLocale"
      :theme-id="currentTheme"
      @select-scene="handleSelectScene"
    />
    <section v-else class="localized-showcase">
      <div class="section-container">
        <h2 class="section-title" :style="sectionTitleStyle">{{ $t('home.localizedScenesTitle') }}</h2>
        <p class="section-subtitle" :style="sectionSubtitleStyle">{{ $t('home.localizedScenesSubtitle') }}</p>
        <div class="localized-card-grid">
          <article v-for="scene in localizedSceneCards" :key="scene.title" class="localized-info-card">
            <span class="localized-card-icon">{{ scene.icon }}</span>
            <h3>{{ scene.title }}</h3>
            <p>{{ scene.copy }}</p>
            <button class="localized-card-button" @click="goTo('/quote')">{{ $t('quote.entry') }}</button>
          </article>
        </div>
      </div>
    </section>

    <!-- 套餐/价格联动区 -->
    <PackageShowcase
      v-if="isChineseLocale"
      :theme-id="currentTheme"
      @select-package="handleSelectPackage"
    />
    <section v-else class="localized-showcase localized-showcase-soft">
      <div class="section-container">
        <h2 class="section-title" :style="sectionTitleStyle">{{ $t('home.localizedPackagesTitle') }}</h2>
        <p class="section-subtitle" :style="sectionSubtitleStyle">{{ $t('home.localizedPackagesSubtitle') }}</p>
        <div class="localized-card-grid">
          <article v-for="pkg in localizedPackageCards" :key="pkg.title" class="localized-info-card">
            <span class="localized-tier">{{ pkg.tier }}</span>
            <h3>{{ pkg.title }}</h3>
            <p>{{ pkg.copy }}</p>
            <button class="localized-card-button" @click="goTo('/quote')">{{ $t('quote.request') }}</button>
          </article>
        </div>
      </div>
    </section>

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

  </div>
</template>

<script>
import ImmersiveHero from '@/components/ImmersiveHero.vue';
import SceneShowcase from '@/components/SceneShowcase.vue';
import PackageShowcase from '@/components/PackageShowcase.vue';
import { getTheme } from '@/themes';
import { getRestaurantAVisuals, getThemePackageVisuals, getVisualAssetsByTheme } from '@/data/visualAssets';

export default {
  name: 'HomePage',
  
  components: {
    ImmersiveHero,
    SceneShowcase,
    PackageShowcase
  },
  
  data() {
    return {
      currentTheme: this.$route.query.theme || 'castle',
      investorHero: {
        image: '/party-assets/investor-hero/immersive-homepage-hero.png',
        alt: 'Party Event immersive visual homepage hero'
      },
      voiceGuidanceTheme: null
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

    isChineseLocale() {
      return this.$i18n.locale === 'zh';
    },

    localizedSceneCards() {
      return [
        {
          icon: '🏰',
          title: this.$t('home.localizedScenes.castle.title'),
          copy: this.$t('home.localizedScenes.castle.copy')
        },
        {
          icon: '🚀',
          title: this.$t('home.localizedScenes.space.title'),
          copy: this.$t('home.localizedScenes.space.copy')
        },
        {
          icon: '🌲',
          title: this.$t('home.localizedScenes.forest.title'),
          copy: this.$t('home.localizedScenes.forest.copy')
        }
      ];
    },

    localizedPackageCards() {
      return [
        {
          tier: this.$t('tiers.basic'),
          title: this.$t('home.localizedPackages.basic.title'),
          copy: this.$t('home.localizedPackages.basic.copy')
        },
        {
          tier: this.$t('tiers.standard'),
          title: this.$t('home.localizedPackages.standard.title'),
          copy: this.$t('home.localizedPackages.standard.copy')
        },
        {
          tier: this.$t('tiers.premium'),
          title: this.$t('home.localizedPackages.premium.title'),
          copy: this.$t('home.localizedPackages.premium.copy')
        }
      ];
    },

    englishAssetCards() {
      return [
        {
          icon: '🏰',
          title: this.$t('home.assetFallbackCards.castle.title'),
          copy: this.$t('home.assetFallbackCards.castle.copy'),
          cta: this.$t('home.assetFallbackCards.castle.cta'),
          to: '/themes/castle-princess'
        },
        {
          icon: '🚀',
          title: this.$t('home.assetFallbackCards.space.title'),
          copy: this.$t('home.assetFallbackCards.space.copy'),
          cta: this.$t('home.assetFallbackCards.space.cta'),
          to: '/themes/space-explorer'
        },
        {
          icon: '🌲',
          title: this.$t('home.assetFallbackCards.forest.title'),
          copy: this.$t('home.assetFallbackCards.forest.copy'),
          cta: this.$t('home.assetFallbackCards.forest.cta'),
          to: '/themes/forest-adventure'
        }
      ];
    },

    englishPackageAssetCards() {
      return [
        {
          tier: this.$t('tiers.basic'),
          title: this.$t('home.packageFallbackCards.basic.title'),
          copy: this.$t('home.packageFallbackCards.basic.copy')
        },
        {
          tier: this.$t('tiers.standard'),
          title: this.$t('home.packageFallbackCards.standard.title'),
          copy: this.$t('home.packageFallbackCards.standard.copy')
        },
        {
          tier: this.$t('tiers.premium'),
          title: this.$t('home.packageFallbackCards.premium.title'),
          copy: this.$t('home.packageFallbackCards.premium.copy')
        }
      ];
    },

    englishRestaurantAssetCards() {
      return [
        {
          icon: '🍽️',
          title: this.$t('home.restaurantFallbackCards.before.title'),
          copy: this.$t('home.restaurantFallbackCards.before.copy')
        },
        {
          icon: '🎈',
          title: this.$t('home.restaurantFallbackCards.decor.title'),
          copy: this.$t('home.restaurantFallbackCards.decor.copy')
        },
        {
          icon: '🧁',
          title: this.$t('home.restaurantFallbackCards.flow.title'),
          copy: this.$t('home.restaurantFallbackCards.flow.copy')
        }
      ];
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
  
  methods: {
    handleThemeChange(themeId) {
      this.switchToTheme(themeId);
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
      this.$router.push(`/ai-voice-intake?theme=${themeId}`);
    },
    
    scrollToThemes() {
      document.getElementById('themes').scrollIntoView({ behavior: 'smooth' });
    },
    
    handlePlayVoice() {
      this.voiceGuidanceTheme = this.currentTheme || 'castle';
    },

    continueWithVoiceTheme() {
      const slugs = {
        castle: 'castle-princess',
        space: 'space-explorer',
        forest: 'forest-adventure'
      };
      this.$router.push(`/ai-voice-intake?theme=${slugs[this.voiceGuidanceTheme] || 'castle-princess'}`);
    },
    
    handleFinalCTA() {
      this.$router.push(`/quote?theme=${this.currentTheme}`);
    },

    goTo(path) {
      this.$router.push(path);
    },

    handleSelectScene({ theme, scene }) {
      console.log('Selected scene:', theme, scene);
      this.$router.push(`/quote?theme=${theme}&scene=${encodeURIComponent(scene.name)}`);
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

.investor-hero {
  min-height: 78vh;
  padding: 72px 24px;
  display: grid;
  grid-template-columns: minmax(0, 0.96fr) minmax(340px, 0.72fr);
  gap: 42px;
  align-items: center;
  background:
    radial-gradient(circle at 84% 18%, rgba(0, 184, 217, 0.18), transparent 28%),
    linear-gradient(135deg, #fff8f0 0%, #ffe4ef 46%, #dff7ff 100%);
  border-bottom: 1px solid rgba(92, 43, 67, 0.12);
}

.investor-hero-content {
  max-width: 720px;
  margin-left: max(0px, calc((100vw - 1200px) / 2));
  padding: 42px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 28px 80px rgba(92, 43, 67, 0.16);
  backdrop-filter: blur(16px);
}

:global([dir='rtl']) .investor-hero-content {
  margin-left: 0;
  margin-right: max(0px, calc((100vw - 1200px) / 2));
}

.investor-kicker {
  display: inline-flex;
  margin-bottom: 18px;
  color: #b72d7a;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

.investor-title {
  margin: 0;
  color: #251522;
  font-size: clamp(2.4rem, 5.4vw, 4.9rem);
  line-height: 1.02;
  font-weight: 900;
}

.investor-copy {
  max-width: 620px;
  margin: 24px 0 0;
  color: #5b4653;
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
  color: #372032;
  font-size: 1rem;
  font-weight: 800;
  border: 1px solid rgba(183, 45, 122, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  backdrop-filter: blur(14px);
  transition: transform 0.22s ease, background 0.22s ease;
}

.investor-action:hover {
  transform: translateY(-2px);
}

.investor-action.is-primary {
  color: #fff;
  border-color: rgba(183, 45, 122, 0.42);
  background: linear-gradient(135deg, #e04491, #ff8a5b);
  box-shadow: 0 14px 36px rgba(224, 68, 145, 0.28);
}

.investor-visual-stack {
  width: min(100%, 460px);
  justify-self: end;
  margin-right: max(0px, calc((100vw - 1200px) / 2));
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 32px 80px rgba(92, 43, 67, 0.2);
  backdrop-filter: blur(18px);
}

.hero-mockup-image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: top center;
}

.hero-mockup-placeholder {
  min-height: 520px;
  aspect-ratio: 4 / 5;
  display: grid;
  align-content: center;
  gap: 18px;
  padding: 42px;
  color: #251522;
  background:
    radial-gradient(circle at 78% 18%, rgba(255, 138, 91, 0.24), transparent 30%),
    linear-gradient(135deg, #fff8f0, #f5e8ff 48%, #dff7ff);
}

.hero-placeholder-icon {
  font-size: 4rem;
}

.hero-mockup-placeholder strong {
  font-size: clamp(1.6rem, 3vw, 2.35rem);
  line-height: 1.08;
}

.hero-mockup-placeholder p {
  max-width: 340px;
  margin: 0;
  color: #5b4653;
  line-height: 1.7;
}

.visual-stack-meta {
  padding: 18px 20px 20px;
  background: #fff;
}

.visual-stack-meta span {
  display: block;
  color: #b72d7a;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.visual-stack-meta strong {
  display: block;
  margin-top: 8px;
  color: #251522;
  font-size: 1.05rem;
}

.english-theme-hero {
  padding: 72px 24px;
  background: #fff8f0;
}

.english-theme-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.42fr);
  gap: 30px;
  align-items: center;
}

.english-theme-title,
.english-theme-copy {
  text-align: left;
}

:global([dir='rtl']) .english-theme-title,
:global([dir='rtl']) .english-theme-copy {
  text-align: right;
}

.english-theme-copy {
  max-width: 720px;
  margin: 0;
}

.english-theme-hero-actions {
  display: grid;
  gap: 12px;
}

.theme-listen-followup {
  padding: 0 24px 56px;
  background: #fff8f0;
}

.theme-listen-card {
  max-width: 980px;
  margin: -28px auto 0;
  padding: 28px;
  border: 1px solid rgba(181, 69, 126, 0.18);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(89, 39, 69, 0.14);
  position: relative;
  z-index: 3;
}

.theme-listen-card h2 {
  margin: 8px 0 10px;
  color: #2b1d27;
  font-size: clamp(1.55rem, 3vw, 2.2rem);
}

.theme-listen-card p {
  max-width: 720px;
  margin: 0;
  color: #5b4653;
  line-height: 1.7;
}

.theme-listen-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
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

.theme-card-image-placeholder {
  height: 220px;
  display: grid;
  place-items: center;
  gap: 12px;
  padding: 28px;
  color: var(--theme-text);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.22), transparent 24%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(0, 0, 0, 0.22));
}

.theme-card-image-placeholder span {
  font-size: 3rem;
}

.theme-card-image-placeholder strong {
  font-size: 1.28rem;
  line-height: 1.2;
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

.english-asset-panel,
.english-restoration-grid .restoration-panel {
  background: rgba(255, 255, 255, 0.08);
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

.localized-showcase {
  padding: 90px 24px;
  background: rgba(255, 255, 255, 0.04);
}

.localized-showcase-soft {
  background: rgba(0, 0, 0, 0.08);
}

.localized-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.compact-localized-grid {
  grid-template-columns: 1fr;
  gap: 14px;
}

.localized-info-card {
  min-height: 260px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.14);
}

.compact-localized-grid .localized-info-card {
  min-height: auto;
  padding: 22px;
}

.localized-card-icon,
.localized-tier {
  display: inline-flex;
  margin-bottom: 18px;
  color: var(--theme-accent);
  font-size: 2rem;
  font-weight: 800;
}

.localized-tier {
  font-size: 0.86rem;
  text-transform: uppercase;
}

.localized-info-card h3 {
  margin: 0 0 12px;
  color: var(--theme-text);
  font-size: 1.35rem;
}

.localized-info-card p {
  min-height: 72px;
  margin: 0 0 22px;
  color: var(--theme-text-muted);
  line-height: 1.65;
}

.localized-card-button {
  min-height: 42px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  color: #20111d;
  background: var(--theme-accent);
  font-weight: 800;
  cursor: pointer;
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
  padding: 64px 24px 56px;
  text-align: center;
  background: linear-gradient(180deg, rgba(255, 248, 240, 0), #fff8f0 62%, #fff8f0 100%);
}

.cta-title {
  max-width: 760px;
  margin: 0 auto 24px;
  color: #2b1d27;
  font-size: clamp(1.55rem, 3vw, 2.18rem);
  font-weight: 800;
  line-height: 1.2;
}

.cta-main-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 34px;
  border: none;
  border-radius: 50px;
  font-size: 1.06rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
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

/* 移动端适配 */
@media (max-width: 768px) {
  .investor-hero {
    min-height: auto;
    padding: 42px 18px 54px;
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .investor-hero-content {
    margin-left: 0;
    padding: 28px 22px;
  }

  .investor-title {
    font-size: 2.6rem;
  }

  .investor-visual-stack {
    width: 100%;
    margin-right: 0;
  }

  .themes-section,
  .how-it-works {
    padding: 60px 20px;
  }

  .final-cta {
    padding: 46px 18px 42px;
  }
  
  .theme-cards {
    grid-template-columns: 1fr;
  }
  
  .steps {
    grid-template-columns: 1fr;
  }
  
}
</style>
