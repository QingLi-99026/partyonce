# PartyOnce Stage 2 Step 4 Quote to Lead Bridge Workpack

Date: 2026-05-09

Scope: `/quote` local/staging bridge to `POST /api/leads`

## 1. Objective

This workpack implements the narrow bridge planned in `docs/PARTYONCE_STAGE2_STEP4_QUOTE_TO_LEAD_BRIDGE_PLAN_20260509.md`.

The goal is to let the quote inquiry form keep its current local demo behavior while optionally syncing to the Lead API skeleton in local or staging mode.

## 2. Files Changed

- `frontend/vue-app/src/views/QuotePage.vue`
- `docs/PARTYONCE_STAGE2_STEP4_QUOTE_TO_LEAD_BRIDGE_WORKPACK_20260509.md`

No backend file, migration file, production configuration, or dist file was changed by this workpack.

## 3. Implemented Behavior

`/quote` still saves every submitted inquiry to:

```text
localStorage.inquirySubmissions
```

This remains the default path.

The page now supports an optional bridge mode:

```text
VITE_LEAD_BRIDGE_MODE=dual_write_skeleton
```

When this mode is explicitly enabled in a local or staging setup, the form:

1. Validates required fields.
2. Builds the existing local inquiry payload.
3. Saves the inquiry to localStorage first.
4. Attempts `POST /api/leads`.
5. Shows a backend skeleton sync confirmation only if the API returns a Lead ID.

If the backend skeleton call fails, the localStorage record remains saved and the page shows a local-only success message.

## 4. Default Mode

If `VITE_LEAD_BRIDGE_MODE` is absent or unsupported, the page treats it as:

```text
local_only
```

`backend_only` was not implemented and is not recommended while Lead persistence remains in-memory.

## 5. Data Mapping

The bridge maps quote inquiry data to `POST /api/leads` as follows:

```text
customerInfo.name -> customer.name
customerInfo.contact -> customer.contact
customerInfo.preferredDate -> preferred_event_date
customerInfo.notes -> intake_notes
selection -> selection
pricing -> pricing_snapshot
source -> web_quote
```

## 6. Boundary Confirmation

This workpack does not:

- Create Quote records.
- Create Order records.
- Trigger payment.
- Trigger webhook or n8n.
- Send email, SMS, WhatsApp, or other outbound messages.
- Read or modify `.env.production`.
- Submit `frontend/vue-app/dist`.
- Create a database migration.
- Write to a database.
- Deploy production code.

## 7. Auth and Backend Reality

`POST /api/leads` remains the public Lead API skeleton endpoint from Step 2.

The admin Lead queue endpoints remain guarded by the backend `require_admin` dependency. This workpack does not change admin auth.

Lead API skeleton storage remains in-memory only.

## 8. Validation and Error Handling

The quote page still requires:

- Name.
- Contact.
- Preferred event date.

The localStorage write happens before the optional backend skeleton call.

If localStorage contains invalid JSON, the page resets the local inquiry list to an empty array before saving the new record.

If the backend skeleton is unavailable, validation fails, or returns a non-OK response, the user flow stays local-only and does not fail the demo.

## 9. Test Result

Performed static code checks only.

Attempted a limited lint command for `src/views/QuotePage.vue`, but the local frontend package does not currently expose an available `eslint` binary in this workspace, so lint could not run.

Ran a Vue single-file component parse check for `src/views/QuotePage.vue` using the local `@vue/compiler-sfc`; it passed.

No build was run in this workpack because the repository has known historical frontend dependency/build blockers outside this scope.

No backend server was started and no API request was sent by this workpack.

## 10. Current Risk

The bridge depends on local/staging environment setup to opt into `dual_write_skeleton`.

Because the Lead API skeleton uses in-memory storage, backend-synced Leads will not persist across backend restarts.

The bridge should not be treated as production Lead intake until the approved database schema, migration, persistence, validation, rate limiting, and admin workflow are implemented.

## 11. Next Step Recommendation

After review, the next narrow step is local acceptance:

1. Run the frontend in default mode and confirm `/quote` still writes only to localStorage.
2. Run the backend Lead API skeleton locally.
3. Enable `VITE_LEAD_BRIDGE_MODE=dual_write_skeleton` in a local or staging-safe setup.
4. Confirm `/quote` still writes localStorage first and then attempts `POST /api/leads`.
5. Confirm `/admin/local-leads` can review local records and can manually use backend skeleton mode where previously implemented.

Do not start Quote API, Order API, payment, webhook, n8n, outbound messaging, database migration, or production deployment as part of this workpack.
