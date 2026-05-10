# PartyOnce Stage 2 Step 6.3 Quote Skeleton Implementation Plan

Date: 2026-05-10

Scope: implementation plan only for an isolated Stage 2 Quote skeleton

## 1. Planning Boundary

This document is not an implementation.

This step does not:

```text
write Quote API code
modify backend/main.py
modify frontend source
create a real migration file
run migration
connect to database
create Order
connect Stripe/payment
trigger webhook/n8n
send email/SMS/WhatsApp
deploy
push
read or modify .env.production
submit frontend/vue-app/dist
clean historical dirty files
```

## 2. Current Basis

Step 6.2 reviewed the existing backend Quote code and concluded:

```text
Do not directly treat the existing backend Quote code as the accepted Stage 2 Quote API.
```

Reasons:

```text
historical /api/quotes can create Quote from raw customer/event payload
historical /api/quotes does not require lead_id
historical Quote model does not include lead_id or customer_id
historical status values use approved instead of accepted
historical endpoints do not clearly enforce admin/manager-only access
historical Quote tables are not part of the accepted Step 5 migration
```

Step 6.3 therefore plans an isolated Stage 2 Lead-to-Quote skeleton.

## 3. Quote Skeleton General Principles

Quote skeleton must follow these rules:

```text
Quote must be created from a persistent Lead.
Quote must not be created directly from anonymous inquiry.
Quote must not be created directly from localStorage.
Quote must not create Order.
Quote must not trigger Stripe/payment.
Quote must not trigger webhook/n8n.
Quote must not send email/SMS/WhatsApp.
Quote skeleton serves admin/manager backend quote drafting only.
```

The customer-facing `/quote` page remains Lead intake:

```text
/quote -> localStorage.inquirySubmissions
/quote -> POST /api/leads when local/staging bridge is enabled
/quote must not directly create Quote
/quote must not directly create Order
```

## 4. Allowed API Surface

Only these endpoints are in the Step 6 skeleton plan:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

Do not plan or implement:

```text
Order API
payment API
Stripe checkout
public quote link
customer quote acceptance endpoint
supplier quote access
external notification endpoint
```

## 5. Quote Creation Rule

`POST /api/quotes` must be admin/manager-only.

Minimum request:

```json
{
  "lead_id": "1",
  "currency": "AUD",
  "line_items": [],
  "selection_snapshot": {},
  "valid_until": "2026-06-10"
}
```

Required behavior:

```text
validate authenticated user is admin/manager
validate lead_id is present
load persistent Lead by lead_id
validate Lead exists
load Customer through Lead.customer_id
read Lead.selection_snapshot_json
read Lead.pricing_snapshot_json
create draft Quote
set status = draft
store quote_number
store customer_id from Lead
store lead_id
store selection snapshot
store line item / pricing snapshot
return Quote response
```

Explicit non-behavior:

```text
must not create Order
must not create payment state
must not call Stripe
must not call webhook/n8n
must not send outbound messages
must not rely on browser pricing as final price without server-side validation rules
```

## 6. Lead Status Update Decision

When `POST /api/quotes` creates a draft Quote from Lead, there are two possible behaviors:

```text
Option A: leave Lead status unchanged
Option B: update Lead status to converted_to_quote
```

Recommendation for first skeleton implementation:

```text
Use Option B only after Quote insert succeeds.
```

Reason:

```text
converted_to_quote is already part of the accepted Lead status enum.
It gives admin queue a clear handoff marker.
It does not create Order or payment.
It can be implemented in the same local SQLite transaction as Quote creation.
```

Guardrail:

```text
If Quote creation fails, Lead status must not change.
```

Alternative:

```text
If the first implementation wants the smallest write surface, use Option A and record the decision in the workpack.
```

## 7. Quote Status Rules

Stage 2 Quote statuses:

```text
draft
sent
accepted
rejected
expired
converted_to_order
```

Recommended active implementation for this phase:

```text
draft
sent
accepted
rejected
expired
```

`converted_to_order` is reserved for future Order work.

Allowed transitions in skeleton:

```text
draft -> sent
draft -> rejected
draft -> expired
sent -> accepted
sent -> rejected
sent -> expired
accepted -> no automatic Order
rejected -> no automatic Order
expired -> no automatic Order
```

Blocked transition:

```text
any status -> converted_to_order
```

Reason:

```text
Order API is not approved in Step 6.
Payment is not approved in Step 6.
converted_to_order must not become a hidden Order creation trigger.
```

## 8. Data Table And Migration Boundary

Step 6 should not rely on historical SQLAlchemy `create_all` behavior for accepted Quote storage.

Recommendation:

```text
Create a separate Step 6.4 Quote migration draft before code implementation.
```

Reason:

```text
Step 5 accepted only customers, leads, and follow_ups in backend/migrations/001_create_lead_storage.sql.
Existing historical Quote tables do not match the Stage 2 Lead-to-Quote contract.
Quote skeleton needs lead_id and customer_id as explicit accepted relationships.
```

Step 6.4 should only draft storage for:

```text
quotes
quote_items or line_items_json
```

Minimum `quotes` fields:

```text
id
lead_id
customer_id
quote_number
status
currency
subtotal
discount_total
tax_total
final_total
line_items_json
selection_snapshot_json
valid_until
sent_at
accepted_at
created_by_user_id
created_at
updated_at
```

Recommended first skeleton storage shape:

```text
Use quotes table with line_items_json.
Defer separate quote_items table until pricing engine and item-level editing are stable.
```

Reason:

```text
line_items_json matches the current Stage 2 snapshot-first approach.
It avoids prematurely designing a full quote item editing model.
It keeps Step 6 smaller and easier to validate.
```

Optional later expansion:

```text
Add quote_items table after Quote skeleton acceptance if item-level backend editing is required.
```

## 9. Permission Boundary

Skeleton phase permissions:

```text
POST /api/quotes -> admin/manager only
GET /api/quotes -> admin/manager only
GET /api/quotes/{quote_id} -> admin/manager only
PATCH /api/quotes/{quote_id} -> admin/manager only
```

Not allowed in skeleton phase:

```text
anonymous Quote creation
customer Quote detail
public quote link
supplier Quote access
customer self-serve acceptance
```

Implementation requirement:

```text
Do not claim admin/manager-only unless the code uses an explicit guard.
```

Possible implementation routes:

```text
Use existing require_admin if manager role is not clearly defined.
Introduce require_admin_or_manager only if role semantics are already clear.
Otherwise document manager support as a future permission refinement.
```

## 10. Relationship To Existing Historical Quote Code

Historical `/api/quotes` must not be directly reused as the Stage 2 skeleton.

If reusing any existing helper, isolate it first:

```text
generate_quote_number() may be reused after confirming format.
calculate_quote_item() may be reused only if line item payload matches Step 6.
calculate_quote() may be reused only if venue/customer discount behavior is accepted.
QuoteResponse shape should not be reused as-is because it lacks lead/customer relationships.
QuoteStatus should not be reused as-is because it uses approved instead of accepted.
```

Do not bring over:

```text
raw customer/event Quote creation
historical get_current_user-only permission behavior
historical approved status
order-adjacent bind-template behavior
payment-adjacent fields
```

Safest route:

```text
Implement an isolated Stage 2 Quote skeleton block near the Lead skeleton/persistence code.
Keep code diff narrow and reviewable.
Avoid refactoring the historical Quote system in the same step.
```

## 11. Proposed Implementation Files For Later Step

Preferred implementation target if code is approved later:

```text
backend/main.py
docs/PARTYONCE_STAGE2_STEP6_4_QUOTE_MIGRATION_DRAFT_20260510.md
docs/PARTYONCE_STAGE2_STEP6_5_QUOTE_API_SKELETON_WORKPACK_20260510.md
```

Possible migration file only after Step 6.4 approval:

```text
backend/migrations/002_create_quote_storage.sql
```

No frontend files are needed for the first backend skeleton.

## 12. Step 6.4 Recommendation

Recommended next step:

```text
Step 6.4: Quote migration draft / schema plan
```

Reason:

```text
The Stage 2 Quote table does not exist in accepted backend/migrations.
The historical Quote schema does not match the Lead-to-Quote contract.
Adding code before a migration draft would repeat the historical create_all ambiguity that Step 5 avoided.
```

Step 6.4 should produce:

```text
SQLite-compatible draft SQL for quotes
optional line_items_json-first design
indexes and constraints
status CHECK constraints
foreign key relationship to leads and customers
dry-run plan but not necessarily execution unless explicitly requested
```

Only after Step 6.4 is accepted should work proceed to:

```text
Step 6.5: isolated Quote API skeleton
```

## 13. Step 6.5 Implementation Acceptance Target

When implementation is later approved, acceptance should verify:

```text
POST /api/quotes requires admin/manager
POST /api/quotes requires existing persistent Lead
POST /api/quotes creates draft Quote
Quote references Lead and Customer
Lead status update behavior matches the accepted Step 6.3 decision
GET /api/quotes lists Quote records
GET /api/quotes/{quote_id} returns Quote detail
PATCH /api/quotes/{quote_id} updates allowed fields/status only
PATCH accepted does not create Order
converted_to_order is blocked
no payment/webhook/n8n/outbound message is triggered
```

## 14. Continuing Blockers

Continue blocking:

```text
Quote API code in this planning step
backend/main.py changes in this planning step
frontend changes
real migration creation in this planning step
database connection
Order API
Order creation
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
deployment
push
.env.production read or modification
frontend/vue-app/dist submission
historical dirty file cleanup
```

## 15. Final Recommendation

Proceed next to:

```text
Step 6.4: Quote migration draft / schema plan
```

Do not implement Quote API until the Quote storage contract is reviewed and accepted.

