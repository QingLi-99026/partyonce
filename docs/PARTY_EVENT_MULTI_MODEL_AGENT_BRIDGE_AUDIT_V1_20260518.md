# Party Event Multi-Model Agent Bridge Audit V1

Date: 2026-05-18

Scope: Party Event / PartyOnce repository review for virtual employee, virtual consumer, and model-adapter readiness.

Safety boundary:
- No `.env.production` was read or modified.
- No Gemini, Kimi, OpenAI, n8n, webhook, payment, messaging, or deployment API was called.
- No customer data, supplier private data, payment data, or production data was sent externally.
- This audit is local repository inspection only.

## Current Findings

### Virtual employee / virtual consumer assets

The repository already contains substantial virtual user and survey artifacts under `docs/` and `test_evidence_track/`, including:

- `docs/PARTY_EVENT_AU_PARENT_VIRTUAL_USER_SURVEY_AND_PERSONAS_V1.md`
- `docs/PARTY_EVENT_AU_PARENT_VIRTUAL_USER_SURVEY_INPUT_V1.json`
- `docs/PARTY_EVENT_AU_PARENT_VIRTUAL_USER_SURVEY_RESULTS_V1.md`
- `docs/PARTY_EVENT_AU_PARENT_PERSONA_BASED_SURVEY_RESULTS_V2.md`
- `docs/PARTY_EVENT_30_PERSONA_CONSUMER_SURVEY_RESULTS_20260517.md`
- `docs/PARTY_EVENT_30_PERSONA_APP_USABILITY_TEST_RESULTS_20260517.md`
- `docs/PARTY_EVENT_VIRTUAL_USER_SIMULATION_REVIEW_V2.md`
- `docs/PARTY_EVENT_VIRTUAL_USER_SIMULATION_REVIEW_V3.md`
- `test_evidence_track/virtual_user_simulation_v2/full_journey_dryrun.cjs`

These artifacts define persona panels, survey results, and browser dry-run evidence. They already recognize a key process defect: virtual testers must not only check HTTP 200; they must check real user-facing copy, route continuity, screenshots, DOM text, clickability, raw i18n keys, and downstream context.

### Existing model provider integration

Searches found references to Gemini/Kimi/OpenAI in reports and safety notes, but no unified local model adapter layer in this repository for:

- OpenAI / Codex primary reviewer metadata
- Gemini challenger adapter
- Kimi challenger adapter
- model routing by virtual employee role
- model routing by virtual consumer persona
- normalized evidence schema with primary/challenger findings and disagreements

Current state: Partial. The product process has virtual-user documents and dry-run scripts, but does not yet have a reusable multi-model bridge for role/persona review.

### Current dual-entry / multi-model state

The virtual-user process is document-driven and script-driven. It is not yet consistently multi-model:

- There is no central provider status object.
- There is no explicit mock mode when `GEMINI_API_KEY` or `KIMI_API_KEY` is absent.
- There is no standard disagreement record between primary and challenger models.
- There is no enforced schema that requires screenshots or DOM evidence for each issue.
- There is no local guard that prevents external model calls unless owner explicitly approves a live API smoke.

## Recommendation

Proceed with a small local `tools/agent-multimodel/` bridge:

1. Keep Codex/OpenAI as the primary reviewer and final synthesizer without adding an OpenAI API call.
2. Add Gemini and Kimi provider adapters that default to mock mode unless a future owner-approved live smoke explicitly enables them.
3. Add virtual employee and consumer model matrices.
4. Add an evidence schema that forces page, action, route, copy, screenshot/DOM, primary finding, challenger finding, disagreement, severity, and final verdict fields.
5. Use this bridge to strengthen future virtual-user skills so missed owner-discovered issues become QA process defects.

## Readiness Verdict

Worth continuing: Yes.

Current multi-model integration: Partial.

Risk: Low for local dry-run adapter skeleton. Medium only when future live Gemini/Kimi API calls are enabled, which must stay behind owner approval.
