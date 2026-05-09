# PartyOnce Stage 2 Step 3 Admin Lead Queue Workpack

Date: 2026-05-09  
Scope: admin lead queue backend skeleton mapping  
Repository: `/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`

## 1. Goal

Step 3 connects the Stage 1 local Lead Review experience to the Stage 2 Lead API skeleton without starting Quote API, Order API, payment, migration, database persistence, supplier backend, deployment, or external automation.

This is still a skeleton workpack. It is not a production lead queue.

## 2. Backend Changes

File:

- `backend/main.py`

Change:

- Extended the existing `PATCH /api/leads/{lead_id}` skeleton to accept:
  - `next_action`
  - `note`
- These fields update the in-memory `follow_up_summary` only.
- No database model was added.
- No migration was created.
- No database write was added.
- No Quote or Order is created.

Current backend Lead skeleton coverage:

- `POST /api/leads` creates an in-memory Lead from public intake.
- `GET /api/leads` returns an admin-only queue from memory.
- `GET /api/leads/{lead_id}` returns admin-only detail from memory.
- `PATCH /api/leads/{lead_id}` updates admin-only operations fields in memory.

## 3. Frontend Changes

File:

- `frontend/vue-app/src/views/LocalLeadReview.vue`

Change:

- Kept `LocalStorage` as the default mode.
- Added a manual `Backend Skeleton` mode.
- Added a manual sync action to POST local `inquirySubmissions` records into `/api/leads`.
- Added backend refresh through `GET /api/leads`.
- Added backend update mapping through `PATCH /api/leads/{lead_id}` for:
  - status
  - priority
  - owner user ID
  - next action
  - note
- Added clear UI copy that Backend Skeleton calls only local `/api/leads` and does not create quote/order/payment or external automation.

Auth reality:

- Backend list/detail/update endpoints use the existing `require_admin` guard.
- In Backend Skeleton mode, the frontend sends the existing Pinia user token as a bearer token when present.
- If the user is not admin/manager or backend is not running, the page shows a warning and keeps the failure local to the UI.

## 4. Data Mapping

Local `inquirySubmissions` to backend `POST /api/leads`:

```text
customerInfo.name -> customer.name
customerInfo.contact -> customer.contact
customerInfo.preferredDate -> preferred_event_date
customerInfo.notes -> intake_notes
selection -> selection
pricing -> pricing_snapshot
source -> local_demo
```

Backend Lead response to admin queue UI:

```text
customer.name/contact -> customerInfo.name/contact
preferred_event_date -> customerInfo.preferredDate
intake_notes -> customerInfo.notes
selection_snapshot -> selection
pricing_snapshot -> pricing
submitted_at -> submitTime
status -> status
priority -> followUp.priority
owner_user_id -> followUp.owner
follow_up_summary.next_action -> followUp.nextAction
follow_up_summary.latest_note -> followUp.note
```

## 5. Boundaries

This workpack did not do:

- Quote API.
- Order API.
- Stripe or real payment.
- Webhook execution.
- n8n execution.
- Email, SMS, WhatsApp, or other outbound messages.
- Production deployment.
- `.env.production` read or modification.
- `frontend/vue-app/dist` cleanup or submission.
- Database migration.
- Database write.
- Supplier backend.
- Automatic approval.
- Contract signing.

## 6. Tests

Executed:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result:

- Passed.
- Syntax validation only.
- No app startup.
- No database connection.
- No external system call.

Frontend validation:

- `npm run build` was intentionally not run because it writes `frontend/vue-app/dist`, which is excluded from this workpack.
- No dedicated no-output Vue type-check script exists in `frontend/vue-app/package.json`.

## 7. Current Risks

- Backend Skeleton mode depends on the local FastAPI server running.
- Backend Lead records are in memory and disappear on process restart.
- Admin updates are skeleton-only until persistent `customers`, `leads`, and `follow_ups` tables exist.
- Owner is currently represented as numeric `owner_user_id` in Backend Skeleton mode; free-text owner remains localStorage-only.
- Public lead sync still needs rate limiting and persistence before production use.

## 8. Next Step Recommendation

After review, the next step should be a limited Step 3 acceptance check:

- Start local backend only if approved.
- Log in as admin/manager only in local dev.
- Sync local demo leads to Backend Skeleton.
- Confirm admin list/search/filter/update behavior.

Do not start Quote API, Order API, payment, supplier backend, deployment, or external automation in the next acceptance check.
