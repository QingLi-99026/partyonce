# PartyOnce Stage 2 Step 4 Quote To Lead Bridge Plan

Date: 2026-05-09  
Scope: planning only  
Repository: `/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`

## 1. Purpose

Step 4 should bridge the current `/quote` local inquiry flow to the Stage 2 Lead API skeleton:

```text
/quote inquiry form -> POST /api/leads
```

This plan does not implement frontend code, backend code, migrations, database persistence, payment, deployment, or external messaging.

## 2. Current Baseline

Relevant commits:

```text
80722979aba81c58899d6e25f71911c4ecc8ddef
Add lead API skeleton

4388f43b0c9586eb8837102bdd4f918aa8cafc05
Map admin lead queue to lead API skeleton
```

Current `/quote` behavior:

- Builds an `inquiryData` object in `QuotePage.vue`.
- Writes the inquiry into `localStorage.inquirySubmissions`.
- Shows a local success message.
- Does not call backend.
- Does not create Quote or Order.

Current Lead API skeleton:

- `POST /api/leads` creates an in-memory Lead skeleton.
- `GET /api/leads` is admin-only through `require_admin`.
- `GET /api/leads/{lead_id}` is admin-only.
- `PATCH /api/leads/{lead_id}` is admin-only.
- No database persistence exists yet.

Current Admin Lead Review:

- Defaults to `LocalStorage`.
- Has a manual `Backend Skeleton` mode.
- Can manually sync localStorage leads to backend skeleton.

## 3. Bridge Design Principle

The bridge must be explicitly local/staging only.

Default behavior should remain:

```text
/quote -> localStorage.inquirySubmissions
```

Backend skeleton submission should happen only when an explicit local/staging flag is enabled. If backend submission fails, the localStorage write must still succeed so the demo remains usable.

Recommended operating modes:

| Mode | Behavior | Use |
|---|---|---|
| `local_only` | Save to `localStorage.inquirySubmissions` only. | Default demo and safest fallback. |
| `dual_write_skeleton` | Save to localStorage first, then try `POST /api/leads`. | Local/staging acceptance. |
| `backend_only` | Submit only to backend. | Not recommended until persistence exists. |

Initial Step 4 implementation should use `dual_write_skeleton` only behind an explicit local/staging flag.

## 4. Proposed Feature Flag

Do not use `.env.production`.

Recommended local/staging controls:

- `VITE_LEAD_BRIDGE_MODE=local_only`
- `VITE_LEAD_BRIDGE_MODE=dual_write_skeleton`

Fallback:

- If the variable is absent or unsupported, treat it as `local_only`.

Rules:

- Never infer production backend mode automatically.
- Never enable backend-only mode in this stage.
- Do not change `.env.production`.
- Document the local/staging flag in a local-only setup note if implementation starts.

## 5. Data Mapping

Current `/quote` `inquiryData` should map to `POST /api/leads` as follows:

```text
customerInfo.name -> customer.name
customerInfo.contact -> customer.contact
customerInfo.preferredDate -> preferred_event_date
customerInfo.notes -> intake_notes
selection -> selection
pricing -> pricing_snapshot
source -> web_quote
```

Recommended payload:

```json
{
  "customer": {
    "name": "Customer name",
    "contact": "phone / email / wechat"
  },
  "preferred_event_date": "YYYY-MM-DD",
  "intake_notes": "Customer notes",
  "selection": {
    "themeId": "space",
    "themeName": "Space",
    "sceneId": "command",
    "sceneName": "Command room",
    "packageId": "standard",
    "packageName": "Standard",
    "addons": []
  },
  "pricing_snapshot": {
    "packagePrice": 0,
    "sceneFee": 0,
    "addonsTotal": 0,
    "finalTotal": 0
  },
  "source": "web_quote"
}
```

Do not map `/quote` directly to Quote or Order.

## 6. Proposed Frontend Implementation Shape

When implementation is approved, keep changes narrow to `QuotePage.vue` and a small local helper if needed.

Suggested functions:

```text
getLeadBridgeMode()
buildLeadPayloadFromInquiry(inquiryData)
submitLeadToBackendSkeleton(inquiryData)
```

Recommended flow inside `submitInquiryForm()`:

1. Validate required form fields.
2. Build `inquiryData`.
3. Save `inquiryData` to `localStorage.inquirySubmissions`.
4. If mode is `dual_write_skeleton`, call `POST /api/leads`.
5. If backend call succeeds, show success with backend skeleton confirmation.
6. If backend call fails, keep local success and show a non-blocking warning.
7. Reset form.

Key rule:

- localStorage write happens before backend call.

## 7. Error Handling

Backend skeleton failure must not break local demo.

Expected failures:

- Backend not running.
- Vite proxy not configured or unavailable.
- Validation error from `POST /api/leads`.
- Network error.
- In-memory backend restarted and lost previous records.

User-facing behavior:

- The inquiry still appears in `/my/inquiries`.
- The inquiry still appears in `/admin/local-leads` LocalStorage mode.
- A warning can say backend skeleton sync failed and the record remains local.
- Do not show production-style incident or payment language.

## 8. Security and Permission Boundary

`POST /api/leads`:

- May remain anonymous in this stage with basic validation.
- Must not require admin.
- Must not create Quote or Order.

Admin queue:

- `GET /api/leads`, `GET /api/leads/{lead_id}`, and `PATCH /api/leads/{lead_id}` remain admin-only through `require_admin`.

Bridge must not:

- Read `.env.production`.
- Modify `.env.production`.
- Send email, SMS, WhatsApp, or other outbound messages.
- Trigger webhook or automation.
- Trigger payment.
- Depend on production deployment.

## 9. Acceptance Criteria For Step 4 Implementation

Step 4 implementation is accepted when:

- Default `/quote` behavior still writes to localStorage without backend.
- With local/staging bridge mode enabled, `/quote` writes to localStorage and attempts `POST /api/leads`.
- Backend failure does not block local inquiry creation.
- Admin Lead Review Backend Skeleton mode can display records created through the bridge while the backend process is alive.
- No Quote is created.
- No Order is created.
- No payment flow is touched.
- No external automation or outbound message is triggered.
- No `.env.production` or dist files enter the commit.

## 10. Testing Plan

Safe tests for implementation:

- Static grep for bridge flag usage.
- `python3 -m py_compile backend/main.py` if backend changes are made, though Step 4 should not need backend changes.
- Manual local route check only if local backend/frontend startup is approved.
- Browser check in local mode:
  - Submit `/quote`.
  - Confirm `localStorage.inquirySubmissions` receives the record.
  - Confirm `/admin/local-leads` LocalStorage mode shows it.
- Browser check in local/staging bridge mode:
  - Submit `/quote`.
  - Confirm localStorage still receives the record.
  - Confirm Backend Skeleton mode shows the submitted lead.

Avoid:

- `npm run build` unless dist handling is explicitly approved.
- Production backend checks.
- Full deployment checks.

## 11. Explicitly Out Of Scope

This plan does not include:

- Quote API.
- Order API.
- Stripe or real payment.
- Webhook execution.
- Automation execution.
- Email, SMS, WhatsApp, or other outbound messaging.
- Production deployment.
- `.env.production` changes.
- `frontend/vue-app/dist` submission.
- Real database persistence.
- Real migration execution.
- Supplier backend expansion.
- Contract signing.

## 12. Next Step Recommendation

If owner approves this plan, implement Step 4 as a narrow frontend bridge:

- Modify `/quote` only.
- Keep localStorage default.
- Add local/staging dual-write mode.
- Add a report.
- Run only safe local checks.

Do not begin Quote API, Order API, payment, deployment, or external messaging.
