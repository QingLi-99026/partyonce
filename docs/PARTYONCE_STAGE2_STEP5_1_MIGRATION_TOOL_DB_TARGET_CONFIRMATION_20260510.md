# PartyOnce Stage 2 Step 5.1 Migration Tool and Database Target Confirmation

Date: 2026-05-10

Scope: migration mechanism confirmation and draft-only Lead persistence migration

## 1. Objective

Step 5.1 confirms the safest migration path for persistent Lead storage before any backend API implementation begins.

This step is intentionally limited to:

- Inspecting the existing backend migration style.
- Confirming a proposed local/staging database target.
- Producing a reviewable SQL migration draft.

This step does not modify backend code, frontend code, production configuration, or database state.

## 2. Current Repository Findings

The backend currently has:

```text
backend/init.sql
backend/schema_sqlite.sql
backend/migration_deposit.sql
backend/requirements.txt
backend/main.py
```

Observed migration style:

- Existing database assets are raw SQL files.
- No Alembic directory or `alembic.ini` was found.
- `backend/requirements.txt` includes SQLAlchemy and MySQL drivers, but does not establish an Alembic workflow.
- `backend/main.py` creates a SQLAlchemy engine from `DATABASE_URL`.
- `backend/main.py` still has startup table verification through SQLAlchemy metadata.
- Existing SQL assets include both SQLite-style and MySQL-style schema references.

Conclusion:

```text
Use raw SQL migration drafts first.
Do not introduce Alembic in Step 5.1.
Do not rely on SQLAlchemy create_all as the migration mechanism for new persistent Lead tables.
```

## 3. Recommended Migration Mechanism

Recommended Step 5 migration mechanism:

```text
reviewed raw SQL migration files
manual local/staging dry run only after owner approval
production migration blocked until owner confirms database target and rollback plan
```

Reasoning:

- The repo already uses raw SQL assets.
- Adding Alembic would be a new migration system and should not be introduced silently.
- `create_all` is not a safe production migration strategy because it can create unmanaged tables at startup.
- Raw SQL makes the Customer/Lead/FollowUp subset easier to review before execution.

## 4. Recommended Database Target

Step 5.1 database target recommendation:

```text
Primary dry-run target: local/staging SQLite under /tmp or an owner-approved local DB
Compatibility target: MySQL-style review pass before any production-like database
Production target: blocked until owner confirms stable database, migration window, and rollback
```

Do not use:

- `.env.production`
- production database
- remote database
- live payment database
- deployment environment

## 5. Migration Draft File

Draft file created:

```text
docs/PARTYONCE_STAGE2_STEP5_1_LEAD_STORAGE_MIGRATION_DRAFT_20260510.sql
```

This file is a draft-only artifact.

It is not placed in `backend/`.
It is not executable by the app automatically.
It was not run.

## 6. Tables Covered

The draft covers only the persistent Lead subset:

```text
customers
leads
follow_ups
```

It also includes indexes for:

```text
customer contact lookup
lead status / owner / priority / submitted_at filtering
follow-up lead timeline lookup
```

It intentionally does not create:

```text
quotes
orders
payment tables
supplier backend tables
contract tables
external notification tables
```

## 7. Implementation Boundary

Step 5.1 did not:

- Modify `backend/main.py`.
- Modify frontend code.
- Create a backend migration file.
- Run a migration.
- Connect to a database.
- Read or modify `.env.production`.
- Submit `frontend/vue-app/dist`.
- Start Quote API.
- Start Order API.
- Touch Stripe or payment code.
- Trigger webhook, n8n, email, SMS, WhatsApp, or other outbound systems.
- Deploy.
- Push.

## 8. Known Blockers Before Execution

Before converting the draft into a real backend migration, owner should confirm:

1. Whether Step 5 uses raw SQL only, or whether a formal migration tool should be introduced.
2. Whether the first dry run targets SQLite, MySQL, or both.
3. Whether `backend/main.py` startup table verification should be disabled or bypassed for migration-managed tables.
4. The final foreign key target for `owner_user_id` and `author_user_id`.
5. Whether contact deduplication should be exact-match only in the first persistent version.
6. Whether rollback should drop tables or only disable application access in staging.

## 9. Next Recommended Step

After owner review, the next narrow step should be:

```text
Step 5.2: convert the reviewed draft into an approved backend migration file and run it only in a safe local/staging profile
```

Do not start persistent API code until the migration mechanism and database target are approved.

Do not expand into Quote API, Order API, payment, webhook, n8n, outbound messaging, supplier full backend, or production deployment.
