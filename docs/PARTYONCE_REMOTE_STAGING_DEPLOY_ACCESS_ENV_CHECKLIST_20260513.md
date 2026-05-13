# PartyOnce Remote Staging Deploy Access / Env Checklist 2026-05-13

## 1. GitHub Branch Push Status

- Branch: `eye-lite-v2-release-candidate-20260512`
- HEAD at push: `713b396b`
- Remote: `origin`
- GitHub branch: `origin/eye-lite-v2-release-candidate-20260512`
- Push status: completed
- GitHub PR URL:
  - `https://github.com/QingLi-99026/partyonce/pull/new/eye-lite-v2-release-candidate-20260512`

## 2. Render Deploy Blocker

Remote staging deploy was not executed.

Current blockers:

- `render` CLI is not installed in this session.
- `RENDER_API_KEY` is not set.
- Render MCP / deploy tool is not available in this session.
- Backend staging env values are not configured.
- Frontend staging env values are not configured.

## 3. Required Render Access

Owner must provide or configure one approved Render access path:

1. Render Dashboard manual deploy access, or
2. Render API key for CLI/MCP use, or
3. Render MCP configured and available to this Codex session.

If using API key, do not paste it into tracked files. Configure it only in the shell/session secret mechanism or Render Dashboard.

## 4. Backend Staging Env

Required backend staging env:

- `ENVIRONMENT=staging`
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `PYTHON_VERSION=3.11.0`
- `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
- `PARTYONCE_LEAD_SQLITE_PATH`

Optional only after explicit approval:

- `OPENAI_API_KEY`
- object storage / R2 env
- any notification provider env

## 5. Frontend Staging Env

Required frontend staging env:

- `VITE_API_URL=https://<approved-staging-api-host>`
- `VITE_STRIPE_TEST_MODE=true`

Optional only after explicit payment readiness approval:

- `VITE_STRIPE_PUBLISHABLE_KEY`

Frontend staging must not use a production API endpoint unless owner explicitly approves that staging is intentionally pointed at production-like infrastructure. Current recommendation: do not connect staging frontend to production backend or production database.

## 6. Values That Must Not Be Written To Git

Never write these values into Git-tracked files:

- `RENDER_API_KEY`
- `DATABASE_URL`
- `SECRET_KEY`
- `PARTYONCE_LEAD_SQLITE_PATH` if it exposes private infrastructure paths
- `OPENAI_API_KEY`
- R2 / object storage access keys
- Stripe keys
- webhook signing secrets
- notification provider keys
- database credentials
- production or staging private tokens

Use Render Dashboard env vars, provider secret stores, or local shell env only.

## 7. Values That Must Not Be Copied From `.env.production`

Do not read or copy values from `.env.production`.

Specifically do not copy:

- production `DATABASE_URL`
- production `SECRET_KEY`
- production `CORS_ORIGINS`
- production API URL
- Stripe live or test keys
- webhook / n8n secrets
- object storage secrets
- any production customer, payment, or account-specific config

Staging values must be independently provided and approved by owner.

## 8. Owner Approval Checklist Before True Deploy

Owner must explicitly approve:

1. Use of the pushed branch `eye-lite-v2-release-candidate-20260512`.
2. Render access method: Dashboard, CLI API key, or MCP.
3. Backend staging env values.
4. Frontend staging env values.
5. Remote staging host connection.
6. Remote staging deploy execution.
7. Staging-only boundary.
8. No production database.
9. No production migration.
10. No real payment / PaymentIntent.
11. No real webhook / n8n trigger.
12. No outbound email / SMS / WhatsApp / WeChat / WeCom.

## 9. Production Status

Production remains **No-Go**.

This checklist does not approve:

- production deploy
- production database connection
- production migration
- payment live mode
- webhook/n8n live mode
- outbound messaging

## 10. Next Step Recommendation

Recommended next step:

1. Owner configures Render access or provides an approved deploy mechanism.
2. Owner provides staging-only env values through Render Dashboard or a secure secret channel.
3. Re-run remote staging deploy preflight:
   - branch/HEAD check
   - forbidden-file grep check
   - `render.staging.yaml` check
   - backend compile
   - frontend staging build to `/tmp`
4. Execute owner-approved remote staging deploy.
5. Run remote staging smoke checklist.

Do not proceed to production until a separate production approval gate passes.
