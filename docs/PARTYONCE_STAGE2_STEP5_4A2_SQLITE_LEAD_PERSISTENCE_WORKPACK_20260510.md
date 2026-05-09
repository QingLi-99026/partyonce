# PartyOnce Stage 2 Step 5.4A-2 SQLite Lead Persistence Workpack

Date: 2026-05-10

Scope: backend-only SQLite local Lead persistence prototype

## 1. Objective

Move the existing Lead API skeleton toward local persistence without expanding into Quote API, Order API, payment, webhook, n8n, outbound messaging, or production deployment.

This workpack implements only an explicit local SQLite path for:

```text
POST /api/leads
GET /api/leads
GET /api/leads/{lead_id}
PATCH /api/leads/{lead_id}
```

## 2. Files Changed

```text
backend/main.py
docs/PARTYONCE_STAGE2_STEP5_4A2_SQLITE_LEAD_PERSISTENCE_WORKPACK_20260510.md
```

No frontend files were modified by this workpack.

No migration file was modified by this workpack.

## 3. Implementation Summary

`backend/main.py` now supports two Lead storage modes:

```text
memory
sqlite_local
```

Default mode remains:

```text
memory
```

SQLite persistence only activates when the process explicitly sets:

```text
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
```

The local SQLite path is controlled by:

```text
PARTYONCE_LEAD_SQLITE_PATH
```

The default local path is:

```text
/tmp/partyonce_stage2_lead_storage.sqlite
```

The implementation rejects SQLite paths inside the repository and only allows explicit local temp paths under `/tmp` or `/var/folders`.

## 4. Persistent Tables Used

This workpack uses only the accepted Step 5.2 migration tables:

```text
customers
leads
follow_ups
```

It does not create or use:

```text
quotes
orders
payment tables
Stripe tables
webhook logs
n8n logs
email / SMS / WhatsApp logs
supplier backend tables
contract tables
```

## 5. Endpoint Behavior

### POST /api/leads

In `sqlite_local` mode:

- Validates the existing Lead request schema.
- Resolves customer contact to email, phone, or other contact.
- Reuses Customer by exact email, exact phone, or exact name + other contact.
- Creates a new Lead for every inquiry.
- Stores `selection` as `selection_snapshot_json`.
- Stores `pricing_snapshot` as `pricing_snapshot_json`.
- Defaults status to `new`.
- Defaults priority to `Medium`.
- Returns the existing `LeadResponse` shape.

It does not:

- Create Quote.
- Create Order.
- Create payment state.
- Trigger webhook or n8n.
- Send outbound messages.

### GET /api/leads

In `sqlite_local` mode:

- Keeps the existing `require_admin` guard.
- Reads Leads from local SQLite.
- Supports status, owner, priority, search, limit, and offset.
- Returns the existing `LeadListResponse` shape.

### GET /api/leads/{lead_id}

In `sqlite_local` mode:

- Keeps the existing `require_admin` guard.
- Returns one persistent Lead.
- Returns 404 when missing.
- Includes customer summary, selection snapshot, pricing snapshot, and follow-up summary.

### PATCH /api/leads/{lead_id}

In `sqlite_local` mode:

- Keeps the existing `require_admin` guard.
- Updates allowed Lead operations fields.
- Persists note and next action into `follow_ups`.
- Persists qualified and unqualified reasons as typed follow-up notes.
- Returns the existing `LeadResponse` shape.

It does not:

- Convert Lead to Quote.
- Convert Lead to Order.
- Create Quote.
- Create Order.
- Trigger payment or external systems.

## 6. Safety Boundaries

This workpack did not:

- Modify frontend code.
- Modify `frontend/vue-app/dist`.
- Read or modify `.env.production`.
- Modify `backend/migrations/001_create_lead_storage.sql`.
- Run production migration.
- Connect to production database.
- Run MySQL.
- Start Quote API.
- Start Order API.
- Touch Stripe or payment code.
- Trigger webhook or n8n.
- Send email, SMS, WhatsApp, or outbound messages.
- Deploy.
- Push.

## 7. Validation Results

Python syntax check:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result:

```text
passed
```

SQLite migration smoke check:

```text
sqlite3 /tmp/partyonce_stage2_step5_4a2_test.sqlite < backend/migrations/001_create_lead_storage.sql
sqlite3 /tmp/partyonce_stage2_step5_4a2_test.sqlite ".tables"
```

Result:

```text
customers
leads
follow_ups
```

Diff safety check:

```text
No added Stripe, PaymentIntent, webhook, n8n, AIChat, Quote API, Order API, dist, or env.production references were found in backend/main.py diff.
```

`backend/__pycache__` was restored/excluded after syntax checking.

## 8. Known Limitations

The backend server was not started in this workpack.

Admin endpoint runtime verification still requires a safe local admin auth fixture/session.

The global backend database startup behavior still exists in `backend/main.py`; safe local profile must set a local database configuration if the backend is started for acceptance.

This is still a local persistence prototype, not a production database solution.

## 9. Next Recommended Step

Next narrow step:

```text
Step 5.4A-3: safe local profile acceptance
```

That step should start the backend only with a safe local profile, verify `POST /api/leads` against SQLite persistence, and verify admin Lead operations if an admin auth fixture/session is available.

Do not proceed to Quote API, Order API, payment, webhook, n8n, outbound messaging, or deployment.

