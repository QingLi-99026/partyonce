# Party Event Production Hardening Patch Pack V1

Date: 2026-05-12

Scope: local/staging-only production hardening guardrails. This patch does not deploy, push, trigger payment, trigger webhook/n8n, send messages, or modify production secrets.

## Safety Boundary

- Did not read, print, copy, or modify `frontend/vue-app/.env.production`.
- Did not read, print, copy, or modify backend production secrets.
- Did not touch payment, Stripe, webhook, n8n, deployment, `dist`, `node_modules`, database files, or production data.
- Did not run backup, deploy, push, or external service actions.

## Files Changed

- `backend/main.py`
- `frontend/vue-app/.env.example`
- `frontend/vue-app/vite.config.js`
- `.gitignore`
- `docs/PARTY_EVENT_PRODUCTION_HARDENING_PATCH_PACK_V1.md`

## Backend Hardening

- Added `ENVIRONMENT` / `APP_ENV` runtime mode detection.
- Production now fails closed when `DATABASE_URL`, `SECRET_KEY`, or `CORS_ORIGINS` is missing.
- Production rejects the default `SECRET_KEY` and short secret values.
- Production rejects wildcard CORS origins.
- Local/staging retains localhost CORS defaults for existing development workflows.
- Production startup skips `Base.metadata.create_all(bind=engine)` and requires controlled migrations instead.

## Frontend Config Hardening

- Added non-secret Vite API examples to `.env.example`.
- Documented that production `VITE_API_URL` must be a stable owner-confirmed HTTPS API, not a temporary tunnel.
- Added local/staging-only `VITE_DEV_API_PROXY_TARGET` support in Vite dev server config.
- Kept Stripe publishable key blank in the example and marked test mode as default until payment receives explicit approval.

## Git Hygiene

- Extended `.gitignore` for local env files, frontend build output, test evidence, Python caches, and local database files.
- Existing tracked dirty files are not reverted by this patch; release staging must still use an explicit whitelist.

## Validation

- `PYTHONPYCACHEPREFIX=/tmp/partyonce_hardening_pycache python3 -m py_compile backend/main.py` - passed.
- `node --check frontend/vue-app/vite.config.js` - passed.
- Focused git status checked only for the patch whitelist.

Frontend production build was intentionally not run in this patch because a Vite production build may load `.env.production`, and this session is forbidden from reading production env contents.

## Remaining Blockers

- No production deploy should proceed until owner confirms stable production API URL, production database/migration plan, Render/hosting blueprint, payment approval state, webhook/n8n approval state, and a clean release branch.
