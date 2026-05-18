# Party Event Browser Evidence Real URL Gate V1

Date: 2026-05-18

## Local URL

```text
http://127.0.0.1:5186
```

The local Vite dev server was started with:

```bash
npm run dev -- --host 127.0.0.1 --port 5186
```

No production deploy was performed.

## Runner Command

```bash
node tools/agent-multimodel/runBrowserEvidenceCase.js \
  --url=http://127.0.0.1:5186 \
  --out=/tmp/party_event_browser_evidence_real_url_gate_v1
```

## Checked Routes

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

Route count: 11

## Real Page Access

Real pages were opened by Chromium against the local URL. The runner captured screenshots and DOM summaries for each route.

Evidence path:

```text
/tmp/party_event_browser_evidence_real_url_gate_v1/
```

Primary summary:

```text
/tmp/party_event_browser_evidence_real_url_gate_v1/browser_evidence_summary.json
```

Screenshots:

```text
/tmp/party_event_browser_evidence_real_url_gate_v1/screenshots/
```

DOM evidence:

```text
/tmp/party_event_browser_evidence_real_url_gate_v1/dom/
```

## Click Checks

The runner performed Playwright trial-click checks for route-specific labels:

- `/themes`: theme/detail/selection labels
- `/themes/castle-princess`: back-to-theme and quote-related labels
- `/packages`: package selection labels
- `/quote`: consultation / quote submission labels
- `/share`: sharing / proof submission labels

Observed blocked click checks:

- `/themes`: expected “详情” label was not found.
- `/themes/castle-princess`: expected “返回主题” / “返回” labels were not found.
- `/quote`: “返回” existed but trial click was blocked by Playwright within timeout.

## Findings

Overall severity: P1

P0 count: 0

P1 route count: 11

P2 count: 0

### P1 Route Findings

| Route | Findings |
|---|---|
| `/` | internal terms found, overflow candidate detected |
| `/themes` | Chinese-mode English residue, overflow candidate, expected click label blocked/missing |
| `/themes/castle-princess` | overflow candidate, expected return label blocked/missing |
| `/packages` | Chinese-mode English residue, overflow candidate |
| `/venue-finder` | Chinese-mode English residue, overflow candidate |
| `/quote` | Chinese-mode English residue, overflow candidate, return click blocked |
| `/my/quotes` | Chinese-mode English residue, overflow candidate |
| `/my/orders` | Chinese-mode English residue, overflow candidate |
| `/my/rewards` | Chinese-mode English residue, overflow candidate |
| `/share` | Chinese-mode English residue, overflow candidate |
| `/payment/deposit` | Chinese-mode English residue, overflow candidate |

## Internal Words

Internal word detection was triggered on `/`.

The route sample includes investor/asset-style labels and English theme labels such as:

```text
SPACE EXPLORER
CASTLE PRINCESS
FOREST ADVENTURE
homepage_hero
OVERVIEW
Investor homepage hero
Package matrix
Basic / Standard / Premium
App mockup
```

These should be reviewed as customer-facing Chinese-mode copy defects, not as runtime crashes.

## Chinese English Residue

Chinese-mode English residue was detected across multiple routes. The most visible classes are:

- English theme names shown beside Chinese names.
- English investor asset labels.
- English package tier labels in some surfaces.
- English operational/status identifiers in customer workspace surfaces.

## Unclickable / Missing Expected Elements

The runner detected missing or blocked expected labels on:

- `/themes`
- `/themes/castle-princess`
- `/quote`

These should be reviewed by the next Fixer round. Some may be label mismatch rather than broken UI, but the evidence runner is intentionally strict so virtual testers do not silently skip workflow nodes.

## Text Overflow

The runner marked overflow candidates on all checked routes. These should be reviewed visually from screenshots before deciding whether each is a real UI defect or a false positive from hidden / measuring elements.

## Broken Images

No broken image summary blocker was reported in the top-level run output. Full per-route image details are in:

```text
/tmp/party_event_browser_evidence_real_url_gate_v1/browser_evidence_summary.json
```

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

## Recommendation

Do not proceed to Gemini/Kimi live smoke yet.

Recommended next step: create a narrow Fixer workpack for the P1 evidence from this real URL run, focusing on:

1. Chinese-mode English residue on home/theme/package/customer pages.
2. Customer-facing removal or localization of investor/asset labels.
3. Expected route labels for `/themes`, `/themes/castle-princess`, and `/quote`.
4. Visual review of overflow candidates before code changes.

After the Fixer round, re-run:

```bash
node tools/agent-multimodel/runBrowserEvidenceCase.js \
  --url=http://127.0.0.1:5186 \
  --out=/tmp/party_event_browser_evidence_real_url_gate_v1_recheck
```
