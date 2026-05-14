export const tierOrder = ['basic', 'standard', 'premium'];

export const packageTierExplanations = {
  basic: {
    id: 'basic',
    label: 'Basic',
    labelZh: '基础',
    priceHint: '$899-$1,299',
    positioning: '控制预算，先把主题感和基础拍照点做出来。',
    bestFor: '适合小型生日、预算敏感、已经有场地或只想先确认视觉方向的家庭。',
    whyRecommend: '当预算选择 Basic、人数较少，或客户希望先轻量试方案时，AI 会优先推荐这一档。',
    includes: [
      '基础主题桌布和桌面摆件',
      '少量主题气球',
      '小型欢迎牌 / 主题牌',
      '简单桌面花或主题小摆件',
      '轻量拍照角'
    ],
    priceDrivers: [
      '基础布置人工',
      '主题桌布和小型道具',
      '少量气球材料',
      '简单运输和现场摆放'
    ],
    upgradeAdds: [
      '升级到 Standard 后增加中型气球拱门',
      '增加主题背景板和甜品台',
      '增加更完整的桌面花艺和供应商组合建议'
    ],
    customerFit: '如果你想控制预算，但仍希望孩子一进门就能感受到主题，这一档最稳。',
    quoteExplanation: 'Basic 的价格主要来自基础装饰材料、轻量人工和主题识别物料；它不追求全场沉浸，而是保留最关键的视觉点。'
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    labelZh: '标准',
    priceHint: '$1,499-$2,399',
    positioning: '完整体验，兼顾预算、视觉冲击和可交付性。',
    bestFor: '适合 15-30 人、希望照片好看、需要甜品台和主题背景的家庭。',
    whyRecommend: '当客户选择中档预算、人数在 16-25 左右，或希望“有完整派对感但不过度豪华”时，AI 会推荐这一档。',
    includes: [
      '完整主题桌布和桌面花艺',
      '中型气球拱门',
      '主题背景板',
      '甜品台建议',
      '供应商组合建议',
      '更清楚的报价依据'
    ],
    priceDrivers: [
      '更高的气球和花艺材料量',
      '背景板 / KT 板制作',
      '甜品台布置',
      '现场布置人工时长',
      '供应商协调成本'
    ],
    upgradeAdds: [
      '升级到 Premium 后增加大型沉浸式拱门',
      '增加主题灯光层和完整拍照区',
      '增加定制 KT 板和更强的现场包装'
    ],
    customerFit: '如果你希望照片、入口、甜品台和主题背景都完整，但又不想直接进入高预算，这一档最适合。',
    quoteExplanation: 'Standard 的价格差异主要来自拱门、背景板、甜品台和现场人工。它比 Basic 更像完整派对，而不是简单装饰。'
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    labelZh: '尊享',
    priceHint: '$2,800+',
    positioning: '沉浸式视觉，强调仪式感、拍照区和全场包装。',
    bestFor: '适合高预算客户、投资人演示、重要生日或希望现场有强记忆点的活动。',
    whyRecommend: '当客户选择高预算、希望强视觉效果，或活动需要更完整的现场包装时，AI 会推荐这一档。',
    includes: [
      '大型沉浸式主题拱门',
      '主题灯光层',
      '定制 KT 板 / 背景板',
      '完整拍照区',
      '高级花艺或主题摆件',
      '现场协调建议'
    ],
    priceDrivers: [
      '大型结构和拱门材料',
      '定制背景板 / KT 板',
      '灯光和拍照区设备',
      '更多花艺、摆件和运输',
      '更长现场布置和协调时间'
    ],
    upgradeAdds: [
      '相对 Standard，增加沉浸式全场包装',
      '增加灯光、拍照区和定制板',
      '更适合需要“第一眼打动客户”的展示'
    ],
    customerFit: '如果你希望客人进场就被主题包围，照片也能明显看出高级感，Premium 更适合。',
    quoteExplanation: 'Premium 的价格主要来自大型结构、定制物料、灯光、拍照区和更长的现场人工。它买的是全场氛围和更高完成度。'
  }
};

export const packageComparisonRows = [
  {
    label: '视觉目标',
    basic: '主题感清楚',
    standard: '完整派对感',
    premium: '沉浸式高级感'
  },
  {
    label: '核心布置',
    basic: '桌布、少量气球、小主题牌',
    standard: '气球拱门、背景板、甜品台',
    premium: '大型拱门、灯光、拍照区、定制板'
  },
  {
    label: '适合客群',
    basic: '预算敏感 / 小型活动',
    standard: '多数家庭 / 完整体验',
    premium: '高预算 / 强视觉展示'
  },
  {
    label: '价格差异',
    basic: '材料和人工最轻',
    standard: '增加结构、背景和协调',
    premium: '增加定制、灯光和全场包装'
  }
];

export function normalizeTierId(tier = 'standard') {
  const normalized = String(tier || '').toLowerCase();
  return tierOrder.includes(normalized) ? normalized : 'standard';
}

export function getPackageExplanation(tier = 'standard') {
  return packageTierExplanations[normalizeTierId(tier)];
}

export function getUpgradeExplanation(tier = 'standard') {
  const current = normalizeTierId(tier);
  if (current === 'premium') {
    return {
      title: 'Premium 已是当前最高演示档',
      items: packageTierExplanations.premium.upgradeAdds
    };
  }
  return {
    title: current === 'basic' ? '从 Basic 升级到 Standard 会多什么' : '从 Standard 升级到 Premium 会多什么',
    items: packageTierExplanations[current].upgradeAdds
  };
}
