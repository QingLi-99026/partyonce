# PartyOnce Stage 2 Step 5.4 Persistence Path Decision

Date: 2026-05-10

Scope: path selection confirmation and next minimum construction plan only

## 1. Objective

This document confirms the next persistence path for PartyOnce Lead storage after Step 5.1, Step 5.2, and Step 5.3.

It compares:

```text
Route A: SQLite-only local persistence prototype
Route B: MySQL migration dry-run path
```

This is not an implementation task. It does not write API code, does not modify `backend/main.py`, does not run MySQL, does not connect to production database, and does not start Quote API, Order API, or payment work.

## 2. Current State

Completed inputs:

```text
fb589041ec2e58c9a922b6734085e06f6821fcb2
Add step 5.1 lead storage migration draft

ff540fc90bf8212ab5e926c74514070f0d5862f1
Add lead storage migration

b4205f089fd6c17a31445f6a9a7c378ec83c23e8
Add step 5.3 MySQL compatibility pass
```

Confirmed app/backend state:

- Stage 1 local demo / alpha acceptance has been completed.
- Lead API skeleton already exists.
- `/quote -> POST /api/leads` local/staging bridge has been implemented.
- Step 4 real local acceptance passed with safe local backend profile.
- The bridge keeps localStorage first and only attempts backend sync in explicit local/staging mode.
- SQLite migration file exists at `backend/migrations/001_create_lead_storage.sql`.
- The SQLite migration has passed `/tmp` dry-run validation.
- MySQL compatibility report and draft SQL exist.
- MySQL draft has not been executed.
- Persistent Lead API code does not exist yet.
- Current Lead API still uses `LEAD_API_SKELETON_STORE`, an in-memory store.

Backend observations from read-only inspection:

- `backend/main.py` contains current database startup behavior using `DATABASE_URL`.
- `backend/main.py` contains `Base.metadata.create_all(bind=engine)` startup behavior.
- Lead API skeleton endpoints exist for `POST /api/leads`, `GET /api/leads`, `GET /api/leads/{lead_id}`, and `PATCH /api/leads/{lead_id}`.
- Admin Lead endpoints use the existing `require_admin` guard.

These observations mean persistent API work should be done carefully and locally. It should not accidentally use production configuration or uncontrolled schema creation.

## 3. Route A: SQLite-Only Local Persistence Prototype

### Evaluation

Route A uses the accepted SQLite migration as the first persistence implementation target.

It should replace the in-memory Lead API store with local SQLite persistence for Customer, Lead, and FollowUp only.

### Advantages

- The SQLite migration dry-run has already succeeded.
- It is the fastest way to validate persistent Lead API behavior.
- It is suitable for local development and local demo acceptance.
- It does not touch production database.
- It does not require MySQL target confirmation.
- It carries lower operational risk than MySQL dry-run.
- It can preserve the existing `/quote` bridge behavior and localStorage fallback.

### Risks

- SQLite and MySQL behavior still differ.
- SQLite cannot be treated as the production database plan.
- MySQL compatibility adjustments will still be needed later.
- Existing backend startup database behavior must be contained so local persistence does not drift into production behavior.
- Restart persistence must be tested explicitly; otherwise the app may appear persistent only during one process lifetime.

### Suitable Work

Route A is suitable for:

```text
Move POST /api/leads from in-memory store to SQLite local persistence.
Create or resolve Customer rows.
Create Lead rows.
Persist follow-up notes / next action if included in the existing Lead operation surface.
Verify Customer + Lead + FollowUp persistence.
Verify backend restart does not lose Leads.
Verify /quote bridge can create persistent Lead records.
```

### Not Suitable Work

Route A is not a reason to start:

```text
Quote API
Order API
Stripe / payment
webhook / n8n
email / SMS / WhatsApp
production deployment
production database migration
```

## 4. Route B: MySQL Migration Dry-Run Path

### Evaluation

Route B validates the MySQL-compatible draft against a non-production MySQL target before persistent API behavior depends on MySQL details.

### Advantages

- It is closer to the likely production database shape.
- It can surface MySQL syntax differences early.
- It can validate `AUTO_INCREMENT`, JSON, timestamp, foreign key, and CHECK behavior.
- It helps reduce future deployment risk if owner has already approved the target MySQL environment.

### Risks

- It requires a confirmed MySQL version.
- It requires a confirmed local/staging database target.
- It can accidentally connect to a remote or production database if environment isolation is weak.
- It requires stricter rollback and dry-run controls.
- Current owner approval for a specific MySQL dry-run target is not recorded.

### Suitable Work

Route B is suitable only after owner confirmation for:

```text
Target MySQL version.
Target local/staging MySQL database.
Connection method.
Rollback strategy.
CHECK constraint behavior.
JSON column behavior.
AUTO_INCREMENT behavior.
Timestamp / ON UPDATE behavior.
Whether owner_user_id should reference users.id.
Whether author_user_id should reference users.id.
```

### Not Suitable Work Right Now

Route B is not suitable for immediate execution because there is no owner-approved MySQL target for this step.

It should not be run against production.

## 5. Recommendation

Recommended next route:

```text
First choose Route A: SQLite-only local persistence prototype.
```

Reasons:

- The `/tmp` SQLite dry-run already validates the current migration file.
- Route A is the fastest safe path to verify persistent Lead behavior.
- Route A does not touch production configuration.
- Route A does not require MySQL version or target database confirmation.
- Route A can move Lead API from in-memory to local persistence without expanding product scope.
- Route A supports the current Stage 1 local demo and Stage 2 quote-to-lead bridge acceptance path.

Route B should remain a later controlled step:

```text
MySQL migration dry-run only after owner confirms MySQL version, target database, connection method, and rollback strategy.
```

The owner confirmation should also cover CHECK, JSON, AUTO_INCREMENT, and timestamp compatibility before any MySQL dry-run.

## 6. Next Minimum Construction Plan If Route A Is Accepted

### Step 5.4A-1: backend persistent Lead implementation plan

Purpose:

- Define exactly how `backend/main.py` should move from `LEAD_API_SKELETON_STORE` to SQLite local persistence.
- Decide whether persistence helpers stay inside `backend/main.py` for the prototype or move to a small backend helper module.
- Define how to avoid reading or depending on `.env.production`.
- Define the safe local database path, preferably under `/tmp` for acceptance.
- Define the test commands before code changes.

Output:

```text
Implementation plan document only.
No API code change.
No database connection except optional local inspection if explicitly approved.
```

### Step 5.4A-2: backend-only SQLite Lead persistence implementation

Purpose:

- Change only the Lead API persistence layer.
- Keep the existing Lead API request and response contract.
- Use `customers`, `leads`, and `follow_ups` only.
- Preserve admin-only guards on list/detail/patch endpoints.

Expected behavior:

```text
POST /api/leads writes Customer + Lead.
GET /api/leads reads persistent Leads.
GET /api/leads/{lead_id} reads one persistent Lead.
PATCH /api/leads/{lead_id} updates allowed operations fields.
No Quote is created.
No Order is created.
No external system is triggered.
```

### Step 5.4A-3: safe local profile acceptance

Purpose:

- Run backend locally with production dotenv disabled.
- Use local SQLite only.
- Validate persistence without production database or external services.

Acceptance:

```text
Migration applies to local SQLite target.
POST /api/leads returns created Lead ID.
GET /api/leads can list persisted Lead.
PATCH /api/leads can update allowed fields.
Invalid status / priority remain rejected.
Backend restart does not lose persisted Lead.
```

### Step 5.4A-4: /quote -> persistent Lead acceptance

Purpose:

- Verify the existing `/quote` bridge can write localStorage first, then create a persistent Lead through `POST /api/leads`.

Acceptance:

```text
/quote localStorage write still succeeds.
Backend sync runs only in explicit local/staging bridge mode.
Backend returns persistent Lead ID.
Lead remains available after backend restart.
Backend failure still does not block localStorage inquiry.
```

## 7. Continued Blockers

This stage continues to block:

```text
API code changes in this document-only pass
backend/main.py changes in this document-only pass
MySQL execution
production database connection
production migration
.env.production reads or writes
frontend/vue-app/dist submission
Quote API
Order API
Stripe / payment
webhook / n8n
email / SMS / WhatsApp
production deployment
push
full supplier backend
automatic approval
contract signing
large permission system expansion
```

## 8. Safety Statement

This Step 5.4 path decision pass did not:

- Modify frontend source.
- Modify backend source.
- Modify `backend/main.py`.
- Modify `backend/migrations`.
- Run migration.
- Connect to any database.
- Run build.
- Read or modify `.env.production`.
- Clean or submit `frontend/vue-app/dist`.
- Trigger Stripe or payment.
- Trigger webhook or n8n.
- Send email, SMS, WhatsApp, or other outbound messages.
- Deploy.
- Push.

## 9. Final Decision Request

Owner should confirm whether to proceed with:

```text
Route A: SQLite-only local persistence prototype
```

If accepted, the next task should be:

```text
Step 5.4A-1: backend persistent Lead implementation plan
```

Do not start Step 5.4A-2 implementation until Step 5.4A-1 is reviewed and accepted.
