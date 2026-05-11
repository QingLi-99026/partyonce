# Party Event / 派对活动 Stage 2 Sprint 6B Admin Order Dependency Regression Report

## Scope

Sprint 6B validates the Admin Order dependency chain after these local commits:

```text
4152ad499ec7ce643d15e338e701ee4a4aac00cb
Add admin quote to draft order flow

787f462e90429cb90d1efb372332f701cb4183a5
Add admin order queue and detail skeleton
```

No business code was changed in this sprint.

## Static Checks

Passed:

```text
node --check frontend/vue-app/src/mock/adminOrders.js
node --check frontend/vue-app/src/services/adminOrderService.js
node --check frontend/vue-app/src/router/index.js
Vue SFC parse frontend/vue-app/src/views/AdminOrders.vue
Vue SFC parse frontend/vue-app/src/views/AdminOrderDetail.vue
Vue SFC parse frontend/vue-app/src/views/AdminQuoteDetail.vue
```

## Browser Regression Method

- Local frontend dev server: `http://127.0.0.1:3016`
- Browser automation: locally installed Playwright dependency
- Admin auth: browser localStorage fixture only
- API behavior: local route mocks only
- No package install, production build, production database, deployment, payment, webhook/n8n, or outbound messaging.

## Browser Routes Tested

```text
/admin/orders
/admin/orders/backend-order-sprint6b-unknown
/admin/quotes/quote-accepted-sprint6b
/admin/orders/order-sprint6b-created
```

## Regression Result

Result: `pass`

Confirmed:

```text
/admin/orders loads Order Review.
Order Queue falls back to localStorage/mock data when local API is unavailable.
/admin/orders/backend-order-sprint6b-unknown generates a valid fallback detail record instead of null.
Accepted Quote Detail can click Create Draft Order.
POST /orders returns 201 through local route mock.
Successful creation navigates to /admin/orders/order-sprint6b-created.
Created Order Detail shows order number, quote number, customer, event info, amount, status=draft, and local/staging safety copy.
```

## POST /orders Summary

```text
POST http://127.0.0.1:8000/orders
status: 201
quote_id: quote-accepted-sprint6b
event_date: 2026-07-12
event_location: Sprint 6B Local Party Room
```

This call was fulfilled by a browser route mock. No real backend, database, payment, webhook/n8n, or outbound system was contacted.

## Evidence Paths

```text
/tmp/party-event-sprint6b-admin-order-regression/01-admin-orders-fallback-queue.png
/tmp/party-event-sprint6b-admin-order-regression/02-admin-order-detail-unknown-fallback.png
/tmp/party-event-sprint6b-admin-order-regression/03-quote-create-draft-order-result.png
/tmp/party-event-sprint6b-admin-order-regression/sprint6b-result.json
```

These are local evidence artifacts and must not be staged.

## Console Summary

Errors:

```text
Two net::ERR_CONNECTION_REFUSED entries occurred while intentionally simulating unavailable local Order API reads for fallback validation.
```

Warnings:

```text
Historical NavHeader warnings for unresolved Party / Magic icons.
Historical NavHeader UserFilled render warning.
```

These warnings are outside Sprint 6B scope and did not block regression.

## Protected Files / Systems

Not touched:

```text
frontend/vue-app/.env.production
frontend/vue-app/dist
node_modules
test_evidence
.DS_Store
backend/main.py
backend/migrations
```

Not triggered:

```text
payment
Stripe
webhook
n8n
email
SMS
WhatsApp
WeChat
WeCom
deployment
push
```

## Blockers

No Sprint 6B regression blocker remains.

Known non-blocking issues:

```text
Historical NavHeader icon/UserFilled warnings.
Historical dirty files remain in the worktree and must stay excluded from staging.
```

## Recommendation

Sprint 6B is ready for limited App review. If accepted, the next small sprint should address either:

```text
1. NavHeader historical warnings cleanup, or
2. Admin Order status update regression evidence, still local-only and without payment/webhook/n8n/deployment.
```
