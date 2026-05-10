# PartyOnce Stage 2 Step 6.6 Quote API Skeleton Workpack

Date: 2026-05-10

Scope: isolated backend Quote API skeleton

## 1. Work Completed

Implemented an isolated Stage 2 Quote API skeleton in:

```text
backend/main.py
```

Added this workpack:

```text
docs/PARTYONCE_STAGE2_STEP6_6_QUOTE_API_SKELETON_WORKPACK_20260510.md
```

Implemented endpoints:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

These endpoints are inserted before `# User Endpoints`, after the Lead API skeleton block, so they are isolated from the historical `# QUOTE API ENDPOINTS` block.

## 2. Clean Isolation

Backup directory:

```text
/tmp/partyonce_step6_6_quote_api_backup_20260510
```

Backups created:

```text
/tmp/partyonce_step6_6_quote_api_backup_20260510/main.before_step6_6.py
/tmp/partyonce_step6_6_quote_api_backup_20260510/main.HEAD.py
```

Clean baseline check:

```text
backend/main.py matched HEAD before Step 6.6 edits
```

This means no historical dirty `backend/main.py` content was mixed into the implementation.

## 3. Implementation Details

Added isolated Stage 2 schema names:

```text
Stage2QuoteStatus
Stage2QuoteCreateRequest
Stage2QuotePatchRequest
Stage2QuoteLeadSummary
Stage2QuoteCustomerSummary
Stage2QuoteResponse
Stage2QuoteListResponse
```

Added isolated helper functions:

```text
ensure_stage2_quote_sqlite_schema
encode_stage2_quote_snapshot
decode_stage2_quote_dict
decode_stage2_quote_list
coerce_stage2_quote_amount
generate_stage2_quote_number
get_stage2_persistent_lead_for_quote
validate_stage2_lead_can_create_quote
get_stage2_quote_detail_row
build_stage2_quote_response
derive_stage2_quote_totals
create_stage2_quote_from_persistent_lead
list_stage2_quotes
get_stage2_quote_response
update_stage2_quote
```

## 4. Storage Behavior

The skeleton uses the existing safe local profile:

```text
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/...
```

It applies:

```text
backend/migrations/001_create_lead_storage.sql
backend/migrations/002_create_quote_storage.sql
```

It writes to:

```text
quotes
```

It does not write to:

```text
quote_items
orders
payment tables
Stripe tables
webhook/n8n tables
outbound message tables
```

If `sqlite_local` is not enabled, the Stage 2 Quote skeleton returns a disabled/not-implemented response instead of using memory Lead storage.

## 5. Lead To Quote Behavior

`POST /api/quotes`:

```text
requires require_admin
requires lead_id
loads persistent Lead
allows contacted or qualified Leads
blocks unqualified and closed Leads
reads customer_id from Lead
copies selection snapshot from Lead unless admin request supplies one
uses Lead pricing snapshot as first draft estimate
creates draft Quote
generates quote_number
updates Lead status to converted_to_quote in the same transaction
```

Guardrail:

```text
If Quote creation fails, Lead status update rolls back.
```

## 6. Status Behavior

Allowed schema values:

```text
draft
sent
accepted
rejected
expired
converted_to_order
```

Step 6.6 API behavior:

```text
draft Quote is created on POST
PATCH can set sent / accepted / rejected / expired / draft
PATCH converted_to_order is blocked with conflict response
```

No Order is created when Quote is accepted.

## 7. Security And Scope Boundaries

All Stage 2 Quote skeleton endpoints use:

```text
require_admin
```

Not implemented:

```text
anonymous Quote access
supplier Quote access
customer Quote view
public Quote link
customer self-service acceptance
```

No external system was triggered.

## 8. Tests Run

Syntax check:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result:

```text
passed
```

Local function-level smoke test used:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite local /tmp dummy app database
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_step6_6_quote_api.sqlite
backend/venv/bin/python
```

Smoke test verified:

```text
created persistent Lead
updated Lead to qualified
created draft Quote from Lead
Lead status became converted_to_quote
listed Quote total = 1
patched Quote to sent
blocked converted_to_order with 409
final_total copied from Lead pricing snapshot
```

Observed smoke test summary:

```text
lead_status_after_quote=converted_to_quote
quote_status=draft
quote_currency=AUD
list_total=1
patched_status=sent
converted_to_order_blocked=True
final_total=1280.0
```

## 9. Excluded Files

Excluded from this implementation:

```text
frontend/vue-app/dist
frontend/vue-app/.env.production
.DS_Store
node_modules
test_evidence
historical dirty files
```

`backend/__pycache__` was restored/excluded after local checks.

## 10. Continuing Blockers

Still blocked:

```text
Order API
Order creation
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
frontend work
production database
production migration
deployment
push
.env.production read or modification
frontend/vue-app/dist submission
historical dirty cleanup
```

## 11. Known Limitations

Current skeleton limitations:

```text
server-side pricing validation is still only a warning-level placeholder
manager-specific guard is not separate from require_admin role behavior
customer-facing Quote view is not implemented
public Quote sharing is not implemented
Quote item editing remains line_items_json snapshot only
production DB and MySQL execution remain unapproved
```

## 12. Recommendation

Next step:

```text
Step 6.6 limited review + whitelist staging + local commit
```

After that:

```text
Step 6.7 local Quote API acceptance
```

Step 6.7 should start a safe local backend profile and test the actual API routes with admin auth if a fixture is available. It must not start Order, payment, external messaging, deployment, or frontend work.

