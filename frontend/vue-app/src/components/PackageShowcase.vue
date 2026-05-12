<template>
  <section class="package-showcase" :style="sectionStyle">
    <div class="section-container">
      <!-- 区标题 -->
      <div class="section-header">
        <h2 class="section-title" :style="titleStyle">
          {{ themeConfig.packageSection?.title || '选择你的派对套餐' }}
        </h2>
        <p class="section-subtitle" :style="subtitleStyle">
          {{ themeConfig.packageSection?.subtitle || '从基础到高端，满足每一种需求' }}
        </p>
      </div>
      
      <!-- 套餐卡网格 -->
      <div class="package-grid">
        <div 
          v-for="(pkg, index) in currentPackages" 
          :key="index"
          class="package-card"
          :class="{ 'is-popular': pkg.popular }"
          :style="getPackageCardStyle(pkg)"
        >
          <!-- 热门标签 -->
          <div v-if="pkg.popular" class="popular-badge" :style="popularBadgeStyle">
            {{ pkg.badge || '最受欢迎' }}
          </div>
          
          <!-- 套餐头部 -->
          <div class="package-header">
            <div class="package-icon">{{ pkg.icon }}</div>
            <h3 class="package-name">{{ pkg.name }}</h3>
            <p class="package-description">{{ pkg.description }}</p>
          </div>
          
          <!-- 价格区 -->
          <div class="package-price" :style="priceAreaStyle">
            <span class="price-currency">$</span>
            <span class="price-amount">{{ pkg.price }}</span>
            <span class="price-unit">/ {{ pkg.unit || '起' }}</span>
          </div>
          
          <!-- 包含项目 -->
          <div class="package-features">
            <div 
              v-for="feature in pkg.features" 
              :key="feature"
              class="feature-item"
            >
              <span class="feature-check" :style="checkStyle">✓</span>
              <span class="feature-text">{{ feature }}</span>
            </div>
          </div>
          
          <!-- 附加项入口 -->
          <div class="addon-hint" :style="addonHintStyle">
            <span class="addon-icon">+</span>
            <span>{{ pkg.addonHint || '可添加更多定制项' }}</span>
          </div>
          
          <!-- CTA按钮 -->
          <button 
            class="package-cta" 
            :class="{ 'is-primary': pkg.popular }"
            :style="pkg.popular ? primaryButtonStyle : secondaryButtonStyle"
            @click="selectPackage(pkg)"
          >
            {{ pkg.ctaText || '选择此套餐' }}
          </button>
        </div>
      </div>
      
      <!-- 价格说明 -->
      <div class="price-notice" :style="noticeStyle">
        <p>* 以上价格为{{ currentThemeName }}主题基础报价，最终价格根据具体场景、人数、日期等因素调整</p>
        <p>所有套餐均包含场地布置、基础道具、工作人员服务</p>
      </div>
    </div>
  </section>
</template>

<script>
import { getTheme } from '@/themes';

export default {
  name: 'PackageShowcase',
  
  props: {
    themeId: {
      type: String,
      default: 'space'
    }
  },
  
  computed: {
    themeConfig() {
      return getTheme(this.themeId);
    },
    
    currentThemeName() {
      return this.themeConfig.name;
    },
    
    currentPackages() {
      // 根据主题调整套餐内容和价格
      const basePackages = [
        {
          name: '基础探索包',
          icon: '🎈',
          description: '适合小型聚会，基础布置',
          price: this.getThemePrice(800),
          unit: '起',
          features: [
            '场地基础布置',
            '主题装饰道具',
            '2小时场地使用',
            '基础灯光音响'
          ],
          addonHint: '可添加：蛋糕、摄影师',
          ctaText: '选择基础包',
          popular: false
        },
        {
          name: '标准体验包',
          icon: '🎉',
          description: '适合中型派对，完整体验',
          price: this.getThemePrice(1500),
          unit: '起',
          features: [
            '全套主题布置',
            '专业场景道具',
            '4小时场地使用',
            '专业灯光音响',
            '1位活动策划师',
            '基础摄影服务'
          ],
          addonHint: '可添加： Catering、表演',
          ctaText: '选择标准包',
          popular: true,
          badge: '最受欢迎'
        },
        {
          name: '高端尊享包',
          icon: '👑',
          description: '奢华定制，专属体验',
          price: this.getThemePrice(3000),
          unit: '起',
          features: [
            'VIP主题定制',
            '高级场景道具',
            '全天场地使用',
            '顶级灯光音响',
            '专属策划团队',
            '专业摄影摄像',
            '定制餐饮服务',
            '专属管家服务'
          ],
          addonHint: '可添加： 明星表演、直升机',
          ctaText: '选择尊享包',
          popular: false
        }
      ];
      
      return basePackages;
    },
    
    sectionStyle() {
      return {
        background: `linear-gradient(180deg, ${this.themeConfig.colors.primary} 0%, ${this.themeConfig.colors.secondary}40 100%)`,
        '--theme-accent': this.themeConfig.colors.accent,
        '--theme-highlight': this.themeConfig.colors.highlight
      };
    },
    
    titleStyle() {
      return {
        fontFamily: this.themeConfig.fonts.heading,
        color: this.themeConfig.colors.text
      };
    },
    
    subtitleStyle() {
      return {
        color: this.themeConfig.colors.textMuted
      };
    },
    
    popularBadgeStyle() {
      return {
        background: this.themeConfig.colors.highlight,
        color: this.themeConfig.colors.primary
      };
    },
    
    priceAreaStyle() {
      return {
        borderColor: `${this.themeConfig.colors.accent}30`
      };
    },
    
    checkStyle() {
      return {
        color: this.themeConfig.colors.accent
      };
    },
    
    addonHintStyle() {
      return {
        background: `${this.themeConfig.colors.accent}15`,
        color: this.themeConfig.colors.accent
      };
    },
    
    primaryButtonStyle() {
      const btn = this.themeConfig.button.primary;
      return {
        background: btn.background,
        color: btn.color,
        boxShadow: btn.boxShadow
      };
    },
    
    secondaryButtonStyle() {
      const btn = this.themeConfig.button.secondary;
      return {
        background: btn.background,
        border: btn.border,
        color: btn.color
      };
    },
    
    noticeStyle() {
      return {
        color: this.themeConfig.colors.textMuted
      };
    }
  },
  
  methods: {
    getThemePrice(basePrice) {
      // 不同主题价格微调
      const multipliers = {
        space: 1.0,
        castle: 1.1,
        forest: 0.9
      };
      const multiplier = multipliers[this.themeId] || 1.0;
      return Math.round(basePrice * multiplier);
    },
    
    getPackageCardStyle(pkg) {
      return {
        background: this.themeConfig.card.background,
        border: pkg.popular 
          ? `2px solid ${this.themeConfig.colors.highlight}` 
          : this.themeConfig.card.border,
        borderRadius: this.themeConfig.card.borderRadius,
        boxShadow: pkg.popular
          ? `0 0 40px ${this.themeConfig.colors.highlight}30, ${this.themeConfig.card.boxShadow}`
          : this.themeConfig.card.boxShadow,
        backdropFilter: this.themeConfig.card.backdropFilter
      };
    },
    
    selectPackage(pkg) {
      this.$emit('select-package', { 
        theme: this.themeId, 
        package: pkg,
        price: pkg.price
      });
    }
  }
};
</script>

<style scoped>
.package-showcase {
  padding: 100px 24px;
  position: relative;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.125rem;
  opacity: 0.8;
}

/* 套餐卡网格 */
.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  align-items: start;
}

.package-card {
  padding: 32px;
  position: relative;
  transition: all 0.4s ease;
}

.package-card:hover {
  transform: translateY(-8px);
}

.package-card.is-popular {
  transform: scale(1.03);
  z-index: 2;
}

.package-card.is-popular:hover {
  transform: scale(1.03) translateY(-8px);
}

/* 热门标签 */
.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 套餐头部 */
.package-header {
  text-align: center;
  margin-bottom: 24px;
}

.package-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
}

.package-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: inherit;
}

.package-description {
  font-size: 0.9375rem;
  opacity: 0.8;
}

/* 价格区 */
.package-price {
  text-align: center;
  padding: 24px 0;
  margin-bottom: 24px;
  border-top: 1px solid;
  border-bottom: 1px solid;
}

.price-currency {
  font-size: 1.5rem;
  font-weight: 600;
  vertical-align: top;
}

.price-amount {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
}

.price-unit {
  font-size: 1rem;
  opacity: 0.7;
}

/* 包含项目 */
.package-features {
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-check {
  font-weight: 700;
  font-size: 1.125rem;
}

.feature-text {
  font-size: 0.9375rem;
  opacity: 0.9;
}

/* 附加项入口 */
.addon-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 0.875rem;
}

.addon-icon {
  font-weight: 700;
  font-size: 1.125rem;
}

/* CTA按钮 */
.package-cta {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 8px;
  font-size: 1.0625rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.package-cta:hover {
  transform: translateY(-2px);
}

.package-cta.is-primary:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

/* 价格说明 */
.price-notice {
  text-align: center;
  margin-top: 60px;
  padding: 24px;
  font-size: 0.875rem;
  line-height: 1.8;
  opacity: 0.7;
}

.price-notice p {
  margin: 8px 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .package-showcase {
    padding: 60px 20px;
  }
  
  .package-grid {
    grid-template-columns: 1fr;
  }
  
  .package-card.is-popular {
    transform: none;
    order: -1;
  }
  
  .package-card.is-popular:hover {
    transform: translateY(-8px);
  }
  
  .price-amount {
    font-size: 2.5rem;
  }
}
</style>
