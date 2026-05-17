# Party Event Multi-Model Virtual Agents Audit V1

Date: 2026-05-18

Scope: codebase audit for Party Event virtual company employee and virtual consumer simulation skills.

Safety boundary:
- `.env.production` was not read or modified.
- No production deploy, payment, webhook, n8n, email, SMS, WhatsApp, Slack, supplier contact, or external model API was triggered.
- No real customer, payment, or supplier-private information was sent externally.

## Audit Questions

### 1. Virtual company employee / agency agents

Result: Partial.

The repository contains product, QA, marketing, release, and virtual-user reports, but there is no product-runtime "virtual company employee skill" module with explicit multi-role model routing. The closest existing assets are:

- `docs/PARTY_EVENT_TEAM_CLOSED_LOOP_FULL_DESKTOP_TEST_20260515.md`
- `docs/PARTY_EVENT_MARKETING_IMPROVEMENT_PLAN.md`
- `docs/PARTY_EVENT_RELEASE_CANDIDATE_NEXT_STEPS_CONTROL_REPORT_20260517.md`
- prior Bridge-side Agency skills in the broader local workspace

Gap: role review exists as documentation and process, but not as a reusable Party Event local skeleton with primary/challenger/judge model routing and evidence schema.

### 2. Virtual consumer / persona simulation

Result: Yes, but evidence quality must be strengthened.

The repository has substantial virtual consumer assets:

- `docs/PARTY_EVENT_AU_PARENT_VIRTUAL_USER_SURVEY_AND_PERSONAS_V1.md`
- `docs/PARTY_EVENT_AU_PARENT_VIRTUAL_USER_SURVEY_INPUT_V1.json`
- `docs/PARTY_EVENT_AU_PARENT_PERSONA_BASED_SURVEY_RESULTS_V2.md`
- `docs/PARTY_EVENT_30_PERSONA_CONSUMER_SURVEY_RESULTS_20260517.md`
- `docs/PARTY_EVENT_30_PERSONA_APP_USABILITY_TEST_RESULTS_20260517.md`
- `docs/PARTY_EVENT_VIRTUAL_USER_SIMULATION_REVIEW_V2.md`
- `docs/PARTY_EVENT_VIRTUAL_USER_SIMULATION_REVIEW_V3.md`
- `test_evidence_track/virtual_user_simulation_v2/full_journey_dryrun.cjs`

Gap: the process has missed owner-visible defects. Future runs need enforced node-by-node journey checks, screenshots or DOM evidence for every issue, raw i18n key detection, Chinese-mode English residue checks, overflow checks, unclickable element checks, and downstream route verification.

### 3. Gemini / Kimi / Moonshot / model provider / LLM router

Result: Newly partial after commit `7d0236de`.

Before the recent bridge work, searches found Gemini/Kimi references in docs, but not a unified provider layer. The current local skeleton now exists under:

- `tools/agent-multimodel/providers/geminiProvider.js`
- `tools/agent-multimodel/providers/kimiProvider.js`
- `tools/agent-multimodel/providers/openaiCodexPrimary.js`
- `tools/agent-multimodel/modelRouter.js`

Gemini and Kimi remain mock/dry-run only unless a future owner-approved API smoke enables live mode.

### 4. Existing evidence / report / QA / browser testing structure

Result: Yes.

The repository has many QA reports and some browser dry-run evidence scripts. However, evidence is not yet normalized under a single schema requiring:

- route checked
- action taken
- selector or label
- expected result
- actual result
- success / failed / blocked
- screenshot evidence
- DOM evidence
- primary model findings
- challenger model findings
- disagreements
- judge verdict

### 5. Current multi-model or dual-model status

Result: Partial.

Current state after the bridge skeleton:

- Codex/OpenAI is represented as the primary reviewer and final judge.
- Gemini and Kimi provider skeletons exist.
- No external model API is called.
- Matrices now define primary/challenger/judge.
- Evidence schema now includes `model_judge`.

Remaining gap: these skeletons are not yet wired into the actual virtual consumer browser runner or a Bridge skill endpoint for Party Event.

## Biggest Gap

The biggest gap is not model availability. It is test discipline.

Future virtual agents must prove that they inspected every workflow node. A test cannot pass because a page returns HTTP 200. It must capture evidence for navigation, back path, language, raw i18n key, overflow, clickability, downstream page, quote wording, payment-readiness wording, sharing voucher clarity, console errors, page errors, and broken images.

## Worth Continuing

Yes.

This is worth continuing because it directly addresses owner-observed QA misses. The next step should connect the local multi-model skeleton to the browser acceptance runner and make schema-valid evidence mandatory before any Fixer work starts.
