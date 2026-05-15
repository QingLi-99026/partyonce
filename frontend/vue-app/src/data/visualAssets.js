import { getPackageExplanation, packageTierExplanations, tierOrder } from './packageExplanation';

const THEME_IMAGES = {
  castle: '/party-assets/themes/castle-princess-full.png',
  space: '/party-assets/themes/space-explorer.png',
  forest: '/party-assets/themes/forest-adventure-full.png'
};

const RESTAURANT_A_IMAGES = {
  original: '/party-assets/venues/restaurant-a/restaurant-a-original.png',
  castle: {
    basic: '/party-assets/venues/restaurant-a/restaurant-a-castle-basic.png',
    standard: '/party-assets/venues/restaurant-a/restaurant-a-castle-standard.png',
    premium: '/party-assets/venues/restaurant-a/restaurant-a-castle-premium.png'
  },
  space: {
    basic: '/party-assets/venues/restaurant-a/restaurant-a-space-basic.png',
    standard: '/party-assets/venues/restaurant-a/restaurant-a-space-standard.png',
    premium: '/party-assets/venues/restaurant-a/restaurant-a-space-standard.png'
  },
  forest: {
    basic: '/party-assets/venues/restaurant-a/restaurant-a-forest-basic.png',
    standard: '/party-assets/venues/restaurant-a/restaurant-a-forest-standard.png',
    premium: '/party-assets/venues/restaurant-a/restaurant-a-forest-premium.png'
  }
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
    ...packageTierExplanations.basic,
    scope: '基础桌面装饰、主题气球、入口欢迎牌、轻量拍照角',
    buyerCue: packageTierExplanations.basic.bestFor
  },
  standard: {
    ...packageTierExplanations.standard,
    scope: '完整主题桌布、气球拱门、甜品台、主题背景板、供应商建议',
    buyerCue: packageTierExplanations.standard.bestFor
  },
  premium: {
    ...packageTierExplanations.premium,
    scope: '沉浸式背景、灯光层、定制 KT 板、主视觉拍照区、现场协调',
    buyerCue: packageTierExplanations.premium.bestFor
  }
};

const themeOrder = ['castle', 'space', 'forest'];

export const visualAssets = [
  {
    id: 'homepage-immersive-hero',
    theme: 'all',
    tier: 'overview',
    asset_type: 'homepage_hero',
    image_path: '/party-assets/investor-hero/immersive-homepage-hero.png',
    preview_url: '/',
    title: 'Investor homepage hero',
    description: 'Dreamy family-party hero with theme, venue, package, and quote CTA.'
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
      buyerCue: tier.buyerCue,
      explanation: getPackageExplanation(tierId)
    };
  });
});

export const restaurantAVisuals = [
  {
    id: 'restaurant-a-original',
    theme: 'all',
    tier: 'original',
    title: 'Restaurant A 原貌',
    image_path: RESTAURANT_A_IMAGES.original,
    structureLock: '桌数、椅子数量、动线和包间结构保持不变',
    decorationLayer: '无主题装饰，仅作为客户确认空间尺度的 reference mockup'
  },
  ...themePackageVisuals.map((item) => ({
    id: `restaurant-a-${item.theme}-${item.tier}`,
    theme: item.theme,
    tier: item.tier,
    title: `Restaurant A · ${item.themeName} ${item.tierLabel}`,
    image_path: RESTAURANT_A_IMAGES[item.theme]?.[item.tier] || RESTAURANT_A_IMAGES.original,
    structureLock: '同一餐厅结构不变；仅替换桌布、气球、背景板、甜品台、拍照区和灯光层',
    decorationLayer: item.scope,
    packageVisualId: item.id
  }))
];

export const venueDisplaySeeds = [
  {
    id: 'restaurant-a',
    venue_id: 'restaurant-a',
    name: 'Restaurant A Private Dining',
    venue_name: 'Restaurant A Private Dining',
    type: 'Private dining room',
    venue_type: 'private_dining_room',
    capacity: '18-28 guests',
    capacityNumber: 28,
    tables: '3 long tables',
    chairs: '24 chairs',
    image_path: RESTAURANT_A_IMAGES.original,
    original_image: RESTAURANT_A_IMAGES.original,
    themeFit: ['castle', 'space', 'forest'],
    theme_compatibility: {
      castle: 'excellent',
      space: 'strong',
      forest: 'strong'
    },
    bestPackageTiers: ['basic', 'standard', 'premium'],
    supported_packages: ['basic', 'standard', 'premium'],
    layoutImage: RESTAURANT_A_IMAGES.original,
    renderings: RESTAURANT_A_IMAGES,
    location: 'North Sydney demo district',
    aiRecommendationRole: 'Primary planning sample venue',
    priceRange: '$800-$1,600 room hire',
    price_range: '$800-$1,600 room hire',
    contact: 'Local/staging demo contact',
    notes: '投资人样板场地，用于展示原貌到主题装饰渲染。',
    note: '投资人样板场地，用于展示原貌到主题装饰渲染。',
    operationsNotes: [
      'Use as the default planning venue when the customer needs a restaurant sample.',
      'Confirm availability before moving from staging quote to real production quote.',
      'Rendering variants lock the same table, chair, window, entrance, and movement layout.'
    ]
  },
  {
    id: 'kids-cafe-wonderland',
    venue_id: 'kids-cafe-wonderland',
    name: 'Kids Cafe Wonderland',
    venue_name: 'Kids Cafe Wonderland',
    type: 'Kids cafe',
    venue_type: 'kids_cafe',
    capacity: '20-35 guests',
    capacityNumber: 35,
    tables: 'Cafe seating + kids zone',
    chairs: 'Flexible',
    image_path: THEME_IMAGES.castle,
    original_image: THEME_IMAGES.castle,
    themeFit: ['castle', 'forest'],
    theme_compatibility: { castle: 'strong', forest: 'strong', space: 'limited' },
    bestPackageTiers: ['basic', 'standard'],
    supported_packages: ['basic', 'standard'],
    layoutImage: THEME_IMAGES.castle,
    renderings: { castle: { basic: THEME_IMAGES.castle, standard: THEME_IMAGES.castle }, forest: { basic: THEME_IMAGES.forest } },
    aiRecommendationRole: 'Backup kids cafe venue',
    priceRange: '$600-$1,200 package base',
    price_range: '$600-$1,200 package base',
    location: 'Sydney local/staging demo',
    contact: 'Local/staging demo contact',
    notes: '适合亲子、小龄儿童、甜品台和轻布置。',
    note: '适合亲子、小龄儿童、甜品台和轻布置。'
  },
  {
    id: 'science-discovery-room',
    venue_id: 'science-discovery-room',
    name: 'Science Discovery Room',
    venue_name: 'Science Discovery Room',
    type: 'Education venue',
    venue_type: 'education_venue',
    capacity: '18-30 guests',
    capacityNumber: 30,
    tables: 'Workshop tables',
    chairs: '30 chairs',
    image_path: THEME_IMAGES.space,
    original_image: THEME_IMAGES.space,
    themeFit: ['space'],
    theme_compatibility: { space: 'excellent', castle: 'limited', forest: 'limited' },
    bestPackageTiers: ['standard', 'premium'],
    supported_packages: ['standard', 'premium'],
    layoutImage: THEME_IMAGES.space,
    renderings: { space: { standard: THEME_IMAGES.space, premium: THEME_IMAGES.space } },
    aiRecommendationRole: 'Space Explorer backup venue',
    priceRange: '$900-$1,500 room hire',
    price_range: '$900-$1,500 room hire',
    location: 'Sydney STEM demo zone',
    contact: 'Local/staging demo contact',
    notes: '适合 Space Explorer 与 STEM 派对。',
    note: '适合 Space Explorer 与 STEM 派对。'
  }
];

export const supplierDisplaySeeds = [
  {
    id: 'balloon-bloom-sydney',
    name: 'Balloon Bloom Sydney',
    category: 'balloon_decorator',
    categoryLabel: '气球 / 拱门',
    serviceArea: 'Sydney Metro',
    priceRange: '$220-$850',
    supportedThemes: ['castle', 'space', 'forest'],
    supportedTiers: ['standard', 'premium'],
    supported_package_tiers: ['standard', 'premium'],
    supported_themes: ['castle', 'space', 'forest'],
    quoteRole: 'balloon_arch_and_entry_visual',
    operationsRole: 'Primary decor vendor for arches, balloon clusters, and entrance styling',
    responsibility: 'Entrance arch, balloon clusters, photo-zone balloon layer',
    image_path: '/party-assets/packages/package-tier-matrix.png',
    status: 'demo_active',
    contact_placeholder: 'Local/staging placeholder only',
    lead_time: '7-10 days',
    serviceContent: '主题气球、拱门、桌边气球束、入口布置',
    materials_or_services: 'Pastel / metallic balloons, arch frame, entrance styling, teardown',
    note: '适合三主题 Standard / Premium 的视觉升级。'
  },
  {
    id: 'mini-cake-lab',
    name: 'Mini Cake Lab',
    category: 'cake_dessert',
    categoryLabel: '蛋糕 / 甜品台',
    serviceArea: 'North Sydney',
    priceRange: '$160-$620',
    supportedThemes: ['castle', 'space', 'forest'],
    supportedTiers: ['basic', 'standard', 'premium'],
    supported_package_tiers: ['basic', 'standard', 'premium'],
    supported_themes: ['castle', 'space', 'forest'],
    quoteRole: 'cake_and_dessert_table',
    operationsRole: 'Theme cake and dessert-table vendor',
    responsibility: 'Theme cake, cupcakes, dessert-table color matching',
    image_path: '/party-assets/quotes/quote-entry-preview.png',
    status: 'demo_active',
    contact_placeholder: 'Local/staging placeholder only',
    lead_time: '5-7 days',
    serviceContent: '主题蛋糕、cupcakes、甜品台色系搭配',
    materials_or_services: 'Theme cake, cupcakes, dessert labels, dessert table styling guidance',
    note: '可作为 Quote 里可替换单品。'
  },
  {
    id: 'kids-show-crew',
    name: 'Kids Show Crew',
    category: 'kids_entertainment',
    categoryLabel: '儿童娱乐',
    serviceArea: 'Sydney + nearby suburbs',
    priceRange: '$280-$900',
    supportedThemes: ['space', 'forest'],
    supportedTiers: ['standard', 'premium'],
    supported_package_tiers: ['standard', 'premium'],
    supported_themes: ['space', 'forest'],
    quoteRole: 'kids_activity_and_hosting',
    operationsRole: 'Activity host and themed game vendor',
    responsibility: 'Kids activity flow, theme games, host coordination',
    image_path: THEME_IMAGES.forest,
    status: 'demo_review',
    contact_placeholder: 'Local/staging placeholder only',
    lead_time: '10-14 days',
    serviceContent: '主持人、主题游戏、科学小实验、森林探险任务',
    materials_or_services: 'Party host, activity props, science/forest mission kits',
    note: '适合增强客户对“下一步怎么交付”的信任。'
  },
  {
    id: 'petal-story-studio',
    name: 'Petal Story Studio',
    category: 'florist',
    categoryLabel: '花艺 / 桌花',
    serviceArea: 'Sydney Metro',
    priceRange: '$180-$760',
    supportedThemes: ['castle', 'forest'],
    supportedTiers: ['standard', 'premium'],
    supported_package_tiers: ['standard', 'premium'],
    supported_themes: ['castle', 'forest'],
    quoteRole: 'floral_table_and_photo_zone',
    operationsRole: 'Floral table styling and photo-zone florist',
    responsibility: 'Table florals, pastel arrangements, greenery layer, photo-zone floral accents',
    image_path: THEME_IMAGES.castle,
    status: 'demo_active',
    contact_placeholder: 'Local/staging placeholder only',
    lead_time: '7-14 days',
    serviceContent: '桌面花艺、拱门花材、森林藤蔓与柔粉花束',
    materials_or_services: 'Fresh/silk flowers, greenery, table arrangements, arch accents',
    note: 'Castle Standard/Premium 与 Forest Standard/Premium 的主要氛围供应商。'
  },
  {
    id: 'little-lens-party-photo',
    name: 'Little Lens Party Photo',
    category: 'photography',
    categoryLabel: '摄影 / 记录',
    serviceArea: 'Sydney Metro',
    priceRange: '$260-$980',
    supportedThemes: ['castle', 'space', 'forest'],
    supportedTiers: ['standard', 'premium'],
    supported_package_tiers: ['standard', 'premium'],
    supported_themes: ['castle', 'space', 'forest'],
    quoteRole: 'photo_zone_and_event_capture',
    operationsRole: 'Photography add-on for family and investor-grade evidence',
    responsibility: 'Photo-zone shots, family portraits, setup documentation',
    image_path: '/party-assets/app-mockups/app-display-mockup.png',
    status: 'demo_optional',
    contact_placeholder: 'Local/staging placeholder only',
    lead_time: '7 days',
    serviceContent: '拍照区、亲子合照、布置记录、精选照片',
    materials_or_services: 'Event photography, photo-zone direction, selected digital gallery',
    note: '作为 Premium 或可选升级项展示。'
  },
  {
    id: 'party-setup-crew',
    name: 'Party Setup Crew',
    category: 'setup_service',
    categoryLabel: '搭建 / 现场执行',
    serviceArea: 'Sydney Metro + nearby suburbs',
    priceRange: '$240-$1,100',
    supportedThemes: ['castle', 'space', 'forest'],
    supportedTiers: ['basic', 'standard', 'premium'],
    supported_package_tiers: ['basic', 'standard', 'premium'],
    supported_themes: ['castle', 'space', 'forest'],
    quoteRole: 'setup_labor_transport_teardown',
    operationsRole: 'Setup, transport, teardown, and on-site handover crew',
    responsibility: 'Transport, setup, floor protection, teardown, venue handover',
    image_path: RESTAURANT_A_IMAGES.original,
    status: 'demo_active',
    contact_placeholder: 'Local/staging placeholder only',
    lead_time: '5-10 days',
    serviceContent: '运输、搭建、撤场、现场交接',
    materials_or_services: 'Setup crew, van/transport, teardown, venue protection',
    note: '与 labor_fee / transport_fee / service_fee line items 直接关联。'
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

export function normalizeThemeId(value = '') {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('castle') || normalized.includes('princess') || normalized.includes('城堡') || normalized.includes('公主')) return 'castle';
  if (normalized.includes('forest') || normalized.includes('jungle') || normalized.includes('nature') || normalized.includes('森林')) return 'forest';
  if (normalized.includes('space') || normalized.includes('rocket') || normalized.includes('science') || normalized.includes('星际') || normalized.includes('宇宙')) return 'space';
  return 'space';
}

export function normalizeTierId(value = '') {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('premium') || normalized.includes('尊享') || normalized.includes('高端')) return 'premium';
  if (normalized.includes('basic') || normalized.includes('基础') || normalized.includes('控制预算')) return 'basic';
  return 'standard';
}

export function getRecommendedVenue(themeId = 'space', tierId = 'standard') {
  const theme = normalizeThemeId(themeId);
  const tier = normalizeTierId(tierId);
  return venueDisplaySeeds.find((venue) => (
    venue.themeFit.includes(theme) && (venue.bestPackageTiers || []).includes(tier)
  )) || venueDisplaySeeds.find((venue) => venue.themeFit.includes(theme)) || venueDisplaySeeds[0];
}

export function getRecommendedSuppliers(themeId = 'space', tierId = 'standard') {
  const theme = normalizeThemeId(themeId);
  const tier = normalizeTierId(tierId);
  const exact = supplierDisplaySeeds.filter((supplier) => (
    supplier.supportedThemes.includes(theme) && (supplier.supportedTiers || []).includes(tier)
  ));
  const fallback = supplierDisplaySeeds.filter((supplier) => supplier.supportedThemes.includes(theme));
  return exact.length ? exact : fallback;
}

export function buildVisualRecommendationSnapshot(themeId = 'space', tierId = 'standard') {
  const theme = normalizeThemeId(themeId);
  const tier = normalizeTierId(tierId);
  const context = getVisualContext(theme, tier);
  return {
    theme,
    tier,
    theme_label: context.packageVisual.themeName,
    package_label: context.packageVisual.tierLabel,
    package_title: context.packageVisual.title,
    package_image: context.packageVisual.image_path,
    restaurant_title: context.restaurant.title,
    restaurant_rendering: context.restaurant.image_path,
    venue_id: context.primaryVenue.id,
    venue_name: context.primaryVenue.name,
    venue_capacity: context.primaryVenue.capacity,
    venue_layout_image: context.primaryVenue.layoutImage || context.primaryVenue.image_path,
    supplier_suggestions: context.suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      role: supplier.quoteRole,
      image_path: supplier.image_path
    })),
    quote_basis: [
      context.packageVisual.scope,
      context.restaurant.decorationLayer,
      `${context.primaryVenue.name} · ${context.primaryVenue.capacity}`,
      context.suppliers.map((supplier) => supplier.name).join(' / ')
    ].filter(Boolean)
  };
}

export function getVisualContext(themeId = 'space', tierId = 'standard') {
  const theme = normalizeThemeId(themeId);
  const tier = normalizeTierId(tierId);
  const primaryVenue = getRecommendedVenue(theme, tier);
  return {
    packageVisual: getThemePackageVisual(theme, tier),
    restaurant: restaurantAVisuals.find((asset) => asset.id === `restaurant-a-${theme}-${tier}`) || restaurantAVisuals[0],
    primaryVenue,
    venues: venueDisplaySeeds.filter((venue) => venue.themeFit.includes(theme)),
    suppliers: getRecommendedSuppliers(theme, tier),
    allThemeSuppliers: supplierDisplaySeeds.filter((supplier) => supplier.supportedThemes.includes(theme))
  };
}
