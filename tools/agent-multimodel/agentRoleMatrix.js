'use strict';

const agentRoleMatrix = [
  {
    role_id: 'ceo_strategy_owner',
    primary: 'openai_codex',
    challenger: 'gemini',
    judge: 'openai_codex',
    task: 'Strategic judgment, product direction, launch risk, resource priority'
  },
  {
    role_id: 'product_manager',
    primary: 'openai_codex',
    challenger: 'kimi',
    judge: 'openai_codex',
    task: 'User journey, feature priority, requirement breakdown, acceptance criteria'
  },
  {
    role_id: 'ux_ui_designer',
    primary: 'gemini',
    challenger: 'openai_codex',
    judge: 'openai_codex',
    task: 'Screenshot observation, visual overflow, layout, card clickability, page trust'
  },
  {
    role_id: 'frontend_engineer',
    primary: 'openai_codex',
    challenger: 'gemini',
    judge: 'openai_codex',
    task: 'Vue components, routes, CSS, button behavior, build, console errors'
  },
  {
    role_id: 'qa_tester',
    primary: 'gemini',
    challenger: 'openai_codex',
    judge: 'openai_codex',
    task: 'Real Chrome, page-by-page, button-by-button, copy-by-copy, screenshot evidence, DOM evidence'
  },
  {
    role_id: 'localization_reviewer',
    primary: 'kimi',
    challenger: 'openai_codex',
    judge: 'openai_codex',
    task: 'Chinese naturalness, multilingual residue, system keys, exposed English technical terms'
  },
  {
    role_id: 'security_compliance_reviewer',
    primary: 'openai_codex',
    challenger: 'gemini',
    judge: 'openai_codex',
    task: 'Payment, privacy, external APIs, safety boundaries, production environment risk'
  },
  {
    role_id: 'marketing_growth_reviewer',
    primary: 'kimi',
    challenger: 'openai_codex',
    judge: 'openai_codex',
    task: 'Chinese parents, Xiaohongshu, sharing vouchers, promotion copy, conversion path'
  }
];

module.exports = {
  agentRoleMatrix
};
