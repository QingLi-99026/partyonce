# PartyOnce Stage 2 Step 8.4 Order API Skeleton Workpack

Date: 2026-05-11

## 1. Scope

Step 8.4 implements the isolated Stage 2 Order API skeleton.

Allowed scope:

```text
POST /api/orders
GET /api/orders
GET /api/orders/{order_id}
PATCH /api/orders/{order_id}
```

This work only uses the safe local/staging SQLite profile. It does not implement payment, Stripe, webhook/n8n, external messaging, frontend UI, production deployment, or production migration.

## 2. Files Changed

Changed:

```text
backend/main.py
```

Added:

```text
docs/PARTYONCE_STAGE2_STEP8_4_ORDER_API_SKELETON_WORKPACK_20260511.md
```

## 3. Isolation

Before editing, the current `backend/main.py` was backed up outside the repo:

```text
/tmp/partyonce_step8_4_backup/main.before_step8_4.py
```

The implementation was inserted in the existing Stage 2 pattern:

```text
Stage2Order schemas after Stage2Quote schemas
Stage2Order helpers after Stage2Quote helpers
Stage2Order endpoints after Stage2Quote endpoints and before User Endpoints
```

The diff is limited to Stage2Order schemas, helpers, endpoints, and this workpack.

## 4. Implemented Schemas

Added:

```text
Stage2OrderStatus
Stage2DepositStatus
Stage2OrderCreateRequest
Stage2OrderPatchRequest
Stage2OrderQuoteSummary
Stage2OrderCustomerSummary
Stage2OrderResponse
Stage2OrderListResponse
```

Order status values:

```text
draft
pending_deposit
confirmed
in_progress
completed
cancelled
```

Deposit status values:

```text
not_started
pending
paid
failed
refunded
waived
```

Deposit fields remain placeholders only. No payment behavior is implemented.

## 5. Implemented Helpers

Added:

```text
ensure_stage2_order_sqlite_schema
encode_stage2_order_snapshot
decode_stage2_order_dict
decode_stage2_order_list
generate_stage2_order_number
get_stage2_accepted_quote_for_order
get_stage2_order_detail_row
build_stage2_order_response
create_stage2_order_from_accepted_quote
list_stage2_orders
get_stage2_order_response
update_stage2_order
```

The helpers reuse the existing safe local SQLite profile:

```text
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/...
```

## 6. Implemented Endpoints

Added:

```text
POST /api/orders
GET /api/orders
GET /api/orders/{order_id}
PATCH /api/orders/{order_id}
```

All endpoints use the existing:

```text
require_admin
```

## 7. Business Rules

`POST /api/orders` requires:

```text
sqlite_local mode
admin user
existing Quote
Quote status accepted
no existing Order for the same Quote
```

On successful Order creation:

```text
Order status = draft
deposit_status = not_started
payment_reference = null
Quote status becomes converted_to_order
Order creation and Quote status update happen in one transaction
```

`PATCH /api/orders/{order_id}` allows only:

```text
status
event_date
event_location
internal_notes
confirmed_at
```

It does not accept or mutate payment/deposit fields.

## 8. Validation

Syntax check:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result:

```text
pass
```

Local API acceptance used:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=local SQLite under /tmp
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=local SQLite under /tmp
backend bound to localhost
```

Acceptance results:

```text
POST /api/leads -> 201
PATCH /api/leads/{lead_id} status qualified -> 200
POST /api/quotes -> 201
POST /api/orders before Quote accepted -> 409
PATCH /api/quotes/{quote_id} status accepted -> 200
POST /api/orders after Quote accepted -> 201
GET /api/orders -> 200, total 1
GET /api/orders/{order_id} -> 200
PATCH /api/orders/{order_id} status confirmed -> 200
duplicate POST /api/orders for same Quote -> 409
invalid quote_id -> 404
GET /api/quotes/{quote_id} after Order creation -> status converted_to_order
```

Backend restart persistence check:

```text
restart backend with same local SQLite files
login local admin again
GET /api/orders -> total 1
GET /api/orders/1 -> status confirmed
```

Result:

```text
pass
```

## 9. Boundaries Confirmed

This work did not:

```text
modify frontend source
submit frontend dist artifacts
read or modify production environment configuration
connect to production database
run production migration
trigger Stripe/payment
create checkout sessions
trigger webhook/n8n
send email/SMS/WhatsApp
deploy
push
```

This work did not modify:

```text
frontend/vue-app/.env.production
frontend/vue-app/dist
backend/migrations
```

## 10. Known Limitations

Known limitations:

```text
manager-specific authorization is still covered by existing require_admin behavior
deposit_status is a placeholder and cannot be changed by PATCH
payment_reference stays null
no customer-facing Order portal exists
no admin Order UI exists yet
no MySQL execution was performed
```

The duplicate Order test returned a conflict after the Quote had already moved to `converted_to_order`, so the duplicate path is safely blocked even though the returned reason is Quote status based.

## 11. Next Recommendation

Recommended next step:

```text
Step 8.5: local Order API skeleton acceptance summary
```

After that, plan:

```text
Step 9: Admin Order Queue / Detail UX planning
```

Do not enter payment, Stripe, webhook/n8n, external messaging, deployment, or production configuration.
