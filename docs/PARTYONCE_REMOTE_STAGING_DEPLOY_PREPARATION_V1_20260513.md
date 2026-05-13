# PartyOnce Remote Staging Deploy Preparation V1 2026-05-13

## 1. Goal

Prepare remote staging deployment inputs without deploying, pushing, touching production, reading `.env.production`, triggering payment, webhook/n8n, or sending outbound messages.

## 2. Current Baseline

- Branch: `eye-lite-v2-release-candidate-20260512`
- HEAD at commit preparation: `ce47272c Remove tracked generated and sensitive files`
- Working tree at preflight: only this remote staging preparation document and `render.staging.yaml` were untracked
- Latest clean branch frontend source restore: complete
- Tracked generated/sensitive/evidence cleanup: complete

## 3. Files Added

- `render.staging.yaml`
- `docs/PARTYONCE_REMOTE_STAGING_DEPLOY_PREPARATION_V1_20260513.md`

## 4. Remote Staging Blueprint

`render.staging.yaml` is a preparation-only Render blueprint for a staging API service.

Key settings:

- `name: partyonce-staging-api`
- `rootDir: backend`
- `buildCommand: pip install -r requirements.txt`
- `startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT`
- `healthCheckPath: /api/health`
- `autoDeploy: false`
- `ENVIRONMENT=staging`
- `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, and `PARTYONCE_LEAD_SQLITE_PATH` are manual/sync-false values.

This blueprint does not contain secrets.

## 5. Required Remote Staging Env

Backend staging must be configured manually in Render:

- `ENVIRONMENT=staging`
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `PYTHON_VERSION=3.11.0`
- `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
- `PARTYONCE_LEAD_SQLITE_PATH`

Frontend staging must be configured manually in the frontend host:

- `VITE_API_URL=https://<staging-api-host>`
- Optional only after explicit approval: `VITE_STRIPE_PUBLISHABLE_KEY`
- Default while payment remains blocked: `VITE_STRIPE_TEST_MODE=true`

Do not use `.env.production` as input to remote staging.

## 6. Deploy Gate

Before any remote staging deploy, owner must confirm:

1. Remote staging API host.
2. Remote staging frontend host.
3. Remote staging database choice and backup policy.
4. `CORS_ORIGINS` allowlist.
5. No production DB connection.
6. No payment live mode.
7. No webhook/n8n live trigger.
8. No outbound email, SMS, WhatsApp, WeChat, or WeCom.
9. No `dist`, `node_modules`, test evidence, `.env.production`, or secrets in Git.

## 7. Pre-deploy Checks

Local checks run in this preparation:

```bash
git status --short
git rev-parse --short HEAD
PYTHONPYCACHEPREFIX=/tmp/partyonce_remote_staging_pycache python3 -m py_compile backend/main.py
cd frontend/vue-app
npm run build -- --mode staging --outDir /tmp/partyonce_remote_staging_build --emptyOutDir
```

Expected:

- Working tree contains only explicitly approved staging preparation files: passed.
- Backend compile passes: passed.
- Frontend staging build passes: passed.
- Build output stays in `/tmp`, not `frontend/vue-app/dist`: passed.
- `render.staging.yaml` parses as YAML and has `autoDeploy: false`: passed.

Known warning:

- Vite reports chunks larger than 500 kB. This remains a P1 optimization issue and is not a remote staging preparation blocker.

## 8. Remote Staging Smoke Plan

After owner-approved remote staging deploy only:

1. `GET /api/health` returns 200.
2. `HEAD /docs` or `GET /docs` returns 200.
3. Lead -> Quote -> Order local/staging API smoke passes.
4. Customer read-only quote/order smoke passes.
5. Supplier light loop smoke passes.
6. Browser route smoke passes for admin, customer, supplier, and payment readiness routes.
7. Payment route remains readiness-only and creates no PaymentIntent.
8. Notification dry-run creates no external n8n/webhook send.

## 9. Explicit Non-actions

This preparation did not:

- deploy to Render, Vercel, Railway, or any remote host
- push to GitHub
- read or modify `.env.production`
- connect to production DB
- execute production migration
- trigger Stripe, PaymentIntent, webhook, n8n, email, SMS, WhatsApp, WeChat, or WeCom
- submit or send anything externally

## 10. Status

Remote staging deploy preparation can proceed to owner review. Remote staging deploy itself remains blocked until explicit owner approval.
