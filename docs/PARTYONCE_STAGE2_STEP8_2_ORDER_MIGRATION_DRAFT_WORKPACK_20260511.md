# PartyOnce Stage 2 Step 8.2 Order Migration Draft Workpack

Date: 2026-05-11

## 1. Scope

Step 8.2 adds the local/staging SQLite migration draft for persistent Order skeleton storage.

This step only creates a migration draft and runs a local SQLite dry-run. It does not implement Order API code, frontend code, payment behavior, Stripe integration, webhook/n8n behavior, outbound messaging, production deployment, or production database migration.

## 2. Files Added

```text
backend/migrations/003_create_order_storage.sql
docs/PARTYONCE_STAGE2_STEP8_2_ORDER_MIGRATION_DRAFT_WORKPACK_20260511.md
```

## 3. Migration Added

Migration:

```text
backend/migrations/003_create_order_storage.sql
```

Table:

```text
orders
```

Dependencies:

```text
backend/migrations/001_create_lead_storage.sql
backend/migrations/002_create_quote_storage.sql
```

The migration creates only the Order skeleton storage table. It does not create payment, Stripe, webhook, n8n, supplier assignment, contract, or outbound messaging tables.

## 4. Orders Table Fields

The table includes:

```text
id
quote_id
lead_id
customer_id
order_number
status
event_date
event_location
currency
total_amount
deposit_amount
deposit_status
payment_reference
selection_snapshot_json
line_items_json
customer_snapshot_json
internal_notes
created_by_user_id
confirmed_at
created_at
updated_at
```

## 5. Status And Deposit Placeholders

Order status enum:

```text
draft
pending_deposit
confirmed
in_progress
completed
cancelled
```

Deposit status enum:

```text
not_started
pending
paid
failed
refunded
waived
```

`deposit_status` and `payment_reference` are placeholders only. This migration does not enable payment collection or Stripe integration.

## 6. Constraints And Indexes

Constraints:

```text
order_number unique
quote_id unique
quote_id foreign key to quotes(id)
lead_id foreign key to leads(id)
customer_id foreign key to customers(id)
status CHECK
deposit_status CHECK
currency length CHECK
total_amount non-negative CHECK
deposit_amount non-negative CHECK
```

Indexes:

```text
idx_orders_quote_id
idx_orders_lead_id
idx_orders_customer_id
idx_orders_status
idx_orders_created_at
idx_orders_customer_status
idx_orders_lead_status
```

No cascade delete is added. Customer, Lead, Quote, and Order records should not be hard-deleted by default.

## 7. SQLite Dry-Run

Dry-run target:

```text
/tmp/partyonce_step8_2_order_migration_dryrun.sqlite
```

Dry-run applied migrations in order:

```text
001_create_lead_storage.sql
002_create_quote_storage.sql
003_create_order_storage.sql
```

Dry-run result:

```text
customers table present
leads table present
quotes table present
orders table present
valid draft Order insert succeeded
orders_count = 1
order_status = draft
deposit_status = not_started
```

Constraint checks:

```text
invalid order status blocked
invalid deposit status blocked
duplicate quote_id blocked
invalid quote_id foreign key blocked
negative total_amount blocked
```

Result: pass.

## 8. Boundaries Confirmed

This step did not:

```text
implement Order API
modify backend/main.py
modify frontend source
run production migration
connect to production database
read or modify production environment configuration
submit frontend dist artifacts
trigger Stripe/payment
trigger webhook/n8n
send email/SMS/WhatsApp
deploy
push
```

## 9. Known Limitations

The migration does not enforce Quote status = accepted at the database layer. That rule should be enforced in the future Order service/API transaction because it depends on reading the related Quote status.

The migration includes payment placeholder fields for future compatibility, but Step 8.2 does not authorize any payment implementation.

MySQL compatibility has not been executed for this migration. Review is required before any MySQL or production execution.

## 10. Next Recommendation

Recommended next step:

```text
Step 8.3: isolated Order API skeleton implementation plan
```

Step 8.3 should remain planning-only or implementation-plan-only unless explicitly approved. The next implementation must continue to block:

```text
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
production deployment
production database migration
.env.production changes
frontend/vue-app/dist submission
```
