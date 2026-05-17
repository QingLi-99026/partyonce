'use strict';

const OPENAI_CODEX_PROVIDER = {
  id: 'openai_codex',
  displayName: 'OpenAI / Codex primary reviewer',
  mode: 'primary_orchestrator',
  externalApiCalled: false,
  notes: [
    'This provider marks the current Codex session as the primary reviewer.',
    'It does not call the OpenAI API from this repository.',
    'Codex remains responsible for final synthesis, safety gates, and owner-facing recommendations.'
  ]
};

async function review(input) {
  return {
    provider: OPENAI_CODEX_PROVIDER.id,
    mode: OPENAI_CODEX_PROVIDER.mode,
    mock_mode: false,
    external_api_called: false,
    summary: 'Codex primary review placeholder. Final judgment is produced by the active Codex session.',
    input_scope: {
      role_or_persona: input.role_id || input.persona_id || input.persona_or_role_id || 'unknown',
      routes: input.route_checked || []
    },
    findings: [
      {
        severity: 'P1',
        category: 'qa_process',
        finding: 'Virtual testing must include route, click, copy, screenshot, DOM evidence, and downstream checks, not HTTP 200 alone.'
      }
    ]
  };
}

module.exports = {
  OPENAI_CODEX_PROVIDER,
  review
};
