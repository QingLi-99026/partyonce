# PartyOnce Supplier Light Closed Loop Workpack 20260512

## 1. Workpack Goal

Complete a local/staging supplier light closed loop:

```text
Supplier display
-> Supplier application
-> Application status
-> Admin review
-> Supplier category / review note
-> Local/staging validation
```

This workpack intentionally stays lightweight. It does not implement a full supplier backend, automatic approval, automatic dispatch, contracts, payment, webhook, n8n, or outbound messaging.

## 2. Modified / Added Files

- `frontend/vue-app/src/services/supplierLightService.js`
- `frontend/vue-app/src/views/SuppliersMap.vue`
- `frontend/vue-app/src/views/partner/Apply.vue`
- `frontend/vue-app/src/views/partner/Status.vue`
- `frontend/vue-app/src/views/admin/Partners.vue`
- `frontend/vue-app/src/components/NavHeader.vue`
- `docs/PARTYONCE_SUPPLIER_LIGHT_CLOSED_LOOP_WORKPACK_20260512.md`

Note: the active routes use `views/partner/Apply.vue`, `views/partner/Status.vue`, and `views/admin/Partners.vue`. The root-level `PartnerApply.vue` had pre-existing local changes and was not touched.

## 3. Supplier Display

`/suppliers` is backed by `supplierLightService.js` local/staging supplier fixtures.

Current behavior:

- displays demo suppliers;
- supports category, suburb, and price filtering;
- avoids remote image dependencies in demo data;
- labels the data source as `local/staging supplier fixture`.

## 4. Supplier Application

`/partner/apply` now submits to the local/staging supplier application store:

```text
partyonce_supplier_applications_v1
```

Stored fields include:

- company name;
- category;
- contact name;
- phone;
- email;
- service area;
- ABN optional;
- status;
- review note;
- created / updated timestamps.

No backend production auth, production database, email, SMS, WhatsApp, webhook, n8n, or payment is triggered.

## 5. Application Status

`/partner/status` can query a supplier application by email.

It displays:

- company name;
- category;
- created time;
- current status;
- review note;
- rejection reason where applicable;
- data source.

Supported local/staging statuses:

- `pending`
- `approved`
- `rejected`
- `needs_info`

## 6. Admin Review

`/admin/partners` can review local/staging applications after admin route access is available.

Admin review now supports:

- listing applications;
- filtering by status, category, and keyword;
- updating status;
- updating supplier category;
- writing review note;
- recording rejection reason.

The update is persisted to `localStorage` and then visible in `/partner/status`.

## 7. Local / Staging Validation

### SFC / JS Checks

SFC parse passed for:

```text
frontend/vue-app/src/views/SuppliersMap.vue
frontend/vue-app/src/views/partner/Apply.vue
frontend/vue-app/src/views/partner/Status.vue
frontend/vue-app/src/views/admin/Partners.vue
frontend/vue-app/src/components/NavHeader.vue
```

JS syntax check passed for:

```text
frontend/vue-app/src/services/supplierLightService.js
```

### Browser Smoke

Local Vite server:

```text
http://127.0.0.1:4178/
```

Checked routes:

```text
/suppliers 200 body-ok
/partner/apply 200 body-ok
/partner/status 200 body-ok
/admin/partners 200 admin-ok
```

Functional checks:

```text
Supplier application created: yes
Application status readable: yes
Admin can see application: yes
Admin can update status / review note: yes
Browser console errors: 0
```

Admin route note:

`/admin/partners` is protected by the existing admin route guard. Browser smoke used a local admin fixture in `localStorage`.

## 8. External Systems

No external system was triggered.

Not used:

- payment;
- Stripe;
- webhook;
- n8n;
- email;
- SMS;
- WhatsApp;
- production deployment;
- push.

## 9. Environment / Build Boundary

- `.env.production` was not read or modified.
- `frontend/vue-app/dist` was not submitted.
- No production database was used.
- No production migration was created.

## 10. Blockers

No blocker for the lightweight local/staging supplier loop.

Backend partner endpoints still exist but require real auth/admin flows and do not match the lightweight unauthenticated local/staging demo requirement. This workpack therefore keeps supplier application review in a controlled local fixture.

## 11. Commit Hash

`0c9140fc`

## 12. Next Step

If product approves the lightweight flow, the next step is a backend read/write skeleton for supplier applications with local/staging auth fixtures, keeping automatic approval, contracts, outbound messaging, and payment in separate blocked workstreams.
