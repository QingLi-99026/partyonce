# Party Event / 派对活动 Quote Minimal Closed Loop Workpack

Date: 2026-05-12

## 1. Goal

This workpack validates the Stage 2 Quote minimal closed loop:

```text
Persistent Lead
-> draft Quote
-> Admin Quote Queue
-> Quote status update
-> local SQLite persistence
-> backend restart persistence check
```

This pass did not attempt to complete the whole app. It only closed and evidenced the Quote loop already present in the local/staging skeleton.

## 2. Modified Files

Business code changes:

```text
None.
```

New report:

```text
docs/PARTYONCE_QUOTE_MINIMAL_CLOSED_LOOP_WORKPACK_20260510.md
```

Reason no code change was needed:

```text
The existing Stage 2 Quote API skeleton, Quote storage migration, Admin Quote Queue, Admin Quote Detail route, and navigation entry already covered the required minimal loop. This workpack focused on local/staging acceptance evidence and commit hygiene.
```

## 3. Quote API Skeleton Implementation Status

Verified existing endpoints:

```text
POST  /api/quotes
GET   /api/quotes
GET   /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

Verified behavior:

```text
Quote is created from a persistent Lead.
POST /api/quotes requires lead_id.
Invalid lead_id is rejected.
Quote creation copies customer_id from Lead.
Quote creation copies Lead selection/pricing snapshots.
Quote is created as draft.
quote_number is generated.
Quote is written to the quotes table.
Quote API is admin/manager only.
converted_to_order remains blocked.
No Order is created.
No payment, webhook/n8n, or outbound message is triggered.
```

Allowed status set exposed in the admin workflow:

```text
draft
sent
accepted
rejected
expired
```

## 4. Admin Quote Queue Implementation Status

Verified existing frontend surfaces:

```text
frontend/vue-app/src/views/AdminQuotes.vue
frontend/vue-app/src/views/AdminQuoteDetail.vue
frontend/vue-app/src/router/index.js
frontend/vue-app/src/components/NavHeader.vue
```

Verified browser routes:

```text
/admin/quotes
/admin/quotes/1
```

Verified displayed/available data:

```text
quote_number
customer
lead_id
status
amount
created_at
detail route
allowed status update control
local/staging-only warning
no order/payment/outbound boundary copy
```

Browser evidence:

```text
/tmp/partyonce_quote_workpack_browser_acceptance.json
/tmp/partyonce_quote_workpack_admin_quotes.png
/tmp/partyonce_quote_workpack_admin_quote_detail.png
```

These `/tmp` artifacts are evidence only and must not be staged.

## 5. Local Acceptance Results

Safe local profile:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite:////tmp/partyonce_quote_workpack_backend_dummy.sqlite
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_quote_workpack.sqlite
backend host=127.0.0.1:18110
frontend host=127.0.0.1:18111
```

API and SQLite acceptance:

| Check | Result |
| --- | --- |
| apply `001_create_lead_storage.sql` | pass |
| apply `002_create_quote_storage.sql` | pass |
| register admin fixture | pass |
| register non-admin fixture | pass |
| admin login | pass |
| non-admin login | pass |
| `POST /api/leads` creates persistent Lead | pass |
| `PATCH /api/leads/{id}` qualifies Lead as admin | pass |
| `POST /api/quotes` creates draft Quote from Lead | pass |
| `GET /api/quotes` lists created Quote | pass |
| `GET /api/quotes/{id}` returns Quote detail | pass |
| `PATCH /api/quotes/{id}` updates `draft -> sent` | pass |
| invalid `lead_id` Quote creation rejected | pass |
| anonymous Quote API access rejected | pass |
| non-admin Quote API access rejected | pass |
| SQLite Quote row exists | pass |
| SQLite Lead marked `converted_to_quote` | pass |

Acceptance evidence:

```text
/tmp/partyonce_quote_workpack_acceptance_initial.json
```

Created Quote:

```text
id=1
quote_number=Q-20260512-3ACA
status=sent
lead_id=1
customer_id=1
```

## 6. SQLite Table And Data Verification

Tables verified in `/tmp/partyonce_quote_workpack.sqlite`:

```text
customers
leads
follow_ups
quotes
```

SQLite counts after acceptance:

```text
customers=1
leads=1
quotes=1
```

Quote row after status update:

```text
id=1
quote_number=Q-20260512-3ACA
status=sent
lead_id=1
customer_id=1
final_total=1210
```

Lead row after Quote creation:

```text
id=1
status=converted_to_quote
source=workpack_quote_acceptance
```

## 7. Backend Restart Persistence Check

Backend was stopped and restarted with the same safe local profile.

Restart evidence:

```text
/tmp/partyonce_quote_workpack_restart_check.json
```

Restart result:

```text
admin login after restart: 200
GET /api/quotes/1 after restart: 200
SQLite row after restart: present
Quote status after restart: sent
```

Conclusion:

```text
Quote persisted across backend restart.
```

## 8. External Systems

Triggered external systems:

```text
No.
```

Not triggered:

```text
Order API creation
payment
Stripe
PaymentIntent
webhook
n8n
email
SMS
WhatsApp
WeChat
WeCom
deployment
push
production database
production migration
```

## 9. Production / Build Artifacts

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

## 10. Static Checks

Executed:

```text
backend/venv/bin/python -m py_compile backend/main.py
node SFC parse for src/views/AdminQuotes.vue
node SFC parse for src/views/AdminQuoteDetail.vue
git diff --check -- backend/main.py frontend/vue-app/src/views/AdminQuotes.vue frontend/vue-app/src/router/index.js frontend/vue-app/src/components/NavHeader.vue
```

Results:

```text
backend/main.py py_compile: pass
AdminQuotes.vue SFC parse: pass
AdminQuoteDetail.vue SFC parse: pass
git diff --check: pass
```

Note:

```text
System Python lacked FastAPI, so backend runtime acceptance used the existing project venv at backend/venv/bin/python. No package install was performed.
```

## 11. Still Not Done

Out of scope for this workpack:

```text
Order API
Order creation
payment / Stripe / PaymentIntent
webhook / n8n
customer-facing Quote presentation
email / SMS / WhatsApp / WeChat / WeCom outbound
production DB
production migration
deployment
push
full supplier backend
contract signing
automatic review
```

## 12. Next Recommendation

Recommended next 10% workpack:

```text
Quote acceptance hardening and handoff to Order readiness.
```

Suggested scope:

```text
1. Add or verify duplicate Quote prevention for the same Lead if product wants one active Quote per Lead.
2. Add a focused backend test file for Quote API skeleton.
3. Keep `converted_to_order` blocked until Order workpack is explicitly approved.
4. Prepare App review before any Order/payment/deployment work.
```

Do not jump to Order/payment/deployment from this workpack without a separate approval-gated plan.
