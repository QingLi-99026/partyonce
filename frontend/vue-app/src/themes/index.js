/**
 * PartyOnce 主题配置系统
 * 配置化驱动：颜色、字体、背景、卡片、按钮、语音
 */

export const themes = {
  // 星际探险主题 - 高水准精修版
  space: {
    id: 'space',
    name: '星际探险',
    nameEn: 'Space Adventure',
    tagline: '开启一段穿越星河的奇妙旅程',
    ctaText: '启动星际任务',

    // 色彩系统 - 宇宙深邃感
    colors: {
      primary: '#050814',      // 极深宇宙黑
      secondary: '#0a1628',    // 深空蓝
      nebula: '#1a0b3d',       // 星云紫
      accent: '#00f0ff',       // 电光青
      cyan: '#00d4ff',         // 青色
      silver: '#c0c0c0',       // 银色
      gold: '#ffd700',         // 星光金
      text: '#ffffff',
      textMuted: '#8ba3c7',
      surface: 'rgba(10, 22, 40, 0.7)',
      surfaceElevated: 'rgba(0, 240, 255, 0.1)',
      hud: 'rgba(0, 212, 255, 0.15)'  // HUD面板色
    },

    // 字体配置 - 硬核科技感
    fonts: {
      heading: '"Orbitron", "Rajdhani", "Exo 2", sans-serif',
      body: '"Inter", "Noto Sans SC", sans-serif',
      decorative: '"Orbitron", sans-serif',
      tech: '"Share Tech Mono", monospace'  // 科技等宽
    },

    // 背景配置 - 宇宙纵深+星云
    background: {
      type: 'gradient',
      // 多层宇宙渐变：深黑→星云紫→深空蓝
      gradient: 'linear-gradient(180deg, #020408 0%, #0a0a1a 20%, #1a0b3d 50%, #0d1b2a 80%, #050814 100%)',
      // 多层星云光效
      overlay: `
        radial-gradient(ellipse at 30% 20%, rgba(138,43,226,0.2) 0%, transparent 40%),
        radial-gradient(ellipse at 70% 40%, rgba(0,212,255,0.15) 0%, transparent 35%),
        radial-gradient(ellipse at 20% 60%, rgba(75,0,130,0.1) 0%, transparent 45%),
        radial-gradient(ellipse at 80% 80%, rgba(0,240,255,0.08) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.1) 0%, transparent 30%)
      `,
      stars: true,
      nebula: true,
      particles: 'constellation',
      // 科技扫描线效果
      scanlines: true
    },

    // 卡片样式 - 科技舱门/面板感
    card: {
      background: 'rgba(10, 22, 40, 0.6)',
      border: '1px solid rgba(0, 212, 255, 0.4)',
      borderRadius: '12px',
      boxShadow: `
        0 0 30px rgba(0, 212, 255, 0.15),
        inset 0 0 20px rgba(0, 212, 255, 0.05),
        0 8px 32px rgba(0, 0, 0, 0.5)
      `,
      backdropFilter: 'blur(12px)',
      // HUD角标装饰
      corners: 'tech'
    },

    // 按钮样式 - 舱门启动按钮
    button: {
      primary: {
        background: 'linear-gradient(135deg, #00f0ff 0%, #00a8cc 50%, #0077aa 100%)',
        color: '#050814',
        boxShadow: `
          0 0 30px rgba(0, 240, 255, 0.6),
          0 0 60px rgba(0, 212, 255, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          0 4px 15px rgba(0, 0, 0, 0.4)
        `,
        hoverGlow: '0 0 50px rgba(0, 240, 255, 0.9)',
        borderRadius: '8px',
        // 舱门边框效果
        border: '1px solid rgba(0, 240, 255, 0.6)'
      },
      secondary: {
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.4)',
        color: '#00f0ff',
        hoverBackground: 'rgba(0, 212, 255, 0.2)'
      }
    },

    // 装饰元素 - 宇宙元素
    decorations: {
      type: 'space',
      elements: [
        { type: 'planet_with_rings', position: 'upper-right', size: 'large' },
        { type: 'satellite', position: 'orbit', count: 2 },
        { type: 'constellation', position: 'scattered', count: 5 },
        { type: 'shooting_star', position: 'random', count: 3 },
        { type: 'nebula_cloud', position: 'background', opacity: 0.3 }
      ],
      floating: true,
      parallax: true
    },

    // 动效配置 - 科技流动
    animations: {
      hero: 'fadeInUp',
      particles: 'constellation-drift',
      cta: 'tech-pulse',
      transition: 'warp',
      planet: 'slow-orbit',
      scanline: 'continuous'
    },

    // 语音配置
    voice: {
      welcome: '欢迎来到星际探险基地！准备好开启一段穿越星河的奇妙旅程了吗？系统将为您规划最佳航线。',
      cta: '舱门开启，准备发射！点击启动星际任务，让我们一起探索未知的宇宙！',
      theme: 'space'
    }
  },

  // 梦幻城堡主题 - 高水准精修版
  castle: {
    id: 'castle',
    name: '梦幻城堡',
    nameEn: 'Dream Castle',
    tagline: '走进童话，开启属于你的公主王子梦',
    ctaText: '进入梦幻城堡',

    // 色彩系统 - 更柔和梦幻
    colors: {
      primary: '#1a0f2e',      // 更深邃的夜空紫
      secondary: '#4a1d6e',    // 皇家紫
      accent: '#e8d5b7',       // 香槟金
      highlight: '#ffd700',    // 星光金
      pink: '#ffb6c1',         // 柔粉
      rose: '#f8e8e8',         // 玫瑰白
      text: '#ffffff',
      textMuted: '#e8d5e8',
      surface: 'rgba(74, 29, 110, 0.6)',
      surfaceElevated: 'rgba(255, 255, 255, 0.1)'
    },

    // 字体配置 - 更童话精致
    fonts: {
      heading: '"Cinzel Decorative", "Cinzel", "Playfair Display", serif',
      body: '"Inter", "Noto Sans SC", sans-serif',
      decorative: '"Great Vibes", "Dancing Script", cursive'
    },

    // 背景配置 - 多层梦幻渐变
    background: {
      type: 'gradient',
      // 从深紫夜空渐变到粉紫晨曦再到奶油白
      gradient: 'linear-gradient(180deg, #0f0518 0%, #1a0f2e 20%, #2d1b4e 40%, #4a1d6e 60%, #8b5a9c 80%, #f5e6d3 100%)',
      // 顶部光晕 + 底部柔光
      overlay: `
        radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.15) 0%, transparent 40%),
        radial-gradient(ellipse at 20% 30%, rgba(255,182,193,0.2) 0%, transparent 30%),
        radial-gradient(ellipse at 80% 40%, rgba(232,213,183,0.15) 0%, transparent 35%),
        radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.2) 0%, transparent 50%)
      `,
      sparkles: true,
      particles: 'sparkle',
      // 城堡剪影背景
      castleSilhouette: true
    },

    // 卡片样式 - 精致玻璃质感
    card: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '20px',
      boxShadow: `
        0 8px 32px rgba(74, 29, 110, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        0 0 60px rgba(255, 215, 0, 0.05)
      `,
      backdropFilter: 'blur(16px) saturate(180%)'
    },

    // 按钮样式 - 金色奢华
    button: {
      primary: {
        background: 'linear-gradient(135deg, #ffd700 0%, #ffb700 50%, #ff8c00 100%)',
        color: '#1a0f2e',
        boxShadow: `
          0 4px 20px rgba(255, 215, 0, 0.5),
          0 0 40px rgba(255, 215, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.4)
        `,
        hoverGlow: '0 0 60px rgba(255, 215, 0, 0.8)',
        borderRadius: '30px'
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 215, 0, 0.4)',
        color: '#ffd700',
        hoverBackground: 'rgba(255, 215, 0, 0.1)'
      }
    },

    // 装饰元素 - 更丰富的童话元素
    decorations: {
      type: 'castle',
      elements: [
        { type: 'castle_silhouette', position: 'bottom-right', opacity: 0.3 },
        { type: 'crown', position: 'floating', count: 3 },
        { type: 'star', position: 'scattered', count: 20 },
        { type: 'sparkle', position: 'random', count: 15 },
        { type: 'cloud', position: 'floating', count: 4 }
      ],
      floating: true,
      parallax: true
    },

    // 动效配置 - 更柔和梦幻
    animations: {
      hero: 'fadeInUp',
      particles: 'gentle-float',
      cta: 'golden-shimmer',
      transition: 'dreamy-dissolve',
      castle: 'subtle-glow'
    },

    // 语音配置
    voice: {
      welcome: '欢迎来到梦幻城堡！在这里，每一个梦想都会变成现实，每一个愿望都能实现。',
      cta: '轻轻点击进入，开启属于你的童话之旅！',
      theme: 'fairy'
    }
  },

  // 森林奇境主题 - 高水准精修版
  forest: {
    id: 'forest',
    name: '森林奇境',
    nameEn: 'Enchanted Forest',
    tagline: '踏入神秘森林，发现大自然的魔法',
    ctaText: '进入森林秘境',

    // 色彩系统 - 更丰富的森林色调
    colors: {
      primary: '#0d1f0d',      // 极深森林绿（背景基底）
      secondary: '#1a3a1a',    // 深绿
      accent: '#2d5016',       // 苔藓绿
      wood: '#5d4037',         // 深木棕
      highlight: '#d4af37',    // 暖金（阳光）
      amber: '#ffb300',        // 琥珀光
      leaf: '#4caf50',         // 嫩叶绿
      fern: '#66bb6a',         // 蕨类绿
      text: '#f1f8e9',         // 米白绿
      textMuted: '#c8e6c9',
      surface: 'rgba(26, 58, 26, 0.7)',
      surfaceElevated: 'rgba(45, 80, 22, 0.4)'
    },

    // 字体配置 - 自然手写+衬线
    fonts: {
      heading: '"Cinzel", "Merriweather", serif',
      body: '"Inter", "Noto Sans SC", sans-serif',
      decorative: '"Amatic SC", "Caveat", cursive'
    },

    // 背景配置 - 林间光束+秘境感
    background: {
      type: 'gradient',
      // 从极深绿到苔藓绿再到暖金光照
      gradient: 'linear-gradient(180deg, #051105 0%, #0d1f0d 25%, #1a3a1a 50%, #2d5016 75%, #1a2f1a 100%)',
      // 多层光束效果
      overlay: `
        radial-gradient(ellipse at 20% 0%, rgba(212,175,55,0.25) 0%, transparent 35%),
        radial-gradient(ellipse at 60% 10%, rgba(255,179,0,0.15) 0%, transparent 40%),
        radial-gradient(ellipse at 80% 30%, rgba(212,175,55,0.1) 0%, transparent 30%),
        radial-gradient(ellipse at 40% 60%, rgba(76,175,80,0.08) 0%, transparent 45%),
        radial-gradient(ellipse at 90% 80%, rgba(212,175,55,0.12) 0%, transparent 35%)
      `,
      lightRays: true,
      particles: 'firefly',
      // 森林氛围增强
      atmosphere: 'misty'
    },

    // 卡片样式 - 木质纹理感
    card: {
      background: 'rgba(26, 58, 26, 0.6)',
      border: '1px solid rgba(139, 115, 85, 0.4)',
      borderRadius: '16px',
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        0 0 40px rgba(76, 175, 80, 0.08)
      `,
      backdropFilter: 'blur(12px)',
      // 木质纹理暗示
      texture: 'subtle-wood'
    },

    // 按钮样式 - 暖金自然感
    button: {
      primary: {
        background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 50%, #8b6914 100%)',
        color: '#0d1f0d',
        boxShadow: `
          0 4px 20px rgba(212, 175, 55, 0.5),
          0 0 40px rgba(212, 175, 55, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `,
        hoverGlow: '0 0 50px rgba(212, 175, 55, 0.6)',
        borderRadius: '28px'
      },
      secondary: {
        background: 'rgba(45, 80, 22, 0.5)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        color: '#d4af37',
        hoverBackground: 'rgba(212, 175, 55, 0.1)'
      }
    },

    // 装饰元素 - 更丰富的森林元素
    decorations: {
      type: 'forest',
      elements: [
        { type: 'forest_silhouette', position: 'bottom', opacity: 0.8 },
        { type: 'firefly', position: 'scattered', count: 25 },
        { type: 'leaf', position: 'floating', count: 8 },
        { type: 'mushroom', position: 'ground', count: 4 },
        { type: 'vine', position: 'corners', count: 6 }
      ],
      floating: true,
      parallax: true
    },

    // 动效配置 - 自然流动
    animations: {
      hero: 'fadeInUp',
      particles: 'firefly-wander',
      cta: 'warm-glow',
      transition: 'natural-fade',
      leaves: 'gentle-sway'
    },

    // 语音配置
    voice: {
      welcome: '欢迎来到森林奇境！听，是风在树叶间低语，是萤火虫在为你引路，让我们一起探索大自然的秘密。',
      cta: '跟随萤火虫的光芒，踏入这片神秘的森林秘境吧！',
      theme: 'nature'
    }
  }
};

// 默认主题
export const defaultTheme = 'space';

// 主题列表（用于切换条）
export const themeList = [
  { id: 'space', name: '星际探险', icon: '🚀' },
  { id: 'castle', name: '梦幻城堡', icon: '🏰' },
  { id: 'forest', name: '森林奇境', icon: '🌲' }
];

// 获取主题配置
export function getTheme(themeId) {
  return themes[themeId] || themes[defaultTheme];
}

// 获取所有主题
export function getAllThemes() {
  return themes;
}

// 获取主题列表
export function getThemeList() {
  return themeList;
}
