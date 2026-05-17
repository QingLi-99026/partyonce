export const addOnServiceGroups = [
  {
    id: 'planning_execution',
    icon: '🧰',
    i18n: {
      zh: { title: '省心执行', subtitle: '把现场搭建、撤场和协调交给团队' },
      en: { title: 'Done-for-you execution', subtitle: 'Setup, pack-down, and on-site coordination support' },
      ko: { title: '안심 실행 서비스', subtitle: '현장 설치, 철수, 진행 조율 지원' },
      ar: { title: 'تنفيذ مريح', subtitle: 'دعم التجهيز والفك والتنسيق في الموقع' }
    }
  },
  {
    id: 'visual_impact',
    icon: '✨',
    i18n: {
      zh: { title: '视觉升级', subtitle: '让照片、入口和主题氛围更出片' },
      en: { title: 'Visual upgrades', subtitle: 'Stronger photos, entry moments, and themed styling' },
      ko: { title: '비주얼 업그레이드', subtitle: '사진, 입구, 테마 분위기를 더 선명하게' },
      ar: { title: 'ترقية بصرية', subtitle: 'صور أجمل ومدخل وأجواء ثيم أوضح' }
    }
  },
  {
    id: 'kids_experience',
    icon: '🎤',
    i18n: {
      zh: { title: '孩子体验', subtitle: '主持、表演和互动让现场更热闹' },
      en: { title: 'Kids experience', subtitle: 'Hosts, shows, and activities that keep children engaged' },
      ko: { title: '아이 경험', subtitle: '사회자, 공연, 활동으로 더 즐거운 현장' },
      ar: { title: 'تجربة الأطفال', subtitle: 'مقدم وفقرات وأنشطة تجعل الحفل أكثر حيوية' }
    }
  },
  {
    id: 'food_dessert',
    icon: '🎂',
    i18n: {
      zh: { title: '餐饮甜品', subtitle: '蛋糕、甜品台和基础餐饮补充' },
      en: { title: 'Food & dessert', subtitle: 'Cake, dessert table, and food service add-ons' },
      ko: { title: '음식과 디저트', subtitle: '케이크, 디저트 테이블, 기본 케이터링' },
      ar: { title: 'الطعام والحلويات', subtitle: 'كيك وطاولة حلويات وخدمات طعام إضافية' }
    }
  }
];

export const addOnServices = [
  {
    id: 'event-styling',
    group: 'visual_impact',
    icon: '🎨',
    price: 280,
    marginRole: 'High-margin styling layer',
    lineItemType: 'optional_upgrade',
    i18n: {
      zh: {
        name: '现场布置与主题造型',
        short: '桌布、摆件、主题色和入口视觉统一。',
        basis: '按主题物料、布置复杂度和现场时长估算。',
        customerValue: '适合希望现场一进门就有派对感的家庭。'
      },
      en: {
        name: 'On-site styling & theme setup',
        short: 'Table styling, props, theme colours, and entry visual consistency.',
        basis: 'Estimated from styling materials, setup complexity, and on-site time.',
        customerValue: 'Best when parents want the room to feel styled as soon as guests arrive.'
      },
      ko: {
        name: '현장 스타일링과 테마 세팅',
        short: '테이블, 소품, 테마 컬러, 입구 분위기 통일.',
        basis: '소품, 설치 난이도, 현장 시간 기준 예상.',
        customerValue: '입장 순간부터 파티 느낌을 원할 때 적합합니다.'
      },
      ar: {
        name: 'تنسيق الموقع والثيم',
        short: 'تنسيق الطاولات والإكسسوارات وألوان الثيم والمدخل.',
        basis: 'تقدير حسب المواد وتعقيد التجهيز ووقت الموقع.',
        customerValue: 'مناسب للعائلات التي تريد إحساس حفلة واضح عند الدخول.'
      }
    }
  },
  {
    id: 'setup-packdown',
    group: 'planning_execution',
    icon: '🛠️',
    price: 220,
    marginRole: 'Labor and operations margin',
    lineItemType: 'optional_upgrade',
    i18n: {
      zh: {
        name: '搭建、撤场与现场协调',
        short: '入场搭建、活动后撤场、基础现场协调。',
        basis: '按入场限制、人员数量和撤场要求估算。',
        customerValue: '适合不想自己搬运、布置和收尾的家长。'
      },
      en: {
        name: 'Setup, pack-down & coordination',
        short: 'Bump-in setup, post-party pack-down, and basic coordination.',
        basis: 'Estimated from access limits, crew size, and pack-down requirements.',
        customerValue: 'Best when parents do not want to carry, style, or clean up themselves.'
      },
      ko: {
        name: '설치, 철수, 현장 조율',
        short: '입장 설치, 파티 후 철수, 기본 현장 조율.',
        basis: '입장 조건, 인원, 철수 조건 기준 예상.',
        customerValue: '부모가 직접 운반과 정리를 하지 않아도 됩니다.'
      },
      ar: {
        name: 'التجهيز والفك والتنسيق',
        short: 'تجهيز قبل الحفل وفك بعده وتنسيق أساسي.',
        basis: 'تقدير حسب قيود الدخول وعدد الفريق ومتطلبات الفك.',
        customerValue: 'مناسب لمن لا يريد حمل وتجهيز وتنظيف كل شيء بنفسه.'
      }
    }
  },
  {
    id: 'host-mc',
    group: 'kids_experience',
    icon: '🎙️',
    price: 320,
    marginRole: 'Talent coordination margin',
    lineItemType: 'optional_upgrade',
    i18n: {
      zh: {
        name: '儿童派对主持 / MC',
        short: '欢迎、流程串联、小游戏和切蛋糕环节引导。',
        basis: '按主持时长、语言需求和活动复杂度估算。',
        customerValue: '适合希望现场更有秩序、更热闹的家庭。'
      },
      en: {
        name: 'Kids party host / MC',
        short: 'Welcome, run sheet guidance, games, and cake moment hosting.',
        basis: 'Estimated from host duration, language needs, and activity complexity.',
        customerValue: 'Best when parents want the party to feel lively but organised.'
      },
      ko: {
        name: '키즈 파티 진행자 / MC',
        short: '환영, 순서 진행, 게임, 케이크 타임 안내.',
        basis: '진행 시간, 언어, 활동 복잡도 기준 예상.',
        customerValue: '현장이 더 활기차고 정돈되길 원할 때 좋습니다.'
      },
      ar: {
        name: 'مقدم حفلة أطفال / MC',
        short: 'ترحيب وتنظيم الفقرات والألعاب ولحظة الكيك.',
        basis: 'تقدير حسب مدة التقديم واللغة وتعقيد الفعاليات.',
        customerValue: 'مناسب لجعل الحفل منظماً وممتعاً للأطفال.'
      }
    }
  },
  {
    id: 'sound-light',
    group: 'planning_execution',
    icon: '🔊',
    price: 180,
    marginRole: 'Equipment coordination margin',
    lineItemType: 'optional_upgrade',
    i18n: {
      zh: {
        name: '音响 / 麦克风基础包',
        short: '小型音响、麦克风和简单播放支持。',
        basis: '按场地限制、设备数量和使用时长估算。',
        customerValue: '适合需要主持、音乐或表演环节的活动。'
      },
      en: {
        name: 'Sound / microphone starter pack',
        short: 'Small speaker, microphone, and simple playback support.',
        basis: 'Estimated from venue limits, equipment count, and usage time.',
        customerValue: 'Useful when the plan includes hosting, music, or performances.'
      },
      ko: {
        name: '음향 / 마이크 기본 패키지',
        short: '소형 스피커, 마이크, 간단한 재생 지원.',
        basis: '장소 제한, 장비 수, 사용 시간 기준 예상.',
        customerValue: '진행, 음악, 공연이 있을 때 유용합니다.'
      },
      ar: {
        name: 'باقة صوت وميكروفون أساسية',
        short: 'سماعة صغيرة وميكروفون ودعم تشغيل بسيط.',
        basis: 'تقدير حسب قيود القاعة وعدد الأجهزة ومدة الاستخدام.',
        customerValue: 'مفيد عند وجود تقديم أو موسيقى أو فقرة أداء.'
      }
    }
  },
  {
    id: 'kids-performance',
    group: 'kids_experience',
    icon: '🎭',
    price: 480,
    marginRole: 'Entertainment supplier margin',
    lineItemType: 'optional_upgrade',
    i18n: {
      zh: {
        name: '儿童互动表演 / 娱乐',
        short: '魔术、角色互动、气球扭扭或主题游戏。',
        basis: '按表演类型、时长和供应商可用性估算。',
        customerValue: '适合想让孩子持续参与、不只是吃饭拍照的家庭。'
      },
      en: {
        name: 'Kids performance / entertainment',
        short: 'Magic, character play, balloon twisting, or themed games.',
        basis: 'Estimated from performance type, duration, and supplier availability.',
        customerValue: 'Best when parents want children engaged beyond dining and photos.'
      },
      ko: {
        name: '키즈 공연 / 엔터테인먼트',
        short: '마술, 캐릭터 놀이, 풍선, 테마 게임.',
        basis: '공연 종류, 시간, 공급업체 가능 여부 기준 예상.',
        customerValue: '식사와 사진 외에도 아이들이 계속 참여하게 합니다.'
      },
      ar: {
        name: 'عرض أو ترفيه للأطفال',
        short: 'سحر أو شخصيات أو بالونات أو ألعاب ثيم.',
        basis: 'تقدير حسب نوع العرض والمدة وتوفر المورد.',
        customerValue: 'مناسب لإبقاء الأطفال متفاعلين بعد الطعام والصور.'
      }
    }
  },
  {
    id: 'cake-dessert',
    group: 'food_dessert',
    icon: '🎂',
    price: 260,
    marginRole: 'Cake and dessert supplier margin',
    lineItemType: 'optional_upgrade',
    i18n: {
      zh: {
        name: '主题蛋糕 / 甜品台',
        short: '主题蛋糕、杯子蛋糕或小型甜品台建议。',
        basis: '按人数、主题复杂度和供应商报价估算。',
        customerValue: '适合希望照片更完整、切蛋糕环节更有仪式感的家庭。'
      },
      en: {
        name: 'Theme cake / dessert table',
        short: 'Theme cake, cupcakes, or a small dessert table recommendation.',
        basis: 'Estimated from guest count, theme complexity, and supplier quote.',
        customerValue: 'Best when parents want a stronger cake moment and better photos.'
      },
      ko: {
        name: '테마 케이크 / 디저트 테이블',
        short: '테마 케이크, 컵케이크, 소형 디저트 테이블.',
        basis: '인원, 테마 난이도, 공급업체 견적 기준 예상.',
        customerValue: '케이크 타임과 사진을 더 예쁘게 만들고 싶을 때 좋습니다.'
      },
      ar: {
        name: 'كيك الثيم / طاولة حلويات',
        short: 'كيك ثيم أو كب كيك أو طاولة حلويات صغيرة.',
        basis: 'تقدير حسب عدد الضيوف وتعقيد الثيم وعرض المورد.',
        customerValue: 'مناسب للحظات كيك أجمل وصور أكثر اكتمالاً.'
      }
    }
  },
  {
    id: 'photo-zone',
    group: 'visual_impact',
    icon: '📸',
    price: 360,
    marginRole: 'Photo-zone styling margin',
    lineItemType: 'optional_upgrade',
    i18n: {
      zh: {
        name: '拍照区 / 背景板升级',
        short: '主题背景、KT 板、气球和拍照角强化。',
        basis: '按背景尺寸、物料和现场搭建复杂度估算。',
        customerValue: '适合重视朋友圈、小红书或家庭照片效果的家庭。'
      },
      en: {
        name: 'Photo zone / backdrop upgrade',
        short: 'Themed backdrop, KT board, balloons, and photo-corner styling.',
        basis: 'Estimated from backdrop size, materials, and setup complexity.',
        customerValue: 'Best when social photos and family memories matter.'
      },
      ko: {
        name: '포토존 / 배경판 업그레이드',
        short: '테마 배경, 보드, 풍선, 포토 코너 강화.',
        basis: '배경 크기, 재료, 설치 난이도 기준 예상.',
        customerValue: 'SNS와 가족 사진을 중요하게 볼 때 좋습니다.'
      },
      ar: {
        name: 'منطقة تصوير / خلفية مطورة',
        short: 'خلفية ثيم ولوحات وبالونات وركن تصوير.',
        basis: 'تقدير حسب حجم الخلفية والمواد وتعقيد التجهيز.',
        customerValue: 'مناسب إذا كانت الصور والذكريات مهمة للعائلة.'
      }
    }
  },
  {
    id: 'party-cleanup',
    group: 'planning_execution',
    icon: '🧹',
    price: 160,
    marginRole: 'After-party service margin',
    lineItemType: 'optional_upgrade',
    i18n: {
      zh: {
        name: '活动后清理 / 撤场支持',
        short: '基础清理、物料打包、撤场协助。',
        basis: '按场地要求、物料数量和撤场时间估算。',
        customerValue: '适合餐厅或场地要求活动后快速恢复的家庭。'
      },
      en: {
        name: 'After-party clean-up support',
        short: 'Basic clean-up, material packing, and pack-down assistance.',
        basis: 'Estimated from venue rules, material volume, and pack-down time.',
        customerValue: 'Useful when the venue needs the room reset quickly after the party.'
      },
      ko: {
        name: '파티 후 정리 / 철수 지원',
        short: '기본 정리, 물품 포장, 철수 보조.',
        basis: '장소 규정, 물품 양, 철수 시간 기준 예상.',
        customerValue: '행사 후 빠르게 원상복구해야 할 때 유용합니다.'
      },
      ar: {
        name: 'تنظيف ودعم بعد الحفل',
        short: 'تنظيف أساسي وتغليف مواد ومساعدة في الفك.',
        basis: 'تقدير حسب قواعد القاعة وحجم المواد ووقت الفك.',
        customerValue: 'مفيد عندما يجب إعادة المكان بسرعة بعد الحفل.'
      }
    }
  }
];

export const addOnOperationsMeta = {
  'event-styling': {
    estimatedCost: 145,
    supplierCategory: 'setup_service',
    opsChecklist: [
      'Confirm venue bump-in window and table count.',
      'Match styling colours with selected theme and package tier.',
      'Confirm props can be removed without venue damage.'
    ]
  },
  'setup-packdown': {
    estimatedCost: 130,
    supplierCategory: 'setup_service',
    opsChecklist: [
      'Confirm parking, lift access, and pack-down deadline.',
      'Confirm crew size before formal quote.',
      'Confirm venue waste and cleaning rules.'
    ]
  },
  'host-mc': {
    estimatedCost: 210,
    supplierCategory: 'kids_entertainment',
    opsChecklist: [
      'Confirm host language, age group, and run sheet.',
      'Confirm noise limits and microphone availability.',
      'Confirm games are suitable for venue rules.'
    ]
  },
  'sound-light': {
    estimatedCost: 95,
    supplierCategory: 'setup_service',
    opsChecklist: [
      'Confirm power outlet position and venue sound limits.',
      'Confirm whether venue has in-house speaker rules.',
      'Confirm microphone is only for preview/test planning.'
    ]
  },
  'kids-performance': {
    estimatedCost: 330,
    supplierCategory: 'kids_entertainment',
    opsChecklist: [
      'Confirm performer availability and child age fit.',
      'Confirm public liability / venue requirements.',
      'Confirm performance volume and space requirement.'
    ]
  },
  'cake-dessert': {
    estimatedCost: 165,
    supplierCategory: 'cake_dessert',
    opsChecklist: [
      'Confirm cake size, flavours, and allergy notes.',
      'Confirm venue cakeage or outside-food policy.',
      'Confirm delivery timing and refrigeration needs.'
    ]
  },
  'photo-zone': {
    estimatedCost: 210,
    supplierCategory: 'balloon_decorator',
    opsChecklist: [
      'Confirm wall/backdrop placement and venue fixing rules.',
      'Confirm balloon arch size and access path.',
      'Confirm photo-zone does not block staff circulation.'
    ]
  },
  'party-cleanup': {
    estimatedCost: 90,
    supplierCategory: 'setup_service',
    opsChecklist: [
      'Confirm what venue considers standard cleaning.',
      'Confirm rubbish disposal and pack-down timing.',
      'Confirm no extra venue cleaning surcharge is triggered.'
    ]
  }
};

const fallbackLocale = 'en';

export const addOnValueStories = [
  {
    id: 'stress-free-execution',
    serviceIds: ['setup-packdown', 'party-cleanup'],
    visualTone: 'execution',
    i18n: {
      zh: {
        title: '家长不用自己搬、摆、收',
        subtitle: '适合餐厅包间和时间窗口紧的活动',
        before: '家长自己提前到场搬物料、摆桌、活动后收拾。',
        after: '团队负责搭建、撤场和现场基础协调，家长专注陪孩子和招呼客人。',
        proofPoint: '常见于 25-40 人中等预算家庭，尤其适合第一次办餐厅派对。'
      },
      en: {
        title: 'Parents do not carry, style and clean up alone',
        subtitle: 'Best for restaurant rooms and tight bump-in windows',
        before: 'Parents arrive early, carry materials, dress tables and clean up after the party.',
        after: 'The team handles setup, pack-down and basic coordination while parents focus on guests.',
        proofPoint: 'Common for 25-40 guest mid-budget families, especially first-time restaurant parties.'
      },
      ko: {
        title: '부모가 직접 운반, 세팅, 정리를 하지 않아도 됩니다',
        subtitle: '레스토랑 룸과 짧은 준비 시간에 적합',
        before: '부모가 일찍 도착해 물품을 옮기고 테이블을 꾸미고 행사 후 정리합니다.',
        after: '팀이 설치, 철수, 기본 조율을 맡아 부모는 아이와 손님에게 집중합니다.',
        proofPoint: '25-40명 중간 예산 가족에게 자주 맞는 패턴입니다.'
      },
      ar: {
        title: 'لا يحتاج الأهل لحمل وتجهيز وتنظيف كل شيء',
        subtitle: 'مناسب لغرف المطاعم ووقت التجهيز المحدود',
        before: 'يصل الأهل مبكراً لنقل المواد وتجهيز الطاولات والتنظيف بعد الحفل.',
        after: 'يتولى الفريق التجهيز والفك والتنسيق الأساسي بينما يركز الأهل على الضيوف.',
        proofPoint: 'نمط شائع لعائلات بميزانية متوسطة وعدد 25-40 ضيفاً.'
      }
    }
  },
  {
    id: 'photo-ready-moment',
    serviceIds: ['event-styling', 'photo-zone'],
    visualTone: 'visual',
    i18n: {
      zh: {
        title: '让照片看起来像一场真正主题派对',
        subtitle: '适合重视拍照、短视频和家庭纪念的家庭',
        before: '普通包间只有餐桌和简单装饰，照片很难看出主题。',
        after: '主题色、背景板、气球和拍照角形成清晰视觉记忆点。',
        proofPoint: '通常是最容易被家长理解的视觉升级，也是后续分享返券的基础。'
      },
      en: {
        title: 'Make the photos look like a real themed party',
        subtitle: 'Best for families who care about photos, short videos and memories',
        before: 'A normal dining room only shows tables and small decorations, with weak theme impact.',
        after: 'Theme colours, backdrop, balloons and a photo corner create a clear memory moment.',
        proofPoint: 'This is often the easiest visual upgrade for parents to understand and share.'
      },
      ko: {
        title: '사진이 진짜 테마 파티처럼 보이게 합니다',
        subtitle: '사진, 짧은 영상, 가족 추억을 중요하게 보는 가족에게 적합',
        before: '일반 룸은 테이블과 작은 장식만 보여 테마 느낌이 약합니다.',
        after: '테마 컬러, 배경, 풍선, 포토존이 기억에 남는 장면을 만듭니다.',
        proofPoint: '부모가 가장 쉽게 이해하고 공유하기 좋은 비주얼 업그레이드입니다.'
      },
      ar: {
        title: 'اجعل الصور تبدو كحفلة بثيم واضح',
        subtitle: 'مناسب للعائلات التي تهتم بالصور والفيديو والذكريات',
        before: 'غرفة عادية بطاولات وزينة بسيطة ولا يظهر الثيم بوضوح.',
        after: 'ألوان الثيم والخلفية والبالونات وركن التصوير تصنع لحظة بصرية واضحة.',
        proofPoint: 'غالباً أسهل ترقية بصرية يفهمها الأهل ويمكن مشاركتها.'
      }
    }
  },
  {
    id: 'kids-engagement',
    serviceIds: ['host-mc', 'kids-performance', 'cake-dessert'],
    visualTone: 'experience',
    i18n: {
      zh: {
        title: '不只是吃饭：让孩子真的参与',
        subtitle: '适合 20+ 孩子、年龄差较大或希望现场更有秩序的活动',
        before: '孩子很快吃完跑开，家长需要临时维持秩序。',
        after: '主持、互动和蛋糕甜品环节让现场更完整，也更容易控制节奏。',
        proofPoint: '适合把 Standard 升级成更省心、更有体验感的方案。'
      },
      en: {
        title: 'Not just dining: keep children engaged',
        subtitle: 'Best for 20+ children, mixed ages or parents who want more structure',
        before: 'Children finish eating quickly and parents need to manage the room on the fly.',
        after: 'A host, activity moment and cake/dessert flow make the party feel complete and easier to manage.',
        proofPoint: 'A practical way to lift a Standard plan into a more memorable experience.'
      },
      ko: {
        title: '식사만이 아니라 아이들이 참여하게 합니다',
        subtitle: '아이 20명 이상, 연령대가 섞인 행사에 적합',
        before: '아이들이 금방 먹고 흩어져 부모가 현장에서 급히 관리해야 합니다.',
        after: '진행자, 활동, 케이크/디저트 순서가 현장을 더 완성도 있게 만듭니다.',
        proofPoint: 'Standard 플랜을 더 기억에 남는 경험으로 올리는 현실적인 방법입니다.'
      },
      ar: {
        title: 'ليست وجبة فقط: اجعل الأطفال متفاعلين',
        subtitle: 'مناسب لـ 20+ طفل أو أعمار مختلفة أو عائلات تريد تنظيماً أكثر',
        before: 'ينتهي الأطفال من الطعام سريعاً ويحتاج الأهل لإدارة المكان فوراً.',
        after: 'المقدم والأنشطة ولحظة الكيك تجعل الحفل أكثر اكتمالاً وأسهل إدارة.',
        proofPoint: 'طريقة عملية لرفع الخطة القياسية إلى تجربة أكثر تميزاً.'
      }
    }
  }
];

export function localizeAddOnText(item, locale = fallbackLocale) {
  const cleanLocale = String(locale || fallbackLocale).split('-')[0];
  return item?.i18n?.[cleanLocale] || item?.i18n?.[fallbackLocale] || item?.i18n?.zh || {};
}

export function getAddOnServiceGroups(locale = fallbackLocale) {
  return addOnServiceGroups.map((group) => ({
    ...group,
    text: localizeAddOnText(group, locale)
  }));
}

export function getAddOnServices(locale = fallbackLocale) {
  return addOnServices.map((item) => ({
    ...item,
    ...addOnOperationsMeta[item.id],
    grossMarginPlaceholder: Math.max(
      0,
      Math.round(Number(item.price || 0) - Number(addOnOperationsMeta[item.id]?.estimatedCost || 0))
    ),
    text: localizeAddOnText(item, locale)
  }));
}

export function getAddOnServiceById(id, locale = fallbackLocale) {
  return getAddOnServices(locale).find((item) => item.id === id) || null;
}

export function getAddOnValueStories(locale = fallbackLocale) {
  const cleanLocale = String(locale || fallbackLocale).split('-')[0];
  return addOnValueStories.map((story) => {
    const text = story.i18n?.[cleanLocale] || story.i18n?.[fallbackLocale] || story.i18n?.zh;
    return {
      ...story,
      text,
      services: story.serviceIds.map((id) => getAddOnServiceById(id, cleanLocale)).filter(Boolean)
    };
  });
}

export function summarizeSelectedAddOns(ids = [], locale = fallbackLocale) {
  const selected = ids.map((id) => getAddOnServiceById(id, locale)).filter(Boolean);
  return {
    items: selected,
    total: selected.reduce((sum, item) => sum + Number(item.price || 0), 0),
    groups: getAddOnServiceGroups(locale)
      .map((group) => ({
        ...group,
        items: selected.filter((item) => item.group === group.id)
      }))
      .filter((group) => group.items.length > 0)
  };
}

export function recommendAddOnServicesForVenue(venue = {}, filters = {}, locale = fallbackLocale) {
  const ids = new Set(['setup-packdown']);
  const guestCount = Number(filters.totalGuests || Number(filters.adults || 0) + Number(filters.kids || 0) || 30);

  if (venue.allowsDecorations) ids.add('event-styling');
  if (venue.hasPhotoZoneSpace) ids.add('photo-zone');
  if (venue.allowsCake || venue.hasDessertTableSpace) ids.add('cake-dessert');
  if (venue.allowsEntertainment || guestCount >= 30) ids.add('host-mc');
  if (venue.allowsEntertainment) ids.add('kids-performance');
  if (venue.spaceType === 'open_dining_area' || venue.venueType === 'community_hall') ids.add('sound-light');
  if (venue.restrictions?.some((item) => /clean|setup|external|pack/i.test(item))) ids.add('party-cleanup');

  return Array.from(ids)
    .map((id) => getAddOnServiceById(id, locale))
    .filter(Boolean)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      group: item.group,
      icon: item.icon,
      name: item.text.name,
      short: item.text.short,
      customerValue: item.text.customerValue,
      price: item.price,
      estimatedCost: item.estimatedCost,
      grossMarginPlaceholder: item.grossMarginPlaceholder,
      supplierCategory: item.supplierCategory
    }));
}
