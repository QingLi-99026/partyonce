import {
  AI_CONCIERGE_QUOTE_PREFILL_KEY,
  AI_CONCIERGE_STORAGE_KEY
} from '@/data/aiConciergeQuestions';
import { buildQuotePrefillPayload, recommendThemeAndPackage } from '@/data/recommendationRules';
import { buildQuoteLineItemsFromSelection, summarizeQuoteLineItems } from '@/data/quoteLineItems';

export const INVESTOR_DEMO_STATE_KEY = 'partyonce_investor_guided_demo_v1';
export const INVESTOR_DEMO_INQUIRY_ID = 'investor-guided-demo-inquiry-v1';

const demoAnswers = {
  childAge: '6-8',
  eventDate: '2026-06-20',
  guestCount: '16-25',
  budgetRange: 'standard',
  area: 'Sydney CBD / Inner West',
  indoorOutdoor: 'indoor',
  themePreference: 'space',
  venueStatus: 'need_restaurant',
  scenePriorities: 'photo_arch',
  stylingPreference: 'balanced',
  customerName: 'Investor Demo Parent',
  customerContact: 'demo-parent@example.test'
};

const readArray = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeArray = (key, items) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(items));
};

export function buildInvestorDemoRecommendation() {
  const recommendation = recommendThemeAndPackage(demoAnswers);
  const quotePrefill = buildQuotePrefillPayload(demoAnswers, recommendation);
  return { answers: demoAnswers, recommendation, quotePrefill };
}

export function bootstrapInvestorCustomerFixture() {
  if (typeof window === 'undefined') return null;
  const customer = {
    id: 'customer-local-41',
    customer_fixture_id: 'customer-local-41',
    full_name: 'Ava Thompson',
    name: 'Ava Thompson',
    email: 'ava.parent@example.test',
    contact: 'ava.parent@example.test',
    role: 'customer',
    user_type: 'personal',
    fixture_scope: 'investor_demo_staging_only',
    customer_readonly_fixture: true
  };
  window.localStorage.setItem('userInfo', JSON.stringify(customer));
  window.localStorage.removeItem('token');
  return customer;
}

export function bootstrapInvestorAdminFixture() {
  if (typeof window === 'undefined') return null;
  const admin = {
    id: 'admin-investor-demo',
    full_name: 'Investor Demo Admin',
    name: 'Investor Demo Admin',
    email: 'admin.preview@example.test',
    role: 'admin',
    user_type: 'internal',
    fixture_scope: 'investor_demo_staging_only',
    admin_demo_fixture: true
  };
  window.localStorage.setItem('token', 'investor-demo-admin-fixture-token');
  window.localStorage.setItem('userInfo', JSON.stringify(admin));
  return admin;
}

export function seedInvestorAiInquiry() {
  if (typeof window === 'undefined') return null;
  const { answers, recommendation, quotePrefill } = buildInvestorDemoRecommendation();
  const demoLineItems = buildQuoteLineItemsFromSelection({
    packageData: { name: 'Standard experience package', price: 1430 },
    sceneData: { name: 'Restaurant A Private Dining', basePrice: 2600 },
    selectedAddons: ['cake', 'activity'],
    addons: [
      { id: 'cake', name: 'Theme cake / dessert table', price: 260 },
      { id: 'activity', name: 'Kids activity host', price: 320 }
    ],
    visualContext: recommendation.visualContext,
    packageExplanation: recommendation.packageExplanation
  });
  const demoLineItemSummary = summarizeQuoteLineItems(demoLineItems);
  window.localStorage.setItem(AI_CONCIERGE_STORAGE_KEY, JSON.stringify({
    answers,
    recommendation,
    quotePrefill,
    saved_at: new Date().toISOString(),
    boundary: 'investor guided demo only; no payment, webhook, n8n, or outbound message'
  }));
  window.localStorage.setItem(AI_CONCIERGE_QUOTE_PREFILL_KEY, JSON.stringify(quotePrefill));
  window.sessionStorage.setItem(AI_CONCIERGE_QUOTE_PREFILL_KEY, JSON.stringify(quotePrefill));

  const inquiry = {
    demoSeedId: INVESTOR_DEMO_INQUIRY_ID,
    source: 'ai_concierge',
    customerInfo: quotePrefill.customerInfo,
    selection: {
      ...quotePrefill.selection,
      addons: [
        { id: 'cake', name: 'Theme cake / dessert table', price: 260 },
        { id: 'activity', name: 'Kids activity host', price: 320 }
      ]
    },
    pricing: {
      packagePrice: 1430,
      sceneFee: 260,
      addonsTotal: 580,
      finalTotal: demoLineItemSummary.total,
      lineItems: demoLineItems,
      lineItemSummary: demoLineItemSummary,
      aiEstimate: quotePrefill.pricing
    },
    aiRecommendation: quotePrefill.aiRecommendation,
    submitTime: new Date().toISOString(),
    status: 'pending'
  };

  const existing = readArray('inquirySubmissions').filter((item) => item.demoSeedId !== INVESTOR_DEMO_INQUIRY_ID);
  writeArray('inquirySubmissions', [inquiry, ...existing]);
  return inquiry;
}

export function startInvestorGuidedDemo() {
  if (typeof window === 'undefined') return null;
  const customer = bootstrapInvestorCustomerFixture();
  const inquiry = seedInvestorAiInquiry();
  const state = {
    started_at: new Date().toISOString(),
    mode: 'staging_investor_guided_demo',
    customer_fixture_id: customer.id,
    inquiry_id: inquiry.demoSeedId,
    guardrails: [
      'No production deploy',
      'No Stripe live mode',
      'No PaymentIntent',
      'No webhook/n8n',
      'No outbound email/SMS/WhatsApp'
    ]
  };
  window.localStorage.setItem(INVESTOR_DEMO_STATE_KEY, JSON.stringify(state));
  return state;
}

export function clearInvestorGuidedDemo() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(INVESTOR_DEMO_STATE_KEY);
  window.localStorage.removeItem(AI_CONCIERGE_STORAGE_KEY);
  window.localStorage.removeItem(AI_CONCIERGE_QUOTE_PREFILL_KEY);
  window.sessionStorage.removeItem(AI_CONCIERGE_QUOTE_PREFILL_KEY);
  writeArray('inquirySubmissions', readArray('inquirySubmissions').filter((item) => item.demoSeedId !== INVESTOR_DEMO_INQUIRY_ID));
}
