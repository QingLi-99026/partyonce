'use strict';

const personaModelMatrix = [
  {
    persona_id: 'au_english_parent',
    primary: 'openai_codex',
    challenger: 'gemini'
  },
  {
    persona_id: 'chinese_parent',
    primary: 'kimi',
    challenger: 'openai_codex'
  },
  {
    persona_id: 'korean_parent',
    primary: 'openai_codex',
    challenger: 'gemini'
  },
  {
    persona_id: 'arabic_rtl_parent',
    primary: 'openai_codex',
    challenger: 'gemini'
  },
  {
    persona_id: 'visual_quality_sensitive_parent',
    primary: 'gemini',
    challenger: 'openai_codex'
  },
  {
    persona_id: 'price_sensitive_parent',
    primary: 'kimi',
    challenger: 'openai_codex'
  },
  {
    persona_id: 'high_income_quality_parent',
    primary: 'gemini',
    challenger: 'openai_codex'
  },
  {
    persona_id: 'low_tech_confidence_parent',
    primary: 'openai_codex',
    challenger: 'kimi'
  }
];

module.exports = {
  personaModelMatrix
};
