'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { agentRoleMatrix } = require('./agentRoleMatrix');
const { personaModelMatrix } = require('./personaModelMatrix');
const { createEvidenceRecord, validateEvidenceRecord } = require('./evidenceSchema');
const { getProviderStatuses, runPrimaryAndChallenger } = require('./modelRouter');

async function main() {
  const outputDir = process.argv[2] || path.join(os.tmpdir(), 'party_event_multimodel_agent_bridge_v1');
  fs.mkdirSync(outputDir, { recursive: true });

  const employeeCase = agentRoleMatrix.find((item) => item.role_id === 'qa_tester');
  const consumerCase = personaModelMatrix.find((item) => item.persona_id === 'chinese_parent');
  const routeSet = ['/', '/themes/castle-princess', '/venue-finder', '/quote', '/payment/deposit'];

  const employeeModelResult = await runPrimaryAndChallenger({
    run_id: 'dryrun-employee-qa-001',
    skill_type: 'virtual_employee',
    role_id: employeeCase.role_id,
    persona_or_role_id: employeeCase.role_id,
    model_primary: employeeCase.primary,
    model_challenger: employeeCase.challenger,
    model_judge: employeeCase.judge,
    route_checked: routeSet
  });

  const consumerModelResult = await runPrimaryAndChallenger({
    run_id: 'dryrun-consumer-zh-001',
    skill_type: 'virtual_consumer',
    persona_id: consumerCase.persona_id,
    persona_or_role_id: consumerCase.persona_id,
    model_primary: consumerCase.primary,
    model_challenger: consumerCase.challenger,
    model_judge: consumerCase.judge,
    route_checked: routeSet
  });

  const employeeEvidence = createEvidenceRecord({
    run_id: 'dryrun-employee-qa-001',
    skill_type: 'virtual_employee',
    persona_or_role_id: employeeCase.role_id,
    model_primary: employeeCase.primary,
    model_challenger: employeeCase.challenger,
    model_judge: employeeCase.judge,
    route_checked: routeSet,
    actions_taken: [
      {
        page: '/quote',
        action: 'click',
        selector_or_label: '获取人工复核报价',
        expected_result: 'Quote page explains human review and does not imply immediate payment.',
        actual_result: 'Dry-run skeleton only; real browser click evidence is required in acceptance runs.',
        result: 'blocked'
      }
    ],
    primary_model_findings: employeeModelResult.primary_result.findings || [],
    challenger_model_findings: employeeModelResult.challenger_result.findings || [],
    final_verdict: 'Dry-run employee QA evidence schema works. Real browser evidence is still required for acceptance.',
    severity: 'P1'
  });

  const consumerEvidence = createEvidenceRecord({
    run_id: 'dryrun-consumer-zh-001',
    skill_type: 'virtual_consumer',
    persona_or_role_id: consumerCase.persona_id,
    model_primary: consumerCase.primary,
    model_challenger: consumerCase.challenger,
    model_judge: consumerCase.judge,
    route_checked: routeSet,
    actions_taken: [
      {
        page: '/themes/castle-princess',
        action: 'scan',
        selector_or_label: 'package tier cards',
        expected_result: 'Chinese mode should show Chinese package tier names and descriptions with no raw i18n keys.',
        actual_result: 'Dry-run skeleton only; DOM text evidence is required in acceptance runs.',
        result: 'blocked'
      }
    ],
    primary_model_findings: consumerModelResult.primary_result.findings || [],
    challenger_model_findings: consumerModelResult.challenger_result.findings || [],
    final_verdict: 'Dry-run consumer evidence schema works. Chinese UI leakage checks must be backed by DOM text and screenshot evidence.',
    severity: 'P1'
  });

  const result = {
    version: 'party_event_multimodel_agent_bridge_v1',
    dry_run: true,
    external_api_called: false,
    env_file_read: false,
    production_env_read: false,
    provider_statuses: getProviderStatuses(),
    matrices: {
      virtual_employee_roles: agentRoleMatrix.length,
      virtual_consumer_personas: personaModelMatrix.length
    },
    evidence_validation: {
      employee: validateEvidenceRecord(employeeEvidence),
      consumer: validateEvidenceRecord(consumerEvidence)
    },
    records: [employeeEvidence, consumerEvidence],
    safety: {
      real_customer_data_sent: false,
      payment_triggered: false,
      webhook_triggered: false,
      n8n_triggered: false,
      messaging_triggered: false,
      production_deploy_triggered: false
    }
  };

  const outputPath = path.join(outputDir, 'multimodel_agent_bridge_dryrun_result.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, output_path: outputPath, external_api_called: false }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
