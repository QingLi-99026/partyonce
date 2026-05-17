export const parentSocialProof = [
  {
    id: 'sample-inner-west-30',
    label: 'Staging sample',
    quote: 'For a 30-person family party, I would start with a private dining room, Standard package, simple host support and one photo-friendly upgrade.',
    parentProfile: 'Inner West parent · 30 guests · medium budget',
    trustNote: 'Sample wording for preview testing only; replace with real parent testimonials before public launch.'
  },
  {
    id: 'sample-low-stress',
    label: 'Staging sample',
    quote: 'The clearest part is seeing venue rules, add-ons and human review before any deposit step. That makes it feel safer than instant booking.',
    parentProfile: 'Busy parent · wants low-stress planning',
    trustNote: 'Sample wording for preview testing only; not a real customer review.'
  },
  {
    id: 'sample-visual-upgrade',
    label: 'Staging sample',
    quote: 'I can understand why photo zone, cake table and setup support cost extra because they are shown separately instead of hidden inside one vague package.',
    parentProfile: 'Parent comparing upgrades · wants better photos',
    trustNote: 'Sample wording for preview testing only; add verified reviews later.'
  }
]

export const popularFamilyChoices = [
  {
    id: 'standard-30-guests',
    title: 'Most practical starting point',
    familyProfile: '25-35 guests · medium budget · restaurant/private room',
    recommendedPackage: 'Standard package',
    addOns: ['Setup / pack-down', 'Cake or dessert table', 'Photo corner'],
    whyItWorks: 'Keeps the base package understandable while adding the services parents usually value most.'
  },
  {
    id: 'basic-budget-control',
    title: 'Budget-control path',
    familyProfile: '15-25 guests · simple venue · lower budget',
    recommendedPackage: 'Basic package',
    addOns: ['Balloon cluster', 'Simple cake table'],
    whyItWorks: 'Good when parents mainly need a neat setup and want to avoid a large styling spend.'
  },
  {
    id: 'premium-visual-event',
    title: 'High-impact photo path',
    familyProfile: '30-50 guests · milestone birthday · higher visual expectations',
    recommendedPackage: 'Premium package',
    addOns: ['Host / MC', 'Photo zone', 'Photography'],
    whyItWorks: 'Best when the family wants the party to feel polished, hosted and shareable.'
  }
]

export const getParentSocialProof = () => parentSocialProof.map((item) => ({ ...item }))
export const getPopularFamilyChoices = () => popularFamilyChoices.map((item) => ({
  ...item,
  addOns: [...item.addOns]
}))
