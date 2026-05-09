# PartyOnce Stage 2 Step 4 Safe Backend Profile and Real Acceptance

Date: 2026-05-09

Scope: safe local backend profile and real `/quote` to `POST /api/leads` acceptance

Related commits:

```text
7ea8e1ed5f44f1e7c37201f78222b2a8bb5679b0
Add quote to lead bridge

bd94b5e603d0fd6d1000c6295e898e9e54c1bb67
Add stage 2 step 4 local acceptance check
```

## 1. Safe Backend Local Profile

The backend was started only after defining a local-only profile.

Profile principles:

- Disable dotenv loading.
- Use the project backend virtual environment.
- Use a `/tmp` SQLite database file.
- Bind only to localhost.
- Do not read or modify `.env.production`.
- Do not connect to production services.
- Do not run migration commands.
- Do not deploy.

Runtime profile used:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite file under /tmp
JWT signing key set to a throwaway local value
storage variables set to empty local values
backend bind: 127.0.0.1 port 8000
```

Important note:

- `backend/main.py` still runs its existing startup table verification logic.
- With the profile above, that startup logic touched only the `/tmp` SQLite file.
- No production database, remote database, or external storage service was used.

## 2. Frontend Local/Staging Bridge Profile

The frontend was started with the explicit Step 4 bridge mode:

```text
VITE_LEAD_BRIDGE_MODE=dual_write_skeleton
frontend bind: 127.0.0.1 port 3014
```

The existing Vite proxy forwarded `/api` requests to the local backend on port 8000.

## 3. Connectivity Checks

Backend health:

```text
local backend /api/health -> 200
```

Frontend route:

```text
local frontend /quote -> 200
```

Frontend proxy:

```text
local frontend /api/health -> 200
```

## 4. Real Browser Acceptance Method

A local headless Chrome session was started with DevTools protocol enabled.

For the final acceptance run, Chrome was started with background networking and component update features disabled as much as the local browser allowed.

The browser opened:

```text
127.0.0.1 port 3014 /quote
```

The test interacted with the real page:

1. Opened `/quote`.
2. Clicked the inquiry submit entry button.
3. Filled the inquiry form.
4. Clicked the form submit button.
5. Captured the real page `fetch('/api/leads')` call.
6. Read browser localStorage after submission.

No external browser target was opened.

## 5. Acceptance Result

Result: Pass

Observed final page result:

```text
success message displayed
localStorage inquiry count: 1
POST /api/leads status: 201
backend returned Lead ID
```

The returned Lead response included:

```text
customer.name: Step 4 Safe Local Test
customer.contact: step4-safe-local@example.test
source: web_quote
status: new
priority: Medium
preferred_event_date: 2026-06-01
pricing_snapshot.finalTotal: 1820
```

The page success text confirmed that the local inquiry was saved and synced to the local Lead API skeleton.

## 6. Boundary Confirmation

This acceptance did not:

- Create Quote records.
- Create Order records.
- Trigger payment.
- Trigger Stripe.
- Trigger webhook or n8n.
- Send email, SMS, WhatsApp, or other outbound messages.
- Read or modify `.env.production`.
- Submit or clean `frontend/vue-app/dist`.
- Run migration commands.
- Deploy.
- Push.

The browser process emitted a browser-owned GCM background warning even after background networking flags were used. This was not a PartyOnce application request and did not trigger PartyOnce payment, webhook, n8n, email, SMS, WhatsApp, deployment, or backend integration behavior.

## 7. Files and Runtime Artifacts

Repo files changed by this acceptance pass:

- `docs/PARTYONCE_STAGE2_STEP4_SAFE_BACKEND_PROFILE_AND_REAL_ACCEPTANCE_20260509.md`

Runtime artifacts outside the repo:

- Local SQLite database under `/tmp`.
- Local Chrome user data under `/tmp`.
- Temporary DevTools script under `/tmp`.

These runtime artifacts are not intended for git.

## 8. Current Remaining Limits

The bridge is still not production-ready because:

- Lead API storage is in-memory.
- The database-backed Lead schema is not implemented.
- Rate limiting and anti-spam controls are not implemented.
- Admin production workflow is not complete.
- Quote API and Order API are still intentionally blocked.
- Payment and external notification systems are still intentionally blocked.

## 9. Next Recommendation

Step 4 can now be considered locally accepted for the intended bridge behavior.

The next narrow step should be either:

1. Review and commit this acceptance report as a single document.
2. Plan Step 5 around persistent Lead storage and controlled migration design.

Do not expand directly into Quote API, Order API, payment, webhook, n8n, external messaging, supplier full backend, or production deployment.
