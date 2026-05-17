# Party Event Multi-Model Virtual Agents Bridge V1

Date: 2026-05-18

Scope: dry-run skeleton for two internal Party Event skills:

1. Virtual company employee skill.
2. Virtual consumer simulation skill.

## Design Principle

OpenAI / Codex remains the highest-level reviewer and final synthesis layer. This repository does not add a separate OpenAI API call.

Gemini and Kimi are represented as external model adapters, but this V1 keeps them in mock/dry-run mode. Their API keys may only be read from environment variables:

- `GEMINI_API_KEY`
- `KIMI_API_KEY`

If the variables are missing, the system enters mock mode and still passes dry-run validation.

## Why This Exists

The owner has repeatedly found issues that prior virtual-user tests should have caught:

- missing or unreachable routes
- incomplete navigation
- missing return buttons
- English text in Chinese mode
- raw i18n keys such as `tiers.heading`
- text overflow
- cards or buttons that look clickable but do not work
- content being removed instead of properly translated

The multi-model bridge does not solve these issues by itself. It makes the review process stricter by requiring primary/challenger findings, a Codex judge layer, and evidence fields that prove what was checked.

## Implemented Skeleton

Files:

- `tools/agent-multimodel/providers/openaiCodexPrimary.js`
- `tools/agent-multimodel/providers/geminiProvider.js`
- `tools/agent-multimodel/providers/kimiProvider.js`
- `tools/agent-multimodel/providers/mockProvider.js`
- `tools/agent-multimodel/modelRouter.js`
- `tools/agent-multimodel/agentRoleMatrix.js`
- `tools/agent-multimodel/personaModelMatrix.js`
- `tools/agent-multimodel/evidenceSchema.js`
- `tools/agent-multimodel/runDryCase.js`

No frontend runtime, backend runtime, payment, webhook, n8n, or production deploy code was changed.

## Virtual Company Employee Role Matrix

| Role | Primary | Challenger | Judge | Responsibility |
|---|---|---|---|---|
| `ceo_strategy_owner` | `openai_codex` | `gemini` | `openai_codex` | Strategy, product direction, launch risk, resource priority |
| `product_manager` | `openai_codex` | `kimi` | `openai_codex` | User journey, feature priority, requirement breakdown, acceptance criteria |
| `ux_ui_designer` | `gemini` | `openai_codex` | `openai_codex` | Screenshot observation, overflow, layout, card clickability, page trust |
| `frontend_engineer` | `openai_codex` | `gemini` | `openai_codex` | Vue components, routes, CSS, button behavior, build, console errors |
| `qa_tester` | `gemini` | `openai_codex` | `openai_codex` | Real Chrome, page-by-page, button-by-button, copy, screenshot and DOM evidence |
| `localization_reviewer` | `kimi` | `openai_codex` | `openai_codex` | Chinese naturalness, multilingual residue, system keys, English technical terms |
| `security_compliance_reviewer` | `openai_codex` | `gemini` | `openai_codex` | Payment, privacy, external APIs, safety boundaries, production risk |
| `marketing_growth_reviewer` | `kimi` | `openai_codex` | `openai_codex` | Chinese parents, Xiaohongshu, sharing vouchers, promotion copy, conversion path |

## Virtual Consumer Persona Matrix

| Persona | Primary | Challenger | Judge |
|---|---|---|---|
| `au_english_parent` | `openai_codex` | `gemini` | `openai_codex` |
| `chinese_parent` | `kimi` | `openai_codex` | `openai_codex` |
| `korean_parent` | `openai_codex` | `gemini` | `openai_codex` |
| `arabic_rtl_parent` | `openai_codex` | `gemini` | `openai_codex` |
| `visual_quality_sensitive_parent` | `gemini` | `openai_codex` | `openai_codex` |
| `price_sensitive_parent` | `kimi` | `openai_codex` | `openai_codex` |
| `high_income_quality_parent` | `gemini` | `openai_codex` | `openai_codex` |
| `low_tech_confidence_parent` | `openai_codex` | `kimi` | `openai_codex` |

## Evidence Schema

Every employee or consumer result must include:

```json
{
  "run_id": "string",
  "skill_type": "virtual_employee | virtual_consumer",
  "persona_or_role_id": "string",
  "model_primary": "openai_codex | gemini | kimi | mock",
  "model_challenger": "openai_codex | gemini | kimi | mock",
  "model_judge": "openai_codex",
  "route_checked": [],
  "actions_taken": [
    {
      "page": "string",
      "action": "click | type | scan | observe",
      "selector_or_label": "string",
      "expected_result": "string",
      "actual_result": "string",
      "result": "success | failed | blocked"
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
  "final_verdict": "string",
  "severity": "P0 | P1 | P2 | OK"
}
```

## Required Test Discipline

Future virtual agents must check:

1. Navigation bar is complete.
2. Return/back path works.
3. Chinese mode has no English residue except intentional brand or technical terms.
4. Raw i18n keys are not visible.
5. Long English/Chinese text does not overflow cards.
6. Images, cards, buttons, and CTAs are clickable where they appear clickable.
7. CTA target route matches user expectation.
8. Quote page clearly says human review is required.
9. Payment readiness page clearly says no money is charged.
10. Sharing voucher rules are understandable.
11. Every issue has a screenshot path or DOM excerpt.

## Dry-Run

Command:

```bash
node tools/agent-multimodel/runDryCase.js /tmp/party_event_multimodel_virtual_agents_v1
```

Expected result:

- dry-run output JSON under `/tmp/party_event_multimodel_virtual_agents_v1/`
- `external_api_called=false`
- `env_file_read=false`
- `production_env_read=false`
- Gemini/Kimi mock mode if keys are absent
- employee and consumer evidence records validate against schema

## Safety Confirmation

This V1:

- does not read `.env.production`
- does not hardcode API keys
- does not call Gemini or Kimi
- does not call OpenAI API
- does not contact suppliers or customers
- does not trigger payment, webhook, n8n, messaging, deploy, or production systems
- does not modify customer-facing runtime

## Next Step

Connect `tools/agent-multimodel/` to the actual virtual consumer browser runner. The runner should fail if a virtual tester does not produce schema-valid evidence for each required journey node.
