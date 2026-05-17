# Party Event Multi-Model Agent Bridge V1

Date: 2026-05-18

Scope: local/staging-only multi-model bridge for Party Event virtual employee and virtual consumer review.

## Purpose

This work adds a local dry-run framework for cross-checking Party Event virtual employee reviews and virtual consumer simulations with model-role routing.

The immediate product reason is concrete: prior virtual-user passes missed issues that owner later found manually, including missing/blocked routes, English residue in Chinese mode, raw i18n keys such as `tiers.heading`, layout problems, and missing click-through validation. Future virtual-user testing must prove it inspected pages and actions, not just route status.

## Current Multi-Model State

Before this V1:

- Virtual user/persona reports existed.
- Browser dry-run evidence existed in prior test folders.
- Gemini/Kimi were mentioned as possible external assistants.
- There was no unified model router or provider adapter layer in this repository.
- There was no standard schema for primary/challenger findings, disagreements, screenshots, DOM evidence, and final severity.

Current state after this V1: local dry-run skeleton installed. Real Gemini/Kimi API calls remain disabled.

## Files Added

- `tools/agent-multimodel/providers/openaiCodexPrimary.js`
- `tools/agent-multimodel/providers/geminiProvider.js`
- `tools/agent-multimodel/providers/kimiProvider.js`
- `tools/agent-multimodel/providers/mockProvider.js`
- `tools/agent-multimodel/modelRouter.js`
- `tools/agent-multimodel/agentRoleMatrix.js`
- `tools/agent-multimodel/personaModelMatrix.js`
- `tools/agent-multimodel/evidenceSchema.js`
- `tools/agent-multimodel/runDryCase.js`
- `docs/PARTY_EVENT_MULTI_MODEL_AGENT_BRIDGE_AUDIT_V1_20260518.md`
- `docs/PARTY_EVENT_MULTI_MODEL_AGENT_BRIDGE_V1_20260518.md`

No Party Event frontend or backend runtime code was modified.

## Model Roles

### OpenAI / Codex

Role: primary reviewer, final synthesizer, safety gate, and owner-facing judgment.

Implementation note: `openaiCodexPrimary.js` does not call OpenAI API. It only marks the current Codex session as the primary review layer.

### Gemini

Role: visual QA, screenshot/layout challenger, clickability and overflow reviewer.

Implementation note: `geminiProvider.js` checks `GEMINI_API_KEY` presence through `process.env`, but defaults to mock mode and does not call any external API in V1.

### Kimi

Role: localization, Chinese-market copy, long-context survey reasoning, parent-market nuance.

Implementation note: `kimiProvider.js` checks `KIMI_API_KEY` presence through `process.env`, but defaults to mock mode and does not call any external API in V1.

## Virtual Employee Model Matrix

| Role | Primary | Challenger | Focus |
|---|---|---|---|
| `ceo_strategy_owner` | OpenAI/Codex | Gemini | Strategy, commercial priority, launch risk |
| `product_manager` | OpenAI/Codex | Kimi | Product path, user needs, feature priority |
| `ux_ui_designer` | Gemini | OpenAI/Codex | Screenshots, layout, overflow, clickability, visual trust |
| `frontend_engineer` | OpenAI/Codex | Gemini | Routes, components, CSS, build, interaction bugs |
| `qa_tester` | Gemini | OpenAI/Codex | Page-by-page, button-by-button, copy, DOM/screenshot evidence |
| `localization_reviewer` | Kimi | OpenAI/Codex | Chinese naturalness, multilingual copy, localization residue |
| `security_compliance_reviewer` | OpenAI/Codex | Gemini | Payment, privacy, API, external systems |
| `marketing_growth_reviewer` | Kimi | OpenAI/Codex | Chinese parents, Xiaohongshu, sharing vouchers, conversion copy |

## Virtual Consumer Model Matrix

| Persona | Primary | Challenger |
|---|---|---|
| `au_english_parent` | OpenAI/Codex | Gemini |
| `chinese_parent` | Kimi | OpenAI/Codex |
| `korean_parent` | OpenAI/Codex | Gemini |
| `arabic_rtl_parent` | OpenAI/Codex | Gemini |
| `visual_quality_sensitive_parent` | Gemini | OpenAI/Codex |
| `price_sensitive_parent` | Kimi | OpenAI/Codex |
| `high_income_quality_parent` | Gemini | OpenAI/Codex |
| `low_tech_confidence_parent` | OpenAI/Codex | Kimi |

## Evidence Schema

Every future virtual employee or virtual consumer acceptance record must include:

```json
{
  "run_id": "...",
  "skill_type": "virtual_employee | virtual_consumer",
  "persona_or_role_id": "...",
  "model_primary": "...",
  "model_challenger": "...",
  "route_checked": ["/", "/quote", "/packages"],
  "actions_taken": [
    {
      "page": "/quote",
      "action": "click",
      "selector_or_label": "获取人工复核报价",
      "result": "success | failed"
    }
  ],
  "visible_copy_checks": {
    "raw_i18n_key_found": false,
    "english_residue_found_in_zh": false,
    "technical_terms_exposed": [],
    "overflow_detected": false,
    "unclickable_elements": []
  },
  "screenshots": [],
  "dom_evidence": [],
  "primary_model_findings": [],
  "challenger_model_findings": [],
  "disagreements": [],
  "final_verdict": "...",
  "severity": "P0 | P1 | P2 | OK"
}
```

## Mandatory Test Standard

Virtual testers must not pass a page because HTTP 200 works. Each route and journey node must check:

1. Navigation bar completeness.
2. Back button or return path clickability.
3. Chinese mode English residue.
4. Raw i18n keys such as `tiers.heading`.
5. Long text overflow in cards and buttons.
6. Image/card/button clickability.
7. CTA target route and downstream context.
8. Quote page clarity that a human review is required.
9. Payment readiness page clarity that no charge is taken.
10. Sharing voucher rule clarity.
11. Screenshot or DOM evidence for every issue.

Any issue later found manually by owner but missed by virtual users must be recorded as a QA process defect.

## Dry-Run Result

Dry-run command:

```bash
node tools/agent-multimodel/runDryCase.js /tmp/party_event_multimodel_agent_bridge_v1
```

Expected output:

- `/tmp/party_event_multimodel_agent_bridge_v1/multimodel_agent_bridge_dryrun_result.json`
- `dry_run=true`
- `external_api_called=false`
- `env_file_read=false`
- `production_env_read=false`
- Gemini/Kimi stay in mock mode unless future owner approval enables live API smoke.

## Future Gemini/Kimi API Smoke

Future live smoke must be a separate owner-approved gate:

1. Owner provides sandbox test keys through environment variables only.
2. Do not read `.env.production`.
3. Use synthetic screenshots or synthetic DOM excerpts only.
4. Do not send real customer, supplier, payment, or private data.
5. Log model name, request category, redaction status, and response evidence.
6. Disable live mode immediately after the smoke test.

## Safety Boundary Confirmation

This V1:

- Did not read or modify `.env.production`.
- Did not hardcode API keys.
- Did not call Gemini, Kimi, OpenAI, payment, webhook, n8n, email, SMS, WhatsApp, or deployment systems.
- Did not modify frontend or backend product code.
- Did not connect this bridge to customer-facing runtime.

## Recommendation

Continue: Yes.

Next implementation should connect this bridge to the local virtual-user/acceptance scripts so every future survey run produces schema-valid evidence and records primary/challenger model disagreements. Do not enable live external model APIs until owner separately approves a live API smoke gate.
