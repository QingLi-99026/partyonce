# PartyOnce Stage 1 Local Demo Acceptance Plan

Date: 2026-05-09  
Scope: local-only Stage 1 demo flow  
Primary entry: `/local-demo`

## 1. Local Demo Entry

Use `/local-demo` as the acceptance starting point.

This page is intentionally local-only. It uses browser `localStorage` for sample inquiry data and does not call payment, webhook, n8n, email, SMS, WhatsApp, deployment, or production backend lead queues.

## 2. Recommended 10-15 Minute Demo Route

| Step | Path | What to verify | Status |
|---|---|---|---|
| 1 | `/` | Current home page loads as the public front door. | Available |
| 2 | `/local-demo` | Reviewer can see the full local demo map and safety boundaries. | Available |
| 3 | `/themes` | Theme entry can be opened from the demo flow. | Available |
| 4 | `/venues` | Venue list can be opened as a front-stage browsing page. | Available |
| 5 | `/templates` | Template library can be opened as a concept/reference surface. | Available |
| 6 | `/quote` | Legacy/local quote preview can be opened. | Available |
| 7 | `/local-demo` | Generate a local inquiry sample. | Available |
| 8 | `/my/inquiries` | Local customer inquiry list can show browser-stored records. | Available |
| 9 | `/admin/local-leads` | Operator can review, search, filter, prioritize, assign owner, set next action, and add notes. | Available |
| 10 | `/suppliers` | Supplier showcase can be opened. | Available |
| 11 | `/partner/apply` | Supplier application entry can be opened. | Available |
| 12 | `/partner/status` | Supplier application status entry can be opened. | Available |
| 13 | `/admin/partners` | Supplier admin review route exists but requires admin auth. | Protected |

## 3. Route Inventory

| Path | Current demo use | Notes |
|---|---|---|
| `/` | Public home | Available. |
| `/local-demo` | Stage 1 demo hub | Available. |
| `/themes` | Theme browsing entry | Available; registered to existing HomePage surface. |
| `/venues` | Venue browsing | Available. |
| `/templates` | Template browsing | Available. |
| `/quote` | Local/legacy quote preview | Available. |
| `/my/inquiries` | Customer inquiry records | Available; browser localStorage records. |
| `/admin/local-leads` | Operator lead review | Available; browser localStorage records. |
| `/suppliers` | Supplier showcase | Available. |
| `/partner/apply` | Supplier application | Available. |
| `/partner/status` | Supplier status | Available. |
| `/admin/dashboard` | Admin dashboard | Not available in this target repo route set. |
| `/admin/orders` | Admin order review | Not available in this target repo route set. |
| `/admin/partners` | Supplier admin review | Route exists; requires admin auth. |

## 4. Completed for Stage 1 Local Demo

- Local demo hub exists and links the main local acceptance path.
- Local quote and inquiry path can be demonstrated without external services.
- Local inquiry sample generation is available from `/local-demo`.
- Local Lead Review reads and writes `localStorage.inquirySubmissions`.
- Lead Review supports status filtering, search, priority, owner, next action, and note.
- Supplier showcase and supplier application/status routes are reachable.
- Local-only and external-action boundaries are visible in the UI.

## 5. Skeleton or Protected Areas

- `/admin/partners` requires admin auth and is not an anonymous demo page.
- `/partner/dashboard` requires login and partner permission.
- `/quotation` exists but requires login and backend quote readiness.
- `/orders` exists but requires login.
- `/admin/dashboard` and `/admin/orders` are not registered in this target repo route set.

## 6. External Systems Still Blocked

The following remain intentionally blocked for this stage:

- Real payment and Stripe production flows.
- Webhook and n8n execution.
- Email, SMS, WhatsApp, or other outbound messages.
- Production deployment.
- Production backend lead queue.
- Real supplier approval workflow.
- Production API configuration changes.

## 7. Not Production-Ready Yet

Do not treat Stage 1 as a production launch.

Current demo records live in the browser. They are not synced to backend users, admin accounts, CRM, payment status, supplier operations, or notification systems.

## 8. Remaining Stage 1 Gaps

- Admin dashboard and admin orders are not present in this target repo route set.
- The local lead queue needs a stable ID model before multi-user or backend sync.
- Build verification is blocked by a pre-existing frontend dependency issue outside this workpack.
- `dist` and `.env.production` have existing dirty state in the target repo and must remain excluded from this workpack.

## 9. Next Round Recommendation

The next smallest useful fix is a local route acceptance smoke script that checks only Stage 1 local routes and records which routes are public, protected, or unavailable.

Do not start backend lead/order contract until Stage 1 demo acceptance is signed off.
