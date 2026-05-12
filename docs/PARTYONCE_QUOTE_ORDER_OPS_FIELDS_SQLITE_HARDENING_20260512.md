# PartyOnce Quote / Order Ops Fields SQLite Hardening 20260512

## 1. Goal

Persist Admin Quote / Order operations fields in the local/staging SQLite skeleton instead of relying on frontend-only state.

This is a backend skeleton hardening slice only. It does not enter payment, Stripe, webhook, n8n, outbound messaging, deployment, production migration, supplier backend, or contract workflows.

## 2. Modified Files

- `backend/main.py`
- `backend/migrations/002_create_quote_storage.sql`
- `backend/migrations/003_create_order_storage.sql`
- `frontend/vue-app/src/services/adminOrderService.js`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `docs/PARTYONCE_QUOTE_ORDER_OPS_FIELDS_SQLITE_HARDENING_20260512.md`
- `docs/PARTYONCE_QUOTE_ORDER_OPS_FIELDS_PERSISTENCE_WORKPACK_20260512.md`

## 3. Backend Field Changes

Quote skeleton now persists:

- `owner_user_id`
- `owner_label`
- `next_action`
- `internal_note`

Order skeleton now persists:

- `owner_user_id`
- `owner_label`
- `next_action`
- `internal_notes` already existed and remains the persisted internal remark field.

## 4. SQLite Auto-Column Strategy

The schema ensure path now includes a controlled helper:

- reads existing columns via `PRAGMA table_info(...)`;
- adds only known hard-coded operations columns;
- uses `ALTER TABLE ... ADD COLUMN ...`;
- commits after schema guard;
- does not drop, rename, truncate, or rebuild existing local/staging tables.

This keeps older `/tmp` acceptance databases usable without forcing a full database rebuild.

## 5. PATCH Update Paths

Quote PATCH supports operations fields alongside existing Quote skeleton fields:

- `owner_user_id`
- `owner_label`
- `next_action`
- `internal_note`

Order PATCH supports operations fields alongside existing Order skeleton fields:

- `owner_user_id`
- `owner_label`
- `next_action`
- `internal_notes`

These PATCH paths only update skeleton records. They do not create Orders from Quote updates, do not create payment records, and do not trigger external automation.

## 6. Frontend Save Logic

Quote detail:

- Reads `owner_label`, `owner_user_id`, `next_action`, and `internal_note` from the local/staging Quote API response.
- Saves owner / next action / internal remark through `PATCH /api/quotes/{quote_id}`.
- Keeps browser localStorage fallback only when the local API is unavailable.

Order detail:

- Reads `owner_label`, `owner_user_id`, `next_action`, and `internal_notes` from the local/staging Order API response.
- Saves owner / next action / internal notes through the existing operations save action.

Order service:

- Normalizes backend `owner_label`, `owner_user_id`, `next_action`, and `internal_notes`.
- Maps frontend `internal_note` to backend `internal_notes`.
- Preserves fallback mock storage when the local API is unavailable.

## 7. Smoke Test Results

Static checks:

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result: passed.

Vue SFC parse:

- `frontend/vue-app/src/views/AdminQuoteDetail.vue`: passed.
- `frontend/vue-app/src/views/AdminOrderDetail.vue`: passed.

SQLite auto-column test:

- Existing old `/tmp/partyonce_admin_ops.sqlite` initially lacked the new Quote / Order operations columns.
- Running the schema ensure path added:
  - Quote: `owner_user_id`, `owner_label`, `next_action`, `internal_note`.
  - Order: `owner_user_id`, `owner_label`, `next_action`.
- No table rebuild or data deletion was performed.

Backend persistence smoke:

- Quote PATCH owner / next action / internal note: passed.
- Order PATCH owner / next action / internal note: passed.
- Quote detail response returned persisted operations fields.
- Order detail response returned persisted operations fields.

Observed legacy DB response:

```json
{
  "quote": {
    "id": "1",
    "owner_label": "Legacy Quote Owner",
    "next_action": "Legacy quote next action",
    "internal_note": "Legacy quote note"
  },
  "order": {
    "id": "1",
    "owner_label": "Legacy Order Owner",
    "next_action": "Legacy order next action",
    "internal_notes": "Legacy order note"
  }
}
```

Browser smoke from the fresh local/staging DB:

- Quote detail loaded persisted owner / next action / internal note into the form fields.
- Order detail loaded persisted owner and internal note into the form fields.
- Console errors: none.

## 8. Safety Results

- Stripe / PaymentIntent: not triggered.
- webhook / n8n: not triggered.
- email / SMS / WhatsApp: not triggered.
- production deployment: not triggered.
- `.env.production`: not read or modified.
- `frontend/vue-app/dist`: not submitted.
- `backend/__pycache__`: not submitted.

## 9. Blockers

No blocker for local/staging SQLite persistence.

Remaining product choice:

- Admin Quote / Order list pages can next be upgraded to show and query these persisted fields more directly.

## 10. Next Step

Add backend query parameters and list-table columns for persisted operations ownership:

- Quote owner filter.
- Order owner filter.
- Quote next action column.
- Order next action column backed by SQLite instead of client-only filtering.
