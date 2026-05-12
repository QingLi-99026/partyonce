# PartyOnce Admin Bulk Ops UX Workpack 20260512

## 1. Goal

Add cautious bulk operations to Admin Quote / Order queues:

- multi-select rows;
- bulk assign owner;
- bulk set next action;
- bulk status update with confirmation.

This stays inside the local/staging skeleton. It does not add payment, Stripe, webhook/n8n, outbound messaging, deployment, supplier dispatch, or production migration.

## 2. Modified Files

- `frontend/vue-app/src/views/AdminQuotes.vue`
- `frontend/vue-app/src/views/AdminOrders.vue`
- `docs/PARTYONCE_ADMIN_BULK_OPS_UX_WORKPACK_20260512.md`

No backend change was required because the existing skeleton PATCH endpoints already support the persisted operations fields and status fields needed by this UX.

## 3. Quote Queue Bulk UX

Completed:

- Added table row selection.
- Added bulk operations panel.
- Bulk owner update maps to `owner_label`.
- Bulk next action update maps to `next_action`.
- Bulk status update is limited to the existing allowed Quote statuses:
  - `draft`
  - `sent`
  - `accepted`
  - `rejected`
  - `expired`
- Bulk status update requires confirmation.
- `converted_to_order` remains unavailable from the status controls.
- Updates call `PATCH /api/quotes/{quote_id}` sequentially.
- No Order, payment, webhook, n8n, or outbound action is triggered.

## 4. Order Queue Bulk UX

Completed:

- Added table row selection.
- Added bulk operations panel.
- Bulk owner update maps to `owner_label`.
- Bulk next action update maps to `next_action`.
- Bulk status update is limited to the existing Order statuses:
  - `draft`
  - `pending_deposit`
  - `confirmed`
  - `in_progress`
  - `completed`
  - `cancelled`
- Bulk status update requires confirmation.
- Updates call the existing `updateAdminOrderOperations()` service sequentially.
- Backend mode uses the local/staging Order API.
- Fallback mode preserves browser mock storage behavior.
- Bulk status update does not change deposit status or payment state.

## 5. Safety Behavior

- Bulk updates are sequential, not a new dangerous batch endpoint.
- Partial update stop is reported if one record fails.
- Confirmation is required for bulk status updates.
- Owner / next action bulk updates do not require confirmation because they only touch operations fields.
- UI copy explicitly states that updates are local/staging skeleton only.

## 6. Validation

Static backend check:

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result: passed.

Vue SFC parse:

- `frontend/vue-app/src/views/AdminQuotes.vue SFC parse ok`
- `frontend/vue-app/src/views/AdminOrders.vue SFC parse ok`

Browser smoke with safe local/staging profile:

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite:////tmp/partyonce_bulk_ops_backend_dummy.sqlite
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_bulk_ops.sqlite
```

Test fixture:

- Created two Leads.
- Created two Quotes.
- Created two Orders.

Browser results:

- `/admin/quotes` bulk owner / next action update succeeded.
- `/admin/orders` bulk owner / next action update succeeded.
- `/admin/orders` bulk status update confirmation flow succeeded.
- Console errors: `0`.

## 7. External Systems / Production Boundaries

- Stripe / PaymentIntent: not triggered.
- payment state: not changed.
- webhook / n8n: not triggered.
- email / SMS / WhatsApp: not triggered.
- deployment / push: not performed.
- `.env.production`: not read or modified.
- `frontend/vue-app/dist`: not submitted.

## 8. Blockers

No blocker for local/staging bulk operations UX.

## 9. Next Step

Add audit trail rows for bulk operations in local/staging SQLite, so each bulk owner / next action / status update has an operator, timestamp, target IDs, and before/after summary.
