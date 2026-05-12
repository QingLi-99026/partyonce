# PartyOnce Admin Operations Hardening Workpack 20260512

## 1. Workpack Goal

Harden the Admin Lead / Quote / Order operations experience for local/staging review:

- Admin Lead: stronger search, status filtering, priority filtering, owner visibility, follow-up notes, and exception alerts.
- Admin Quote: operations search/filtering, quote status guidance, quote exception alerts, and local/staging-only owner/remark fields on detail.
- Admin Order: operations search/filtering, owner filtering, order exception alerts, editable event/internal note fields on detail, and clear blocked payment boundaries.

This workpack does not enter payment, Stripe, webhook, n8n, deployment, supplier backend, contract signing, or production database work.

## 2. Existing Page Inventory

- `LocalLeadReview.vue`: existing localStorage / Backend Skeleton Lead queue with status updates, priority, owner, next action, and follow-up note support.
- `AdminQuotes.vue`: existing Quote queue with search, status filter, status update, amount/selection display, and detail navigation.
- `AdminQuoteDetail.vue`: existing Quote detail with status update, amount snapshots, line items, selection snapshot, and safe draft Order creation for accepted Quotes.
- `AdminOrders.vue`: existing Order queue with search, status filter, status update, next action display, backend-first / fallback mock behavior.
- `AdminOrderDetail.vue`: existing Order detail with status update, customer/quote/event/amount display, blocked action list, and status flow.

## 3. Modified Files

- `frontend/vue-app/src/api/index.js`
- `frontend/vue-app/src/services/adminOrderService.js`
- `frontend/vue-app/src/views/LocalLeadReview.vue`
- `frontend/vue-app/src/views/AdminQuotes.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrders.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `docs/PARTYONCE_ADMIN_OPERATIONS_HARDENING_WORKPACK_20260512.md`

## 4. Admin Lead Hardening

Completed:

- Expanded status filter to all Lead statuses: `new`, `pending`, `contacted`, `qualified`, `unqualified`, `converted_to_quote`, `closed`.
- Added priority filter.
- Added exception filter.
- Expanded search across customer, contact, theme, package, owner, next action, and follow-up note.
- Added Lead exception alerts:
  - missing contact
  - missing next action
  - high priority
  - closed/unqualified without note
- Preserved existing localStorage and Backend Skeleton update paths.

## 5. Admin Quote Hardening

Completed:

- Added operations alert filter.
- Expanded search across quote/customer/lead/theme/package signals.
- Added visible status guidance for `draft`, `sent`, `accepted`, `rejected`, `expired`.
- Added Quote exception alerts:
  - missing amount
  - missing `valid_until`
  - sent quote past valid date
  - accepted quote needs Order check
- Added `valid_until` column.
- Added local/staging-only Quote detail owner, next action, and internal remark fields stored in browser localStorage.
- Kept `converted_to_order` blocked from the status dropdown.

## 6. Admin Order Hardening

Completed:

- Added owner filter.
- Added operations alert filter.
- Added Order exception alerts:
  - `pending_deposit` is business state only
  - missing event date
  - missing location
  - missing next action
- Displayed owner with next action in the Order queue.
- Added editable event date, event location, and internal note fields on Order detail.
- Added `updateAdminOrderOperations()` service method:
  - backend mode PATCHes the safe local/staging Order API.
  - fallback mode writes to local mock storage.
- Preserved blocked payment / webhook / outbound action boundaries.

## 7. API Base URL Hardening

The local `.env` sets `VITE_API_URL=http://127.0.0.1:8000`, while backend routes live under `/api/*`.

Completed:

- Normalized configured `VITE_API_URL` inside `frontend/vue-app/src/api/index.js`.
- If `VITE_API_URL` does not end with `/api`, the frontend API client appends `/api`.
- This fixed Admin Quote / Order pages incorrectly calling `/quotes` and `/orders` during local/staging validation.

No `.env.production` file was read or modified.

## 8. Local / Staging Validation

Safe local backend profile used:

```bash
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite:////tmp/partyonce_admin_ops_backend_dummy.sqlite
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_admin_ops.sqlite
backend host=127.0.0.1
backend port=8000
frontend host=127.0.0.1
frontend port=3000
```

Backend smoke:

- Created local admin user.
- Created Lead.
- Patched Lead to `qualified`, `High`, owner `1`, with next action and note.
- Created Quote.
- Patched Quote to `accepted`.
- Created Order.
- Patched Order internal note and event location through `/api/orders/{id}`.

Browser route validation:

- `/admin/local-leads`: opened, status controls visible, no external boundary broken.
- `/admin/quotes`: opened, Ops Alerts visible, status controls visible.
- `/admin/quotes/1`: opened, Quote detail loaded as `Q-20260512-01AA`, Ops Alerts visible.
- `/admin/orders`: opened, Ops Alerts visible, status controls visible.
- `/admin/orders/1`: opened, Order detail loaded as `O-20260512-9377`, Ops Alerts visible.

Browser console result:

- No console errors after API base URL normalization.

## 9. Static Check

Attempted:

```bash
npm run lint
```

Result:

- Blocked because local `eslint` command is unavailable in this frontend directory.
- No dependency install was performed in this workpack.

## 10. External Systems / Production Boundaries

- Stripe / PaymentIntent: not triggered.
- webhook / n8n: not triggered.
- email / SMS / WhatsApp: not triggered.
- production deployment: not triggered.
- `.env.production`: not read or modified.
- `frontend/vue-app/dist`: not modified or submitted.
- production database / migration: not used.
- push / deploy: not performed.

## 11. Blockers

- `npm run lint` cannot run until the local frontend dependency set exposes `eslint`.
- Quote owner / remark remains localStorage-only because the current Stage 2 Quote API patch schema does not include owner or internal note fields.
- Order owner remains display/filter only because the current Stage 2 Order API patch schema does not include owner assignment.

## 12. Commit

- Commit hash: final local commit for this workpack; verify with `git rev-parse --short HEAD`.

## 13. Next Step

Proceed to the next backend-safe admin hardening slice: add read-only owner/internal-note fields to the Quote/Order skeleton schemas if the product wants those fields to be persisted in local/staging SQLite rather than browser localStorage.
