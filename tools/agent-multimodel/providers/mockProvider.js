'use strict';

async function review(input = {}) {
  const subject = input.role_id || input.persona_id || input.persona_or_role_id || 'unknown';
  return {
    provider: 'mock',
    mode: 'dry_run',
    mock_mode: true,
    external_api_called: false,
    summary: `Mock challenger review for ${subject}.`,
    findings: [
      {
        severity: 'P1',
        category: 'evidence_required',
        finding: 'Every virtual tester must attach route, click result, screenshot or DOM evidence for each claim.'
      }
    ]
  };
}

module.exports = {
  review
};
