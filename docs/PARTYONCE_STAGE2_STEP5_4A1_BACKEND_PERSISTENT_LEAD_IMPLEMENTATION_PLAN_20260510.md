# PartyOnce Stage 2 Step 5.4A-1 Backend Persistent Lead Implementation Plan

Date: 2026-05-10

Scope: implementation plan only for SQLite-only local Lead persistence prototype

## 1. Objective

Step 5.4A-1 defines the minimum implementation plan for moving the existing Lead API skeleton from in-memory storage to explicit local SQLite persistence.

This document does not implement API code, does not modify `backend/main.py`, does not run migration, does not connect to any database, and does not touch production configuration.

## 2. Accepted Direction

Accepted path from Step 5.4:

```text
Route A: SQLite-only local persistence prototype
```

Deferred path:

```text
Route B: MySQL migration dry-run path
```

Reason:

- `backend/migrations/001_create_lead_storage.sql` already exists.
- The SQLite migration has already passed `/tmp` dry-run validation.
- The Lead API skeleton exists and currently uses `LEAD_API_SKELETON_STORE`.
- The `/quote -> POST /api/leads` local/staging bridge has already been accepted.
- MySQL still requires owner confirmation for version, target database, connection method, rollback strategy, CHECK behavior, JSON behavior, AUTO_INCREMENT behavior, and timestamp behavior.

## 3. Current Backend Observations

Read-only inspection found:

```text
backend/main.py has DATABASE_URL configuration.
backend/main.py creates a global SQLAlchemy engine.
backend/main.py defines SessionLocal and get_db.
backend/main.py has Base.metadata.create_all(bind=engine) startup behavior.
backend/main.py defines LeadStatus and LeadPriority.
backend/main.py defines Lead request / response schemas.
backend/main.py stores current Lead records in LEAD_API_SKELETON_STORE.
backend/main.py has POST /api/leads, GET /api/leads, GET /api/leads/{lead_id}, PATCH /api/leads/{lead_id}.
GET /api/leads, GET /api/leads/{lead_id}, and PATCH /api/leads/{lead_id} use require_admin.
```

Key risk:

```text
The existing global DATABASE_URL and create_all behavior must not be allowed to turn this prototype into a production database operation.
```

## 4. Implementation Principle

Step 5.4A-2 should be explicit, local-only, and reversible.

Recommended approach:

```text
Keep the default Lead API skeleton behavior unchanged unless local SQLite persistence is explicitly enabled.
```

Explicit local mode should be activated only by process environment variables in a safe local profile, for example:

```text
PYTHON_DOTENV_DISABLED=1
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_stage2_lead_storage.sqlite
DATABASE_URL=sqlite:////tmp/partyonce_backend_dummy.sqlite
```

The exact variable names can be adjusted during implementation, but the behavior must remain:

```text
No .env.production dependency.
No production database connection.
No implicit MySQL use.
No external system trigger.
```

## 5. Recommended File Scope for Step 5.4A-2

Preferred minimal code scope:

```text
backend/main.py
docs/PARTYONCE_STAGE2_STEP5_4A2_SQLITE_LEAD_PERSISTENCE_WORKPACK_20260510.md
```

Do not modify:

```text
frontend/vue-app/src
frontend/vue-app/dist
frontend/vue-app/.env.production
backend/migrations/001_create_lead_storage.sql
Quote API files
Order API files
payment / Stripe code
webhook / n8n code
```

If `backend/main.py` contains historical dirty changes at the time of implementation, use clean isolation again:

```text
1. Back up current dirty backend/main.py outside the repo.
2. Recreate backend/main.py from HEAD.
3. Inject only the Lead persistence hunks.
4. Verify diff contains only the intended Lead persistence changes.
```

Do not stage the whole file until the diff is verified to be Lead-only.

## 6. Lead Persistence Design

### Storage mode switch

Introduce a small storage mode decision:

```text
memory
sqlite_local
```

Expected behavior:

```text
memory: existing LEAD_API_SKELETON_STORE behavior.
sqlite_local: use local SQLite tables customers, leads, follow_ups.
```

Default should remain conservative:

```text
memory
```

This prevents accidental production-like behavior until the local profile explicitly enables persistence.

### SQLite database path

Use an explicit local SQLite path only in local/staging acceptance.

Recommended acceptance path:

```text
/tmp/partyonce_stage2_lead_storage.sqlite
```

Rules:

- Do not place the local SQLite database inside git.
- Do not use production database credentials.
- Do not read `.env.production`.
- Do not run MySQL.

### Schema creation

Use the accepted raw SQL migration:

```text
backend/migrations/001_create_lead_storage.sql
```

Recommended Step 5.4A-2 behavior:

```text
Do not rely on SQLAlchemy create_all for Lead persistence tables.
Use the reviewed raw SQL migration for local SQLite schema setup.
```

Implementation option:

```text
Apply the migration only when PARTYONCE_LEAD_STORAGE_MODE=sqlite_local and PARTYONCE_LEAD_SQLITE_PATH points to an approved local path.
```

Alternative:

```text
Run the migration in the test/acceptance setup before starting the backend.
```

The safer default for the first implementation is:

```text
Apply migration in an explicit local test setup, then let API code assume tables exist.
```

This keeps runtime API code simpler and reduces hidden schema side effects.

## 7. Endpoint Behavior for Step 5.4A-2

Allowed endpoints:

```text
POST /api/leads
GET /api/leads
GET /api/leads/{lead_id}
PATCH /api/leads/{lead_id}
```

No other API should be added.

### POST /api/leads

Behavior in `sqlite_local` mode:

```text
Validate customer.name.
Validate customer.contact.
Resolve contact into email, phone, or wechat_or_other_contact.
Create or reuse a conservative Customer record.
Create a Lead record.
Store selection as selection_snapshot_json.
Store pricing_snapshot as pricing_snapshot_json.
Default status to new.
Default priority to Medium.
Return the existing LeadResponse shape.
```

Must not:

```text
Create Quote.
Create Order.
Create payment record.
Trigger webhook or n8n.
Send email, SMS, or WhatsApp.
Allow public caller to set owner_user_id.
Allow public caller to set admin-only status.
```

### GET /api/leads

Behavior in `sqlite_local` mode:

```text
Keep require_admin.
Read Leads from SQLite.
Join or query Customer summary.
Support current query parameters: status, owner_user_id, priority, search, limit, offset.
Return existing LeadListResponse shape.
```

Search should remain simple:

```text
Search customer name, email, phone, other contact, and intake notes where practical.
```

### GET /api/leads/{lead_id}

Behavior in `sqlite_local` mode:

```text
Keep require_admin.
Return one persistent Lead.
Return 404 for missing Lead.
Preserve customer summary, selection snapshot, pricing snapshot, and follow-up summary shape.
```

### PATCH /api/leads/{lead_id}

Behavior in `sqlite_local` mode:

```text
Keep require_admin.
Allow only status, priority, owner_user_id, intake_notes, qualified_reason, unqualified_reason.
Update Lead operations fields.
Persist note / next action into follow_ups if the existing request shape includes those fields.
Return existing LeadResponse shape.
```

Must not:

```text
Convert Lead to Quote.
Convert Lead to Order.
Create Quote.
Create Order.
Trigger payment or external systems.
```

## 8. Contact Mapping

Use conservative parsing:

```text
customer.contact containing @ -> customers.email
customer.contact with mostly digits / phone symbols -> customers.phone
otherwise -> customers.wechat_or_other_contact
```

Customer reuse:

```text
Reuse exact email match.
Reuse exact phone match.
Reuse exact name + other contact match.
Otherwise create a new Customer.
```

Always create a new Lead for each submitted inquiry.

## 9. JSON Snapshot Handling

SQLite migration stores snapshots as `TEXT`.

Implementation should:

```text
json.dumps(selection)
json.dumps(pricing_snapshot)
json.loads(...) when building LeadResponse
```

If invalid or missing snapshot data exists:

```text
Return an empty object or the raw safe fallback.
Do not crash the endpoint.
```

## 10. Transaction Boundary

`POST /api/leads` should be one transaction:

```text
Begin local SQLite transaction.
Resolve or create Customer.
Create Lead.
Commit.
Return LeadResponse.
```

Failure behavior:

```text
Rollback transaction.
Return an HTTP error.
Do not leave orphan Lead rows.
Do not trigger external systems.
```

`PATCH /api/leads/{lead_id}` should also be transactional when it updates both `leads` and `follow_ups`.

## 11. Testing Plan for Step 5.4A-2

Allowed local tests:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
sqlite3 /tmp/partyonce_stage2_lead_storage.sqlite < backend/migrations/001_create_lead_storage.sql
Start backend with PYTHON_DOTENV_DISABLED=1 and explicit local SQLite profile.
POST /api/leads returns 201.
GET /api/leads returns the created Lead for admin test context if admin auth fixture/session is available.
PATCH /api/leads/{lead_id} updates allowed fields for admin test context if admin auth fixture/session is available.
Restart backend and confirm Lead still exists.
```

If admin auth fixture/session setup is not available:

```text
Document admin endpoint verification as blocked by auth fixture.
Still verify persistence directly with SQLite queries and public POST behavior.
```

Blocked tests:

```text
Production database test.
MySQL test.
Stripe test.
webhook / n8n test.
email / SMS / WhatsApp test.
deployment test.
frontend build.
```

## 12. Review and Staging Plan for Step 5.4A-2

Before staging:

```text
Review backend/main.py diff only for Lead persistence changes.
Confirm no Quote API or Order API additions.
Confirm no Stripe, PaymentIntent, webhook, n8n, or outbound messaging changes.
Confirm no .env.production reads or writes.
Confirm no frontend/vue-app/dist staged.
Confirm no unrelated historical dirty files staged.
```

Expected whitelist:

```text
backend/main.py
docs/PARTYONCE_STAGE2_STEP5_4A2_SQLITE_LEAD_PERSISTENCE_WORKPACK_20260510.md
```

Use:

```text
git add backend/main.py docs/PARTYONCE_STAGE2_STEP5_4A2_SQLITE_LEAD_PERSISTENCE_WORKPACK_20260510.md
```

Never use:

```text
git add .
```

## 13. Continued Blockers

Step 5.4A-1 and Step 5.4A-2 continue to block:

```text
Quote API
Order API
Stripe / payment
webhook / n8n
email / SMS / WhatsApp
production database connection
production migration
.env.production reads or writes
frontend/vue-app/dist submission
full supplier backend
automatic approval
contract signing
deployment
push
```

## 14. Acceptance Criteria for Step 5.4A-1

This planning step is accepted when:

```text
The implementation path is limited to SQLite local Lead persistence.
The storage mode switch is explicit.
The local database path is outside git.
The endpoint behavior is defined.
The transaction and JSON snapshot handling rules are defined.
The test plan avoids production database and external systems.
The next coding step is clearly limited to backend/main.py and a workpack report.
```

## 15. Next Recommended Step

After this plan is reviewed and accepted, proceed to:

```text
Step 5.4A-2: backend-only SQLite Lead persistence implementation
```

Do not start Step 5.4A-2 until this document is reviewed and committed.
