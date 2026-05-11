# PartyOnce Stage 2 Step 8.3 Order API Skeleton Implementation Plan

Date: 2026-05-11

Scope: implementation plan only

## 1. Planning Boundary

Step 8.3 plans the isolated Order API skeleton implementation. It does not implement code.

This document does not modify backend source, frontend source, migrations, database state, production configuration, dist artifacts, payment, Stripe, webhook/n8n, external messaging, deployment, or push state.

## 2. Current Inputs

Completed prerequisites:

```text
386a2e2a Add order storage migration draft
c66e2340 Add stage 2 order skeleton plan
53e02d87 Add stage 2 quote admin workflow closeout
6d2ece2c Add isolated quote API skeleton
7a90d541 Add quote storage migration draft
ff1d0cb8 Add SQLite lead persistence prototype
```

Relevant storage files:

```text
backend/migrations/001_create_lead_storage.sql
backend/migrations/002_create_quote_storage.sql
backend/migrations/003_create_order_storage.sql
```

Relevant implementation pattern:

```text
Stage2QuoteStatus
Stage2QuoteCreateRequest
Stage2QuotePatchRequest
Stage2QuoteResponse
Stage2QuoteListResponse
ensure_stage2_quote_sqlite_schema
create_stage2_quote_from_persistent_lead
list_stage2_quotes
get_stage2_quote_response
update_stage2_quote
require_admin
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
```

## 3. API Skeleton Scope

Only plan these endpoints:

```text
POST /api/orders
GET /api/orders
GET /api/orders/{order_id}
PATCH /api/orders/{order_id}
```

No other endpoint is in scope.

Do not implement:

```text
Payment API
Stripe checkout
deposit collection
webhook/n8n
email/SMS/WhatsApp
supplier assignment
contract generation
customer-facing Order portal
public Order links
```

## 4. Core Rules

Order creation must follow:

```text
admin/manager only through existing require_admin behavior
sqlite_local mode only
quote_id required
Quote must exist
Quote must have status accepted
No existing Order for the same Quote
Copy lead_id and customer_id from Quote
Copy selection_snapshot_json and line_items_json from Quote
Copy customer summary into customer_snapshot_json
Create Order status draft
deposit_status starts as not_started
payment_reference stays null
Update Quote to converted_to_order in the same transaction
Rollback both Order creation and Quote status update if any part fails
```

Order creation must not:

```text
create PaymentIntent
create checkout session
change deposit_status to paid
trigger Stripe
trigger webhook/n8n
send email/SMS/WhatsApp
assign suppliers
generate contracts
```

## 5. backend/main.py Insertion Strategy

Implementation should be isolated and follow the existing Stage 2 Quote skeleton pattern.

Recommended placement:

```text
1. Add Stage2Order schemas after Stage2Quote schemas and before historical Quote schemas.
2. Add Stage2Order SQLite helpers after Stage2Quote helper functions.
3. Add Stage2Order API endpoints after Stage2Quote endpoints and before User Endpoints.
```

Required isolation rules:

```text
Do not directly reuse historical Order code.
Do not directly reuse payment-adjacent Order helpers.
Do not modify historical payment/deposit endpoints.
Do not change existing Stripe-related code.
Do not change frontend code.
If backend/main.py has historical dirty content, use clean isolation before staging.
```

Clean isolation approach if needed:

```text
1. Back up current dirty backend/main.py outside the repo working tree.
2. Generate a clean baseline from HEAD:backend/main.py.
3. Extract only Stage2Order schemas/helpers/endpoints from the dirty working file.
4. Insert the extracted blocks at the planned anchors.
5. Run py_compile.
6. Review diff to confirm only Stage2Order skeleton content is present.
```

Staging must remain whitelist-only. Do not use `git add .`.

## 6. Suggested Schema Names

Use Stage 2 names to avoid collision with historical Order code:

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

Status enums:

```text
Stage2OrderStatus:
  draft
  pending_deposit
  confirmed
  in_progress
  completed
  cancelled

Stage2DepositStatus:
  not_started
  pending
  paid
  failed
  refunded
  waived
```

Initial implementation rule:

```text
PATCH should not allow setting deposit_status.
PATCH should not allow setting payment_reference.
pending_deposit should remain a non-payment placeholder unless owner separately approves payment planning.
```

## 7. Suggested Helper Names

Recommended helper names:

```text
ensure_stage2_order_sqlite_schema
get_stage2_order_detail_row
build_stage2_order_response
generate_stage2_order_number
get_stage2_accepted_quote_for_order
create_stage2_order_from_accepted_quote
list_stage2_orders
get_stage2_order_response
update_stage2_order
encode_stage2_order_snapshot
decode_stage2_order_dict
decode_stage2_order_list
```

Use existing SQLite local profile:

```text
is_lead_sqlite_local_enabled
get_lead_sqlite_connection
ensure_lead_sqlite_schema
ensure_stage2_quote_sqlite_schema
```

Order implementation should extend the same local/staging SQLite stack instead of introducing a new database connection mode.

## 8. Request / Response Details

### Stage2OrderCreateRequest

Suggested fields:

```text
quote_id: required string
event_date: optional date string
event_location: optional string
internal_notes: optional string
```

Do not accept:

```text
customer_id
lead_id
total_amount
deposit_status
payment_reference
line_items_json
selection_snapshot_json
```

Those values must come from the accepted Quote or internal defaults.

### Stage2OrderPatchRequest

Allowed fields:

```text
status
event_date
event_location
internal_notes
confirmed_at
```

Blocked fields:

```text
quote_id
lead_id
customer_id
total_amount
deposit_amount
deposit_status
payment_reference
line_items
selection_snapshot
customer_snapshot
```

### Stage2OrderResponse

Suggested fields:

```text
id
quote_id
quote_number
lead_id
customer_id
order_number
status
event_date
event_location
currency
total_amount
deposit_amount
deposit_status
payment_reference
selection_snapshot
line_items
customer_summary
quote_summary
internal_notes
created_by_user_id
confirmed_at
created_at
updated_at
skeleton_notice
```

Skeleton notice:

```text
Stage 2 Order skeleton does not collect payment, create checkout sessions, trigger webhook/n8n, or send outbound messages.
```

## 9. Endpoint Behavior

### POST /api/orders

Must:

```text
require admin
require sqlite_local mode
validate accepted Quote
reject non-accepted Quote
reject duplicate Order for same Quote
create draft Order
set deposit_status not_started
set payment_reference null
copy Quote snapshots
update Quote status to converted_to_order in same transaction
return Stage2OrderResponse
```

### GET /api/orders

Must:

```text
require admin
support status, quote_id, lead_id, customer_id, search, limit, offset
return Stage2OrderListResponse
```

### GET /api/orders/{order_id}

Must:

```text
require admin
return Stage2OrderResponse
404 when missing
```

### PATCH /api/orders/{order_id}

Must:

```text
require admin
allow status/event/internal_notes updates only
block payment/deposit mutations
return Stage2OrderResponse
```

Status transitions can remain simple in the first skeleton. Payment-related transition enforcement should wait for a separate payment planning phase.

## 10. Testing Plan

Safe local tests only:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
Start backend with PYTHON_DOTENV_DISABLED=1
Use DATABASE_URL pointing to local SQLite under /tmp
Use PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
Use PARTYONCE_LEAD_SQLITE_PATH pointing to local SQLite under /tmp
Create admin user
Create persistent Lead
Create Quote from Lead
PATCH Quote to accepted
POST /api/orders creates draft Order
GET /api/orders lists Order
GET /api/orders/{id} returns detail
PATCH /api/orders/{id} updates allowed status
POST /api/orders rejects non-accepted Quote
POST /api/orders rejects duplicate Order
POST /api/orders rejects invalid quote_id
Verify Quote status becomes converted_to_order only after successful Order creation
Verify backend restart preserves Order
```

Do not test:

```text
Stripe/payment
checkout session
webhook/n8n
email/SMS/WhatsApp
production database
deployment
frontend build
```

## 11. Review And Staging Plan

Implementation review must check:

```text
Only Stage2Order schemas/helpers/endpoints were added.
No historical Order/payment code was changed.
No Stripe code was touched.
No webhook/n8n code was touched.
No frontend code was touched.
No production configuration was read or changed.
No dist files were staged.
No pycache files were staged.
```

Allowed implementation files should be limited to:

```text
backend/main.py
docs/PARTYONCE_STAGE2_STEP8_4_ORDER_API_SKELETON_WORKPACK_YYYYMMDD.md
```

Only if implementation requires a separate helper file and the current codebase supports it, add that helper file explicitly to the whitelist before staging.

## 12. Explicitly Blocked

Continue to block:

```text
Stripe/payment
deposit collection
PaymentIntent
checkout session
webhook/n8n
email/SMS/WhatsApp
supplier notification
contract generation
production deployment
production database migration
.env.production changes
frontend/vue-app/dist submission
customer-facing Order portal
public Order links
automatic supplier assignment
```

## 13. Next Recommendation

Recommended next step:

```text
Step 8.4: isolated Order API skeleton implementation
```

But only after owner confirms this plan.

Step 8.4 should begin by backing up and clean-isolating `backend/main.py`, then adding only Stage2Order schemas, helpers, endpoints, and a workpack report. It must not enter payment, frontend, deployment, or external messaging work.
