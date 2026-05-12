# PartyOnce Admin Quote / Order List Ops Fields Workpack 20260512

## 1. Goal

Extend persisted operations fields from Quote Detail / Order Detail into the Admin Quote Queue and Admin Order Queue list layer.

Target fields:

- `owner_user_id`
- `owner_label`
- `next_action`
- `internal_note` / `internal_notes`

This workpack stays in the local/staging skeleton lane. It does not enter payment, Stripe, webhook, n8n, outbound messaging, deployment, supplier backend, or production migration.

## 2. Modified Files

- `backend/main.py`
- `frontend/vue-app/src/views/AdminQuotes.vue`
- `frontend/vue-app/src/views/AdminOrders.vue`
- `docs/PARTYONCE_ADMIN_QUOTE_ORDER_LIST_OPS_FIELDS_WORKPACK_20260512.md`

`frontend/vue-app/src/services/adminOrderService.js` was reviewed for scope and did not require changes in this slice.

## 3. Backend List Query Parameters

Admin Quote list now supports:

- `owner`
- `next_action`

Admin Order list now supports:

- `owner`
- `next_action`

The filters query persisted SQLite fields:

- Quote `owner_label`, `owner_user_id`, `next_action`
- Order `owner_label`, `owner_user_id`, `next_action`

Existing list behavior remains:

- `search`
- `status`
- pagination
- customer-facing `/api/my/*` read-only list routes

## 4. Frontend List Display

Admin Quote Queue:

- Added owner / next action filter controls.
- Sends `owner` and `next_action` params to `/api/quotes`.
- Displays `owner_label` or `owner_user_id` in the table.
- Displays persisted `next_action` in the table.
- Keeps existing search / status / risk filter behavior.

Admin Order Queue:

- Added next action filter control.
- Owner filter now sends `owner` to `/api/orders`.
- Sends `next_action` to `/api/orders`.
- Displays persisted owner and next action in the table.
- Keeps existing search / status / risk filter behavior.

## 5. Test Results

Static backend check:

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result: passed.

Vue SFC parse:

The exact root-level command could not resolve `@vue/compiler-sfc`, so the same parser was loaded from `frontend/vue-app/node_modules`.

Result:

- `frontend/vue-app/src/views/AdminQuotes.vue SFC parse ok`
- `frontend/vue-app/src/views/AdminOrders.vue SFC parse ok`

Safe local/staging backend profile:

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite:////tmp/partyonce_list_ops_backend_dummy.sqlite
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_list_ops.sqlite
```

Backend smoke:

- Created local admin fixture.
- Created Lead.
- Created Quote with `owner_label=Queue Owner` and `next_action=Queue next quote action`.
- Created Order with `owner_label=Queue Order Owner` and `next_action=Queue order next action`.
- `GET /api/quotes?owner=Queue%20Owner&next_action=Queue%20next` returned `total=1`.
- `GET /api/orders?owner=Queue%20Order&next_action=Queue%20order` returned `total=1`.

Browser route validation:

- `/admin/quotes` displayed persisted Quote owner and next action.
- `/admin/orders` displayed persisted Order owner and next action.
- Console errors: `0`.

## 6. Safety Results

- Stripe / PaymentIntent: not triggered.
- payment routes or payment state: not modified.
- webhook / n8n: not triggered.
- email / SMS / WhatsApp: not triggered.
- production deployment: not performed.
- `.env.production`: not read or modified.
- `frontend/vue-app/dist`: not submitted.

## 7. Blockers

No blocker for local/staging list-level owner / next action display and filtering.

## 8. Next Step

The next useful admin hardening slice is persisted bulk operations UX:

- multi-select Quote / Order rows;
- batch owner assignment;
- batch next-action update;
- still local/staging skeleton only, with no payment or outbound automation.
