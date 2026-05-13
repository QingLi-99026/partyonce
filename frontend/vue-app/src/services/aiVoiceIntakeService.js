import { getThemePackageVisual, getVisualContext } from '@/data/visualAssets';

export const intakeSteps = [
  {
    id: 'guest',
    label: '人数规模',
    prompt: '这次派对大概有多少位小朋友和家长参加？',
    options: [
      { label: '10-15 人', value: '10-15', weight: { castle: 2, forest: 2, space: 1 } },
      { label: '16-25 人', value: '16-25', weight: { castle: 2, space: 2, forest: 2 } },
      { label: '26-40 人', value: '26-40', weight: { space: 2, forest: 2, castle: 1 } }
    ]
  },
  {
    id: 'age',
    label: '年龄',
    prompt: '小主角大概几岁？',
    options: [
      { label: '4-5 岁', value: '4-5', weight: { castle: 3, forest: 1 } },
      { label: '6-8 岁', value: '6-8', weight: { castle: 1, space: 2, forest: 2 } },
      { label: '9-10 岁', value: '9-10', weight: { space: 3, forest: 2 } }
    ]
  },
  {
    id: 'budget',
    label: '预算',
    prompt: '你希望先看哪个预算层级？',
    options: [
      { label: 'Basic · 控制预算', value: 'basic', tier: 'basic' },
      { label: 'Standard · 完整体验', value: 'standard', tier: 'standard' },
      { label: 'Premium · 投资人级效果', value: 'premium', tier: 'premium' }
    ]
  },
  {
    id: 'style',
    label: '风格',
    prompt: '孩子会更喜欢哪种氛围？',
    options: [
      { label: '童话、公主、柔粉色', value: 'fairytale', weight: { castle: 4 } },
      { label: '宇宙、火箭、任务感', value: 'mission', weight: { space: 4 } },
      { label: '森林、动物、自然探险', value: 'nature', weight: { forest: 4 } }
    ]
  },
  {
    id: 'venue',
    label: '场地偏好',
    prompt: '你倾向什么场地？',
    options: [
      { label: '餐厅包间 / private dining', value: 'restaurant', weight: { castle: 2, forest: 2 } },
      { label: '室内游乐 / 科学空间', value: 'indoor-play', weight: { space: 3 } },
      { label: '花园 / 社区活动室', value: 'garden-hall', weight: { forest: 3, castle: 1 } }
    ]
  }
];

export const voiceScripts = {
  welcome: '欢迎来到 PartyOnce。我是你的 AI 派对引导官。你可以自己浏览主题，也可以让我用几个问题快速推荐适合孩子的方案。',
  castle: '梦幻城堡适合喜欢童话、公主、皇冠和柔粉色布置的小朋友。',
  space: '星际探险适合喜欢火箭、宇宙任务、科学探索和蓝银色视觉的小朋友。',
  forest: '森林奇境适合喜欢自然、动物、探险和暖光氛围的小朋友。',
  quote: '我已经整理出主题、场地和套餐建议。下一步可以进入报价页，提交咨询，不会触发真实支付。'
};

export function scoreRecommendation(answers) {
  const scores = { castle: 0, space: 0, forest: 0 };
  intakeSteps.forEach((step) => {
    const answerValue = answers[step.id];
    const option = step.options.find((item) => item.value === answerValue);
    Object.entries(option?.weight || {}).forEach(([theme, score]) => {
      scores[theme] += score;
    });
  });

  const theme = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'space';
  const tier = answers.budget || 'standard';
  const visualContext = getVisualContext(theme, tier);
  return {
    theme,
    tier,
    packageVisual: getThemePackageVisual(theme, tier),
    visualContext,
    summary: buildSummary(answers, theme, tier)
  };
}

export function buildSummary(answers, theme, tier) {
  const labels = {};
  intakeSteps.forEach((step) => {
    const option = step.options.find((item) => item.value === answers[step.id]);
    labels[step.id] = option?.label || '未选择';
  });
  return {
    guest: labels.guest,
    age: labels.age,
    budget: labels.budget,
    style: labels.style,
    venue: labels.venue,
    recommendedTheme: theme,
    recommendedTier: tier
  };
}

export function speakText(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { ok: false, reason: 'speech_synthesis_unavailable' };
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
  return { ok: true };
}

export function saveIntakeForQuote(recommendation) {
  const payload = {
    ...recommendation,
    saved_at: new Date().toISOString(),
    boundary: 'local/staging visual intake only; no payment, webhook, n8n, or outbound message'
  };
  localStorage.setItem('partyonce_ai_voice_intake', JSON.stringify(payload));
  return payload;
}
