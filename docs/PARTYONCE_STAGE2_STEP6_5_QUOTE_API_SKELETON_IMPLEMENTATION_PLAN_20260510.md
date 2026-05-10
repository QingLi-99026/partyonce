# PartyOnce Stage 2 Step 6.5 Quote API Skeleton Implementation Plan

Date: 2026-05-10

Scope: implementation and backend insertion plan only

## 1. Boundary

This step only plans an isolated Quote API skeleton implementation.

This step does not:

```text
write Quote API code
modify backend/main.py
modify frontend source
run migration
connect to database
create Order API
create Order records
connect Stripe/payment
trigger webhook/n8n
send email/SMS/WhatsApp
create public quote links
create customer self-service quote acceptance
deploy
push
read or modify .env.production
submit frontend/vue-app/dist
clean historical dirty files
```

## 2. Current Basis

Accepted Step 6.4A assets:

```text
backend/migrations/001_create_lead_storage.sql
backend/migrations/002_create_quote_storage.sql
```

`002_create_quote_storage.sql` creates only:

```text
quotes
```

It does not create:

```text
quote_items
orders
payment tables
Stripe tables
webhook/n8n tables
outbound messaging tables
```

SQLite dry-run has already verified:

```text
001 + 002 apply to a local /tmp SQLite database
valid draft Quote insert works
invalid Quote status is rejected
invalid lead_id foreign key is rejected
```

## 3. Quote API Skeleton Scope

Only these endpoints are in scope:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

Out of scope:

```text
Order API
Payment API
Stripe
Webhook
n8n
Email / SMS / WhatsApp
Public quote link
Customer self-service quote acceptance
Supplier quote access
```

## 4. Quote Must Come From Persistent Lead

`POST /api/quotes` must:

```text
require admin/manager access
require lead_id
validate Lead exists in persistent storage
validate Lead status allows Quote creation
read customer_id from Lead
read selection_snapshot_json from Lead
read pricing_snapshot_json from Lead
create draft Quote
set status=draft
generate unique quote_number
write to quotes table
return Quote response
```

It must not:

```text
create Quote from anonymous inquiry
create Quote directly from localStorage
create Order
trigger payment
call Stripe
trigger webhook/n8n
send outbound messages
```

The customer-facing `/quote` route remains Lead intake:

```text
/quote -> localStorage.inquirySubmissions
/quote -> POST /api/leads when local/staging bridge is enabled
/quote must not directly create Quote
```

## 5. Backend Insertion Strategy

Do not directly reuse the historical `/api/quotes` endpoints as Stage 2 Quote skeleton.

Do not:

```text
overwrite historical Quote code
refactor historical Quote model in the same step
import historical Order-adjacent behavior
import payment-adjacent fields or logic
change existing customer-facing frontend quote flow
```

Recommended insertion strategy:

```text
Add isolated Stage 2 Quote schemas near the Lead skeleton schemas.
Add isolated Stage 2 Quote helper functions near the Lead SQLite helper functions.
Add isolated Stage 2 Quote endpoints after the Lead API skeleton block and before User Endpoints.
Use a clear section header: Stage 2 Quote API Skeleton.
Avoid touching the historical QUOTE API ENDPOINTS block.
```

Why this location:

```text
The Lead API skeleton already owns the accepted Stage 2 local/staging persistence model.
Quote skeleton depends on Lead persistence.
Placing Quote skeleton after Lead endpoints keeps the Stage 2 flow visible and reviewable.
```

Historical backend anchors observed:

```text
# Lead API Skeleton
# User Endpoints
# ==================== QUOTE API ENDPOINTS ====================
```

Recommended insertion point for future implementation:

```text
after PATCH /api/leads/{lead_id}
before # User Endpoints
```

Reason:

```text
This keeps Stage 2 Quote isolated from historical /api/quotes code below.
```

## 6. Clean Isolation Requirement

If `backend/main.py` has historical dirty content before implementation, do not directly stage the whole file.

Required process:

```text
backup current backend/main.py outside the repo or in an approved backup path
generate a clean baseline from HEAD
apply only Stage 2 Quote skeleton hunks
run py_compile
review diff for Quote-only changes
stage with whitelist only
never use git add .
```

The implementation workpack must explicitly report:

```text
backup path
clean isolation method
diff scope
py_compile result
excluded historical dirty content
```

## 7. Suggested Stage 2 Quote Schema Names

Use names that avoid confusion with historical Quote schemas.

Recommended names:

```text
Stage2QuoteStatus
Stage2QuoteCreateRequest
Stage2QuotePatchRequest
Stage2QuoteResponse
Stage2QuoteListResponse
Stage2QuoteLeadSummary
Stage2QuoteCustomerSummary
```

Reason:

```text
backend/main.py already has historical QuoteStatus, QuoteCreateRequest, QuoteUpdateRequest, QuoteResponse, and QuoteListItem.
Using Stage2-prefixed names avoids accidental reuse and makes staged diffs easier to review.
```

## 8. Suggested Helper Names

Recommended isolated helpers:

```text
generate_stage2_quote_number
build_stage2_quote_response
get_stage2_quote_sqlite_connection
ensure_stage2_quote_sqlite_schema
get_persistent_lead_for_quote
create_quote_from_persistent_lead
list_stage2_quotes
get_stage2_quote_response
update_stage2_quote
```

SQLite profile:

```text
Reuse the Lead SQLite local profile path and guard where safe.
Do not introduce production database access.
Do not read .env.production.
```

Preferred local profile behavior:

```text
Stage 2 Quote skeleton is available only when PARTYONCE_LEAD_STORAGE_MODE=sqlite_local.
If storage mode is memory, return a clear 501/disabled response for Quote skeleton or keep endpoints disabled until sqlite_local is enabled.
```

Reason:

```text
Quote must be created from persistent Lead, and memory Leads do not satisfy persistent Lead requirements.
```

## 9. SQLite Persistence Design

Quote skeleton must use:

```text
backend/migrations/001_create_lead_storage.sql
backend/migrations/002_create_quote_storage.sql
```

Storage behavior:

```text
write Quote rows to quotes
do not write quote_items
store line_items_json as snapshot
copy selection_snapshot_json from Lead unless request overrides with allowed admin value
map pricing_snapshot_json from Lead into initial totals only with server-side validation warning
set status=draft on create
```

Pricing caveat:

```text
server-side pricing validation is still required
```

Initial skeleton can use Lead pricing snapshot as a draft estimate, but must label it as not final production pricing.

`converted_to_order`:

```text
schema allows the value for future compatibility
API must reject setting converted_to_order in Step 6
Order API stage must explicitly approve it later
```

## 10. Quote Status Rules

Allowed schema values:

```text
draft
sent
accepted
rejected
expired
converted_to_order
```

Allowed API-settable values in Step 6:

```text
draft
sent
accepted
rejected
expired
```

Blocked in Step 6:

```text
converted_to_order
```

Reason:

```text
converted_to_order implies Order work, and Order API is not in scope.
```

Allowed transitions for first skeleton:

```text
draft -> sent
draft -> rejected
draft -> expired
sent -> accepted
sent -> rejected
sent -> expired
```

Implementation may keep transition validation simple in the first skeleton, but it must block `converted_to_order`.

## 11. Lead Status Handling

Two possible strategies:

```text
Strategy A: after creating Quote, update Lead status to converted_to_quote.
Strategy B: after creating Quote, leave Lead status unchanged and infer conversion from Quote relationship.
```

Recommendation:

```text
Use Strategy A.
```

Required guardrails:

```text
update Lead status only after Quote insert succeeds
perform Quote insert and Lead status update in the same SQLite transaction
rollback both if either write fails
do not update Lead status if Quote creation fails
do not create Order
do not trigger payment or external systems
```

Reason:

```text
converted_to_quote is already an accepted Lead status.
It gives admin lead queue a clear handoff marker.
It remains inside Lead/Quote scope and does not imply Order or payment.
```

Lead status gate for creating Quote:

```text
allow qualified
allow contacted only if local/staging demo needs it and the workpack states that explicitly
block unqualified
block closed
```

Recommended first implementation:

```text
allow qualified and contacted for local/staging skeleton
block unqualified and closed
```

## 12. Permission Boundary

All Step 6 Quote skeleton endpoints must be admin/manager-only:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

Forbidden:

```text
anonymous access
supplier access
customer quote view
public quote share link
customer self-service acceptance
```

Implementation recommendation:

```text
Use require_admin for first skeleton unless manager role semantics are confirmed.
Document manager support as future refinement if no explicit manager guard exists.
```

Do not claim manager support in code unless the guard actually permits and verifies it.

## 13. API Contract For Later Implementation

### POST /api/quotes

Request:

```json
{
  "lead_id": "1",
  "currency": "AUD",
  "line_items": [],
  "selection_snapshot": {},
  "valid_until": "2026-06-10"
}
```

Response:

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
line_items
selection_snapshot
valid_until
sent_at
accepted_at
created_by_user_id
created_at
updated_at
lead_summary
customer_summary
```

### GET /api/quotes

Query:

```text
lead_id
customer_id
status
search
limit
offset
```

Response:

```text
items
total
limit
offset
```

### GET /api/quotes/{quote_id}

Response:

```text
single Stage2QuoteResponse
```

### PATCH /api/quotes/{quote_id}

Allowed fields:

```text
status
currency
line_items
selection_snapshot
valid_until
subtotal
discount_total
tax_total
final_total
```

Blocked fields:

```text
lead_id
customer_id
quote_number
converted_to_order status
Order fields
payment fields
external notification fields
```

## 14. Testing Plan

Safe tests:

```text
py_compile backend/main.py
SQLite local profile only
apply 001 + 002 migrations to /tmp SQLite
create persistent Customer and Lead
POST /api/quotes creates draft Quote
GET /api/quotes returns Quote
GET /api/quotes/{id} returns Quote detail
PATCH /api/quotes/{id} updates allowed status
invalid lead_id returns error
unqualified/closed Lead is blocked
converted_to_order PATCH is blocked
non-admin access blocked if auth fixture is available
```

Do not test:

```text
payment
Stripe
webhook
n8n
email/SMS/WhatsApp
production DB
deployment
frontend build
```

## 15. Recommended Implementation Workpack

Next implementation workpack should be:

```text
Step 6.6: isolated Quote API skeleton implementation
```

Allowed files for Step 6.6 should be limited to:

```text
backend/main.py
docs/PARTYONCE_STAGE2_STEP6_6_QUOTE_API_SKELETON_WORKPACK_20260510.md
```

Only if tests require a separate helper file and the repo structure supports it, consider:

```text
backend/quote_stage2_helpers.py
```

Default recommendation:

```text
keep first implementation inside backend/main.py to match current project structure
use clean isolation if backend/main.py is dirty
```

## 16. Staging And Commit Rules For Later Implementation

Future Step 6.6 must:

```text
run limited review before staging
stage only whitelisted files
never use git add .
exclude frontend/vue-app/dist
exclude frontend/vue-app/.env.production
exclude .DS_Store
exclude node_modules
exclude test_evidence unless explicitly requested
exclude historical dirty files
```

## 17. Final Recommendation

Proceed next to:

```text
Step 6.6: isolated Quote API skeleton implementation
```

But only after this plan is reviewed and committed.

Do not start Order API, payment, external messaging, frontend work, production deployment, or production configuration work.

