# PartyOnce Stage 2 Step 5.2 Backend Migration Workpack

Date: 2026-05-10

Scope: create formal backend migration file and safe local/staging dry run only

## 1. Objective

Convert the reviewed Step 5.1 SQL draft into a backend migration file for persistent Lead storage.

This workpack does not implement API persistence and does not touch Quote API, Order API, payment, webhook, n8n, outbound messaging, production configuration, or deployment.

## 2. Files Added

```text
backend/migrations/001_create_lead_storage.sql
docs/PARTYONCE_STAGE2_STEP5_2_BACKEND_MIGRATION_WORKPACK_20260510.md
```

## 3. Migration Scope

The migration creates only:

```text
customers
leads
follow_ups
```

It creates indexes for:

```text
customers.email
customers.phone
customers.wechat_or_other_contact
leads.customer_id
leads.status
leads.owner_user_id
leads.priority
leads.submitted_at
leads.status + owner_user_id + submitted_at
follow_ups.lead_id
follow_ups.created_at
follow_ups.lead_id + created_at
```

It also includes Lead status and priority checks.

## 4. Explicitly Not Included

The migration does not create:

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

## 5. Dry Run Target

Dry run target:

```text
/tmp/partyonce_step5_2_lead_storage_dryrun.db
```

This file is outside the repository and is not intended for git.

## 6. Safety Boundary

This workpack did not:

- Read or modify `.env.production`.
- Connect to production database.
- Run against remote database.
- Modify `backend/main.py`.
- Modify frontend code.
- Submit or clean `frontend/vue-app/dist`.
- Start backend server.
- Run application API requests.
- Trigger payment.
- Trigger Stripe.
- Trigger webhook or n8n.
- Send email, SMS, WhatsApp, or other outbound messages.
- Deploy.
- Push.

## 7. Validation Result

The migration was applied only to the `/tmp` SQLite dry-run database.

Validation checked:

```text
customers table exists
leads table exists
follow_ups table exists
expected indexes exist
invalid Lead status is rejected by CHECK constraint
invalid Lead priority is rejected by CHECK constraint
valid Customer + Lead + FollowUp inserts work
```

Dry-run command result summary:

```text
customer_count: 1
lead_count: 1
follow_up_count: 1
invalid status insert exit code: 19
invalid priority insert exit code: 19
```

The invalid status and priority cases failed with the expected SQLite CHECK constraint errors.

No production data was touched.

## 8. Current Limitations

This migration is SQLite-first.

Before MySQL or production-like use, owner should review:

- `INTEGER PRIMARY KEY` strategy versus MySQL `AUTO_INCREMENT`.
- `DATETIME DEFAULT CURRENT_TIMESTAMP` behavior.
- `CHECK` constraint support in the target MySQL version.
- JSON snapshot storage as `TEXT` versus native JSON.
- Whether `owner_user_id` and `author_user_id` should reference `users.id`.
- Whether foreign keys should specify `ON DELETE` behavior.

## 9. Next Recommended Step

Next narrow step:

```text
Step 5.3: review this migration file, then decide whether to adapt it for MySQL compatibility or proceed with local SQLite-only persistence prototype.
```

Do not start persistent API code until this migration file is reviewed and accepted.
