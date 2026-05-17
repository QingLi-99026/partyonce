'use strict';

const { review: codexReview } = require('./providers/openaiCodexPrimary');
const geminiProvider = require('./providers/geminiProvider');
const kimiProvider = require('./providers/kimiProvider');
const mockProvider = require('./providers/mockProvider');

const providers = {
  openai_codex: {
    id: 'openai_codex',
    review: codexReview
  },
  gemini: {
    id: 'gemini',
    review: geminiProvider.review,
    getProviderStatus: geminiProvider.getProviderStatus
  },
  kimi: {
    id: 'kimi',
    review: kimiProvider.review,
    getProviderStatus: kimiProvider.getProviderStatus
  },
  mock: {
    id: 'mock',
    review: mockProvider.review
  }
};

function getProvider(id) {
  return providers[id] || providers.mock;
}

function getProviderStatuses() {
  return {
    openai_codex: {
      provider: 'openai_codex',
      current_session_primary: true,
      external_api_called: false
    },
    gemini: geminiProvider.getProviderStatus(),
    kimi: kimiProvider.getProviderStatus()
  };
}

async function runPrimaryAndChallenger(input, options = {}) {
  const primary = getProvider(input.model_primary || input.primary || 'openai_codex');
  const challenger = getProvider(input.model_challenger || input.challenger || 'mock');
  const primaryResult = await primary.review(input, options);
  const challengerResult = await challenger.review(input, options);

  return {
    dry_run: true,
    external_api_called: false,
    primary: primary.id,
    challenger: challenger.id,
    primary_result: primaryResult,
    challenger_result: challengerResult,
    disagreement_policy: 'Record material disagreements and require Codex final synthesis before fixer work.',
    safety: {
      env_file_read: false,
      production_env_read: false,
      customer_private_data_sent: false,
      payment_triggered: false,
      webhook_triggered: false,
      messaging_triggered: false,
      production_deploy_triggered: false
    }
  };
}

module.exports = {
  getProvider,
  getProviderStatuses,
  runPrimaryAndChallenger
};
