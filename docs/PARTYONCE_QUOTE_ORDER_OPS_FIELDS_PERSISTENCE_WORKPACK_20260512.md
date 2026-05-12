# PartyOnce Quote / Order Ops Fields Persistence Workpack 20260512

## 1. Goal

Move Quote / Order operations fields that were partially frontend-only into the local/staging SQLite skeleton persistence path.

Scope:

- Quote owner, next action, internal note.
- Order owner, next action, internal notes.
- local/staging SQLite only.

Out of scope:

- payment / Stripe / PaymentIntent
- webhook / n8n
- outbound email / SMS / WhatsApp
- production deployment
- production migrations
- supplier backend
- contracts

## 2. Backend Changes

Modified:

- `backend/main.py`
- `backend/migrations/002_create_quote_storage.sql`
- `backend/migrations/003_create_order_storage.sql`

Quote skeleton fields added:

- `owner_user_id`
- `owner_label`
- `next_action`
- `internal_note`

Order skeleton fields added:

- `owner_user_id`
- `owner_label`
- `next_action`

Order already had:

- `internal_notes`

The SQLite schema guard now auto-adds missing columns through `PRAGMA table_info(...)` + `ALTER TABLE ... ADD COLUMN ...`, so existing local `/tmp` acceptance databases can be upgraded without rebuilding the whole file.

## 3. API Contract Changes

Quote create / patch / response now support:

- `owner_user_id`
- `owner_label`
- `next_action`
- `internal_note`

Order create / patch / response now support:

- `owner_user_id`
- `owner_label`
- `next_action`
- `internal_notes`

Search now includes the new operations fields:

- Quote list search includes `owner_label`, `next_action`, `internal_note`.
- Order list search includes `owner_label`, `next_action`, `internal_notes`.

## 4. Frontend Changes

Modified:

- `frontend/vue-app/src/services/adminOrderService.js`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`

Quote detail:

- Loads owner / next action / internal note from backend response.
- Saves operations fields to `/api/quotes/{quote_id}`.
- Falls back to browser localStorage only if the local API is unavailable.

Order detail:

- Loads owner / next action / internal note from backend response.
- Saves owner / next action / internal note through the existing Order operations save action.

Order service:

- Normalizes `owner_label`, `owner_user_id`, `next_action`, and `internal_notes`.
- Sends `owner_label`, `next_action`, and `internal_notes` to the local/staging Order API.

## 5. Validation

Static validation:

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
git diff --check -- backend/main.py backend/migrations/002_create_quote_storage.sql backend/migrations/003_create_order_storage.sql frontend/vue-app/src/services/adminOrderService.js frontend/vue-app/src/views/AdminQuoteDetail.vue frontend/vue-app/src/views/AdminOrderDetail.vue
```

Result:

- Passed.

Vue SFC parse:

- `frontend/vue-app/src/views/AdminQuoteDetail.vue`: passed.
- `frontend/vue-app/src/views/AdminOrderDetail.vue`: passed.

Safe local backend profile:

```bash
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite:////tmp/partyonce_ops_fields_backend_dummy.sqlite
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_ops_fields.sqlite
```

Backend smoke result:

- Created local admin user.
- Created Lead.
- Patched Lead to `qualified`.
- Created Quote with owner / next action / internal note.
- Patched Quote owner / next action / internal note.
- Patched Quote to `accepted`.
- Created Order with owner / next action / internal note.
- Patched Order owner / next action / internal note.

Observed persisted response:

```json
{
  "quote": {
    "owner_label": "Ops Owner B",
    "next_action": "Create draft order",
    "internal_note": "Updated persisted quote note",
    "status": "accepted"
  },
  "order": {
    "owner_label": "Order Owner B",
    "next_action": "Confirm supplier availability",
    "internal_notes": "Updated persisted order note",
    "status": "draft"
  }
}
```

Browser validation:

- `/admin/quotes/1` loaded persisted Quote owner / next action / internal note into form fields.
- `/admin/orders/1` loaded persisted Order owner / internal note into form fields.
- `/admin/orders` showed persisted Order owner.
- Console errors: none.

Legacy `/tmp` database auto-column validation:

- `/tmp/partyonce_admin_ops.sqlite` started with the older Quote / Order schema.
- The schema ensure path added the new operations columns in place.
- Quote PATCH persisted owner / next action / internal note.
- Order PATCH persisted owner / next action / internal notes.
- No table rebuild, delete, payment, webhook, n8n, or outbound action was triggered.

## 6. Boundaries

- `.env.production`: not read or modified.
- `frontend/vue-app/dist`: not submitted.
- Stripe / payment: not triggered.
- webhook / n8n: not triggered.
- outbound messaging: not triggered.
- push / deploy: not performed.

## 7. Blockers

- No blocker for local/staging SQLite persistence.
- Existing historical dirty files remain outside this workpack and were not staged.

## 8. Commit

- Commit hash: final local commit for this workpack; verify with `git rev-parse --short HEAD`.

## 9. Next Step

The most useful next backend-safe step is Admin list ergonomics for persisted operations fields: show persisted Quote owner / next action in the Quote queue and add owner filters that query backend fields instead of only filtering client-side.
