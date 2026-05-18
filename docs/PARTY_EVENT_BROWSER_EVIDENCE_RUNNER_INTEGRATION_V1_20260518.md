# Party Event Browser Evidence Runner Integration V1

Date: 2026-05-18

## Current Runner Status

Status: **Partial**

The runner is implemented and validates no-URL fail-closed behavior. A full real-URL browser evidence run was not completed in this pass because no existing local Party Event dev/preview server was reachable during the check, and this task did not authorize production deploy or external preview redeploy.

## Supported Inputs

The runner supports:

```bash
PARTY_EVENT_APP_URL=http://127.0.0.1:3000 node tools/agent-multimodel/runBrowserEvidenceCase.js
```

```bash
node tools/agent-multimodel/runBrowserEvidenceCase.js --url=http://127.0.0.1:3000
```

```bash
node tools/agent-multimodel/runBrowserEvidenceCase.js \
  --url=http://127.0.0.1:3000 \
  --out=/tmp/party_event_browser_evidence_runner_v1
```

## No-URL Fail-Closed Result

Command:

```bash
node tools/agent-multimodel/runBrowserEvidenceCase.js --out=/tmp/party_event_browser_evidence_runner_v1_no_url
```

Result:

```json
{
  "version": "party_event_browser_evidence_runner_v1",
  "dry_run": true,
  "blocked": true,
  "blocker": "No app URL provided. Use PARTY_EVENT_APP_URL or --url=http://127.0.0.1:<port>.",
  "external_api_called": false,
  "gemini_api_called": false,
  "kimi_api_called": false,
  "env_file_read": false,
  "production_env_read": false
}
```

Evidence:

```text
/tmp/party_event_browser_evidence_runner_v1_no_url/browser_evidence_summary.json
```

## Planned Routes For Real URL Runs

When a URL is provided, the runner checks:

- `/`
- `/themes`
- `/themes/castle-princess`
- `/packages`
- `/venue-finder`
- `/quote`
- `/my/quotes`
- `/my/orders`
- `/my/rewards`
- `/share`
- `/payment/deposit`

## Checks Per Page

Each route checks:

- HTTP / SPA accessibility
- non-empty page body
- navigation presence
- primary CTA presence
- Chinese-mode English residue
- raw i18n key pattern such as `tiers.heading`
- internal technical words such as `staging`, `fixture`, `skeleton`, `webhook`, `n8n`, `PaymentIntent`, `Stripe`, `localStorage`, `sessionStorage`
- visible text overflow candidates
- broken images
- console errors
- key clickability using Playwright trial clicks for selected route-specific labels

## Evidence Outputs

For real URL runs, the runner writes:

- `browser_evidence_summary.json`
- `multimodel_browser_evidence_result.json`
- `screenshots/*.png`
- `dom/*.json`
- `failures[]` inside the summary if any route fails checks

The summary embeds a record shaped by `tools/agent-multimodel/evidenceSchema.js` using:

- `model_primary: mock`
- `model_challenger: mock`
- `model_judge: openai_codex`

## Real URL Run

Real URL run completed: **No**

Reason: no local dev/preview URL was reachable during this clean integration pass. Checked common local ports without finding an active app server. The runner is ready for a real URL run once owner starts or approves a local dev server.

## Safety Confirmation

- Gemini API called: **No**
- Kimi API called: **No**
- `.env.production` read: **No**
- External business system triggered: **No**
- Payment / Stripe / PaymentIntent triggered: **No**
- Webhook / n8n triggered: **No**
- Email / SMS / WhatsApp / Slack triggered: **No**
- Production deploy triggered: **No**
- `git add` / commit / push: **No**

## Gemini / Kimi Smoke Recommendation

Should this enter Gemini/Kimi smoke next: **No**

Reason: the browser evidence runner should first complete at least one full real-URL local run and produce stable schema-valid evidence. Gemini/Kimi smoke can be considered after the local evidence pipeline is proven and owner separately approves live model API use.

## Next Step

Owner can approve a local real-URL browser evidence gate:

```bash
cd frontend/vue-app
npm run dev -- --host 127.0.0.1 --port 5186
```

Then run:

```bash
PARTY_EVENT_APP_URL=http://127.0.0.1:5186 \
node tools/agent-multimodel/runBrowserEvidenceCase.js \
  --out=/tmp/party_event_browser_evidence_runner_v1_real_url
```
