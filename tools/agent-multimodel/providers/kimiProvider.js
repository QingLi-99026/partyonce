'use strict';

const KIMI_PROVIDER = {
  id: 'kimi',
  displayName: 'Kimi localization and long-context challenger',
  envKey: 'KIMI_API_KEY',
  defaultMode: 'mock_without_key',
  externalApiCalledByDefault: false
};

function getProviderStatus() {
  return {
    provider: KIMI_PROVIDER.id,
    env_key_name: KIMI_PROVIDER.envKey,
    api_key_present: Boolean(process.env[KIMI_PROVIDER.envKey]),
    mock_mode: !process.env[KIMI_PROVIDER.envKey],
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
      summary: 'Kimi adapter stayed in mock mode. No external API call was made.',
      findings: [
        {
          severity: 'P1',
          category: 'localization_acceptance',
          finding: 'Check Chinese, Korean, and Arabic screens for raw keys, English residue, untranslated package tiers, and missing culturally natural copy.'
        }
      ],
      input_scope: {
        role_or_persona: input.role_id || input.persona_id || input.persona_or_role_id || 'unknown',
        routes: input.route_checked || []
      }
    };
  }

  throw new Error('Kimi live API smoke is blocked in V1. Owner approval gate is required before enabling.');
}

module.exports = {
  KIMI_PROVIDER,
  getProviderStatus,
  review
};
