<template>
  <section class="scene-showcase" :style="sectionStyle">
    <div class="section-container">
      <!-- 区标题 -->
      <div class="section-header">
        <h2 class="section-title" :style="titleStyle">
          {{ themeConfig.sceneSection?.title || '选择你的派对场景' }}
        </h2>
        <p class="section-subtitle" :style="subtitleStyle">
          {{ themeConfig.sceneSection?.subtitle || '每个场景都是一段独特的体验' }}
        </p>
      </div>
      
      <!-- 场景卡网格 -->
      <div class="scene-grid">
        <div 
          v-for="(scene, index) in currentScenes" 
          :key="index"
          class="scene-card"
          :class="{ 'is-featured': scene.featured }"
          :style="getSceneCardStyle(scene)"
          @click="selectScene(scene)"
        >
          <!-- 场景图片 -->
          <div class="scene-image" :style="getImageStyle(scene)">
            <div class="scene-icon">{{ scene.icon }}</div>
            <div v-if="scene.featured" class="featured-badge">热门</div>
          </div>
          
          <!-- 场景信息 -->
          <div class="scene-info">
            <h3 class="scene-name">{{ scene.name }}</h3>
            <p class="scene-description">{{ scene.description }}</p>
            
            <!-- 场景标签 -->
            <div class="scene-tags">
              <span 
                v-for="tag in scene.tags" 
                :key="tag"
                class="scene-tag"
                :style="tagStyle"
              >{{ tag }}</span>
            </div>
            
            <!-- 价格预览 -->
            <div class="scene-price-preview">
              <span class="price-label">基础布置</span>
              <span class="price-value" :style="priceStyle">{{ scene.basePrice }}</span>
            </div>
          </div>
          
          <!-- 选择按钮 -->
          <button class="select-scene-btn" :style="selectButtonStyle">
            {{ scene.ctaText || '选择此场景' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { getTheme } from '@/themes';

export default {
  name: 'SceneShowcase',
  
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
    
    currentScenes() {
      return this.scenes[this.themeId] || this.scenes.space;
    },
    
    sectionStyle() {
      return {
        background: this.themeConfig.colors.primary,
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
    
    tagStyle() {
      return {
        background: `${this.themeConfig.colors.accent}20`,
        color: this.themeConfig.colors.accent,
        border: `1px solid ${this.themeConfig.colors.accent}40`
      };
    },
    
    priceStyle() {
      return {
        color: this.themeConfig.colors.highlight
      };
    },
    
    selectButtonStyle() {
      const btn = this.themeConfig.button.secondary;
      return {
        background: btn.background,
        border: btn.border,
        color: btn.color
      };
    }
  },
  
  data() {
    return {
      scenes: {
        space: [
          {
            name: '星际指挥舱',
            icon: '🚀',
            description: '高科技舱内布置，LED星空顶，宇航员体验',
            tags: ['室内', '科技', '沉浸式'],
            basePrice: '$2,800起',
            featured: true,
            ctaText: '进入指挥舱'
          },
          {
            name: '月球表面基地',
            icon: '🌙',
            description: '模拟月球地表，陨石坑装饰，太空漫步体验',
            tags: ['半户外', '探险', '拍照'],
            basePrice: '$3,200起',
            featured: false,
          },
          {
            name: '星际观测站',
            icon: '🔭',
            description: '巨型望远镜，星座投影，天文科普互动',
            tags: ['室内', '科普', '互动'],
            basePrice: '$2,500起',
            featured: false
          }
        ],
        castle: [
          {
            name: '皇家宴会厅',
            icon: '👑',
            description: '水晶吊灯，丝绒帷幔，宫廷餐桌布置',
            tags: ['室内', '奢华', '正式'],
            basePrice: '$3,500起',
            featured: true,
            ctaText: '进入宴会厅'
          },
          {
            name: '秘密花园露台',
            icon: '🌹',
            description: '藤蔓拱门，鲜花装饰，童话氛围',
            tags: ['户外', '浪漫', '自然'],
            basePrice: '$2,800起',
            featured: false
          },
          {
            name: '魔法塔楼',
            icon: '🏰',
            description: '螺旋楼梯，魔法书墙，巫师体验',
            tags: ['室内', '奇幻', '探险'],
            basePrice: '$3,000起',
            featured: false
          }
        ],
        forest: [
          {
            name: '林间空地',
            icon: '🌲',
            description: '阳光穿透树叶，野花地毯，自然野餐',
            tags: ['户外', '自然', '野餐'],
            basePrice: '$2,200起',
            featured: true,
            ctaText: '进入林间'
          },
          {
            name: '树屋秘境',
            icon: '🏕️',
            description: '木质树屋，绳梯通道，森林探险',
            tags: ['半户外', '探险', '独特'],
            basePrice: '$3,800起',
            featured: false
          },
          {
            name: '萤火虫溪谷',
            icon: '✨',
            description: '小溪流水，萤火虫灯，夜晚魔法',
            tags: ['户外', '夜景', '浪漫'],
            basePrice: '$2,600起',
            featured: false
          }
        ]
      }
    };
  },
  
  methods: {
    getSceneCardStyle(scene) {
      return {
        background: this.themeConfig.card.background,
        border: scene.featured 
          ? `2px solid ${this.themeConfig.colors.accent}` 
          : this.themeConfig.card.border,
        borderRadius: this.themeConfig.card.borderRadius,
        boxShadow: scene.featured
          ? `0 0 30px ${this.themeConfig.colors.accent}40, ${this.themeConfig.card.boxShadow}`
          : this.themeConfig.card.boxShadow,
        backdropFilter: this.themeConfig.card.backdropFilter
      };
    },
    
    getImageStyle(scene) {
      // 根据主题返回不同的渐变背景
      const gradients = {
        space: 'linear-gradient(135deg, #1a3a5f 0%, #0d1b2a 100%)',
        castle: 'linear-gradient(135deg, #4c1d95 0%, #2d1b4e 100%)',
        forest: 'linear-gradient(135deg, #2d5016 0%, #1a2f1a 100%)'
      };
      return {
        background: gradients[this.themeId] || gradients.space
      };
    },
    
    selectScene(scene) {
      this.$emit('select-scene', { theme: this.themeId, scene });
    }
  }
};
</script>

<style scoped>
.scene-showcase {
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

/* 场景卡网格 */
.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.scene-card {
  overflow: hidden;
  transition: all 0.4s ease;
  cursor: pointer;
}

.scene-card:hover {
  transform: translateY(-8px);
}

.scene-card.is-featured {
  transform: scale(1.02);
}

.scene-card.is-featured:hover {
  transform: scale(1.02) translateY(-8px);
}

/* 场景图片区 */
.scene-image {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.scene-icon {
  font-size: 5rem;
  filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3));
}

.featured-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #1a0f2e;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 场景信息 */
.scene-info {
  padding: 24px;
}

.scene-name {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: inherit;
}

.scene-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-bottom: 16px;
  opacity: 0.8;
}

/* 标签 */
.scene-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.scene-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 价格预览 */
.scene-price-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.price-label {
  font-size: 0.875rem;
  opacity: 0.7;
}

.price-value {
  font-size: 1.125rem;
  font-weight: 700;
}

/* 选择按钮 */
.select-scene-btn {
  width: 100%;
  padding: 16px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-scene-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-2px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .scene-showcase {
    padding: 60px 20px;
  }
  
  .scene-grid {
    grid-template-columns: 1fr;
  }
  
  .scene-card.is-featured {
    transform: none;
  }
  
  .scene-card.is-featured:hover {
    transform: translateY(-8px);
  }
}
</style>
