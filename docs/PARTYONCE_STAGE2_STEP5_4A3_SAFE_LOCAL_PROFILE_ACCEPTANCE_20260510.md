# PartyOnce Stage 2 Step 5.4A-3 Safe Local Profile Acceptance

Date: 2026-05-10

Scope: local-only acceptance for SQLite Lead persistence prototype

## 1. Objective

Validate that the Step 5.4A-2 Lead persistence prototype can run in a safe local backend profile and write Lead intake to local SQLite.

This acceptance did not test Quote API, Order API, payment, webhook, n8n, outbound messaging, production database, deployment, or frontend build.

## 2. Safe Local Profile

Backend was started with explicit local-only settings:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite:////tmp/partyonce_stage2_5_4a3_backend_dummy.sqlite
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_stage2_5_4a3_acceptance.sqlite
host=127.0.0.1
port=8012
```

The backend startup log showed the active database target as local SQLite under `/tmp`.

No production database target was used.

## 3. Commands Run

Syntax check:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache backend/venv/bin/python -m py_compile backend/main.py
```

Migration smoke check:

```text
sqlite3 /tmp/partyonce_stage2_step5_4a2_test.sqlite < backend/migrations/001_create_lead_storage.sql
sqlite3 /tmp/partyonce_stage2_step5_4a2_test.sqlite ".tables"
```

Local backend acceptance:

```text
POST /api/leads
sqlite3 /tmp/partyonce_stage2_5_4a3_acceptance.sqlite lead/customer count checks
GET /api/leads without auth
backend restart
sqlite3 /tmp/partyonce_stage2_5_4a3_acceptance.sqlite persistence check after restart
GET /api/leads without auth after restart
```

## 4. Acceptance Results

### Syntax checks

Result:

```text
passed
```

### Migration smoke check

Tables present:

```text
customers
leads
follow_ups
```

### POST /api/leads

Public POST returned:

```text
201 Created
```

Returned Lead summary:

```text
id=1
customer.name=Stage 5.4A Test Parent
customer.contact=stage54a@example.test
source=web_quote
status=new
priority=Medium
preferred_event_date=2026-06-01
```

### SQLite persistence check

After POST:

```text
customers count=1
leads count=1
lead row=1|1|new|Medium|web_quote|2026-06-01
```

### Admin guard check

Unauthenticated `GET /api/leads` returned:

```text
401
```

This confirms the endpoint is not publicly listable without auth.

### Restart persistence check

After backend restart, the same SQLite file still contained:

```text
customers count=1
leads count=1
lead row=1|new|Medium|web_quote
```

Unauthenticated `GET /api/leads` after restart still returned:

```text
401
```

## 5. What Was Not Tested

Admin authenticated `GET /api/leads`, `GET /api/leads/{lead_id}`, and `PATCH /api/leads/{lead_id}` were not fully exercised because no safe admin auth fixture/session was established in this step.

The database-level persistence and public POST path were verified.

Next step should either:

```text
create a safe local admin auth fixture/session
or document admin endpoint runtime verification as blocked until auth fixture exists
```

## 6. Safety Boundaries Confirmed

This acceptance did not:

- Modify frontend source.
- Modify `frontend/vue-app/dist`.
- Read or modify `.env.production`.
- Modify backend migration files.
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

`backend/__pycache__` was restored/excluded after local checks.

## 7. Current Result

Step 5.4A-3 is accepted for the public Lead intake persistence path:

```text
POST /api/leads -> customers/leads persisted in local SQLite -> data survives backend restart
```

Remaining gap:

```text
Authenticated admin runtime verification for GET/PATCH endpoints
```

Recommended next step:

```text
Step 5.4A-4: /quote -> persistent Lead acceptance
```

That step should run the frontend bridge in explicit local/staging mode and confirm:

```text
/quote localStorage write succeeds
POST /api/leads returns persistent Lead ID
customers/leads persist in SQLite
backend restart does not lose the Lead
```

Do not expand into Quote API, Order API, payment, webhook, n8n, outbound messaging, or deployment.

