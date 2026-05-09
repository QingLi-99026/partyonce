# PartyOnce Stage 2 Step 6.2 Existing Quote Code And Schema Review

Date: 2026-05-10

Scope: review only for existing Quote code and schema before any Step 6 implementation

## 1. Review Conclusion

Pass with blocking recommendation for implementation:

```text
Do not directly treat the existing backend Quote code as the accepted Stage 2 Quote API.
```

The existing backend has Quote models, schemas, utility functions, and endpoints, but they were built before the accepted Stage 2 Lead persistence path.

The safest next step is:

```text
isolate a narrow Stage 2 Lead-to-Quote skeleton
reuse only small reviewed helpers if they fit
do not broad-reuse the historical Quote endpoints as-is
```

## 2. Files Reviewed

Reviewed read-only:

```text
backend/main.py
backend/migrations/001_create_lead_storage.sql
docs/PARTYONCE_STAGE2_STEP6_1_QUOTE_API_CONTRACT_AND_SKELETON_PLAN_20260510.md
docs/PARTYONCE_STAGE2_SCHEMA_MIGRATION_DRAFT_20260509.md
docs/PARTYONCE_STAGE2_BACKEND_LEAD_ORDER_CONTRACT_PLAN_20260509.md
```

No source file was modified in this review.

## 3. Existing Quote Code Inventory

Existing backend Quote-related pieces in `backend/main.py`:

```text
QuoteStatus enum
QuoteItemType enum
Quote SQLAlchemy model
QuoteItem SQLAlchemy model
QuoteCreateRequest
QuoteUpdateRequest
QuoteCalculationResult
QuoteResponse
QuoteListItem
generate_quote_number()
calculate_quote_item()
calculate_quote()
get_quote_response()
POST /api/quotes/calculate
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
```

There is also historical order-adjacent code:

```text
POST /api/orders/{order_id}/bind-template
```

That endpoint queries `Quote` by `order_id` and treats the quote-like record as the source for event creation. This is outside Step 6 scope and should not be touched by the Quote skeleton work.

## 4. Existing Quote Model Shape

The current `Quote` model is customer/event-centric:

```text
quote_number
customer_name
customer_email
customer_phone
customer_type
company_name
event_name
event_type
event_date
event_duration_hours
guest_count
event_notes
venue_id
venue_name
subtotal
venue_discount_amount
vip_discount_amount
other_discount_amount
discount_total
tax_rate
tax_amount
total_amount
status
valid_until
created_by
created_at
updated_at
```

The current `QuoteItem` model stores item-level pricing:

```text
quote_id
item_type
item_name
item_description
unit_price
quantity
unit
discount_rate
discount_amount
original_amount
final_amount
reference_id
reference_type
sort_order
notes
```

Useful pieces:

```text
quote_number generation exists
line item pricing helpers exist
subtotal / discount / tax calculation helpers exist
QuoteItem storage exists
Quote response builder exists
```

Missing pieces for Stage 2:

```text
lead_id is not part of the current Quote model
customer_id is not part of the current Quote model
selection_snapshot_json is not part of the current Quote model
line_items_json is not part of the current Quote model
created_by_user_id naming does not match the Step 6 contract
status values differ from the Step 6 contract
```

## 5. Contract Mismatch Against Step 6.1

Step 6.1 requires Quote to be created from an existing backend Lead.

Current `POST /api/quotes` request:

```text
customer
event
venue_id
items
additional_discount_rate
tax_rate
valid_days
notes
```

Step 6.1 target request:

```text
lead_id
currency
line_items
selection_snapshot
valid_until
created_by_user_id
```

Mismatch:

```text
current endpoint can create Quote from raw customer/event payload
current endpoint does not require lead_id
current endpoint does not validate Lead exists
current endpoint does not update Lead status to converted_to_quote
current endpoint stores customer fields directly instead of linking to customers table
current endpoint uses get_current_user, not the stricter admin/manager-only boundary from Step 6.1
```

## 6. Status Mismatch

Current QuoteStatus enum:

```text
draft
sent
approved
rejected
expired
```

Stage 2 Quote status contract:

```text
draft
sent
accepted
rejected
expired
converted_to_order
```

Risk:

```text
approved and accepted may be semantically close, but they should not be mixed without an explicit migration/compatibility decision.
converted_to_order must remain future-only until Order work is approved.
```

Recommendation:

```text
Step 6 skeleton should use accepted, not approved.
Step 6 should define converted_to_order only as a future state and must not create Orders.
```

## 7. Permission Boundary Review

Existing Quote endpoints use:

```text
POST /api/quotes/calculate -> get_current_user optional dependency
POST /api/quotes -> get_current_user
GET /api/quotes -> get_current_user
GET /api/quotes/{quote_id} -> get_current_user
```

Step 6.1 target:

```text
admin/manager only for create/list/detail/patch skeleton
not anonymous
not supplier
customer access deferred until ownership checks exist
```

Risk:

```text
get_current_user alone may allow non-admin users depending on existing auth behavior.
Step 6 should not claim admin-only behavior unless it uses an explicit admin/manager guard.
```

Recommendation:

```text
Use the existing require_admin guard or introduce a narrow require_admin_or_manager helper only after reviewing role semantics.
Do not expose customer Quote detail until ownership checks are designed.
```

## 8. Database And Migration Review

Current accepted Step 5 migration file:

```text
backend/migrations/001_create_lead_storage.sql
```

It intentionally creates only:

```text
customers
leads
follow_ups
```

It explicitly does not create Quote or Order tables.

The Stage 2 schema draft includes future `quotes` and `orders` table planning, but this has not been executed as a real backend migration.

Risk:

```text
Existing SQLAlchemy Quote tables may depend on Base.metadata.create_all behavior or existing local DB state.
Step 6 should not silently rely on create_all as a formal migration path.
```

Recommendation:

```text
Before implementation, create a Step 6 Quote storage decision document or draft migration.
For local skeleton only, either use a clearly isolated local SQLite route or explicitly document that existing SQLAlchemy Quote tables are historical and not production migration-approved.
```

## 9. Order And Payment Boundary

Existing Quote code itself does not show direct Stripe/payment calls in the reviewed Quote endpoint block.

However, the backend has adjacent historical order-like behavior:

```text
POST /api/orders/{order_id}/bind-template
```

It uses `Quote` as the source record and is outside the Step 6 scope.

Step 6 must continue to block:

```text
Order API
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
deployment
production database migration
.env.production modification
frontend/vue-app/dist submission
```

## 10. Reuse Decision

Recommended reuse:

```text
generate_quote_number() after confirming numbering format
calculate_quote_item() if line item shape is accepted
calculate_quote() only if venue/customer discount behavior is accepted for PartyOnce Stage 2
QuoteItem pricing fields as reference
```

Do not reuse as-is:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
QuoteCreateRequest
QuoteResponse
QuoteStatus enum
Quote model as the final Stage 2 schema
```

Reason:

```text
They do not enforce Lead-to-Quote creation.
They do not use the Step 5 customers/leads relationship.
They do not match the Stage 2 Quote status contract.
They do not clearly enforce admin/manager-only access.
They are not backed by an accepted Quote migration in backend/migrations.
```

## 11. Recommended Step 6.3 Plan

Next workpack:

```text
Step 6.3: Quote skeleton implementation plan
```

Step 6.3 should define:

```text
exact storage path for Quote skeleton
whether to add a new Quote migration draft first
exact allowed edits in backend/main.py
admin/manager guard decision
Lead status requirements before Quote creation
Quote status transition rules
test commands
rollback boundaries
staging whitelist
```

Recommended minimal API surface for Step 6.4 implementation:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

Recommended implementation rules:

```text
POST /api/quotes requires existing lead_id
POST /api/quotes reads customer_id from Lead
POST /api/quotes creates draft Quote only
GET endpoints require admin/manager
PATCH can update draft/status fields only
PATCH accepted must not create Order
converted_to_order must be blocked until Order work is approved
```

## 12. Final Recommendation

Proceed with Step 6.3 planning before code.

Do not directly patch existing `/api/quotes` endpoints until Step 6.3 defines the exact isolation strategy.

Do not start:

```text
Order API
payment
webhook/n8n
external messaging
production database migration
production deployment
frontend rewrite
```

