# PartyOnce Stage 2 Step 5.3 MySQL Compatibility Pass

Date: 2026-05-10

Scope: MySQL compatibility review only for Lead storage migration

## 1. Objective

Review the SQLite-first migration from Step 5.2 and define a MySQL-compatible variant before any MySQL execution or persistent API work.

This workpack does not run MySQL, does not connect to a database, does not modify API code, and does not touch production configuration.

## 2. Inputs Reviewed

Reviewed files:

```text
backend/migrations/001_create_lead_storage.sql
backend/init.sql
```

Observed project conventions from `backend/init.sql`:

- MySQL tables use `INT AUTO_INCREMENT PRIMARY KEY`.
- Tables use `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`.
- JSON fields are used in existing MySQL-style schema.
- `created_at` uses `DATETIME DEFAULT CURRENT_TIMESTAMP`.
- `updated_at` commonly uses `DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
- Indexes are often declared inside `CREATE TABLE` in initial schema files.

## 3. Compatibility Findings

### Primary keys

SQLite migration:

```text
id INTEGER PRIMARY KEY
```

MySQL recommendation:

```text
id INT AUTO_INCREMENT PRIMARY KEY
```

Reason:

- Matches existing `backend/init.sql` convention.
- Avoids relying on SQLite rowid behavior.

### JSON snapshots

SQLite migration:

```text
selection_snapshot_json TEXT
pricing_snapshot_json TEXT
```

MySQL recommendation:

```text
selection_snapshot_json JSON
pricing_snapshot_json JSON
```

Reason:

- Existing MySQL schema already uses native JSON fields.
- Lead snapshots benefit from structured storage if target MySQL supports JSON.

Open question:

- If the target database is older MySQL or MariaDB with limited JSON behavior, keep `TEXT`.

### timestamp behavior

SQLite migration:

```text
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
```

MySQL recommendation:

```text
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

Reason:

- Matches existing `backend/init.sql`.
- Reduces application code needed for common updates.

### CHECK constraints

SQLite dry-run validated:

```text
ck_leads_status
ck_leads_priority
```

MySQL recommendation:

- Keep CHECK constraints if the target MySQL version enforces them.
- If target does not enforce CHECK constraints, enforce status and priority in application validation and consider lookup tables later.

Owner must confirm target MySQL version before execution.

### foreign keys

SQLite migration:

```text
FOREIGN KEY (customer_id) REFERENCES customers (id)
FOREIGN KEY (lead_id) REFERENCES leads (id)
```

MySQL recommendation:

- Keep these foreign keys.
- Do not add cascade delete in the first version.
- Prefer preserving Lead history over hard deletes.

Open question:

- Whether `owner_user_id` and `author_user_id` should reference `users.id` immediately or remain nullable non-FK placeholders until auth ownership is finalized.

## 4. MySQL Draft Artifact

Draft file created:

```text
docs/PARTYONCE_STAGE2_STEP5_3_LEAD_STORAGE_MYSQL_DRAFT_20260510.sql
```

This is a review artifact only.

It is not placed in `backend/migrations`.
It was not executed.
It must not be run against production without owner approval.

## 5. Recommendation

Recommended path:

1. Keep `backend/migrations/001_create_lead_storage.sql` as the accepted SQLite/local migration.
2. Review the MySQL draft before any MySQL dry run.
3. Confirm target MySQL version and CHECK constraint support.
4. Decide whether `owner_user_id` and `author_user_id` should become foreign keys to `users.id`.
5. Only then create a backend MySQL migration file or adapt the existing backend migration.

## 6. Explicitly Not Done

This pass did not:

- Run MySQL.
- Connect to any database.
- Modify `backend/main.py`.
- Modify frontend code.
- Modify `.env.production`.
- Submit or clean `frontend/vue-app/dist`.
- Implement persistent API code.
- Start Quote API.
- Start Order API.
- Trigger payment or Stripe.
- Trigger webhook or n8n.
- Send email, SMS, WhatsApp, or outbound messages.
- Deploy.
- Push.

## 7. Next Recommended Step

If owner accepts the MySQL compatibility plan:

```text
Step 5.4: choose SQLite-only local persistence prototype or MySQL migration dry-run path
```

Do not start persistent API code until the database target path is selected.
