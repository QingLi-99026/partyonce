export const parentSocialProof = [
  {
    id: 'sample-inner-west-30',
    label: '家庭规划参考',
    quote: '30 人左右的家庭派对，可以先看私人包间、标准套餐、简单主持支持和一个适合拍照的升级项。',
    parentProfile: '内西区家长 · 30 人 · 中等预算',
    trustNote: '这是规划参考，不是真实客户评价。'
  },
  {
    id: 'sample-low-stress',
    label: '家庭规划参考',
    quote: '能先看到场地规则、附加服务和人工复核说明，再进入订金步骤，会比即时预订更安心。',
    parentProfile: '忙碌家长 · 想降低筹备压力',
    trustNote: '这是规划参考，不是真实客户评价。'
  },
  {
    id: 'sample-visual-upgrade',
    label: '家庭规划参考',
    quote: '拍照区、蛋糕桌和布置支持分开说明后，更容易理解为什么会产生额外费用。',
    parentProfile: '正在比较升级项的家长 · 希望照片更好看',
    trustNote: '这是规划参考，未来可替换为真实评价。'
  }
]

export const popularFamilyChoices = [
  {
    id: 'standard-30-guests',
    title: '最实用的起步方案',
    familyProfile: '25-35 人 · 中等预算 · 餐厅 / 私人包间',
    recommendedPackage: '标准套餐',
    addOns: ['布置和收场', '蛋糕或甜品桌', '拍照角'],
    whyItWorks: '基础套餐容易理解，同时加入家长通常最在意的服务。'
  },
  {
    id: 'basic-budget-control',
    title: '控制预算路径',
    familyProfile: '15-25 人 · 简单场地 · 较低预算',
    recommendedPackage: '基础套餐',
    addOns: ['气球点缀', '简单蛋糕桌'],
    whyItWorks: '适合主要需要整洁布置、又想避免大额造景费用的家庭。'
  },
  {
    id: 'premium-visual-event',
    title: '高质感拍照路径',
    familyProfile: '30-50 人 · 重要生日 · 对视觉效果要求高',
    recommendedPackage: '高级套餐',
    addOns: ['主持人', '拍照区', '摄影'],
    whyItWorks: '适合希望派对更完整、更有人带流程，也更适合分享的家庭。'
  }
]

export const getParentSocialProof = () => parentSocialProof.map((item) => ({ ...item }))
export const getPopularFamilyChoices = () => popularFamilyChoices.map((item) => ({
  ...item,
  addOns: [...item.addOns]
}))
