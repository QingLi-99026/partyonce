<template>
  <section class="immersive-hero" :style="heroStyle">
    <!-- 动态背景层 -->
    <div class="hero-background">
      <div class="gradient-bg" :style="gradientStyle"></div>
      <div class="overlay-bg" :style="overlayStyle"></div>
      <div v-if="themeConfig.background.stars" class="stars-container">
        <div v-for="n in 50" :key="n" class="star" :style="getStarStyle(n)"></div>
      </div>
      <div v-if="themeConfig.background.lightRays" class="light-rays">
        <div v-for="n in 5" :key="n" class="ray" :style="getRayStyle(n)"></div>
      </div>
      <!-- 城堡剪影 - 仅梦幻城堡主题 -->
      <div v-if="themeId === 'castle'" class="castle-silhouette">
        <svg viewBox="0 0 400 300" class="castle-svg">
          <defs>
            <linearGradient id="castleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(45,27,78,0.4)"/>
              <stop offset="100%" style="stop-color:rgba(45,27,78,0.8)"/>
            </linearGradient>
          </defs>
          <!-- 主塔 -->
          <rect x="170" y="80" width="60" height="180" fill="url(#castleGrad)"/>
          <polygon points="160,80 200,20 240,80" fill="url(#castleGrad)"/>
          <!-- 左塔 -->
          <rect x="100" y="120" width="50" height="140" fill="url(#castleGrad)"/>
          <polygon points="95,120 125,70 155,120" fill="url(#castleGrad)"/>
          <!-- 右塔 -->
          <rect x="250" y="100" width="55" height="160" fill="url(#castleGrad)"/>
          <polygon points="245,100 277,50 310,100" fill="url(#castleGrad)"/>
          <!-- 城墙 -->
          <rect x="80" y="200" width="240" height="100" fill="url(#castleGrad)"/>
          <!-- 窗户光 -->
          <rect x="185" y="110" width="12" height="20" fill="rgba(255,215,0,0.6)" rx="6"/>
          <rect x="185" y="150" width="12" height="20" fill="rgba(255,215,0,0.4)" rx="6"/>
          <rect x="118" y="145" width="10" height="16" fill="rgba(255,215,0,0.5)" rx="5"/>
          <rect x="268" y="130" width="11" height="18" fill="rgba(255,215,0,0.5)" rx="5"/>
        </svg>
      </div>
      <!-- 森林树木剪影 - 仅森林奇境主题 -->
      <div v-if="themeId === 'forest'" class="forest-silhouette">
        <svg viewBox="0 0 400 200" class="forest-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="treeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(76,175,80,0.4)"/>
              <stop offset="100%" style="stop-color:rgba(26,47,26,0.95)"/>
            </linearGradient>
            <linearGradient id="treeGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(102,187,106,0.5)"/>
              <stop offset="100%" style="stop-color:rgba(45,80,22,0.9)"/>
            </linearGradient>
          </defs>
          <!-- 远景树木（较淡） -->
          <polygon points="40,200 60,100 80,200" fill="url(#treeGrad)" opacity="0.6"/>
          <polygon points="300,200 330,80 360,200" fill="url(#treeGrad)" opacity="0.6"/>
          <!-- 近景树木（较深） -->
          <polygon points="0,200 30,60 70,200" fill="url(#treeGrad2)"/>
          <polygon points="100,200 140,40 180,200" fill="url(#treeGrad2)"/>
          <polygon points="250,200 290,50 330,200" fill="url(#treeGrad2)"/>
          <polygon points="360,200 380,90 400,200" fill="url(#treeGrad2)"/>
          <!-- 灌木 -->
          <ellipse cx="50" cy="190" rx="50" ry="25" fill="url(#treeGrad2)"/>
          <ellipse cx="350" cy="185" rx="60" ry="30" fill="url(#treeGrad2)"/>
          <!-- 萤火虫点缀 -->
          <circle cx="80" cy="120" r="2" fill="#d4af37" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="320" cy="100" r="2" fill="#d4af37" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="200" cy="80" r="1.5" fill="#ffd700" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>

      <!-- 宇宙元素 - 仅星际探险主题 -->
      <div v-if="themeId === 'space'" class="space-elements">
        <!-- 流星拖尾效果 -->
        <div class="shooting-stars">
          <div v-for="n in 3" :key="n" class="shooting-star" :style="getShootingStarStyle(n)"></div>
        </div>

        <!-- 带环行星 -->
        <div class="planet-with-rings">
          <svg viewBox="0 0 200 200" class="planet-svg">
            <defs>
              <radialGradient id="planetGrad" cx="30%" cy="30%">
                <stop offset="0%" style="stop-color:#4a90d9"/>
                <stop offset="50%" style="stop-color:#1e5799"/>
                <stop offset="100%" style="stop-color:#0d1b2a"/>
              </radialGradient>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(192,192,192,0.8)"/>
                <stop offset="50%" style="stop-color:rgba(255,215,0,0.6)"/>
                <stop offset="100%" style="stop-color:rgba(192,192,192,0.4)"/>
              </linearGradient>
            </defs>
            <!-- 行星环背面 -->
            <ellipse cx="100" cy="100" rx="120" ry="25" fill="none" stroke="url(#ringGrad)" stroke-width="8" opacity="0.6" transform="rotate(-15 100 100)"/>
            <!-- 行星本体 -->
            <circle cx="100" cy="100" r="50" fill="url(#planetGrad)"/>
            <!-- 行星环正面 -->
            <ellipse cx="100" cy="100" rx="120" ry="25" fill="none" stroke="url(#ringGrad)" stroke-width="4" opacity="0.9" transform="rotate(-15 100 100)"/>
            <!-- 行星光晕 -->
            <circle cx="100" cy="100" r="55" fill="none" stroke="rgba(0,212,255,0.3)" stroke-width="2"/>
          </svg>
        </div>
        <!-- 卫星 -->
        <div class="satellite">
          <svg viewBox="0 0 60 60" class="satellite-svg">
            <circle cx="30" cy="30" r="8" fill="#c0c0c0"/>
            <rect x="10" y="25" width="15" height="10" fill="#4a90d9" rx="2"/>
            <rect x="35" y="25" width="15" height="10" fill="#4a90d9" rx="2"/>
            <line x1="25" y1="30" x2="10" y2="30" stroke="#888" stroke-width="1"/>
            <line x1="35" y1="30" x2="50" y2="30" stroke="#888" stroke-width="1"/>
          </svg>
        </div>
        <!-- 科技扫描线 -->
        <div class="scanlines"></div>
      </div>
    </div>

    <!-- 装饰元素层 -->
    <div class="decorations-layer">
      <div
        v-for="(element, index) in themeConfig.decorations.elements"
        :key="index"
        class="floating-element"
        :class="`element-${getElementKey(element)}`"
        :style="getElementStyle(index)"
      >
        <span class="floating-element-icon" aria-hidden="true">{{ getElementIcon(element) }}</span>
      </div>
    </div>

    <!-- 内容层 -->
    <div class="hero-content">
      <div class="content-wrapper">
        <!-- 主标题 -->
        <h1 class="hero-title" :style="titleStyle">
          <span class="title-line">{{ themeConfig.name }}</span>
          <span class="title-tagline">{{ themeConfig.tagline }}</span>
        </h1>

        <!-- 副标题 -->
        <p class="hero-subtitle" :style="subtitleStyle">
          让每一个派对都成为难忘的回忆
        </p>

        <!-- CTA按钮组 -->
        <div class="cta-group">
          <button
            class="cta-primary"
            :style="primaryButtonStyle"
            @click="handlePrimaryCTA"
          >
            <span class="cta-icon">{{ getThemeIcon }}</span>
            <span class="cta-text">{{ themeConfig.ctaText }}</span>
            <div class="cta-glow"></div>
          </button>

          <button
            class="cta-secondary"
            :style="secondaryButtonStyle"
            @click="handleSecondaryCTA"
          >
            <span>探索更多主题</span>
          </button>
        </div>

        <!-- 语音按钮 -->
        <button class="voice-button" @click="playVoice">
          <span class="voice-icon">🔊</span>
          <span class="voice-text">听一听</span>
        </button>
      </div>
    </div>

    <!-- 底部渐变遮罩 -->
    <div class="bottom-fade"></div>
  </section>
</template>

<script>
import { getTheme } from '@/themes';

export default {
  name: 'ImmersiveHero',

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

    heroStyle() {
      return {
        '--theme-primary': this.themeConfig.colors.primary,
        '--theme-accent': this.themeConfig.colors.accent,
        '--theme-highlight': this.themeConfig.colors.highlight,
        fontFamily: this.themeConfig.fonts.body
      };
    },

    gradientStyle() {
      return {
        background: this.themeConfig.background.gradient
      };
    },

    overlayStyle() {
      return {
        background: this.themeConfig.background.overlay
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

    primaryButtonStyle() {
      const btn = this.themeConfig.button.primary;
      return {
        background: btn.background,
        color: btn.color,
        boxShadow: btn.boxShadow,
        '--hover-glow': btn.hoverGlow
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

    getThemeIcon() {
      const icons = {
        space: '🚀',
        castle: '👑',
        forest: '🌲'
      };
      return icons[this.themeId] || '✨';
    }
  },

  methods: {
    getStarStyle(n) {
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 60}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      };
    },

    getRayStyle(n) {
      return {
        left: `${20 + n * 15}%`,
        animationDelay: `${n * 0.5}s`,
        transform: `rotate(${-30 + n * 15}deg)`
      };
    },

    getElementStyle(index) {
      return {
        left: `${10 + (index * 25)}%`,
        top: `${20 + (index % 2) * 40}%`,
        animationDelay: `${index * 0.8}s`,
        animationDuration: `${4 + index * 0.5}s`
      };
    },

    getElementKey(element) {
      return typeof element === 'string' ? element : element?.type;
    },

    getElementIcon(element) {
      // 返回装饰元素的SVG或字符
      const elementKey = this.getElementKey(element);
      const icons = {
        planet: '🪐',
        planet_with_rings: '🪐',
        orbit: '⭕',
        satellite: '🛰️',
        star: '⭐',
        sparkle: '✨',
        constellation: '✦',
        castle_tower: '🏰',
        castle_silhouette: '🏰',
        crown: '👑',
        vine: '🌿',
        gem: '💎',
        cloud: '☁️',
        nebula_cloud: '☁️',
        forest_silhouette: '🌲',
        leaf: '🍃',
        mushroom: '🍄',
        wood_sign: '🪧',
        shooting_star: '⭐',
        firefly: '✨'
      };
      return icons[elementKey] || '✨';
    },

    getShootingStarStyle(n) {
      const positions = [
        { top: '10%', left: '80%', delay: '0s', duration: '3s' },
        { top: '20%', left: '70%', delay: '1.5s', duration: '2.5s' },
        { top: '15%', left: '90%', delay: '3s', duration: '3.5s' }
      ];
      const pos = positions[n - 1] || positions[0];
      return {
        top: pos.top,
        left: pos.left,
        animationDelay: pos.delay,
        animationDuration: pos.duration
      };
    },

    handlePrimaryCTA() {
      this.$emit('start-planning', this.themeId);
    },

    handleSecondaryCTA() {
      this.$emit('explore-themes');
    },

    playVoice() {
      // 播放语音欢迎词
      const utterance = new SpeechSynthesisUtterance(this.themeConfig.voice.welcome);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
      this.$emit('play-voice', this.themeConfig.voice.welcome);
    }
  }
};
</script>

<style scoped>
.immersive-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 背景层 */
.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.gradient-bg {
  position: absolute;
  inset: 0;
}

.overlay-bg {
  position: absolute;
  inset: 0;
}

/* 星星效果 */
.stars-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 光束效果 */
.light-rays {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ray {
  position: absolute;
  top: -20%;
  width: 100px;
  height: 150%;
  background: linear-gradient(180deg, rgba(212,175,55,0.1) 0%, transparent 50%);
  animation: rayMove 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes rayMove {
  0%, 100% { opacity: 0.3; transform: translateY(0) rotate(var(--rotation, 0deg)); }
  50% { opacity: 0.6; transform: translateY(5%) rotate(var(--rotation, 0deg)); }
}

/* 装饰元素 */
.decorations-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  font-size: 2rem;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.floating-element-icon {
  display: inline-block;
  line-height: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* 内容层 */
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 120px 24px 80px;
  max-width: 800px;
}

.content-wrapper {
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 标题 */
.hero-title {
  margin-bottom: 24px;
}

.title-line {
  display: block;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 16px;
}

.title-tagline {
  display: block;
  font-size: clamp(1rem, 3vw, 1.5rem);
  font-weight: 400;
  opacity: 0.9;
  line-height: 1.4;
}

/* 副标题 */
.hero-subtitle {
  font-size: 1.125rem;
  margin-bottom: 40px;
  opacity: 0.8;
}

/* CTA按钮组 */
.cta-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.cta-primary {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 36px;
  border: none;
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: var(--hover-glow) !important;
}

.cta-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
  border-radius: 50px;
  opacity: 0;
  transition: opacity 0.3s;
}

.cta-primary:hover .cta-glow {
  opacity: 1;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cta-icon {
  font-size: 1.25rem;
}

.cta-secondary {
  padding: 18px 32px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* 语音按钮 */
.voice-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.voice-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.voice-icon {
  font-size: 1rem;
}

/* 底部渐变遮罩 */
.bottom-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to top, var(--theme-primary), transparent);
  z-index: 5;
}

/* 城堡剪影 - 梦幻城堡主题 */
.castle-silhouette {
  position: absolute;
  bottom: 0;
  right: 5%;
  width: 350px;
  height: 280px;
  z-index: 2;
  opacity: 0.6;
  animation: castleGlow 4s ease-in-out infinite;
}

.castle-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.3));
}

@keyframes castleGlow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.2)); }
  50% { filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.5)); }
}

/* 森林剪影 - 森林奇境主题 */
.forest-silhouette {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  z-index: 2;
  opacity: 0.7;
}

.forest-svg {
  width: 100%;
  height: 100%;
}

/* 宇宙元素 - 星际探险主题 */
.space-elements {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.planet-with-rings {
  position: absolute;
  top: 15%;
  right: 10%;
  width: 180px;
  height: 180px;
  animation: planetFloat 8s ease-in-out infinite;
}

.planet-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 30px rgba(74, 144, 217, 0.4));
}

@keyframes planetFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(3deg); }
}

.satellite {
  position: absolute;
  top: 25%;
  right: 25%;
  width: 50px;
  height: 50px;
  animation: satelliteOrbit 12s linear infinite;
}

.satellite-svg {
  width: 100%;
  height: 100%;
}

@keyframes satelliteOrbit {
  0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
}

/* 科技扫描线 */
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 212, 255, 0.03) 2px,
    rgba(0, 212, 255, 0.03) 4px
  );
  pointer-events: none;
  animation: scanlineMove 10s linear infinite;
}

@keyframes scanlineMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

/* 流星拖尾效果 */
.shooting-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shooting-star {
  position: absolute;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  border-radius: 50%;
  opacity: 0;
  animation: shoot 3s ease-out infinite;
  transform: rotate(-45deg);
}

.shooting-star::before {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px 2px rgba(255,255,255,0.8), 0 0 20px 4px rgba(0,212,255,0.4);
}

@keyframes shoot {
  0% {
    opacity: 0;
    transform: translateX(0) translateY(0) rotate(-45deg);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(-300px) translateY(300px) rotate(-45deg);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .hero-content {
    padding: 100px 20px 60px;
  }

  .cta-group {
    flex-direction: column;
    align-items: center;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }

  .floating-element {
    font-size: 1.5rem;
  }
}
</style>
