export const parentTrustFaq = [
  {
    id: 'manual-review',
    question: 'Is this an instant booking?',
    answer: 'No. This preview helps you compare venue, theme, package and add-ons. The team still reviews venue rules, supplier availability, food and allergy notes before issuing a formal quote.'
  },
  {
    id: 'payment-readiness',
    question: 'Will I be charged when I submit a quote request?',
    answer: 'No. Quote submission does not trigger payment. Deposit payment is a later readiness step after a formal quote is reviewed and accepted.'
  },
  {
    id: 'venue-data',
    question: 'Are these real venue guarantees?',
    answer: 'Current venue data is local/staging demo data. Capacity, room hire, minimum spend, cakeage, food options and allergy handling must be confirmed with the venue before a formal quote.'
  },
  {
    id: 'addons',
    question: 'Why are add-ons shown separately?',
    answer: 'Add-ons such as styling, setup, host, sound, entertainment, cake, photography and clean-up are optional profit services. They help families decide how much support they want without hiding costs inside one vague package.'
  },
  {
    id: 'share-rewards',
    question: 'Are share rewards real coupons?',
    answer: 'In this staging preview, rewards are placeholders. A future production version can offer simple fixed rewards such as a $30 voucher, free balloon upgrade or free photo-corner upgrade after manual review.'
  }
]

export const trustChecklist = [
  '正式报价前必须人工复核',
  '提交报价需求不会即时扣款',
  '餐饮和过敏需求必须确认',
  '附加服务可选且价格清楚',
  '场地信息用于报价前规划'
]

export const quoteProcessSteps = [
  {
    id: 'choose',
    title: '选择场地、主题和套餐',
    customerTitle: '选择场地、主题和套餐',
    body: '家长先比较候选场地、套餐档位和可选附加服务，再提交报价需求。'
  },
  {
    id: 'submit',
    title: '提交派对需求',
    customerTitle: '提交派对需求',
    body: '需求会记录日期、人数、预算、餐饮、过敏、蛋糕和家长关注点，供团队复核。'
  },
  {
    id: 'review',
    title: '人工复核档期和限制',
    customerTitle: '人工复核档期和限制',
    body: '策划师会在正式报价前复核场地规则、最低消费、供应商档期和执行细节。'
  },
  {
    id: 'deposit',
    title: '确认后才进入订金准备',
    customerTitle: '确认后才进入订金准备',
    body: '当前不会扣款。只有正式报价被接受后，订金步骤才有意义。'
  }
]

export const getParentTrustFaq = () => parentTrustFaq.map((item) => ({ ...item }))
export const getTrustChecklist = () => [...trustChecklist]
export const getQuoteProcessSteps = () => quoteProcessSteps.map((item) => ({ ...item }))
