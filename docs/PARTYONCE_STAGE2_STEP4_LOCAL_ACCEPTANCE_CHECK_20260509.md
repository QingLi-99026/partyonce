# PartyOnce Stage 2 Step 4 Local Acceptance Check

Date: 2026-05-09

Scope: `/quote` to `POST /api/leads` local/staging bridge acceptance

Related commit:

```text
7ea8e1ed5f44f1e7c37201f78222b2a8bb5679b0
Add quote to lead bridge
```

## 1. Acceptance Goal

Verify the Step 4 bridge implementation without expanding scope into Quote API, Order API, payment, production deployment, database migration, or external messaging.

The expected behavior is:

1. `/quote` remains usable as a local demo route.
2. Default behavior remains localStorage-only.
3. `POST /api/leads` is attempted only when the explicit local/staging bridge mode is enabled.
4. Backend skeleton failure does not block the local inquiry record.

## 2. Local Route Check

Started the Vite dev server locally.

The server selected:

```text
127.0.0.1 port 3001
```

Route checks:

```text
GET /quote -> 200 OK
GET /local-demo -> 200 OK
```

This confirms the local frontend routes load through Vite.

## 3. Served Module Check

Fetched the Vite-served `QuotePage.vue` module and confirmed it includes the expected bridge markers:

```text
VITE_LEAD_BRIDGE_MODE
dual_write_skeleton
local_only
fetch('/api/leads'
saveInquiryToLocalStorage
pricing_snapshot
source: 'web_quote'
```

The served module check confirms the local dev server is loading the Step 4 bridge implementation.

## 4. Backend Skeleton Check

The backend was not started in this acceptance pass.

Reason:

- `backend/main.py` calls `load_dotenv()`.
- Backend startup also initializes database engine and startup table creation logic.
- This acceptance pass avoids reading production-like environment configuration and avoids database connection or migration side effects.

Because backend was not started, no real `POST /api/leads` request was sent in this pass.

## 5. Confirmed Implementation Boundaries

The Step 4 bridge keeps these boundaries:

- Default mode is localStorage-only.
- `dual_write_skeleton` is opt-in for local/staging.
- LocalStorage save happens before backend skeleton sync.
- Backend sync failure does not block the local demo record.
- No Quote record is created.
- No Order record is created.
- No payment flow is triggered.
- No webhook or n8n flow is triggered.
- No email, SMS, WhatsApp, or other outbound message is sent.
- No database migration is created or executed.
- No production deployment is performed.

## 6. Files and Configuration Not Touched

This acceptance pass did not modify:

- `frontend/vue-app/dist`
- `frontend/vue-app/.env.production`
- `backend/main.py`
- database schema or migration files
- payment code
- webhook or n8n code

Existing historical dirty files remain outside this acceptance scope.

## 7. Test Commands and Results

Route check targets:

```text
127.0.0.1 port 3001 /quote
127.0.0.1 port 3001 /local-demo
```

Both returned `200 OK`.

Served module marker check:

```text
VITE_LEAD_BRIDGE_MODE: true
dual_write_skeleton: true
local_only: true
fetch('/api/leads': true
saveInquiryToLocalStorage: true
pricing_snapshot: true
source: 'web_quote': true
```

## 8. Remaining Acceptance Gap

The only remaining Step 4 acceptance gap is a real local/staging `POST /api/leads` request from `/quote`.

That should be done only after confirming a safe backend startup mode that does not read production configuration, does not connect to production services, and does not run migrations.

## 9. Recommendation

Next narrow step:

1. Define a safe local backend startup profile for the Lead API skeleton.
2. Start backend with local-only configuration.
3. Enable `VITE_LEAD_BRIDGE_MODE=dual_write_skeleton`.
4. Submit one `/quote` inquiry.
5. Confirm localStorage receives the inquiry.
6. Confirm `POST /api/leads` returns a Lead ID.
7. Confirm no Quote, Order, payment, webhook, n8n, or outbound message is triggered.

Do not start Quote API, Order API, payment, production deployment, database migration, full supplier backend, or external messaging from this acceptance step.
