# PartyOnce Remote Staging Deploy Approval Gate V1 2026-05-13

## 1. Current Branch / HEAD

- Branch: `eye-lite-v2-release-candidate-20260512`
- HEAD: `912ddd58 Add remote staging deploy preparation`
- Release candidate branch: prepared
- Remote staging deploy preparation commit: `912ddd58`

## 2. render.staging.yaml Check

`render.staging.yaml` exists and was checked locally.

Result:

- `autoDeploy: false` - pass
- `rootDir: backend` - pass
- no real secret values in blueprint - pass
- no `.env.production` content or reference - pass
- service name: `partyonce-staging-api`
- `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, and `PARTYONCE_LEAD_SQLITE_PATH` are `sync: false`

No Render connection was made.

## 3. Git Clean Status

Command:

```bash
git status --short
```

Result before this report was added:

```text
<no output>
```

Interpretation: working tree was clean before creating this approval gate report.

## 4. Forbidden Files Check

Command:

```bash
git ls-files | grep -E 'frontend/vue-app/dist|frontend/vue-app/.env.production|frontend/vue-app/node_modules|.DS_Store|backend/__pycache__|test_evidence|EvidencePack' || true
```

Result:

```text
EvidencePack_RC20260303.zip
generate_test_evidence.sh
test_evidence_track/evidence_output.txt
test_evidence_track/evidence_track_report.md
test_evidence_track/login_response.json
test_evidence_track/register_response.json
```

Interpretation: approval gate is not fully green. The release candidate no longer shows the high-risk paths `frontend/vue-app/dist`, `frontend/vue-app/.env.production`, `frontend/vue-app/node_modules`, `.DS_Store`, `backend/__pycache__`, or `EvidencePack/`, but the required grep command still matches tracked historical evidence/test-evidence-like files. No cleanup was performed in this approval gate.

## 5. Owner Approval Required

Before true remote staging deploy, owner must explicitly approve:

1. Whether to push release candidate branch.
2. Whether to connect to remote staging host.
3. Whether to configure staging env.
4. Whether to execute remote staging deploy.
5. Confirm staging-only, production forbidden.
6. Confirm no real payment.
7. Confirm no real webhook / n8n trigger.
8. Confirm no outbound email / SMS / WhatsApp.

Additional blocker decision:

- Decide whether the tracked grep matches listed in section 4 must be removed/renamed in a separate cleanup commit before push/deploy approval.

## 6. Staging Env Required

Backend remote staging:

- `ENVIRONMENT=staging`
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `PYTHON_VERSION=3.11.0`
- `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
- `PARTYONCE_LEAD_SQLITE_PATH`

Frontend remote staging:

- `VITE_API_URL=https://<approved-staging-api-host>`
- `VITE_STRIPE_TEST_MODE=true`
- `VITE_STRIPE_PUBLISHABLE_KEY` only if explicitly approved for staging test-mode readiness

Do not use `.env.production` as input to staging.

## 7. Staging Deploy Smoke Checklist

After owner-approved remote staging deploy only:

1. `GET /api/health` returns 200.
2. `GET /docs` or `HEAD /docs` returns 200.
3. Backend logs do not print secrets.
4. Backend logs do not show wildcard CORS.
5. Lead create / qualify smoke passes.
6. Quote create / accept smoke passes.
7. Order create / status update smoke passes.
8. Customer read-only quote/order smoke passes.
9. Supplier light apply / status / admin approve smoke passes.
10. Browser route smoke passes for admin, customer, supplier, and payment readiness routes.
11. Payment readiness creates no PaymentIntent.
12. Notification dry-run triggers no real webhook/n8n and sends no outbound messages.

## 8. Production Status

Production remains **No-Go**.

Reasons:

- Production deployment was not approved.
- Production migration was not executed.
- MySQL-compatible production migration set is not fully solidified.
- Payment, webhook/n8n, monitoring, backup, rate limit, and production auth gates remain incomplete.
- This gate is remote staging only.

## 9. Explicit Non-actions This Round

This round did not:

- push
- deploy
- connect to Render, Vercel, or Railway
- read or modify `.env.production`
- submit `dist`
- connect to production DB
- run production migration
- trigger Stripe/payment
- trigger webhook/n8n
- send email/SMS/WhatsApp
- use `git add .`

## 10. Gate Conclusion

Remote staging deploy approval gate report is complete, but the gate is **not fully green** because the required forbidden-file grep command returned tracked evidence/test-evidence-like files.

Recommendation:

- Do not request true remote staging deploy approval until owner reviews section 4.
- If owner accepts those files as non-blocking legacy release artifacts, remote staging deploy approval can be requested.
- If owner requires strict no-output compliance, perform a separate owner-approved cleanup commit before push/deploy approval.
