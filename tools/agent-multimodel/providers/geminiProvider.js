'use strict';

const GEMINI_PROVIDER = {
  id: 'gemini',
  displayName: 'Gemini visual and QA challenger',
  envKey: 'GEMINI_API_KEY',
  defaultMode: 'mock_without_key',
  externalApiCalledByDefault: false
};

function getProviderStatus() {
  return {
    provider: GEMINI_PROVIDER.id,
    env_key_name: GEMINI_PROVIDER.envKey,
    api_key_present: Boolean(process.env[GEMINI_PROVIDER.envKey]),
    mock_mode: !process.env[GEMINI_PROVIDER.envKey],
    external_api_called: false,
    live_smoke_requires_owner_approval: true
  };
}

async function review(input = {}, options = {}) {
  const status = getProviderStatus();
  if (!options.allowLiveApi) {
    return {
      ...status,
      mode: 'dry_run_mock',
      summary: 'Gemini adapter stayed in mock mode. No external API call was made.',
      findings: [
        {
          severity: 'P1',
          category: 'visual_acceptance',
          finding: 'Check screenshots for missing navigation, raw i18n keys, mixed-language copy, overflow, unclickable cards, and weak CTA hierarchy.'
        }
      ],
      input_scope: {
        role_or_persona: input.role_id || input.persona_id || input.persona_or_role_id || 'unknown',
        routes: input.route_checked || []
      }
    };
  }

  throw new Error('Gemini live API smoke is blocked in V1. Owner approval gate is required before enabling.');
}

module.exports = {
  GEMINI_PROVIDER,
  getProviderStatus,
  review
};
