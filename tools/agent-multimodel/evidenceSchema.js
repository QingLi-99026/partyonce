'use strict';

const severityValues = ['P0', 'P1', 'P2', 'OK'];
const skillTypeValues = ['virtual_employee', 'virtual_consumer'];

const requiredAcceptanceChecks = [
  'navigation_complete',
  'back_button_clickable',
  'zh_mode_no_english_residue',
  'raw_i18n_key_absent',
  'copy_no_overflow',
  'cards_buttons_clickable',
  'cta_downstream_correct',
  'quote_manual_review_clear',
  'payment_readiness_no_charge_clear',
  'sharing_voucher_rules_clear',
  'each_issue_has_dom_or_screenshot_evidence'
];

function createEvidenceRecord(input) {
  return {
    run_id: input.run_id,
    skill_type: input.skill_type,
    persona_or_role_id: input.persona_or_role_id,
    model_primary: input.model_primary,
    model_challenger: input.model_challenger,
    route_checked: input.route_checked || [],
    actions_taken: input.actions_taken || [],
    visible_copy_checks: {
      raw_i18n_key_found: false,
      english_residue_found_in_zh: false,
      technical_terms_exposed: [],
      overflow_detected: false,
      unclickable_elements: []
    },
    screenshots: input.screenshots || [],
    dom_evidence: input.dom_evidence || [],
    primary_model_findings: input.primary_model_findings || [],
    challenger_model_findings: input.challenger_model_findings || [],
    disagreements: input.disagreements || [],
    final_verdict: input.final_verdict || 'dry-run evidence schema generated',
    severity: input.severity || 'OK',
    required_acceptance_checks: requiredAcceptanceChecks
  };
}

function validateEvidenceRecord(record) {
  const errors = [];
  for (const field of [
    'run_id',
    'skill_type',
    'persona_or_role_id',
    'model_primary',
    'model_challenger',
    'route_checked',
    'actions_taken',
    'visible_copy_checks',
    'screenshots',
    'dom_evidence',
    'primary_model_findings',
    'challenger_model_findings',
    'disagreements',
    'final_verdict',
    'severity'
  ]) {
    if (!(field in record)) errors.push(`missing:${field}`);
  }

  if (!skillTypeValues.includes(record.skill_type)) errors.push('invalid:skill_type');
  if (!severityValues.includes(record.severity)) errors.push('invalid:severity');
  if (!Array.isArray(record.route_checked)) errors.push('invalid:route_checked');
  if (!Array.isArray(record.actions_taken)) errors.push('invalid:actions_taken');
  if (!record.visible_copy_checks || typeof record.visible_copy_checks !== 'object') errors.push('invalid:visible_copy_checks');

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  requiredAcceptanceChecks,
  createEvidenceRecord,
  validateEvidenceRecord
};
