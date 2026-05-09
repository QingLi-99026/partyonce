# PartyOnce Stage 2 Lead API Skeleton Workpack

Date: 2026-05-09  
Scope: Lead API skeleton only  
Repository: `/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`

## 1. Backend Stack Judgment

The backend is a Python FastAPI application centered on `backend/main.py`.

Observed structure:

- FastAPI app instance is defined in `backend/main.py`.
- SQLAlchemy is used for existing models and database sessions.
- Existing auth uses OAuth2 bearer tokens with `get_current_user`.
- Existing admin guard is `require_admin`, accepting users with `admin` or `manager` role.
- The app currently creates/validates SQLAlchemy tables on startup with `Base.metadata.create_all`.
- Existing routes are mostly defined directly in `backend/main.py`, with some supporting modules such as `api_extensions.py`.

Implementation decision:

- This workpack does not add SQLAlchemy models or migration files.
- The Lead API skeleton uses an in-process memory store so it does not create tables, run migrations, write a database, or require production configuration.
- Admin read/update endpoints use the existing `require_admin` dependency, but this remains a skeleton until the persistent Customer/Lead schema is approved.

## 2. Files Changed

- `backend/main.py`
- `docs/PARTYONCE_STAGE2_LEAD_API_SKELETON_WORKPACK_20260509.md`

## 3. Lead API Skeleton Implemented

Implemented endpoints:

```text
POST /api/leads
GET /api/leads
GET /api/leads/{lead_id}
PATCH /api/leads/{lead_id}
```

### `POST /api/leads`

Purpose:

- Public lead intake skeleton for quote/inquiry flow.

Request contract:

```json
{
  "customer": {
    "name": "",
    "contact": ""
  },
  "preferred_event_date": "",
  "intake_notes": "",
  "selection": {},
  "pricing_snapshot": {},
  "source": "web_quote"
}
```

Validation:

- `customer.name` is required and cannot be blank.
- `customer.contact` is required and cannot be blank.

Behavior:

- Creates an in-memory Lead skeleton record.
- Defaults status to `new`.
- Defaults priority to `Medium`.
- Does not create Quote.
- Does not create Order.
- Does not trigger payment, webhook, n8n, email, SMS, WhatsApp, or any external system.

### `GET /api/leads`

Purpose:

- Admin-only lead queue skeleton.

Supported query parameters:

- `status`
- `owner_user_id`
- `priority`
- `search`
- `limit`
- `offset`

Auth:

- Uses existing `require_admin`.
- Anonymous access is not allowed.

Storage:

- Reads the in-process memory store only.

### `GET /api/leads/{lead_id}`

Purpose:

- Admin-only Lead detail skeleton.

Response shape includes:

- Lead ID.
- Customer summary.
- Selection snapshot.
- Pricing snapshot.
- Follow-up summary placeholder.
- Status, priority, owner, submitted/created/updated timestamps.

Auth:

- Uses existing `require_admin`.

### `PATCH /api/leads/{lead_id}`

Purpose:

- Admin-only Lead operations update skeleton.

Allowed fields:

```text
status
priority
owner_user_id
intake_notes
qualified_reason
unqualified_reason
```

Boundaries:

- Does not convert Lead directly to Order.
- Does not create Quote.
- Does not trigger external systems.

## 4. Status and Priority Constraints

Lead status values:

```text
new
pending
contacted
qualified
unqualified
converted_to_quote
closed
```

Priority values:

```text
High
Medium
Low
```

## 5. Placeholder / TODO Items

Current placeholders:

- Lead records are stored in process memory only.
- No `customers`, `leads`, or `follow_ups` database tables are used.
- No migration is created.
- No database persistence exists for Lead records.
- Follow-up history is represented only as a response placeholder.
- `owner_user_id` is accepted as an integer placeholder but not validated against a user table in this skeleton.

TODO before production use:

- Implement approved Customer/Lead schema and migration.
- Persist Leads to the database.
- Add duplicate detection and spam/rate limiting for public lead intake.
- Add admin lead queue tests against the persistent store.
- Decide how localStorage demo records are submitted to this API from the frontend.

## 6. Auth / Admin Reality

Current real state:

- Admin endpoints use the existing `require_admin` dependency.
- `require_admin` depends on the existing token/user lookup and allows `admin` or `manager`.
- This is a real guard in the current backend code, but the Lead API itself is still a skeleton because it does not persist records.

Anonymous behavior:

- `POST /api/leads` allows anonymous creation with basic validation.
- `GET /api/leads`, `GET /api/leads/{lead_id}`, and `PATCH /api/leads/{lead_id}` require admin.

## 7. Database and Migration Status

Database use:

- No database write is implemented for Lead skeleton records.
- No database connection was required for the validation performed in this workpack.

Migration:

- No migration file was created.
- No migration was executed.
- No table was created by this workpack.

## 8. External Systems

This workpack did not trigger:

- Stripe.
- Real payment.
- Webhook.
- n8n.
- Email.
- SMS.
- WhatsApp.
- Deployment.
- Push.

## 9. Production Config

- `.env.production` was not read.
- `.env.production` was not modified.
- `frontend/vue-app/dist` was not touched.

## 10. Testing

Executed:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result:

- Passed.
- Syntax validation only.
- No app startup.
- No database connection.
- No external system call.

## 11. Current Risks

- In-memory records disappear when the process restarts.
- Multi-worker deployments would not share Lead records.
- Public Lead creation needs rate limiting before production.
- Admin queue behavior is only useful for skeleton contract validation until persistence exists.
- The existing backend startup behavior can create SQLAlchemy tables for declared models, so real Lead models should not be added until migration strategy is approved.
- `backend/main.py` had historical dirty content before this workpack was isolated, so review/staging must remain limited to the Lead API skeleton hunks and this report.

## 12. Clean Isolation Result

Clean isolation has been completed for `backend/main.py`.

- The dirty pre-isolation file was backed up under `/Users/aiagentkevin/PartyOnce_lead_api_isolation_backup_20260509/`.
- The workpack report was also backed up under the same directory before isolation.
- A clean baseline was generated from `HEAD:backend/main.py`.
- The following three Lead API skeleton fragments were extracted from the dirty file and injected into the clean baseline:
  - Lead API skeleton schemas.
  - In-memory Lead store and helper functions.
  - `POST /api/leads`, `GET /api/leads`, `GET /api/leads/{lead_id}`, and `PATCH /api/leads/{lead_id}` endpoints.
- The generated clean + Lead-only file passed syntax validation before replacing `backend/main.py`.
- The replaced `backend/main.py` passed syntax validation again.
- Current `backend/main.py` diff is limited to Lead API skeleton content.
- No migration was created or executed.
- No database write was performed.
- No external system was triggered.
- `.env.production` was not read or modified.

## 13. Next Step Recommendation

After owner review, the next smallest step is a persistence design checkpoint:

- Confirm whether to implement Customer + Lead tables first.
- Confirm migration tool and database target.
- Confirm admin user table for `owner_user_id`.
- Then implement persistent `POST /api/leads` and admin list/detail/update against the approved schema.

Do not expand next step into Quote API, Order API, payment, webhook/n8n, outbound messaging, or supplier backend.
