# Party Events / PartyOnce Local Lead Review Workpack

Date: 2026-05-08  
Route: `/admin/local-leads`  
Scope: localStorage inquiry lead review and follow-up operations  
External systems: not triggered

## 1. Route Choice

I used `/admin/local-leads`.

Reason:

- The page is operational rather than customer-facing, so the `/admin/*` namespace matches the product model.
- I intentionally did not add `requiresAuth` / `requiresAdmin` metadata for this page because it is a local acceptance page backed only by browser `localStorage`. This keeps the demo reviewable without an admin backend account while the page copy clearly marks it as local-only.

## 2. Changes Made

### Added local Lead Review page

File: `frontend/vue-app/src/views/LocalLeadReview.vue`

What it does:

- Reads `localStorage.inquirySubmissions`.
- Displays customer name, contact, theme/package, amount, submit time, and status.
- Supports status filter: all / pending / contacted / closed.
- Supports text search across customer name, contact, theme, package, owner, and next action.
- Supports updating status.
- Supports setting follow-up priority: `High`, `Medium`, `Low`.
- Supports setting owner.
- Supports setting next action.
- Supports editing follow-up note in the expanded row.
- Persists all edits back to `localStorage.inquirySubmissions`.
- Stores operations fields under a non-breaking `followUp` object:
  - `priority`
  - `owner`
  - `nextAction`
  - `note`
  - `updatedAt`

Safety behavior:

- Corrupt or non-array localStorage data is handled as an empty list with a warning.
- Existing customer inquiry fields are preserved.
- No backend API, payment API, webhook, n8n, email, SMS, or WhatsApp call is made.

### Registered route

File: `frontend/vue-app/src/router/index.js`

Change:

- Added `/admin/local-leads` route with title `本地留资跟进中心`.

### Connected navigation

File: `frontend/vue-app/src/components/NavHeader.vue`

Change:

- Added `Lead Review` under Support for easy local access.
- Added `Local Leads` under Admin for admin users.

### Connected Local Demo Hub

File: `frontend/vue-app/src/views/LocalDemoHub.vue`

Change:

- Added header button `进入 Lead Review`.
- Added Lead Review to the quote / lead walkthrough step.
- Added Lead Review Ops to the quote / lead / follow-up route group.

## 3. Local Test Results

Build:

```bash
npm run build
```

Result:

- Passed.
- Vite transformed 1672 modules.
- `LocalLeadReview` CSS/JS chunks were generated.
- Existing large chunk warning remains. It is a bundle-size warning, not a route or compile failure.

Dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Result:

- A Vite dev server is available at `http://127.0.0.1:3000/`.

Route check:

```bash
curl -I http://127.0.0.1:3000/admin/local-leads
```

Result:

- `HTTP/1.1 200 OK`

## 4. External Systems

- Real payment triggered: no.
- Webhook / n8n triggered: no.
- Email / SMS / WhatsApp sent: no.
- Backend API called by this new page: no.
- Online deployment triggered: no.
- OpenClaw / OpenCloud connected: no.
- User files deleted: no.

## 5. Sensitive Files

- `.env` / `.env*` files read: no.
- Secrets printed or copied: no.

## 6. dist Status

Running `npm run build` regenerated Vite build outputs under `frontend/vue-app/dist`, causing dist hash changes and existing tracked dist asset deletions/new generated files in the working tree.

I did not add, commit, or intentionally deliver `dist/` as part of this workpack. The source deliverables are the Vue page, route/nav wiring, Local Demo Hub wiring, and this report.

## 7. Current App Progress Judgment

PartyOnce is now stronger as a local acceptance demo:

- Customer can generate local inquiry records from quote flow.
- Operations can review, search, prioritize, assign, and annotate local leads.
- Local Demo Hub now connects the full first-stage review path.

The app is still not a production lead management system because these records live in browser localStorage and do not sync to backend users, admin accounts, real order queues, or notification systems.

## 8. Recommended Next Work

Next round should define and implement the backend lead/order contract:

- Decide the canonical backend model for inquiry lead vs quote draft vs order lead.
- Map current local fields into that backend model.
- Add a read-only backend-backed lead queue behind admin auth.
- Keep external notifications and payment flows blocked until owner approval gates are complete.
