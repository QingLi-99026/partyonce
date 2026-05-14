export const AI_CONCIERGE_STORAGE_KEY = 'partyonce_ai_concierge_intake_v1';
export const AI_CONCIERGE_QUOTE_PREFILL_KEY = 'partyonce_ai_concierge_quote_prefill_v1';

export const aiConciergeIntro = {
  title: 'PartyOnce AI Concierge',
  greeting:
    "Hi, welcome to Party Event. I can help you plan your child's party step by step.",
  subGreeting:
    '我会像派对顾问一样先问几个轻问题，再推荐主题、套餐和 Restaurant A 样板，并帮你带入报价咨询。'
};

export const aiConciergeQuestions = [
  {
    id: 'childAge',
    label: '孩子年龄',
    prompt: '小主角今年几岁？',
    helper: '我会根据年龄先判断主题气质和布置强度。',
    type: 'choice',
    required: true,
    options: [
      { label: '3-5 岁', value: '3-5', weights: { castle: 4, forest: 2, space: 0 } },
      { label: '6-8 岁', value: '6-8', weights: { castle: 2, forest: 3, space: 3 } },
      { label: '9-10 岁', value: '9-10', weights: { castle: 0, forest: 2, space: 4 } }
    ]
  },
  {
    id: 'eventDate',
    label: '活动日期',
    prompt: '你希望哪一天办活动？',
    helper: '不确定也没关系，先选一个大概日期，顾问后续会人工确认。',
    type: 'date',
    required: true
  },
  {
    id: 'guestCount',
    label: '预计人数',
    prompt: '大概会有多少位孩子和家长参加？',
    helper: '人数会影响 Restaurant A 是否合适，以及桌椅和服务配置。',
    type: 'choice',
    required: true,
    options: [
      { label: '10-15 人', value: '10-15', capacity: 'small', weights: { castle: 2, forest: 2, space: 1 } },
      { label: '16-25 人', value: '16-25', capacity: 'medium', weights: { castle: 2, forest: 2, space: 2 } },
      { label: '26-40 人', value: '26-40', capacity: 'large', weights: { castle: 1, forest: 2, space: 3 } }
    ]
  },
  {
    id: 'budgetRange',
    label: '预算范围',
    prompt: '你希望先按哪个预算层级规划？',
    helper: '这里只是规划层级，不会触发付款，也不会创建 PaymentIntent。',
    type: 'choice',
    required: true,
    options: [
      { label: 'Basic · 控制预算', value: 'basic', tier: 'basic' },
      { label: 'Standard · 完整体验', value: 'standard', tier: 'standard' },
      { label: 'Premium · 高端沉浸', value: 'premium', tier: 'premium' }
    ]
  },
  {
    id: 'area',
    label: '所在区域',
    prompt: '你希望活动安排在哪个区域？',
    helper: '这会帮助我们后续匹配场地和供应商服务范围。',
    type: 'choice',
    required: true,
    options: [
      { label: 'Sydney CBD / Inner West', value: 'Sydney CBD / Inner West' },
      { label: 'North Sydney / Chatswood', value: 'North Sydney / Chatswood' },
      { label: 'Eastern Suburbs / South', value: 'Eastern Suburbs / South' }
    ]
  },
  {
    id: 'indoorOutdoor',
    label: '室内/室外',
    prompt: '你更倾向室内还是室外？',
    helper: '室内更稳定，室外更适合森林和自然主题。',
    type: 'choice',
    required: true,
    options: [
      { label: '室内优先', value: 'indoor', weights: { castle: 2, space: 2, forest: 1 } },
      { label: '室外 / 花园', value: 'outdoor', weights: { forest: 3, castle: 1, space: 0 } },
      { label: '都可以，听推荐', value: 'flexible', weights: { castle: 1, forest: 1, space: 1 } }
    ]
  },
  {
    id: 'themePreference',
    label: '主题偏好',
    prompt: '孩子最容易被哪种主题吸引？',
    helper: '如果还没有想法，选“帮我推荐”，我会根据前面的答案判断。',
    type: 'choice',
    required: true,
    options: [
      { label: '公主 / 城堡 / 童话', value: 'castle', weights: { castle: 5 } },
      { label: '火箭 / 宇宙 / 科学', value: 'space', weights: { space: 5 } },
      { label: '动物 / 森林 / 自然', value: 'forest', weights: { forest: 5 } },
      { label: '不确定，帮我推荐', value: 'open', weights: { castle: 1, forest: 1, space: 1 } }
    ]
  },
  {
    id: 'venueStatus',
    label: '场地状态',
    prompt: '你现在已经有场地了吗？',
    helper: '没有场地也没关系，可以先用 Restaurant A 样板进入报价咨询。',
    type: 'choice',
    required: true,
    options: [
      { label: '已经有餐厅/包间', value: 'has_venue' },
      { label: '需要推荐餐厅', value: 'need_restaurant' },
      { label: '还不确定', value: 'unsure' }
    ]
  },
  {
    id: 'customerName',
    label: '联系人',
    prompt: '怎么称呼你？',
    helper: '只用于本地/staging 咨询表预填，不会外发消息。',
    type: 'text',
    placeholder: '例如 Ava / Kevin',
    required: true
  },
  {
    id: 'customerContact',
    label: '联系方式',
    prompt: '留下一个手机号、微信或邮箱，方便顾问后续人工确认。',
    helper: '本轮只写入本地 Lead / staging skeleton，不会发送短信、邮件或 WhatsApp。',
    type: 'text',
    placeholder: '手机号 / 微信 / 邮箱',
    required: true
  }
];
