# Party Event / 派对活动 Stage 2 Git Hygiene and Backend/API Readiness Checklist

Date: 2026-05-12

## Scope

This pass is a git hygiene and readiness decision pass after the Stage 2 Local Alpha management loop.

No business code was modified.

No staging, commit, push, deployment, production configuration change, payment, webhook, n8n, outbound message, production database migration, or external system action was performed.

## Current Local Alpha Status

The Party Event / 派对活动 Stage 2 Local Alpha management loop is now auditable as a local-only workflow:

```text
Admin Quote Detail
-> Create Draft Order
-> Admin Order Queue / Detail
-> Order status update fallback evidence
-> NavHeader warning cleanup
```

Current boundaries remain:

```text
Local-only / staging-only
No real payment
No Stripe execution
No webhook / n8n
No email / SMS / WhatsApp / WeChat / WeCom
No production database
No production migration
No deployment
No push
No .env.production handling
No frontend/vue-app/dist staging
```

## Relevant Commit Chain

### 4152ad499ec7ce643d15e338e701ee4a4aac00cb

Message:

```text
Add admin quote to draft order flow
```

Files:

```text
docs/PARTY_EVENT_STAGE2_SPRINT4_ADMIN_QUOTE_CREATE_DRAFT_ORDER_REPORT.md
docs/PARTY_EVENT_STAGE2_SPRINT5_CREATE_DRAFT_ORDER_BROWSER_EVIDENCE_REPORT.md
frontend/vue-app/src/services/adminOrderService.js
frontend/vue-app/src/views/AdminQuoteDetail.vue
```

### 787f462e90429cb90d1efb372332f701cb4183a5

Message:

```text
Add admin order queue and detail skeleton
```

Files:

```text
docs/PARTY_EVENT_STAGE2_SPRINT1_ADMIN_ORDER_QUEUE_DETAIL_REPORT.md
docs/PARTY_EVENT_STAGE2_SPRINT2_ADMIN_ORDER_LOCAL_API_REPORT.md
docs/PARTY_EVENT_STAGE2_SPRINT3_ADMIN_ORDER_FALLBACK_BROWSER_REPORT.md
docs/PARTY_EVENT_STAGE2_SPRINT4_5_STAGING_READINESS_REPORT.md
frontend/vue-app/src/components/NavHeader.vue
frontend/vue-app/src/mock/adminOrders.js
frontend/vue-app/src/router/index.js
frontend/vue-app/src/views/AdminOrderDetail.vue
frontend/vue-app/src/views/AdminOrders.vue
```

### f78c1b940726248922604cc1a2819631810005bb

Message:

```text
Add admin order status regression evidence
```

Files:

```text
docs/PARTY_EVENT_STAGE2_ADMIN_ORDER_STATUS_UPDATE_REGRESSION_REPORT.md
```

### a9ab2c40bc33a8845946702328040c417aad1611

Message:

```text
Add stage 2 management loop closeout
```

Files:

```text
docs/PARTY_EVENT_STAGE2_MANAGEMENT_LOOP_CLOSEOUT_REPORT.md
```

### ac12fb33456063b4f14e1db3b841426c0fda7236

Message:

```text
Clean up NavHeader icon warnings
```

Files:

```text
docs/PARTY_EVENT_STAGE2_NAVHEADER_WARNING_CLEANUP_REPORT.md
frontend/vue-app/src/components/NavHeader.vue
```

## Evidence-only Documents Still Untracked

### docs/PARTY_EVENT_STAGE2_SPRINT6A_ADMIN_ORDER_DEPENDENCY_STAGING_READINESS_REPORT.md

Status:

```text
Exists: yes
Git state: untracked
Type: evidence / staging readiness report
Business code: no
```

Checks:

```text
git diff --check: no whitespace errors reported for the target evidence docs
Sensitive content: no secret, password, token, production env value, or production URL found
```

Notes:

The document mentions `.env.production`, webhook, n8n, and payment only as blocked or forbidden items. It does not contain `.env.production` content.

Recommendation:

```text
Recommend whitelist staging as evidence-only documentation.
```

### docs/PARTY_EVENT_STAGE2_SPRINT6B_ADMIN_ORDER_DEPENDENCY_REGRESSION_REPORT.md

Status:

```text
Exists: yes
Git state: untracked
Type: evidence / regression report
Business code: no
```

Checks:

```text
git diff --check: no whitespace errors reported for the target evidence docs
Sensitive content: no secret, password, token, production env value, or production URL found
```

Notes:

The document contains localhost-only acceptance URLs and a local route mock request summary. These are evidence details, not production secrets or production endpoints.

Recommendation:

```text
Recommend whitelist staging as evidence-only documentation.
```

## Suggested Whitelist Staging

If owner approves evidence-only follow-up staging, use exactly:

```bash
git add docs/PARTY_EVENT_STAGE2_SPRINT6A_ADMIN_ORDER_DEPENDENCY_STAGING_READINESS_REPORT.md \
  docs/PARTY_EVENT_STAGE2_SPRINT6B_ADMIN_ORDER_DEPENDENCY_REGRESSION_REPORT.md
```

Do not use:

```bash
git add .
```

## Forbidden Staging

Continue to exclude:

```text
frontend/vue-app/.env.production
frontend/vue-app/dist
.DS_Store
node_modules
test_evidence
.playwright-cli
/tmp evidence artifacts
backend/main.py
backend/migrations
payment / Stripe files
webhook / n8n files
production database files
historical dirty files
```

## Backend/API Integration Readiness Checklist

Before moving from local-only / fallback mock into real backend/API integration, the following conditions should be reviewed and accepted.

### API Contract

- Confirm canonical Order API paths and payloads.
- Confirm whether the Stage 2 Order API uses `/api/orders` or another versioned namespace.
- Confirm request / response shape for list, detail, create draft from Quote, and status update.
- Confirm error shape for validation, not found, auth denied, and unsafe transition.

### Auth / Admin Fixture

- Confirm admin / manager auth mechanism for local, staging, and future production.
- Confirm whether browser localStorage admin fixtures are allowed only for local acceptance.
- Confirm anonymous users cannot create or mutate Orders.
- Confirm supplier and customer roles cannot access admin Order endpoints during this phase.

### Order Lifecycle

- Confirm allowed local lifecycle states.
- Confirm initial state for draft Orders created from accepted Quotes.
- Confirm blocked transitions, especially payment-adjacent states.
- Confirm whether cancellation and completion are allowed in skeleton phase.

### Quote -> Order Conversion

- Confirm only accepted Quote can create draft Order.
- Confirm Quote must be persistent and linked to Lead / Customer.
- Confirm duplicate draft Order behavior for the same Quote.
- Confirm converted Quote state handling remains separate from payment.

### Status Update

- Confirm admin / manager only mutation.
- Confirm allowed status transitions.
- Confirm local-only fallback behavior remains visible when API fails.
- Confirm no status update triggers payment, webhook, n8n, or outbound notification.

### Persistence

- Confirm storage target before implementation.
- Confirm local SQLite or staging DB profile before writing persistent API code.
- Confirm no production DB connection is used.
- Confirm restart persistence acceptance criteria.

### Error Handling

- Confirm frontend fallback rules for API unavailable, 404, 403, and validation errors.
- Confirm no UI path can render null Order detail after failed PATCH.
- Confirm user-facing safety copy remains visible.
- Confirm backend errors do not trigger external actions.

### Payment Boundary

- Confirm Order skeleton does not create PaymentIntent, checkout session, or real deposit workflow.
- Confirm `pending_deposit` remains a business state only until owner approves payment phase.
- Confirm Stripe test mode work is deferred to a separate approved sprint.

### Webhook / n8n Boundary

- Confirm no webhook, n8n, or outbound automation runs during real backend/API integration.
- Confirm future webhook/n8n work requires dry-run evidence and owner approval.

### Migration Boundary

- Confirm no production migration is run.
- Confirm local/staging migration target is approved before execution.
- Confirm rollback plan exists before persistent Order schema changes.
- Confirm migration artifacts are reviewed separately from API behavior.

### Rollback Plan

- Confirm a file-level rollback path for frontend and backend changes.
- Confirm DB rollback or local DB reset plan for local/staging only.
- Confirm no rollback action affects production systems.

### Browser Acceptance

- Confirm real browser route acceptance for:
  - Admin Quote Detail
  - Create Draft Order
  - Admin Order Queue
  - Admin Order Detail
  - Status update
- Confirm screenshots / snapshots are stored outside staged forbidden evidence directories unless explicitly approved.
- Confirm console and request summaries are captured.

### Release Readiness

- Confirm no `dist` staging.
- Confirm no `.env.production` changes.
- Confirm no push or deployment.
- Confirm historical dirty files remain excluded.
- Confirm whitelist staging and staged safety checks are performed before every commit.

## Current P0 Assessment

No current P0 blocker is identified for documentation hygiene.

The two untracked Sprint 6A / 6B documents are relevant evidence-only docs and are suitable for owner-approved whitelist staging.

## Next Recommendation

Recommended next step:

```text
Run single-purpose whitelist staging + commit for the two Sprint 6A / 6B evidence-only reports.
```

After that, run a backend/API integration checklist review before implementing any real Order backend/API integration.

