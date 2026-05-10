# PartyOnce Stage 2 Step 6.4A Quote Migration Draft Workpack

Date: 2026-05-10

Scope: real Quote migration draft file and local SQLite dry-run

## 1. Work Completed

Added a real migration draft file:

```text
backend/migrations/002_create_quote_storage.sql
```

This migration draft creates only:

```text
quotes
```

It does not create:

```text
quote_items
orders
payment tables
Stripe tables
webhook/n8n tables
outbound messaging tables
```

## 2. Design Choice

The first Stage 2 Quote storage draft uses:

```text
line_items_json
selection_snapshot_json
```

It intentionally does not create a `quote_items` table yet.

Reason:

```text
The immediate Step 6 goal is Lead-to-Quote skeleton validation, not full backend item editing.
The snapshot-first design matches the accepted Lead persistence model.
The migration stays small and reviewable.
```

## 3. Quotes Table Fields

The migration draft includes:

```text
id
lead_id
customer_id
quote_number
status
currency
subtotal
discount_total
tax_total
final_total
line_items_json
selection_snapshot_json
valid_until
sent_at
accepted_at
created_by_user_id
created_at
updated_at
```

## 4. Constraints And Indexes

Constraints:

```text
unique quote_number
foreign key lead_id -> leads.id
foreign key customer_id -> customers.id
status CHECK constraint
currency length CHECK constraint
```

Indexes:

```text
idx_quotes_lead_id
idx_quotes_customer_id
idx_quotes_status
idx_quotes_created_at
idx_quotes_lead_status
idx_quotes_customer_status
```

## 5. SQLite Dry-Run

Dry-run target:

```text
/tmp/partyonce_stage2_step6_4a_quote_migration_20260510.sqlite
```

Commands executed locally:

```text
sqlite3 local /tmp database < backend/migrations/001_create_lead_storage.sql
sqlite3 local /tmp database < backend/migrations/002_create_quote_storage.sql
insert valid customer
insert valid qualified lead
insert valid draft quote
attempt invalid quote status
attempt invalid lead_id foreign key
```

Results:

```text
tables=customers,leads,follow_ups,quotes
quote_row=1|1|1|Q-STEP64A-001|draft|AUD|880
bad_status_exit=19
bad_status_error=CHECK constraint failed: ck_quotes_status
bad_fk_exit=19
bad_fk_error=FOREIGN KEY constraint failed
quote_count=1
```

Conclusion:

```text
SQLite dry-run passed.
The migration draft applies after 001_create_lead_storage.sql.
Valid Quote insert works.
Invalid status is rejected.
Invalid lead_id foreign key is rejected.
```

## 6. Scope Boundaries Preserved

This step did not:

```text
modify backend/main.py
modify frontend source
write Quote API code
run production migration
connect to production database
create Order API
create Order records
connect Stripe/payment
trigger webhook/n8n
send email/SMS/WhatsApp
deploy
push
read or modify .env.production
submit frontend/vue-app/dist
clean historical dirty files
```

## 7. Current Risk

Remaining decisions before API implementation:

```text
admin/manager guard strategy
Lead status gate for quote creation
whether creating Quote updates Lead status to converted_to_quote
server-side pricing validation rules
whether converted_to_order should be blocked at API layer
MySQL compatibility review before any MySQL execution
```

## 8. Recommendation

Next step:

```text
Step 6.5: isolated Quote API skeleton implementation plan or implementation
```

Recommended before code:

```text
Define exact backend/main.py insertion points.
Define request/response schemas.
Use existing Lead SQLite helpers where safe.
Keep implementation backend-only.
Do not modify frontend.
Do not create Order.
Do not connect payment or external systems.
```

