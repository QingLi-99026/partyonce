# Party Event / 派对活动 Remaining 30 Percent Order Skeleton Workpack

Date: 2026-05-12

## 1. Goal

This workpack advances Party Event / 派对活动 from:

```text
Lead -> Quote minimal closed loop available
```

to:

```text
Lead -> Quote -> accepted Quote -> Order skeleton local closed loop available
```

This is not a payment phase, deployment phase, webhook/n8n phase, supplier dispatch phase, contract phase, or production migration phase.

## 2. Actual Completed Scope

Completed in this pass:

```text
Quote acceptance hardening review
Order readiness plan
Order storage migration verification
Order API skeleton verification
Admin Order Queue / Detail local API verification
SQLite dry-run and data verification
backend restart persistence verification
browser route acceptance
final report
whitelist local commit
```

Business code changes:

```text
None required.
```

Reason:

```text
The existing Stage 2 Order skeleton implementation already covered the required API, migration, and Admin Order UI surfaces. This workpack performed hardening acceptance and added missing readiness/report documentation.
```

## 3. Modified / Added Files

Added:

```text
docs/PARTYONCE_STAGE2_ORDER_READINESS_PLAN_20260510.md
docs/PARTYONCE_REMAINING_30_PERCENT_ORDER_SKELETON_WORKPACK_20260510.md
```

Existing implementation verified:

```text
backend/main.py
backend/migrations/003_create_order_storage.sql
frontend/vue-app/src/services/adminOrderService.js
frontend/vue-app/src/views/AdminOrders.vue
frontend/vue-app/src/views/AdminOrderDetail.vue
frontend/vue-app/src/router/index.js
frontend/vue-app/src/components/NavHeader.vue
```

Not staged:

```text
backend/__pycache__/main.cpython-314.pyc
```

## 4. Quote Hardening Result

Verified:

```text
Lead can be created in local SQLite mode.
Quote must be created from a persistent Lead.
Quote can move draft -> accepted.
Invalid lead_id is rejected.
Anonymous Quote access is rejected.
Non-admin Quote access is rejected.
Quote persists after backend restart in prior Quote minimal loop acceptance.
Admin Quote Queue and Detail were already browser accepted in the Quote minimal loop workpack.
```

Current Quote-to-Order rule:

```text
Only accepted Quote can create an Order skeleton.
```

## 5. Order Readiness Conclusion

Order skeleton readiness is complete for local/staging.

Key rules:

```text
accepted Quote can create draft Order skeleton.
draft/sent/rejected/expired Quote cannot create Order.
Order skeleton is not payment.
pending_deposit is only a business status.
payment_reference remains empty.
No Stripe, webhook/n8n, or outbound messaging is triggered.
```

Readiness plan:

```text
docs/PARTYONCE_STAGE2_ORDER_READINESS_PLAN_20260510.md
```

## 6. Order Migration Result

Verified migration:

```text
backend/migrations/003_create_order_storage.sql
```

Migration scope:

```text
creates orders table only
depends on customers/leads/quotes
has quote_id foreign key
has lead_id foreign key
has customer_id foreign key
has unique order_number
has status CHECK constraint
has deposit_status CHECK constraint
keeps payment_reference as nullable placeholder
does not create payment, Stripe, webhook, n8n, supplier dispatch, contract, or outbound tables
```

SQLite dry-run:

```text
apply 001_create_lead_storage.sql: pass
apply 002_create_quote_storage.sql: pass
apply 003_create_order_storage.sql: pass
insert customer: pass
insert lead: pass
insert accepted quote: pass
insert order: pass
invalid quote_id rejected: pass
invalid status rejected: pass
```

Evidence:

```text
/tmp/partyonce_order_workpack_acceptance_initial.json
```

## 7. Order API Skeleton Result

Verified endpoints:

```text
POST  /api/orders
GET   /api/orders
GET   /api/orders/{order_id}
PATCH /api/orders/{order_id}
```

Verified behavior:

```text
POST /api/orders creates Order from accepted Quote.
GET /api/orders lists persisted Orders.
GET /api/orders/{id} reads persisted detail.
PATCH /api/orders/{id} updates allowed status.
draft Quote cannot create Order.
sent Quote cannot create Order.
rejected Quote cannot create Order.
expired Quote cannot create Order.
invalid quote_id is rejected.
anonymous access is rejected.
non-admin user access is rejected.
supplier access is rejected.
```

Created test Order:

```text
id=1002
order_number=O-20260511-5A58
status=pending_deposit
quote_id=1002
customer_id=1002
deposit_status=not_started
payment_reference=null
```

## 8. Admin Order Queue Result

Verified existing frontend surfaces:

```text
/admin/orders
/admin/orders/1002
```

Verified browser behavior:

```text
Admin Order Queue renders local API Order.
Admin Order Detail renders local API Order.
Data source shows local API.
Order detail displays blocked external actions.
No payment or outbound action is exposed as an enabled workflow.
```

Browser evidence:

```text
/tmp/partyonce_order_workpack_browser_acceptance.json
/tmp/partyonce_order_workpack_admin_orders.png
/tmp/partyonce_order_workpack_admin_order_detail.png
```

The `/tmp` artifacts are evidence only and must not be staged.

## 9. SQLite Acceptance Result

Safe local profile:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite:////tmp/partyonce_order_workpack_backend_dummy.sqlite
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_order_workpack.sqlite
backend host=127.0.0.1:18120
frontend host=127.0.0.1:18121
```

SQLite counts after acceptance:

```text
customers=6
leads=6
quotes=6
orders=2
```

The second Order row is the main API-created Order. The first Order row is the direct SQL dry-run row used to verify migration constraints.

## 10. Backend Restart Persistence

Backend was stopped and restarted using the same local SQLite files.

Restart evidence:

```text
/tmp/partyonce_order_workpack_restart_check.json
```

Result:

```text
admin login after restart: 200
GET /api/orders/1002 after restart: 200
Order row after restart: present
Order status after restart: pending_deposit
deposit_status after restart: not_started
payment_reference after restart: null
```

Conclusion:

```text
Order skeleton persists across backend restart.
```

## 11. Browser Acceptance

Browser acceptance passed:

```text
/admin/orders
/admin/orders/1002
```

Evidence:

```text
/tmp/partyonce_order_workpack_browser_acceptance.json
/tmp/partyonce_order_workpack_admin_orders.png
/tmp/partyonce_order_workpack_admin_order_detail.png
```

## 12. External Systems

Triggered external systems:

```text
No.
```

Not triggered:

```text
Stripe
payment
PaymentIntent
webhook
n8n
email
SMS
WhatsApp
WeChat
WeCom
production deployment
push
production database
production migration
supplier dispatch
contract signing
automatic review
```

## 13. Production / Build Artifacts

`.env.production`:

```text
Not read.
Not modified.
Not staged.
```

`frontend/vue-app/dist`:

```text
Not handled.
Not modified.
Not staged.
```

Other forbidden artifacts:

```text
node_modules not staged.
test_evidence not staged.
.DS_Store not staged.
backend/__pycache__ not staged.
/tmp evidence not staged.
```

## 14. Static Checks

Executed:

```text
backend/venv/bin/python -m py_compile backend/main.py
node SFC parse for src/views/AdminOrders.vue
node SFC parse for src/views/AdminOrderDetail.vue
git diff --check -- backend/main.py backend/migrations/003_create_order_storage.sql frontend/vue-app/src/views/AdminOrders.vue frontend/vue-app/src/views/AdminOrderDetail.vue frontend/vue-app/src/router/index.js frontend/vue-app/src/components/NavHeader.vue frontend/vue-app/src/services/adminOrderService.js
```

Results:

```text
backend/main.py py_compile: pass
AdminOrders.vue SFC parse: pass
AdminOrderDetail.vue SFC parse: pass
git diff --check: pass
```

## 15. Blockers

P0 blockers:

```text
None.
```

Known non-blocking residue:

```text
backend/__pycache__/main.cpython-314.pyc is dirty from local Python checks/runs and was not staged.
Historical dirty/untracked repo noise remains outside this workpack.
```

## 16. Commit Hash List

This workpack commit:

```text
{HASH} Add order skeleton closed loop
```

Relevant baseline commits:

```text
11458cba794fbff6405ada9425be8ee79b69f8f9 Add quote minimal closed loop
f6b2c9bdba0566f16a5c86653a557ae87bff0d34 Add stage 2 backend readiness evidence
787f462e90429cb90d1efb372332f701cb4183a5 Add admin order queue and detail skeleton
4152ad499ec7ce643d15e338e701ee4a4aac00cb Add admin quote to draft order flow
```

## 17. Remaining Work Estimate

Updated estimate after this workpack:

```text
Lead local persistence: complete for local/staging
Quote minimal closed loop: complete for local/staging
Order skeleton local closed loop: complete for local/staging
Remaining app work: still significant, but payment/deployment/supplier fulfilment can now be planned after App review
```

Remaining high-level work:

```text
Order lifecycle hardening
customer-facing Quote presentation
payment readiness planning
supplier dispatch planning
production auth/database/deployment planning
git hygiene and historical dirty cleanup
```

## 18. Next Recommendation

Recommended next workpack:

```text
Order skeleton App review and lifecycle hardening plan.
```

Do not jump directly to payment, Stripe, webhook/n8n, deployment, or external notification.

Suggested next scope:

```text
1. Review Order state transitions.
2. Add focused backend tests for Order API skeleton.
3. Decide whether pending_deposit should remain default next state or stay manual only.
4. Prepare payment readiness plan as a document-only package.
5. Keep all real external actions approval-gated.
```
