const THEME_IMAGES = {
  castle: '/party-assets/themes/castle-princess-full.png',
  space: '/party-assets/themes/space-explorer.png',
  forest: '/party-assets/themes/forest-adventure-full.png'
};

const THEME_META = {
  castle: {
    id: 'castle',
    name: 'Castle Princess',
    nameZh: '梦幻城堡',
    icon: '👑',
    color: '#f6c8dc',
    accent: '#ffd166',
    age: '4-9',
    venueFit: 'Private dining room, kids cafe, dance studio',
    decoration: '皇冠、柔粉气球、香槟金桌布、城堡背景板、甜品台',
    materials: 'Pastel balloons, gold foil props, princess backdrop, soft florals'
  },
  space: {
    id: 'space',
    name: 'Space Explorer',
    nameZh: '星际探险',
    icon: '🚀',
    color: '#9ddcff',
    accent: '#00f0ff',
    age: '6-10',
    venueFit: 'Science centre, indoor play venue, dark private room',
    decoration: '星球吊饰、银色气球、火箭 KT 板、蓝紫灯光、任务徽章',
    materials: 'Metallic balloons, rocket standees, LED strips, astronaut table signs'
  },
  forest: {
    id: 'forest',
    name: 'Forest Adventure',
    nameZh: '森林奇境',
    icon: '🌲',
    color: '#b8e6c4',
    accent: '#d4af37',
    age: '5-10',
    venueFit: 'Garden, community hall, restaurant with warm lighting',
    decoration: '藤蔓、木纹桌牌、森林动物摆件、暖光灯串、拍照帐篷',
    materials: 'Leaf garlands, timber signs, warm fairy lights, animal props'
  }
};

const TIER_META = {
  basic: {
    label: 'Basic',
    labelZh: '基础',
    priceHint: '$899-$1,299',
    scope: '基础桌面装饰、主题气球、入口欢迎牌、轻量拍照角',
    buyerCue: '适合小型生日、预算敏感、想快速确认方向的家庭'
  },
  standard: {
    label: 'Standard',
    labelZh: '标准',
    priceHint: '$1,499-$2,399',
    scope: '完整主题桌布、气球拱门、甜品台、主题背景板、供应商建议',
    buyerCue: '适合 15-30 人、需要完整主题氛围和可拍照效果的派对'
  },
  premium: {
    label: 'Premium',
    labelZh: '尊享',
    priceHint: '$2,800+',
    scope: '沉浸式背景、灯光层、定制 KT 板、主视觉拍照区、现场协调',
    buyerCue: '适合投资人演示、高预算客户、需要强记忆点的活动'
  }
};

const themeOrder = ['castle', 'space', 'forest'];
const tierOrder = ['basic', 'standard', 'premium'];

export const visualAssets = [
  {
    id: 'homepage-immersive-hero',
    theme: 'all',
    tier: 'overview',
    asset_type: 'homepage_hero',
    image_path: '/party-assets/investor-hero/immersive-homepage-hero.png',
    preview_url: '/',
    title: 'Investor homepage hero',
    description: 'Dreamy family-party hero with AI planning cue and clear customer CTA.'
  },
  {
    id: 'quote-entry-preview',
    theme: 'all',
    tier: 'overview',
    asset_type: 'quote_entry',
    image_path: '/party-assets/quotes/quote-entry-preview.png',
    preview_url: '/quote',
    title: 'Quote entry preview',
    description: 'Quote summary visual entry for package-to-price flow.'
  },
  {
    id: 'package-matrix',
    theme: 'all',
    tier: 'overview',
    asset_type: 'package_matrix',
    image_path: '/party-assets/packages/package-tier-matrix.png',
    preview_url: '/preview-home-v8.html',
    title: 'Package matrix',
    description: 'Basic / Standard / Premium package reference for investor preview.'
  },
  {
    id: 'app-display-mockup',
    theme: 'all',
    tier: 'overview',
    asset_type: 'app_display_mockup',
    image_path: '/party-assets/app-mockups/app-display-mockup.png',
    preview_url: '/preview-home-v2.html',
    title: 'App display mockup',
    description: 'App mockup for customer flow and investor storytelling.'
  }
];

export const themePackageVisuals = themeOrder.flatMap((themeId) => {
  const theme = THEME_META[themeId];
  return tierOrder.map((tierId) => {
    const tier = TIER_META[tierId];
    return {
      id: `${themeId}-${tierId}`,
      theme: themeId,
      themeName: theme.name,
      themeNameZh: theme.nameZh,
      tier: tierId,
      tierLabel: tier.label,
      tierLabelZh: tier.labelZh,
      title: `${theme.name} ${tier.label}`,
      image_path: THEME_IMAGES[themeId],
      accent: theme.accent,
      suitableAge: theme.age,
      suitableVenue: theme.venueFit,
      decoration: theme.decoration,
      materials: theme.materials,
      priceHint: tier.priceHint,
      scope: tier.scope,
      buyerCue: tier.buyerCue
    };
  });
});

export const restaurantAVisuals = [
  {
    id: 'restaurant-a-original',
    theme: 'all',
    tier: 'original',
    title: 'Restaurant A 原貌',
    image_path: '/party-assets/dining-layouts/private-dining-room-layout.png',
    structureLock: '桌数、椅子数量、动线和包间结构保持不变',
    decorationLayer: '无主题装饰，仅作为客户确认空间尺度的 reference mockup'
  },
  ...themePackageVisuals.map((item) => ({
    id: `restaurant-a-${item.theme}-${item.tier}`,
    theme: item.theme,
    tier: item.tier,
    title: `Restaurant A · ${item.themeName} ${item.tierLabel}`,
    image_path: '/party-assets/dining-layouts/private-dining-room-layout.png',
    structureLock: '同一餐厅结构不变；仅替换桌布、气球、背景板、甜品台、拍照区和灯光层',
    decorationLayer: item.scope,
    packageVisualId: item.id
  }))
];

export const venueDisplaySeeds = [
  {
    id: 'restaurant-a',
    name: 'Restaurant A Private Dining',
    type: 'Private dining room',
    capacity: '18-28 guests',
    tables: '3 long tables',
    chairs: '24 chairs',
    image_path: '/party-assets/dining-layouts/private-dining-room-layout.png',
    themeFit: ['castle', 'space', 'forest'],
    priceRange: '$800-$1,600 room hire',
    contact: 'Local/staging demo contact',
    note: '投资人样板场地，用于展示原貌到主题装饰渲染。'
  },
  {
    id: 'kids-cafe-wonderland',
    name: 'Kids Cafe Wonderland',
    type: 'Kids cafe',
    capacity: '20-35 guests',
    tables: 'Cafe seating + kids zone',
    chairs: 'Flexible',
    image_path: THEME_IMAGES.castle,
    themeFit: ['castle', 'forest'],
    priceRange: '$600-$1,200 package base',
    contact: 'Local/staging demo contact',
    note: '适合亲子、小龄儿童、甜品台和轻布置。'
  },
  {
    id: 'science-discovery-room',
    name: 'Science Discovery Room',
    type: 'Education venue',
    capacity: '18-30 guests',
    tables: 'Workshop tables',
    chairs: '30 chairs',
    image_path: THEME_IMAGES.space,
    themeFit: ['space'],
    priceRange: '$900-$1,500 room hire',
    contact: 'Local/staging demo contact',
    note: '适合 Space Explorer 与 STEM 派对。'
  }
];

export const supplierDisplaySeeds = [
  {
    id: 'balloon-bloom-sydney',
    name: 'Balloon Bloom Sydney',
    category: '气球 / 拱门',
    serviceArea: 'Sydney Metro',
    priceRange: '$220-$850',
    supportedThemes: ['castle', 'space', 'forest'],
    image_path: '/party-assets/packages/package-tier-matrix.png',
    status: 'demo_active',
    serviceContent: '主题气球、拱门、桌边气球束、入口布置',
    note: '适合三主题 Standard / Premium 的视觉升级。'
  },
  {
    id: 'mini-cake-lab',
    name: 'Mini Cake Lab',
    category: '蛋糕 / 甜品台',
    serviceArea: 'North Sydney',
    priceRange: '$160-$620',
    supportedThemes: ['castle', 'space', 'forest'],
    image_path: '/party-assets/quotes/quote-entry-preview.png',
    status: 'demo_active',
    serviceContent: '主题蛋糕、cupcakes、甜品台色系搭配',
    note: '可作为 Quote 里可替换单品。'
  },
  {
    id: 'kids-show-crew',
    name: 'Kids Show Crew',
    category: '儿童娱乐',
    serviceArea: 'Sydney + nearby suburbs',
    priceRange: '$280-$900',
    supportedThemes: ['space', 'forest'],
    image_path: THEME_IMAGES.forest,
    status: 'demo_review',
    serviceContent: '主持人、主题游戏、科学小实验、森林探险任务',
    note: '适合增强客户对“下一步怎么交付”的信任。'
  }
];

export function getVisualAssetsByTheme(themeId) {
  return visualAssets.filter((asset) => asset.theme === themeId || asset.theme === 'all');
}

export function getThemePackageVisuals(themeId) {
  return themePackageVisuals.filter((asset) => asset.theme === themeId);
}

export function getThemePackageVisual(themeId, tierId = 'standard') {
  return themePackageVisuals.find((asset) => asset.theme === themeId && asset.tier === tierId)
    || themePackageVisuals.find((asset) => asset.theme === themeId)
    || themePackageVisuals[0];
}

export function getRestaurantAVisuals(themeId) {
  return restaurantAVisuals.filter((asset) => asset.theme === themeId || asset.theme === 'all');
}

export function getVisualContext(themeId = 'space', tierId = 'standard') {
  return {
    packageVisual: getThemePackageVisual(themeId, tierId),
    restaurant: restaurantAVisuals.find((asset) => asset.id === `restaurant-a-${themeId}-${tierId}`) || restaurantAVisuals[0],
    venues: venueDisplaySeeds.filter((venue) => venue.themeFit.includes(themeId)),
    suppliers: supplierDisplaySeeds.filter((supplier) => supplier.supportedThemes.includes(themeId))
  };
}
