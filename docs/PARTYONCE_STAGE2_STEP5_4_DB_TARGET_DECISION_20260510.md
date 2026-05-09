# PartyOnce Stage 2 Step 5.4 DB Target Decision

Date: 2026-05-10

Scope: choose the next persistent Lead storage path before API persistence work

## 1. Objective

Step 5.4 is a decision gate after the accepted SQLite migration and MySQL compatibility pass.

The goal is to decide whether the next implementation step should use:

```text
Path A: SQLite-only local persistence prototype
Path B: MySQL migration dry-run path
```

This document does not implement persistent API code, does not run migrations, does not connect to a database, and does not modify production configuration.

## 2. Inputs

Accepted local migration:

```text
backend/migrations/001_create_lead_storage.sql
```

Accepted workpacks:

```text
docs/PARTYONCE_STAGE2_STEP5_2_BACKEND_MIGRATION_WORKPACK_20260510.md
docs/PARTYONCE_STAGE2_STEP5_3_MYSQL_COMPATIBILITY_PASS_20260510.md
docs/PARTYONCE_STAGE2_STEP5_3_LEAD_STORAGE_MYSQL_DRAFT_20260510.sql
```

Current persistent scope remains:

```text
customers
leads
follow_ups
```

Deferred scope remains:

```text
quotes
orders
payment records
Stripe
webhook / n8n
email / SMS / WhatsApp
supplier full backend
contracts
production deployment
```

## 3. Current State

The backend already has a Lead API skeleton:

```text
POST /api/leads
GET /api/leads
GET /api/leads/{lead_id}
PATCH /api/leads/{lead_id}
```

The skeleton currently uses an in-memory store. It does not persist records after backend restart.

The migration file creates the minimum tables needed to replace the in-memory store for local/staging use:

```text
customers
leads
follow_ups
```

The MySQL draft is a review artifact only and has not been executed.

## 4. Path A: SQLite-Only Local Persistence Prototype

### Purpose

Use the accepted SQLite migration to make the Lead API skeleton persist data locally without production database access.

### Why this is the recommended next path

- It matches the already dry-run migration target.
- It avoids production database configuration.
- It keeps Step 5 focused on Lead persistence only.
- It can validate the backend contract before MySQL ownership decisions.
- It preserves the Stage 1 local demo and Step 4 quote-to-lead bridge safety model.

### Allowed in Path A

```text
Create or reuse a local SQLite database file outside production.
Wire POST /api/leads to insert customers and leads.
Wire GET /api/leads to read persisted leads.
Wire GET /api/leads/{lead_id} to read one persisted lead.
Wire PATCH /api/leads/{lead_id} to update lead operations fields.
Keep follow_ups available for notes / next action persistence if the existing API surface needs it.
Run local-only SQLite tests or py_compile checks.
```

### Not allowed in Path A

```text
No Quote API.
No Order API.
No payment or Stripe.
No webhook or n8n.
No email, SMS, WhatsApp, or outbound messaging.
No production deployment.
No .env.production changes.
No dist submission.
No production database connection.
```

### Acceptance checks

Path A is accepted when:

```text
POST /api/leads creates persistent Customer + Lead rows in a local SQLite target.
GET /api/leads returns rows after process-local in-memory reset or backend restart, if restart is tested.
GET /api/leads/{lead_id} returns the persisted Lead detail shape.
PATCH /api/leads/{lead_id} updates status / priority / owner / notes fields without creating Quote or Order.
Invalid status and priority remain rejected.
No external system is triggered.
```

## 5. Path B: MySQL Migration Dry-Run Path

### Purpose

Validate the MySQL-compatible draft against a non-production MySQL target before any API persistence work depends on MySQL behavior.

### Required owner confirmations before Path B

Owner must confirm:

```text
Target MySQL version.
Whether CHECK constraints are enforced by the target version.
Whether JSON columns should remain native JSON or be changed to TEXT.
Whether owner_user_id should reference users.id now.
Whether author_user_id should reference users.id now.
Which local/staging database target may be used for dry run.
```

### Allowed in Path B

```text
Create a MySQL migration candidate after owner approval.
Run the candidate only against a local/staging MySQL target approved by owner.
Validate table creation, indexes, foreign keys, JSON fields, and CHECK behavior.
Record dry-run output in docs.
```

### Not allowed in Path B

```text
No production database connection.
No production migration.
No .env.production reads or changes.
No persistent API code before dry-run result is accepted.
No Quote API.
No Order API.
No payment, Stripe, webhook, n8n, or outbound messaging.
No deploy.
```

### Acceptance checks

Path B is accepted when:

```text
customers, leads, and follow_ups create successfully in a non-production MySQL target.
Expected indexes exist.
Foreign keys are active.
Lead status and priority validation behavior is confirmed.
JSON snapshot storage behavior is confirmed.
Rollback draft is reviewed, not run against production.
```

## 6. Recommendation

Recommended next step:

```text
Choose Path A first: SQLite-only local persistence prototype.
```

Reason:

- It is the lowest-risk way to replace the in-memory Lead API store.
- It does not require production configuration or owner-provided database credentials.
- It lets the app prove the Lead persistence contract before introducing MySQL environment risk.

Path B should remain blocked until owner confirms the MySQL target and version.

## 7. Step 5.5 Proposal

If Path A is accepted, the next narrow implementation task should be:

```text
Step 5.5: Lead API SQLite persistence prototype
```

Allowed Step 5.5 scope:

```text
Backend-only Lead persistence.
Use customers / leads / follow_ups only.
Preserve existing Lead API response contract.
Keep localStorage frontend fallback unchanged.
Run local SQLite-only tests.
Document the result.
```

Explicit Step 5.5 blockers:

```text
Quote API
Order API
Stripe / payment
webhook / n8n
email / SMS / WhatsApp
production deployment
.env.production
dist
full supplier backend
automatic approval
contract signing
```

## 8. Safety Statement

This Step 5.4 pass did not:

- Modify backend code.
- Modify frontend code.
- Create or run a migration.
- Connect to any database.
- Read or modify `.env.production`.
- Submit or clean `frontend/vue-app/dist`.
- Trigger Stripe or payment.
- Trigger webhook or n8n.
- Send email, SMS, WhatsApp, or outbound messages.
- Deploy.
- Push.

