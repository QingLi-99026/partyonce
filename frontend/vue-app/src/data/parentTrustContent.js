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
  'Human review before formal quote',
  'No instant payment from quote request',
  'Food and allergy notes must be confirmed',
  'Add-ons are optional and visible',
  'Staging demo data is clearly marked'
]

export const quoteProcessSteps = [
  {
    id: 'choose',
    title: 'Choose venue, theme and package',
    customerTitle: '选择场地、主题和套餐',
    body: 'Parents compare Venue Finder results, package tiers and optional add-ons before submitting a request.'
  },
  {
    id: 'submit',
    title: 'Submit party requirements',
    customerTitle: '提交派对需求',
    body: 'The inquiry captures date, guests, budget, food, allergy, cake and parent priority notes for review.'
  },
  {
    id: 'review',
    title: 'Planner reviews availability',
    customerTitle: '人工复核档期和限制',
    body: 'A human planner checks venue rules, minimum spend, supplier availability and execution details before a formal quote.'
  },
  {
    id: 'deposit',
    title: 'Deposit readiness after approval',
    customerTitle: '确认后才进入订金准备',
    body: 'Payment remains disabled in this preview. A deposit step only makes sense after the formal quote is accepted.'
  }
]

export const getParentTrustFaq = () => parentTrustFaq.map((item) => ({ ...item }))
export const getTrustChecklist = () => [...trustChecklist]
export const getQuoteProcessSteps = () => quoteProcessSteps.map((item) => ({ ...item }))
