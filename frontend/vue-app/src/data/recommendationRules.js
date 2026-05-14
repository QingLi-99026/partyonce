import { getVisualContext } from '@/data/visualAssets';
import { aiConciergeQuestions } from '@/data/aiConciergeQuestions';
import { getPackageExplanation, getUpgradeExplanation } from '@/data/packageExplanation';

const THEME_LABELS = {
  castle: 'Castle Princess',
  space: 'Space Explorer',
  forest: 'Forest Adventure'
};

const THEME_COPY = {
  castle: '适合喜欢童话、公主、皇冠、柔粉色和仪式感的小朋友。',
  space: '适合喜欢火箭、宇宙任务、科学探索和蓝银色视觉的小朋友。',
  forest: '适合喜欢动物、自然、藤蔓、暖光和探险感的小朋友。'
};

const TIER_LABELS = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium'
};

const TIER_REASONS = {
  basic: '预算优先，先保留关键主题氛围和基础拍照点。',
  standard: '适合完整生日体验，兼顾视觉、甜品台和现场布置。',
  premium: '适合沉浸式效果和投资人级展示，需要完整场景包装。'
};

const BUDGET_MATCH = {
  basic: 'Basic 会优先控制预算，把钱花在主题识别、桌面氛围和基础拍照点上。',
  standard: 'Standard 在预算和效果之间最平衡，适合多数家庭先做完整生日体验。',
  premium: 'Premium 适合希望现场更有沉浸感和仪式感的家庭，预算会更多留给灯光、拱门和定制板。'
};

const optionFor = (questionId, value) => {
  const question = aiConciergeQuestions.find((item) => item.id === questionId);
  return question?.options?.find((item) => item.value === value) || null;
};

const labelFor = (questionId, value) => optionFor(questionId, value)?.label || value || '-';

const addWeights = (scores, weights = {}) => {
  Object.entries(weights).forEach(([theme, score]) => {
    scores[theme] = (scores[theme] || 0) + score;
  });
};

export function buildCustomerBrief(answers = {}, recommendation) {
  const result = recommendation || {};
  const summary = result.summary || {};
  const themeLabel = result.themeLabel || THEME_LABELS[result.theme] || 'recommended theme';
  const tierLabel = result.tierLabel || TIER_LABELS[result.tier] || 'recommended package';
  const venue = result.visualContext?.primaryVenue?.name || 'Restaurant A';

  return [
    `Customer is planning a ${summary.childAge || 'child'} birthday party`,
    `for around ${summary.guestCount || 'the expected guest count'}`,
    `in ${summary.area || 'the preferred area'}`,
    `with a ${summary.budgetRange || 'selected'} budget.`,
    `They prefer ${summary.themePreference || 'an open theme preference'}`,
    `and ${summary.indoorOutdoor || 'a flexible venue setting'}.`,
    `Venue status: ${summary.venueStatus || 'not confirmed'}.`,
    `Recommended package: ${themeLabel} ${tierLabel} using ${venue} as the staging sample.`
  ].join(' ');
}

export function recommendThemeAndPackage(answers = {}) {
  const themeScores = { castle: 0, space: 0, forest: 0 };

  aiConciergeQuestions.forEach((question) => {
    const option = optionFor(question.id, answers[question.id]);
    addWeights(themeScores, option?.weights);
  });

  const theme = Object.entries(themeScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'space';
  const tier = answers.budgetRange || 'standard';
  const visualContext = getVisualContext(theme, tier);
  const tierExplanation = getPackageExplanation(tier);
  const upgradeExplanation = getUpgradeExplanation(tier);
  const guestOption = optionFor('guestCount', answers.guestCount);
  const venueStatus = answers.venueStatus || 'unsure';
  const venueType = venueStatus === 'need_restaurant'
    ? 'Restaurant A private dining recommendation'
    : venueStatus === 'has_venue'
      ? 'Customer-owned venue / restaurant'
      : 'Flexible venue search';

  const result = {
    theme,
    themeLabel: THEME_LABELS[theme],
    tier,
    tierLabel: TIER_LABELS[tier],
    venueType,
    visualContext,
    score: themeScores,
    reason: [
      THEME_COPY[theme],
      TIER_REASONS[tier],
      `${labelFor('guestCount', answers.guestCount)} 建议优先看 ${guestOption?.capacity || 'medium'} capacity 场地。`,
      answers.indoorOutdoor === 'outdoor'
        ? '你偏向室外/花园，因此会优先保留自然光和天气备选方案。'
        : '你偏向室内或灵活安排，因此 Restaurant A 样板可作为稳定报价参考。'
    ],
    reasonHeadline: `Based on ${labelFor('childAge', answers.childAge)}, ${labelFor('indoorOutdoor', answers.indoorOutdoor)} and ${labelFor('budgetRange', answers.budgetRange)}, ${THEME_LABELS[theme]} ${TIER_LABELS[tier]} is the clearest starting point.`,
    budgetMatch: BUDGET_MATCH[tier],
    packageIncludes: tierExplanation.includes,
    priceDrivers: tierExplanation.priceDrivers,
    upgradeExplanation,
    customerFit: tierExplanation.customerFit,
    quoteExplanation: tierExplanation.quoteExplanation,
    nextStepSuggestion: '进入 quote request，确认联系人、日期和备注后提交 inquiry。团队会再人工确认场地、供应商可用性和最终报价。',
    summary: {
      childAge: labelFor('childAge', answers.childAge),
      eventDate: answers.eventDate || '-',
      guestCount: labelFor('guestCount', answers.guestCount),
      budgetRange: labelFor('budgetRange', answers.budgetRange),
      area: labelFor('area', answers.area),
      indoorOutdoor: labelFor('indoorOutdoor', answers.indoorOutdoor),
      themePreference: labelFor('themePreference', answers.themePreference),
      venueStatus: labelFor('venueStatus', answers.venueStatus),
      customerName: answers.customerName || '',
      customerContact: answers.customerContact || ''
    }
  };

  result.customerBrief = buildCustomerBrief(answers, result);
  return result;
}

export function buildQuotePrefillPayload(answers = {}, recommendation) {
  const result = recommendation || recommendThemeAndPackage(answers);
  const packageVisual = result.visualContext.packageVisual;
  const restaurant = result.visualContext.restaurant;
  const venue = result.visualContext.primaryVenue;
  const suppliers = result.visualContext.suppliers || [];

  return {
    source: 'ai_concierge',
    customerInfo: {
      name: answers.customerName || '',
      contact: answers.customerContact || '',
      preferredDate: answers.eventDate || '',
      notes: [
        result.customerBrief,
        '',
        `AI Concierge summary: ${result.themeLabel} / ${result.tierLabel}`,
        `Child age: ${result.summary.childAge}`,
        `Guests: ${result.summary.guestCount}`,
        `Area: ${result.summary.area}`,
        `Venue: ${result.summary.venueStatus}`,
        `Budget match: ${result.budgetMatch}`,
        `Price explanation: ${result.quoteExplanation}`,
        `AI reason: ${result.reason.join(' ')}`
      ].join('\n'),
      customerBrief: result.customerBrief,
      guestCount: result.summary.guestCount,
      budgetRange: result.summary.budgetRange,
      area: result.summary.area,
      venuePreference: result.venueType
    },
    selection: {
      themeId: result.theme,
      theme: result.themeLabel,
      themeName: result.themeLabel,
      packageTier: result.tier,
      packageId: result.tier,
      packageName: `${result.themeLabel} ${result.tierLabel}`,
      budgetRange: result.summary.budgetRange,
      venueType: result.venueType,
      venueId: venue.id,
      venueName: venue.name,
      venueCapacity: venue.capacity,
      venueLayoutImage: venue.layoutImage || venue.image_path,
      sceneId: 'restaurant-a',
      sceneName: restaurant.title,
      guestCount: result.summary.guestCount,
      restaurantVisual: restaurant.image_path,
      packageVisual: packageVisual.image_path,
      supplierSuggestions: suppliers.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        role: item.quoteRole,
        priceRange: item.priceRange
      }))
    },
    pricing: {
      packageTier: result.tier,
      priceHint: packageVisual.priceHint,
      estimatedLevel: result.tier,
      priceDrivers: result.priceDrivers,
      upgradeAdds: result.upgradeExplanation.items,
      customerFit: result.customerFit,
      snapshot_note: 'Rule-based local/staging estimate; final price requires human review.'
    },
    aiRecommendation: {
      theme: result.theme,
      tier: result.tier,
      reason: result.reason,
      reasonHeadline: result.reasonHeadline,
      budgetMatch: result.budgetMatch,
      packageIncludes: result.packageIncludes,
      priceDrivers: result.priceDrivers,
      upgradeExplanation: result.upgradeExplanation,
      customerFit: result.customerFit,
      quoteExplanation: result.quoteExplanation,
      customerBrief: result.customerBrief,
      venueRecommendation: {
        id: venue.id,
        name: venue.name,
        capacity: venue.capacity
      },
      score: result.score,
      generated_at: new Date().toISOString()
    }
  };
}
