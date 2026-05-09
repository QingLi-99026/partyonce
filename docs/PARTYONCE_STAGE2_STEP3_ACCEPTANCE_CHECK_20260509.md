# PartyOnce Stage 2 Step 3 Acceptance Check

Date: 2026-05-09  
Scope: admin lead queue backend skeleton acceptance  
Repository: `/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`

## 1. Accepted Baseline

Step 3 implementation commit:

```text
4388f43b0c9586eb8837102bdd4f918aa8cafc05
Map admin lead queue to lead API skeleton
```

Committed files:

- `backend/main.py`
- `frontend/vue-app/src/views/LocalLeadReview.vue`
- `docs/PARTYONCE_STAGE2_ADMIN_LEAD_QUEUE_WORKPACK_20260509.md`

## 2. What Step 3 Is Meant To Prove

Step 3 proves that the Stage 1 local Lead Review page can map to the Stage 2 Lead API skeleton while preserving the safe local demo path.

Acceptance target:

- LocalStorage mode remains the default and still works for local demo.
- Backend Skeleton mode is manually selected.
- Local demo leads can be manually submitted to `POST /api/leads`.
- Admin users can load `GET /api/leads`.
- Admin users can update lead status, priority, owner user ID, next action, and note through `PATCH /api/leads/{lead_id}`.
- Backend Skeleton remains in-memory only.

## 3. Recommended Local Acceptance Route

Do not run this against production.

1. Start local backend only in a local/dev shell.
2. Start local frontend only in a local/dev shell.
3. Open `/local-demo`.
4. Generate a local inquiry sample.
5. Open `/admin/local-leads`.
6. Confirm the page opens in `LocalStorage` mode by default.
7. Confirm local lead data appears from browser storage.
8. Switch to `Backend Skeleton` mode.
9. Log in as an admin or manager if the backend requires auth for queue reads.
10. Click `同步本地 Lead 到 Backend Skeleton`.
11. Confirm backend skeleton records appear.
12. Update status, priority, owner user ID, next action, and note.
13. Refresh Backend Skeleton mode and confirm updates remain for the current backend process.

## 4. Expected Backend Behavior

`POST /api/leads`:

- Allows public/basic lead creation.
- Validates required customer name and contact.
- Stores data in process memory.
- Does not create Quote.
- Does not create Order.

`GET /api/leads`:

- Requires existing `require_admin`.
- Supports list/search/filter parameters through the skeleton.
- Reads process memory only.

`GET /api/leads/{lead_id}`:

- Requires existing `require_admin`.
- Returns one in-memory lead detail.

`PATCH /api/leads/{lead_id}`:

- Requires existing `require_admin`.
- Updates status, priority, owner user ID, intake notes, qualified/unqualified reasons, next action, and note.
- Updates `follow_up_summary` in memory.

## 5. Expected Frontend Behavior

`/admin/local-leads`:

- Defaults to `LocalStorage`.
- Shows a `Backend Skeleton` mode toggle.
- Sends the existing Pinia auth credential as a bearer credential when present.
- Shows a warning if backend is unavailable or current user is not admin/manager.
- Does not call backend unless Backend Skeleton mode is selected or sync is clicked.
- Does not call payment, external automation, email, SMS, or WhatsApp.

## 6. Verification Already Run

Executed:

```text
PYTHONPYCACHEPREFIX=/tmp/partyonce_pycache python3 -m py_compile backend/main.py
```

Result:

- Passed.
- No app startup.
- No database connection.
- No external system call.

## 7. Not Verified In This Check

The following were intentionally not run in this acceptance check:

- `npm run build`, because it writes `frontend/vue-app/dist`.
- Full backend server startup, because the current backend startup can initialize SQLAlchemy tables depending on environment.
- Browser automation, because this check is documenting the acceptance route before owner-approved local server testing.
- Any production deployment.

## 8. Explicitly Still Blocked

This step still blocks:

- Real database persistence for Leads.
- Real migration execution.
- Quote API.
- Order API.
- Stripe or real payment.
- External automation.
- Email, SMS, WhatsApp, or other outbound messages.
- Production deployment.
- `.env.production` changes.
- `frontend/vue-app/dist` submission.
- Supplier backend expansion.
- Contract signing.

## 9. Current Repository Caution

The repository still has unrelated historical dirty state outside this work:

- `frontend/vue-app/.env.production`
- `frontend/vue-app/dist`

These must remain excluded from Step 3 acceptance and any follow-up commit unless separately reviewed.

## 10. Next Recommendation

If owner accepts this Step 3 acceptance check, the next useful unit is Step 4 planning:

- Decide whether `/quote` should submit to `POST /api/leads` behind an explicit local/staging flag.
- Keep localStorage fallback for demos.
- Do not start Quote API, Order API, payment, deployment, or external messaging.
