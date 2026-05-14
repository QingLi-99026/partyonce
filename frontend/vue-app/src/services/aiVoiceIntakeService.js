import {
  AI_CONCIERGE_QUOTE_PREFILL_KEY,
  AI_CONCIERGE_STORAGE_KEY,
  aiConciergeIntro,
  aiConciergeQuestions
} from '@/data/aiConciergeQuestions';
import {
  buildQuotePrefillPayload,
  recommendThemeAndPackage
} from '@/data/recommendationRules';

export const intakeSteps = aiConciergeQuestions;

export const voiceScripts = {
  welcome: `${aiConciergeIntro.greeting} ${aiConciergeIntro.subGreeting}`,
  quote:
    '我已经整理出主题、套餐、场地样板和咨询摘要。下一步可以进入报价页提交 inquiry，不会触发真实支付。',
  disabled: '语音提示已关闭，你仍然可以继续点击完成需求登记。'
};

export function scoreRecommendation(answers) {
  return recommendThemeAndPackage(answers);
}

export function buildQuotePrefill(answers, recommendation) {
  const prefill = buildQuotePrefillPayload(answers, recommendation);
  if (recommendation?.quote_ready_summary) {
    prefill.quote_ready_summary = recommendation.quote_ready_summary;
    prefill.aiRecommendation = {
      ...prefill.aiRecommendation,
      quote_ready_summary: recommendation.quote_ready_summary,
      free_text_analysis: recommendation.free_text_analysis || null,
      advisor_message: recommendation.advisor_message || null
    };
  }
  return prefill;
}

export function speakText(text, enabled = true) {
  if (!enabled) {
    return { ok: false, reason: 'voice_disabled' };
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { ok: false, reason: 'speech_synthesis_unavailable' };
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.04;
  window.speechSynthesis.speak(utterance);
  return { ok: true };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function saveIntakeForQuote(answers, recommendation) {
  const quotePrefill = buildQuotePrefill(answers, recommendation);
  const intakePayload = {
    answers,
    recommendation,
    quotePrefill,
    saved_at: new Date().toISOString(),
    boundary: 'local/staging AI Concierge only; no payment, webhook, n8n, or outbound message'
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AI_CONCIERGE_STORAGE_KEY, JSON.stringify(intakePayload));
    window.localStorage.setItem(AI_CONCIERGE_QUOTE_PREFILL_KEY, JSON.stringify(quotePrefill));
    window.sessionStorage.setItem(AI_CONCIERGE_QUOTE_PREFILL_KEY, JSON.stringify(quotePrefill));
  }

  return {
    ...quotePrefill,
    theme: quotePrefill.selection.themeId,
    tier: quotePrefill.selection.packageId
  };
}

export function readQuotePrefill() {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(AI_CONCIERGE_QUOTE_PREFILL_KEY)
    || window.localStorage.getItem(AI_CONCIERGE_QUOTE_PREFILL_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.source === 'ai_concierge' ? parsed : null;
  } catch (error) {
    return null;
  }
}
