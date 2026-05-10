# PartyOnce Stage 2 Step 6.7 Local Quote API Acceptance

Date: 2026-05-10

Scope: local-only acceptance for isolated Stage 2 Quote API skeleton

## 1. Acceptance Target

Validate the real local API route behavior for:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

This acceptance used the safe local backend profile only.

It did not test or trigger:

```text
Order API
Order creation
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
frontend build
production database
deployment
push
```

## 2. Safe Local Backend Profile

Backend was started with:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite local /tmp dummy app database
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_step6_7_quote_acceptance.sqlite
host=127.0.0.1
port=8013
```

The server was stopped after acceptance.

No production configuration was read or modified.

## 3. Admin Auth Fixture

Admin auth fixture was usable.

Initial attempt with a reserved test email domain returned validation error:

```text
POST /api/users/register -> 422
```

The fixture was retried with a normal example email domain and succeeded:

```text
admin register -> 200
admin login -> 200
regular user register -> 200
regular user login -> 200
```

No private credential values are recorded in this report.

## 4. Route Acceptance Results

Observed final route statuses:

```text
POST /api/leads -> 201
PATCH /api/leads/{lead_id} -> 200
POST /api/quotes -> 201
GET /api/quotes -> 200
GET /api/quotes/{quote_id} -> 200
PATCH /api/quotes/{quote_id} status=sent -> 200
PATCH /api/quotes/{quote_id} status=converted_to_order -> 409
GET /api/quotes as regular user -> 403
GET /api/quotes anonymous -> 401
GET /api/leads/{lead_id} as admin -> 200
```

Accepted behavior:

```text
admin can create draft Quote from qualified persistent Lead
admin can list Quote records
admin can read Quote detail
admin can patch Quote status to sent
converted_to_order is blocked
regular user cannot access admin Quote queue
anonymous user cannot access admin Quote queue
Lead status becomes converted_to_quote after Quote creation
```

## 5. Final API Summary

Final acceptance summary:

```text
lead_create_status=201
lead_patch_status=200
quote_create_status=201
quote_list_status=200
quote_detail_status=200
quote_patch_status=200
converted_to_order_status=409
non_admin_get_quotes_status=403
anonymous_get_quotes_status=401
lead_status_after_quote=converted_to_quote
quote_status_initial=draft
quote_status_after_patch=sent
quote_currency=AUD
quote_final_total=1680.0
quote_list_total=1
```

## 6. SQLite Verification

SQLite target:

```text
/tmp/partyonce_step6_7_quote_acceptance.sqlite
```

Observed counts and rows:

```text
customers=2
leads=2
quotes=1
quote_row=1|2|2|sent|AUD|1680
lead_row=2|converted_to_quote
```

The extra customer/lead came from the first failed auth-fixture attempt sequence where public Lead creation succeeded before admin authentication was corrected. It does not affect Quote acceptance because the accepted Quote references Lead 2 and Customer 2.

## 7. Boundaries Confirmed

This acceptance did not:

```text
modify backend/main.py
modify frontend source
modify backend/migrations
run production migration
connect production database
create Order
connect Stripe/payment
trigger webhook/n8n
send email/SMS/WhatsApp
deploy
push
read or modify .env.production
submit frontend/vue-app/dist
clean historical dirty files
```

## 8. Result

Final result:

```text
pass
```

The isolated Stage 2 Quote API skeleton is accepted for local route behavior under the safe local backend profile.

## 9. Remaining Gaps

Remaining before production readiness:

```text
server-side pricing validation remains placeholder-level
manager-specific auth fixture still relies on require_admin behavior
customer-facing Quote view is not implemented
public Quote share link is not implemented
Order API remains blocked
Stripe/payment remains blocked
MySQL execution remains unapproved
production database migration remains unapproved
```

## 10. Next Recommendation

Proceed to:

```text
Step 6.8: Stage 2 Quote API closeout summary
```

After Step 6 closeout, the next broader phase can plan customer-facing quote review or Quote status UX, but must still not start Order/payment without explicit approval.
