# PartyOnce Stage 2 Step 7.2B Admin Quote Queue Browser Acceptance

Date: 2026-05-11

Scope: safe local backend plus browser acceptance for Admin Quote Queue

## 1. Acceptance Target

Validate the committed Admin Quote Queue skeleton with a safe local backend profile:

```text
/admin/quotes
GET /api/quotes
PATCH /api/quotes/{quote_id}
```

Relevant commit:

```text
f8c5c7fe313e20acf3043a003961ec8404b3bf05
Add admin quote queue skeleton
```

This acceptance did not enter Order, payment, Stripe, webhook, n8n, outbound messaging, deployment, or production configuration.

## 2. Safe Local Backend Profile

Backend was started locally with:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite local /tmp app database
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_step7_2b_quote_acceptance.sqlite
host=127.0.0.1
port=8014
```

The frontend was started locally with:

```text
VITE_API_URL pointing to the local backend API path
npm run dev bound to host 127.0.0.1 port 5173
```

Both local servers were stopped after acceptance. Follow-up curl checks confirmed both ports no longer accepted connections.

## 3. Seed Data

Created local acceptance data through the safe backend profile:

```text
admin fixture login -> 200
POST /api/leads -> 201
PATCH /api/leads/{lead_id} status=qualified -> 200
POST /api/quotes -> 201
```

Created records:

```text
lead_id=1
quote_id=1
quote_status=draft
quote_number present=true
```

No private credential values are recorded in this report.

## 4. Backend API Verification

Verified admin Quote queue API:

```text
GET /api/quotes -> 200
total=1
items=1
first_status=draft
first_quote_number_present=true
```

Verified admin status update:

```text
PATCH /api/quotes/1 status=sent -> 200
quote_status=sent
```

This confirms the backend side of the Admin Quote Queue can read and update the seeded persistent Quote under the safe local profile.

## 5. Browser Acceptance Attempt

Opened the local frontend in Playwright and added the admin fixture session data to browser storage.

Navigated to:

```text
host 127.0.0.1 port 5173 route /admin/quotes
```

Observed final browser page:

```text
Page URL: host 127.0.0.1 port 5173 route /
Page title: 首页 - PartyOnce
```

The browser was redirected back to the home page instead of rendering the Admin Quote Queue.

The visible nav did include:

```text
Quote Review
```

This means the route and navigation entry are visible, but the admin route guard blocks the page before the queue can render.

## 6. Blocker

Primary blocker:

```text
frontend router guard checks userStore.isAdmin
the inspected store implementation does not expose isAdmin in its returned setup-store state
```

Observed impact:

```text
/admin/quotes redirects to /
AdminQuotes.vue cannot complete browser UI acceptance
GET /api/quotes is not reached from the visible page
PATCH status update cannot be verified from the visible page
```

This matches the risk documented in the Step 7.2 workpack.

Recommended fix should be a separate limited workpack:

```text
add or repair userStore.isAdmin / userStore.isPartner derived fields
verify existing admin and partner route guards
do not modify Quote API, Order API, payment, or backend
```

## 7. Browser Console Notes

Browser console showed existing frontend warnings unrelated to this Step 7.2B blocker:

```text
NavHeader unresolved icon components
UserFilled accessed during render but not defined
Home unresolved icon component
```

These were not fixed in this acceptance pass because that would broaden scope beyond Admin Quote Queue acceptance.

## 8. Result

Final result:

```text
partial pass
```

Passed:

```text
safe backend profile starts
persistent Lead can be created
draft Quote can be created from Lead
GET /api/quotes returns the Quote
PATCH /api/quotes/{quote_id} updates allowed status
frontend route and module were previously confirmed reachable by local Vite route acceptance
browser nav shows Quote Review entry
```

Blocked:

```text
visible /admin/quotes browser UI cannot render because admin guard redirects to home
visible UI row rendering not verified
visible UI status update not verified
non-admin browser access not separately verified
```

## 9. Boundaries Confirmed

This acceptance did not:

```text
modify frontend source
modify backend/main.py
modify backend/migrations
run frontend build
submit frontend/vue-app/dist
read or modify .env.production
connect Stripe/payment
trigger webhook/n8n
send email/SMS/WhatsApp
create Order
deploy
push
```

Generated local browser CLI artifacts remain excluded from staging.

## 10. Next Recommendation

Proceed next with:

```text
Step 7.2C: Admin auth guard/store limited fix
```

Scope should be limited to the existing frontend store/router auth guard behavior needed for admin and partner routes.

After that fix, rerun:

```text
Step 7.2D: Admin Quote Queue browser acceptance retry
```

Do not enter:

```text
Order API
payment
Stripe
webhook/n8n
email/SMS/WhatsApp
deployment
production configuration
```
