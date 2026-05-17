'use strict';

const agentRoleMatrix = [
  {
    role_id: 'ceo_strategy_owner',
    primary: 'openai_codex',
    challenger: 'gemini',
    task: 'Strategic judgment, commercial priority, launch risk'
  },
  {
    role_id: 'product_manager',
    primary: 'openai_codex',
    challenger: 'kimi',
    task: 'Product journey, user needs, feature priority'
  },
  {
    role_id: 'ux_ui_designer',
    primary: 'gemini',
    challenger: 'openai_codex',
    task: 'Screenshots, layout, overflow, clickability, visual trust'
  },
  {
    role_id: 'frontend_engineer',
    primary: 'openai_codex',
    challenger: 'gemini',
    task: 'Routes, components, CSS, build, interaction bugs'
  },
  {
    role_id: 'qa_tester',
    primary: 'gemini',
    challenger: 'openai_codex',
    task: 'Page-by-page, button-by-button, copy-by-copy, DOM and screenshot evidence'
  },
  {
    role_id: 'localization_reviewer',
    primary: 'kimi',
    challenger: 'openai_codex',
    task: 'Chinese naturalness, multilingual copy, localization residue'
  },
  {
    role_id: 'security_compliance_reviewer',
    primary: 'openai_codex',
    challenger: 'gemini',
    task: 'Payment, privacy, API, external systems, safety boundaries'
  },
  {
    role_id: 'marketing_growth_reviewer',
    primary: 'kimi',
    challenger: 'openai_codex',
    task: 'Chinese parent market, Xiaohongshu, sharing vouchers, conversion copy'
  }
];

module.exports = {
  agentRoleMatrix
};
