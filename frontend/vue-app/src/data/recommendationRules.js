import { getVisualContext } from '@/data/visualAssets';
import { aiConciergeQuestions } from '@/data/aiConciergeQuestions';

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

export function recommendThemeAndPackage(answers = {}) {
  const themeScores = { castle: 0, space: 0, forest: 0 };

  aiConciergeQuestions.forEach((question) => {
    const option = optionFor(question.id, answers[question.id]);
    addWeights(themeScores, option?.weights);
  });

  const theme = Object.entries(themeScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'space';
  const tier = answers.budgetRange || 'standard';
  const visualContext = getVisualContext(theme, tier);
  const guestOption = optionFor('guestCount', answers.guestCount);
  const venueStatus = answers.venueStatus || 'unsure';
  const venueType = venueStatus === 'need_restaurant'
    ? 'Restaurant A private dining recommendation'
    : venueStatus === 'has_venue'
      ? 'Customer-owned venue / restaurant'
      : 'Flexible venue search';

  return {
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
}

export function buildQuotePrefillPayload(answers = {}, recommendation) {
  const result = recommendation || recommendThemeAndPackage(answers);
  const packageVisual = result.visualContext.packageVisual;
  const restaurant = result.visualContext.restaurant;
  const suppliers = result.visualContext.suppliers || [];

  return {
    source: 'ai_concierge',
    customerInfo: {
      name: answers.customerName || '',
      contact: answers.customerContact || '',
      preferredDate: answers.eventDate || '',
      notes: [
        `AI Concierge summary: ${result.themeLabel} / ${result.tierLabel}`,
        `Child age: ${result.summary.childAge}`,
        `Guests: ${result.summary.guestCount}`,
        `Area: ${result.summary.area}`,
        `Venue: ${result.summary.venueStatus}`,
        `AI reason: ${result.reason.join(' ')}`
      ].join('\n'),
      guestCount: result.summary.guestCount,
      budgetRange: result.summary.budgetRange,
      area: result.summary.area,
      venuePreference: result.venueType
    },
    selection: {
      themeId: result.theme,
      themeName: result.themeLabel,
      packageId: result.tier,
      packageName: `${result.themeLabel} ${result.tierLabel}`,
      venueType: result.venueType,
      sceneId: 'restaurant-a',
      sceneName: restaurant.title,
      guestCount: result.summary.guestCount,
      restaurantVisual: restaurant.image_path,
      packageVisual: packageVisual.image_path,
      supplierSuggestions: suppliers.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category
      }))
    },
    pricing: {
      packageTier: result.tier,
      priceHint: packageVisual.priceHint,
      estimatedLevel: result.tier,
      snapshot_note: 'Rule-based local/staging estimate; final price requires human review.'
    },
    aiRecommendation: {
      theme: result.theme,
      tier: result.tier,
      reason: result.reason,
      score: result.score,
      generated_at: new Date().toISOString()
    }
  };
}
