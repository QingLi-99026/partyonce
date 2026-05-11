# Party Event / 派对活动 Stage 2 Sprint 6A Admin Order Dependency Staging Readiness Report

## Scope

Sprint 6A reviews the dependency gap left after commit `4152ad499ec7ce643d15e338e701ee4a4aac00cb`:

1. `frontend/vue-app/src/services/adminOrderService.js` imports `@/mock/adminOrders`, but `frontend/vue-app/src/mock/adminOrders.js` was not part of the commit.
2. `frontend/vue-app/src/views/AdminQuoteDetail.vue` routes successful draft Order creation to `/admin/orders/:orderId`, but Admin Order Queue / Detail pages, router entries, and navigation entry were not part of the commit.

This sprint only performs whitelist staging readiness review. It does not run `git add`, commit, push, deploy, trigger payment, trigger webhook/n8n, send messages, or touch production configuration.

## Candidate Files

| File | Exists | Dependency Role | Recommendation |
| --- | --- | --- | --- |
| `frontend/vue-app/src/mock/adminOrders.js` | yes | Required by `adminOrderService.js`; provides local-only Order skeleton data, fallback persistence, status values, and blocked action labels. | include |
| `frontend/vue-app/src/views/AdminOrders.vue` | yes | Required Queue page for `/admin/orders`; shows API-first/fallback Order list and status updates. | include |
| `frontend/vue-app/src/views/AdminOrderDetail.vue` | yes | Required Detail page for `/admin/orders/:orderId`; target route after Create Draft Order succeeds. | include |
| `frontend/vue-app/src/router/index.js` | yes | Required routes for `/admin/orders` and `/admin/orders/:orderId`. | include |
| `frontend/vue-app/src/components/NavHeader.vue` | yes | Required navigation entry for Order Review. | include |
| `docs/PARTY_EVENT_STAGE2_SPRINT1_ADMIN_ORDER_QUEUE_DETAIL_REPORT.md` | yes | Documents local-only Queue / Detail skeleton. | include |
| `docs/PARTY_EVENT_STAGE2_SPRINT2_ADMIN_ORDER_LOCAL_API_REPORT.md` | yes | Documents local API-first/fallback bridge. | include |
| `docs/PARTY_EVENT_STAGE2_SPRINT3_ADMIN_ORDER_FALLBACK_BROWSER_REPORT.md` | yes | Documents fallback resilience and browser route acceptance. | include |
| `docs/PARTY_EVENT_STAGE2_SPRINT4_5_STAGING_READINESS_REPORT.md` | yes | Documents Sprint 4+5 staging readiness. | include |

## Check Results

Passed:

```text
node --check frontend/vue-app/src/mock/adminOrders.js
node --check frontend/vue-app/src/services/adminOrderService.js
node --check frontend/vue-app/src/router/index.js
Vue SFC parse frontend/vue-app/src/views/AdminOrders.vue
Vue SFC parse frontend/vue-app/src/views/AdminOrderDetail.vue
Vue SFC parse frontend/vue-app/src/views/AdminQuoteDetail.vue
git diff --check -- <candidate files>
```

## Safety Review

Search terms checked across candidate files:

```text
payment
PaymentIntent
Stripe
checkout
webhook
n8n
email
SMS
WhatsApp
WeChat
WeCom
.env.production
dist
migration
deploy
database
send
```

Findings:

- Candidate frontend files include only local-only safety copy, blocked action labels, mock fields such as `payment_reference: null`, and explicit statements that payment/webhook/n8n/outbound actions remain blocked.
- Candidate docs include boundary statements and forbidden staging lists.
- No candidate file adds real payment execution, Stripe execution, webhook/n8n execution, outbound messaging, production migration, `.env.production` handling, or `dist` handling.

## Recommended Staging Whitelist

Recommended for next owner-approved whitelist staging:

```text
frontend/vue-app/src/mock/adminOrders.js
frontend/vue-app/src/views/AdminOrders.vue
frontend/vue-app/src/views/AdminOrderDetail.vue
frontend/vue-app/src/router/index.js
frontend/vue-app/src/components/NavHeader.vue
docs/PARTY_EVENT_STAGE2_SPRINT1_ADMIN_ORDER_QUEUE_DETAIL_REPORT.md
docs/PARTY_EVENT_STAGE2_SPRINT2_ADMIN_ORDER_LOCAL_API_REPORT.md
docs/PARTY_EVENT_STAGE2_SPRINT3_ADMIN_ORDER_FALLBACK_BROWSER_REPORT.md
docs/PARTY_EVENT_STAGE2_SPRINT4_5_STAGING_READINESS_REPORT.md
```

## Exact Git Add Command If Approved

```bash
git add frontend/vue-app/src/mock/adminOrders.js \
  frontend/vue-app/src/views/AdminOrders.vue \
  frontend/vue-app/src/views/AdminOrderDetail.vue \
  frontend/vue-app/src/router/index.js \
  frontend/vue-app/src/components/NavHeader.vue \
  docs/PARTY_EVENT_STAGE2_SPRINT1_ADMIN_ORDER_QUEUE_DETAIL_REPORT.md \
  docs/PARTY_EVENT_STAGE2_SPRINT2_ADMIN_ORDER_LOCAL_API_REPORT.md \
  docs/PARTY_EVENT_STAGE2_SPRINT3_ADMIN_ORDER_FALLBACK_BROWSER_REPORT.md \
  docs/PARTY_EVENT_STAGE2_SPRINT4_5_STAGING_READINESS_REPORT.md
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
payment files
webhook/n8n files
historical dirty files
```

## Recommendation

Recommend owner approval for the next whitelist staging step. These nine candidate files close the missing Admin Order dependency chain required by commit `4152ad499ec7ce643d15e338e701ee4a4aac00cb`.
