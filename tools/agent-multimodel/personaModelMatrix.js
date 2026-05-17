'use strict';

const personaModelMatrix = [
  {
    persona_id: 'au_english_parent',
    primary: 'openai_codex',
    challenger: 'gemini',
    judge: 'openai_codex'
  },
  {
    persona_id: 'chinese_parent',
    primary: 'kimi',
    challenger: 'openai_codex',
    judge: 'openai_codex'
  },
  {
    persona_id: 'korean_parent',
    primary: 'openai_codex',
    challenger: 'gemini',
    judge: 'openai_codex'
  },
  {
    persona_id: 'arabic_rtl_parent',
    primary: 'openai_codex',
    challenger: 'gemini',
    judge: 'openai_codex'
  },
  {
    persona_id: 'visual_quality_sensitive_parent',
    primary: 'gemini',
    challenger: 'openai_codex',
    judge: 'openai_codex'
  },
  {
    persona_id: 'price_sensitive_parent',
    primary: 'kimi',
    challenger: 'openai_codex',
    judge: 'openai_codex'
  },
  {
    persona_id: 'high_income_quality_parent',
    primary: 'gemini',
    challenger: 'openai_codex',
    judge: 'openai_codex'
  },
  {
    persona_id: 'low_tech_confidence_parent',
    primary: 'openai_codex',
    challenger: 'kimi',
    judge: 'openai_codex'
  }
];

module.exports = {
  personaModelMatrix
};
