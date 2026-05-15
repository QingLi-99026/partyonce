const FIELD_LABELS = {
  zh: {
    event_type: '活动类型',
    age: '年龄',
    gender_preference: '性别/偏好',
    date: '日期',
    area: '地区',
    guest_count: '人数',
    budget_range: '预算',
    theme_preference: '主题偏好',
    indoor_outdoor: '室内/户外',
    intent: '意图',
    venue_status: '场地状态',
    service_needs: '服务需求'
  },
  en: {
    event_type: 'Event type',
    age: 'Age',
    gender_preference: 'Gender / preference',
    date: 'Date',
    area: 'Area',
    guest_count: 'Guest count',
    budget_range: 'Budget',
    theme_preference: 'Theme preference',
    indoor_outdoor: 'Indoor / outdoor',
    intent: 'Intent',
    venue_status: 'Venue status',
    service_needs: 'Service needs'
  },
  ko: {
    event_type: '행사 유형',
    age: '나이',
    gender_preference: '성별 / 선호',
    date: '날짜',
    area: '지역',
    guest_count: '인원',
    budget_range: '예산',
    theme_preference: '테마 선호',
    indoor_outdoor: '실내 / 야외',
    intent: '의도',
    venue_status: '장소 상태',
    service_needs: '서비스 필요'
  },
  ar: {
    event_type: 'نوع الحفل',
    age: 'العمر',
    gender_preference: 'الجنس / التفضيل',
    date: 'التاريخ',
    area: 'المنطقة',
    guest_count: 'عدد الضيوف',
    budget_range: 'الميزانية',
    theme_preference: 'تفضيل الثيم',
    indoor_outdoor: 'داخلي / خارجي',
    intent: 'النية',
    venue_status: 'حالة القاعة',
    service_needs: 'الخدمات المطلوبة'
  }
};

export const starterPromptTemplates = {
  zh: [
    '我想给孩子办生日派对',
    '不知道选什么主题',
    '预算有限怎么办',
    '想办得高级一点',
    '想要适合女孩子/男孩子',
    '想在餐厅办',
    '想要拍照好看',
    '想先看报价',
    '想知道 Basic / Standard / Premium 差别',
    '需要推荐场地'
  ],
  en: [
    'I want to plan a birthday party',
    'I am not sure which theme to choose',
    'What if my budget is limited?',
    'I want it to feel more premium',
    'I need something suitable for a girl or boy',
    'I want to host it in a restaurant',
    'I want it to look good in photos',
    'I want to see a quote first',
    'What is the difference between Basic, Standard, and Premium?',
    'I need venue recommendations'
  ],
  ko: [
    '아이 생일 파티를 준비하고 싶어요',
    '어떤 테마를 고를지 모르겠어요',
    '예산이 제한적이면 어떻게 하나요?',
    '조금 더 고급스럽게 하고 싶어요',
    '여자아이/남자아이에게 어울리는 구성이 필요해요',
    '식당에서 하고 싶어요',
    '사진이 예쁘게 나오면 좋겠어요',
    '먼저 견적을 보고 싶어요',
    'Basic / Standard / Premium 차이가 궁금해요',
    '장소 추천이 필요해요'
  ],
  ar: [
    'أريد تنظيم حفلة عيد ميلاد لطفلي',
    'لا أعرف أي ثيم أختار',
    'ماذا لو كانت الميزانية محدودة؟',
    'أريدها أن تكون أرقى',
    'أحتاج شيئاً مناسباً لبنت أو ولد',
    'أريد إقامة الحفل في مطعم',
    'أريد أن تكون الصور جميلة',
    'أريد رؤية عرض سعر أولاً',
    'ما الفرق بين Basic و Standard و Premium؟',
    'أحتاج توصية بقاعة'
  ]
};

const normalize = (text = '') => text.toLowerCase();

const firstMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0];
  }
  return '';
};

const includesAny = (text, words) => words.some((word) => text.includes(word));

const CHINESE_NUMERALS = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10
};

function chineseNumberToInt(value = '') {
  if (!value) return '';
  if (/^\d+$/.test(value)) return value;
  if (value === '十') return '10';
  if (value.includes('十')) {
    const [tensRaw, onesRaw] = value.split('十');
    const tens = tensRaw ? CHINESE_NUMERALS[tensRaw] || 1 : 1;
    const ones = onesRaw ? CHINESE_NUMERALS[onesRaw] || 0 : 0;
    return String(tens * 10 + ones);
  }
  return CHINESE_NUMERALS[value] ? String(CHINESE_NUMERALS[value]) : '';
}

function firstNumberLikeMatch(original, patterns) {
  const match = firstMatch(original, patterns);
  return chineseNumberToInt(match) || match;
}

export function analyzeFreeTextIntake(rawText = '', locale = 'zh') {
  const original = rawText.trim();
  const text = normalize(original);

  const age = firstNumberLikeMatch(original, [
    /(\d{1,2})\s*岁/,
    /([一二两三四五六七八九十]{1,3})\s*岁/,
    /(\d{1,2})\s*세/,
    /(\d{1,2})\s*(?:years?|yo|y\/o)/i,
    /عمر(?:ه|ها)?\s*(\d{1,2})/,
    /(\d{1,2})/
  ]);
  const guestCount = firstNumberLikeMatch(original, [
    /(\d{1,3})\s*(?:人|位|个|名|小朋友|명|guests?|people|kids?|children|ضيف)/i,
    /([一二两三四五六七八九十]{1,3})\s*(?:人|位|个|名|小朋友)/
  ]);
  const date = firstMatch(original, [
    /(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/,
    /(\d{1,2}[-/.]\d{1,2})/,
    /(this weekend|next weekend|tomorrow|다음 주말|이번 주말|نهاية الأسبوع)/i
  ]);

  const extracted = {
    intent: includesAny(text, ['帮我做一个策划', '帮我策划', '不太了解', '我不懂', '推荐', 'plan for me', 'help me plan', 'recommend', '추천', 'ساعدني', 'اقترح'])
      ? 'needs_ai_planning'
      : '',
    event_type: includesAny(text, ['birthday', '生日', '생일', 'عيد ميلاد']) ? 'birthday_party' : '',
    age,
    gender_preference: includesAny(text, ['女儿', '女孩', 'girl', 'daughter', '여자', '딸', 'بنت', 'ابنت'])
      ? 'girl / feminine preference'
      : includesAny(text, ['儿子', '男孩', 'boy', 'son', '남자', '아들', 'ولد', 'ابن'])
        ? 'boy / masculine preference'
        : '',
    date,
    area: firstMatch(original, [
      /(Sydney|Chatswood|CBD|Inner West|North Sydney|Eastern Suburbs|Parramatta)/i,
      /(悉尼|北区|市中心|차스우드|시드니|سيدني)/
    ]),
    guest_count: guestCount,
    budget_range: includesAny(text, ['中等', '适中', '标准', 'standard', 'medium', 'moderate', '보통', 'متوسطة'])
      ? 'standard'
      : includesAny(text, ['预算有限', '别太夸张', '控制', 'limited budget', 'not too expensive', '예산', 'ميزانية محدودة'])
      ? 'mid_controlled'
      : includesAny(text, ['高级', '高端', 'premium', 'luxury', '고급', 'راق'])
        ? 'premium_leaning'
        : '',
    theme_preference: includesAny(text, ['公主', '城堡', 'princess', 'castle', '공주', '성', 'أميرة', 'قصر'])
      ? 'castle'
      : includesAny(text, ['宇宙', '火箭', 'space', 'rocket', '우주', '로켓', 'فضاء', 'صاروخ'])
        ? 'space'
        : includesAny(text, ['森林', '动物', 'forest', 'animal', '숲', '동물', 'غابة', 'حيوان'])
          ? 'forest'
          : includesAny(text, ['高级', '不幼稚', 'photo', '拍照', '고급', 'صور'])
            ? 'premium_photo'
            : '',
    indoor_outdoor: includesAny(text, ['餐厅', '室内', 'restaurant', 'indoor', '식당', '실내', 'مطعم', 'داخلي'])
      ? 'indoor'
      : includesAny(text, ['户外', '花园', 'outdoor', 'garden', '야외', 'حديقة'])
        ? 'outdoor'
        : '',
    venue_status: includesAny(text, ['没有场地', '还没场地', '还没有场地', '需要场地', 'need venue', 'no venue', 'venue recommendation', '장소 추천', 'لا توجد قاعة'])
      ? 'need_venue'
      : includesAny(text, ['已有场地', '有场地', 'already have a venue', 'have venue', '장소가 있음'])
        ? 'has_venue'
        : '',
    service_needs: [
      includesAny(text, ['策划', '推荐', 'plan', 'planning', 'recommend', '기획', 'تخطيط']) ? 'planning' : '',
      includesAny(text, ['餐饮', 'catering', 'food', '음식', 'طعام']) ? 'catering' : '',
      includesAny(text, ['摄影', '拍照', 'photo', 'photography', '사진', 'تصوير']) ? 'photography' : '',
      includesAny(text, ['装饰', '布置', 'decor', 'decoration', '장식', 'ديكور']) ? 'decor' : '',
      includesAny(text, ['气球', 'balloon', '풍선', 'بالون']) ? 'balloons' : '',
      includesAny(text, ['蛋糕', 'cake', '케이크', 'كعكة']) ? 'cake' : '',
      includesAny(text, ['娱乐', '儿童娱乐', '表演', 'entertainment', 'show', '놀이', 'ترفيه']) ? 'kids_entertainment' : '',
      includesAny(text, ['过敏', '饮食', 'allergy', 'allergies', 'diet', 'حساسية']) ? 'diet_allergy' : '',
      includesAny(text, ['主持', 'host', 'mc', '사회자', 'مقدم']) ? 'host' : ''
    ].filter(Boolean)
  };

  const missingFields = ['date', 'area', 'guest_count'].filter((field) => !extracted[field]);
  if (!extracted.budget_range) missingFields.push('budget_range');
  if (!extracted.indoor_outdoor) missingFields.push('indoor_outdoor');

  const packageRecommendation = extracted.budget_range === 'premium_leaning'
    ? 'Premium'
    : ['mid_controlled', 'standard'].includes(extracted.budget_range)
      ? 'Standard'
      : 'Standard';
  const themeRecommendation = extracted.theme_preference === 'space'
    ? 'Space Explorer'
    : extracted.theme_preference === 'forest'
      ? 'Forest Adventure'
      : extracted.theme_preference === 'castle'
        ? 'Castle Princess'
        : 'Elegant photo-ready party';

  const quoteReadySummary = {
    event_type: extracted.event_type || 'party_inquiry',
    age: extracted.age || '',
    gender_preference: extracted.gender_preference || '',
    date: extracted.date || '',
    area: extracted.area || '',
    guest_count: extracted.guest_count || '',
    budget_range: extracted.budget_range || '',
    theme_preference: extracted.theme_preference || '',
    intent: extracted.intent || '',
    venue_status: extracted.venue_status || '',
    package_recommendation: packageRecommendation,
    venue_recommendation: extracted.venue_status === 'need_venue'
      ? 'Need venue recommendation'
      : extracted.indoor_outdoor === 'outdoor'
      ? 'Outdoor venue with indoor backup'
      : 'Restaurant A / private dining room sample',
    emotional_summary: buildEmotionalSummary(extracted, packageRecommendation, locale),
    missing_fields: missingFields,
    next_questions: buildNextQuestions(missingFields, locale),
    service_needs: extracted.service_needs
  };

  return {
    raw_text: original,
    extracted,
    missing_fields: missingFields,
    recommendation: {
      theme: themeRecommendation,
      package: packageRecommendation,
      venue: quoteReadySummary.venue_recommendation,
      rationale: buildRationale(extracted, packageRecommendation, locale)
    },
    advisor_message: buildAdvisorMessage(quoteReadySummary, locale),
    quote_ready_summary: quoteReadySummary,
    boundary: 'local rule-based AI Concierge skeleton; no external AI, voice API, payment, webhook, n8n, or outbound message'
  };
}

export function mapAnalysisToAnswers(analysis = {}) {
  const extracted = analysis.extracted || {};
  const ageNumber = Number(extracted.age);
  return {
    childAge: ageNumber && ageNumber >= 9 ? '9-10' : ageNumber && ageNumber <= 5 ? '3-5' : '6-8',
    eventDate: extracted.date || '',
    guestCount: extracted.guest_count
      ? Number(extracted.guest_count) > 25 ? '26-40' : Number(extracted.guest_count) <= 15 ? '10-15' : '16-25'
      : '16-25',
    budgetRange: analysis.quote_ready_summary?.package_recommendation?.toLowerCase() === 'premium'
      ? 'premium'
      : analysis.quote_ready_summary?.package_recommendation?.toLowerCase() === 'basic'
        ? 'basic'
        : 'standard',
    area: extracted.area || '',
    indoorOutdoor: extracted.indoor_outdoor === 'outdoor' ? 'outdoor' : 'indoor',
    themePreference: extracted.theme_preference === 'space'
      ? 'space'
      : extracted.theme_preference === 'forest'
        ? 'forest'
        : extracted.theme_preference === 'castle'
          ? 'castle'
          : 'open',
    venueStatus: extracted.venue_status === 'has_venue'
      ? 'has_venue'
      : extracted.venue_status === 'need_venue' || extracted.indoor_outdoor === 'indoor'
        ? 'need_restaurant'
        : 'unsure',
    scenePriorities: extracted.service_needs?.includes('photography') ? 'photo_arch' : 'dessert_backdrop',
    stylingPreference: analysis.quote_ready_summary?.package_recommendation === 'Premium' ? 'immersive' : 'balanced',
    customerName: '',
    customerContact: ''
  };
}

export function localizeFieldLabel(field, locale = 'zh') {
  return FIELD_LABELS[locale]?.[field] || FIELD_LABELS.en[field] || field;
}

function buildNextQuestions(missingFields, locale) {
  const copy = {
    zh: {
      date: '你大概想哪一天办？',
      area: '活动希望安排在哪个区域？',
      guest_count: '预计多少位孩子和家长参加？',
      budget_range: '预算更接近 Basic、Standard 还是 Premium？',
      indoor_outdoor: '更倾向室内、户外，还是都可以？'
    },
    en: {
      date: 'Which date are you considering?',
      area: 'Which area should we plan around?',
      guest_count: 'How many guests should we expect?',
      budget_range: 'Should we plan around Basic, Standard, or Premium?',
      indoor_outdoor: 'Do you prefer indoor, outdoor, or flexible?'
    },
    ko: {
      date: '어느 날짜를 생각하고 있나요?',
      area: '어느 지역을 기준으로 볼까요?',
      guest_count: '예상 인원은 몇 명인가요?',
      budget_range: 'Basic, Standard, Premium 중 어떤 예산에 가까울까요?',
      indoor_outdoor: '실내, 야외, 또는 유연하게 볼까요?'
    },
    ar: {
      date: 'ما التاريخ الذي تفكر فيه؟',
      area: 'أي منطقة نخطط حولها؟',
      guest_count: 'كم عدد الضيوف المتوقع؟',
      budget_range: 'هل نخطط حول Basic أو Standard أو Premium؟',
      indoor_outdoor: 'هل تفضل داخلياً أم خارجياً أم مرناً؟'
    }
  };
  const dict = copy[locale] || copy.en;
  return missingFields.map((field) => dict[field] || field).slice(0, 3);
}

function buildRationale(extracted, tier, locale) {
  if (locale === 'ko') {
    return `${tier} 단계는 현재 예산과 사진/분위기 요구를 균형 있게 맞추며, 부족한 정보는 다음 질문으로 확인하면 됩니다.`;
  }
  if (locale === 'ar') {
    return `باقة ${tier} توازن بين الميزانية والشكل البصري، ويمكن تأكيد المعلومات الناقصة في الأسئلة التالية.`;
  }
  if (locale === 'en') {
    return `${tier} balances the desired visual quality with budget control, while the missing details can be confirmed next.`;
  }
  return `${tier} 比较适合当前“效果要好、预算别失控”的诉求；日期、地区和人数补齐后就可以进入 quote request。`;
}

function buildEmotionalSummary(extracted, tier, locale) {
  if (locale === 'ko') {
    return `이 방향은 충분히 예쁘고 성숙하게 만들 수 있습니다. ${tier}부터 보면 부담을 줄이면서도 사진 포인트를 살릴 수 있어요.`;
  }
  if (locale === 'ar') {
    return `يمكن تنفيذ هذه الفكرة بشكل أنيق ومطمئن. البدء بـ ${tier} يعطي أثراً بصرياً جيداً دون مبالغة في الميزانية.`;
  }
  if (locale === 'en') {
    return `This idea can work beautifully. Starting with ${tier} keeps the planning clear while protecting the photo-ready moments.`;
  }
  return `这个想法是可以办得很好看的。先按 ${tier} 方向规划，既能保留拍照亮点，也能避免预算一开始就失控。`;
}

function buildAdvisorMessage(summary, locale) {
  if (locale === 'zh' && summary.intent === 'needs_ai_planning') {
    const ageText = summary.age ? `${summary.age} 岁孩子` : '孩子';
    const guestText = summary.guest_count ? `约 ${summary.guest_count} 人` : '待确认人数';
    const budgetText = summary.package_recommendation === 'Standard' ? '中等预算' : `${summary.package_recommendation} 预算`;
    const venueText = summary.venue_status === 'need_venue' ? '需要场地推荐' : summary.venue_recommendation;
    return `明白了，我会按 ${ageText}、${guestText}、${budgetText}、${venueText} 来帮你策划。我们先从主题开始。`;
  }
  if (locale === 'ko') {
    return `${summary.emotional_summary} 먼저 ${summary.package_recommendation}와 ${summary.venue_recommendation} 방향으로 잡고, ${summary.next_questions.join(' / ')} 를 확인하면 견적 요청으로 넘어갈 수 있습니다.`;
  }
  if (locale === 'ar') {
    return `${summary.emotional_summary} أقترح البدء بـ ${summary.package_recommendation} و ${summary.venue_recommendation}. نحتاج فقط إلى: ${summary.next_questions.join(' / ')}.`;
  }
  if (locale === 'en') {
    return `${summary.emotional_summary} I would start with ${summary.package_recommendation} and ${summary.venue_recommendation}. Next I only need: ${summary.next_questions.join(' / ')}.`;
  }
  return `${summary.emotional_summary} 我建议先看 ${summary.package_recommendation} + ${summary.venue_recommendation}，接下来只需要补充：${summary.next_questions.join(' / ')}。`;
}
