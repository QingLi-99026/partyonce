# Party Event / 派对活动 Stage 2 Admin Order Status Update Regression Report

## Scope

This sprint only validates Admin Order Queue / Detail status update regression evidence.

No business code was changed. No staging, commit, push, deployment, payment, webhook/n8n, outbound messaging, production database migration, or production configuration action was performed.

## Method

- Local frontend dev server: `http://127.0.0.1:3017`
- Admin fixture: browser localStorage only
- Backend mode: local Order API intentionally unavailable
- Data mode: localStorage / mock fallback
- Browser automation: already-installed local Playwright dependency

## Routes Tested

```text
/admin/orders
/admin/orders/order-local-1001
```

## Status Update Result

Result: `pass`

Order:

```text
order id: order-local-1001
order number: PE-ORD-1001
customer: Ava Thompson
theme: Castle Princess
```

Status transition:

```text
before: draft
after: pending_deposit
persisted fallback status: pending_deposit
```

The update used fallback mock/localStorage storage because the local backend Order API was intentionally unavailable. The page remained valid after update and continued to display customer, event, status, and safety copy.

## Evidence Paths

```text
/tmp/party-event-admin-order-status-update-regression/01-admin-orders-fallback-queue.png
/tmp/party-event-admin-order-status-update-regression/02-order-detail-before-status-update.png
/tmp/party-event-admin-order-status-update-regression/03-order-detail-after-status-update.png
/tmp/party-event-admin-order-status-update-regression/status-update-result.json
```

These are local evidence artifacts and must not be staged.

## Request Summary

```text
GET /admin/orders
GET http://127.0.0.1:8000/orders?limit=100&offset=0
GET /admin/orders/order-local-1001
GET http://127.0.0.1:8000/orders/order-local-1001
```

The local API requests were intentionally refused to validate fallback behavior. No external service was contacted.

## Console Summary

Errors:

```text
Two expected net::ERR_CONNECTION_REFUSED entries from intentionally unavailable local Order API reads.
```

Warnings:

```text
Historical NavHeader Party / Magic unresolved component warnings.
Historical NavHeader UserFilled render warning.
```

These warnings did not block the status update regression.

## Static Checks

Passed:

```text
node --check frontend/vue-app/src/mock/adminOrders.js
node --check frontend/vue-app/src/services/adminOrderService.js
Vue SFC parse frontend/vue-app/src/views/AdminOrders.vue
Vue SFC parse frontend/vue-app/src/views/AdminOrderDetail.vue
```

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

No blocker remains for Admin Order status update fallback regression.

Known non-blocking issue:

```text
Historical NavHeader icon/UserFilled warnings remain outside this sprint.
```

## Recommendation

Ready for limited App review. Do not stage `/tmp` evidence artifacts.
