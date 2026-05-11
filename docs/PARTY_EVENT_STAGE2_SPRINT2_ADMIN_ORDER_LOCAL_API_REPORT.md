# Party Event / 派对活动 Stage 2 Sprint 2 Admin Order Local API Report

Date: 2026-05-11

## 1. Scope

Sprint 2 connected the Admin Order Queue / Detail local UI skeleton to the safe local backend Order API surface while preserving the Sprint 1 localStorage mock fallback.

This sprint did not implement production Order UX, payment, Stripe, webhook/n8n, outbound messaging, real database migration, or deployment.

## 2. Real Working Directory

```text
/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce
```

## 3. API Skeleton Paths

The frontend now targets the existing Stage 2 backend Order skeleton paths through `apiClient`:

```text
GET /api/orders
GET /api/orders/{order_id}
PATCH /api/orders/{order_id}
```

Frontend API helper calls are made as:

```text
apiClient.get('/orders')
apiClient.get(`/orders/${orderId}`)
apiClient.patch(`/orders/${order.id}`, { status })
```

No new backend code was required because `backend/main.py` already contains the Stage 2 Order API skeleton committed in:

```text
41a0c05e7317af887a4c8fb204471ac4e07e28b7
Add order API skeleton
```

## 4. Frontend Fallback Design

Added service:

```text
frontend/vue-app/src/services/adminOrderService.js
```

Behavior:

```text
Try local backend Order API first.
Normalize backend response into the Admin Order UI shape.
If the API is unavailable or rejects the request, fall back to browser localStorage mock records.
Return a data source label: local API or fallback mock.
Keep status updates local-only when fallback is active.
If an API status update fails, fall back to localStorage status update.
```

Admin Order Queue now displays current data source:

```text
local API
fallback mock
```

Admin Order Detail also displays current data source and a fallback notice when local backend API is unavailable.

## 5. Files Added

```text
frontend/vue-app/src/services/adminOrderService.js
docs/PARTY_EVENT_STAGE2_SPRINT2_ADMIN_ORDER_LOCAL_API_REPORT.md
```

## 6. Files Modified

```text
frontend/vue-app/src/views/AdminOrders.vue
frontend/vue-app/src/views/AdminOrderDetail.vue
/Users/aiagentkevin/Documents/New project 2/handoff/party-event/CLI_PROGRESS_LATEST.md
```

No router or NavHeader change was required in Sprint 2.

No backend file was modified.

## 7. Page Behavior

### /admin/orders

Now:

```text
loads Order queue via GET /api/orders when the safe local backend is available
falls back to localStorage mock records when unavailable
shows data source in the page alert and summary cards
supports search and status filter
supports status updates via PATCH /api/orders/{order_id} when API is active
falls back to localStorage status updates if PATCH fails
continues to block payment, webhook/n8n, and outbound messaging
```

### /admin/orders/:orderId

Now:

```text
loads Order detail via GET /api/orders/{order_id} when the safe local backend is available
falls back to localStorage mock detail when unavailable
shows linked quote, customer, event, amount, deposit placeholder, next action, internal note, status flow, and line items
supports status update through PATCH /api/orders/{order_id} when API is active
falls back to localStorage status update if PATCH fails
keeps payment/deposit capture blocked
```

## 8. Local-Only Safety Boundary

This sprint did not:

```text
read or modify frontend/vue-app/.env.production
modify frontend/vue-app/dist
modify node_modules
modify test_evidence
modify .DS_Store
run npm install
run production build
create real database migration
connect production database
trigger Stripe/payment
create PaymentIntent
create checkout session
trigger webhook/n8n
send email/SMS/WhatsApp
send WeChat or WeCom messages
deploy
push
stage files
commit files
```

The UI still clearly marks itself as local/staging skeleton and blocks external actions.

## 9. Tests And Checks

Commands run:

```text
node --check frontend/vue-app/src/services/adminOrderService.js
node --check frontend/vue-app/src/mock/adminOrders.js
node --check frontend/vue-app/src/router/index.js
node -e require('./frontend/vue-app/node_modules/@vue/compiler-sfc') parse AdminOrders.vue and AdminOrderDetail.vue
git diff --check for Sprint 2 files
```

Results:

```text
adminOrderService.js -> pass
adminOrders.js -> pass
router/index.js -> pass
AdminOrders.vue SFC parse -> pass
AdminOrderDetail.vue SFC parse -> pass
git diff --check -> pass
```

No browser route acceptance was run in this sprint.

No backend server was started.

## 10. Current Blockers

Current blockers:

```text
Real browser acceptance for /admin/orders and /admin/orders/:orderId is still pending.
Safe local backend profile must be running for local API mode.
Admin auth fixture may be required because routes use requiresAuth and requiresAdmin.
Create Draft Order from Admin Quote Detail is still not implemented.
Payment/deposit flow remains blocked.
Webhook/n8n/outbound messaging remains blocked.
```

## 11. Current Risks

Risks:

```text
Fallback mock data can diverge from local backend data during manual demos.
Users may misread fallback mock records as persistent backend records if they ignore the data source label.
Existing repository dirty state remains high risk for accidental staging.
Do not use git add .
```

## 12. Suggested Whitelist Staging

If Sprint 2 is accepted, whitelist staging should include only:

```text
frontend/vue-app/src/services/adminOrderService.js
frontend/vue-app/src/views/AdminOrders.vue
frontend/vue-app/src/views/AdminOrderDetail.vue
docs/PARTY_EVENT_STAGE2_SPRINT2_ADMIN_ORDER_LOCAL_API_REPORT.md
```

If Sprint 1 has not yet been staged, also include its required files:

```text
frontend/vue-app/src/mock/adminOrders.js
frontend/vue-app/src/router/index.js
frontend/vue-app/src/components/NavHeader.vue
docs/PARTY_EVENT_STAGE2_SPRINT1_ADMIN_ORDER_QUEUE_DETAIL_REPORT.md
```

Do not stage:

```text
frontend/vue-app/.env.production
frontend/vue-app/dist
.DS_Store
node_modules
test_evidence
.playwright-cli
backend/main.py
backend/migrations
payment files
webhook/n8n files
historical dirty files
```

## 13. Next Step Recommendation

Recommended next step:

```text
Sprint 2 App review and browser/local route acceptance.
```

Acceptance should verify:

```text
/admin/orders route loads
/admin/orders/:orderId route loads
page shows data source local API when safe backend is available
page shows fallback mock when backend is unavailable
status update works in both modes
no payment, webhook/n8n, or outbound action is triggered
```

After App review, the next build step should be:

```text
Sprint 3: Admin Quote Detail -> Create Draft Order action, guarded to accepted Quotes only.
```

Sprint 3 must still block payment, deployment, production configuration, webhook/n8n, and outbound messaging.

## 14. App Review Recommendation

Recommendation:

```text
Ready for limited internal App review after route browser acceptance.
```

Review scope should be limited to:

```text
Admin Order Queue
Admin Order Detail
local API vs fallback mock source labeling
status update UX
blocked payment/external action boundaries
```

Do not treat this as production readiness review.
