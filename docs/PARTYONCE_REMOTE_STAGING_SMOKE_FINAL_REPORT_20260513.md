# PartyOnce Remote Staging Smoke Final Report - 2026-05-13

## Scope

This report closes the remote staging smoke pass for the PartyOnce release candidate branch.

- Branch: `eye-lite-v2-release-candidate-20260512`
- Commit under smoke: `9516f129`
- Scope: remote staging backend and Vercel Preview only
- Production: No-Go

## Render Staging Backend

- Backend URL: `https://partyonce-staging-api.onrender.com`
- Health endpoint: `https://partyonce-staging-api.onrender.com/api/health`
- `/api/health` result: passed
- Observed response shape: `{"status":"healthy","timestamp":"..."}`

## Backend Deployment Fix

The backend Dockerfile was updated to use Render's runtime `$PORT` value instead of a fixed port.

- Issue fixed: Render expected the service to bind to the platform-assigned port.
- Fix commit: `9516f129`
- Result: Uvicorn bound to Render's runtime port and the service became Live.

## Vercel Preview

- Preview URL: `https://partyonce-1qrhkf9lr-qingli-99026s-projects.vercel.app/`
- Branch alias: `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`
- Preview environment: `Preview`
- Preview backend env: `VITE_API_URL=https://partyonce-staging-api.onrender.com`
- Stripe mode env: `VITE_STRIPE_TEST_MODE=true`

## Smoke Results

| Route | Result | Notes |
| --- | --- | --- |
| `/` | Passed | Homepage rendered normally and was not blank. |
| `/my/quotes` | Passed | Customer quote page rendered normally and was not blank. |
| `/admin/quotes` | Passed | Admin quote page rendered after temporary local admin fixture; it was not blank. |
| `/payment/deposit` | Passed | Payment readiness page rendered; payment remained blocked. |

## Admin Data State

The `/admin/quotes` page showed an empty queue / loading warning state. This is treated as staging data/auth fixture absence, not a blank-page failure.

- Page shell rendered.
- Admin controls rendered.
- Empty-state messaging rendered.
- No order creation, payment action, webhook, n8n, or outbound action was triggered.

## Safety Confirmation

- Payment triggered: No
- Webhook triggered: No
- n8n triggered: No
- Email/SMS/WhatsApp/outbound messages triggered: No
- `.env.production` read or modified: No
- Production deploy: No
- `dist` committed: No
- Production status: No-Go

## Current Status

Remote staging smoke is complete for the current release candidate preview/backend pair.

The remaining limitation is staging data/auth depth for admin flows. The admin page can render, but real staging admin workflow validation needs approved staging credentials or seeded staging-only fixture data.

## Recommended Next Steps

1. Keep production No-Go until owner explicitly approves a separate production gate.
2. Add or approve staging-only admin credentials / fixture data for deeper admin workflow smoke.
3. Re-run a targeted admin data smoke after staging fixtures are available.
4. Keep payment readiness blocked until Stripe test-mode publishable key and backend payment scope are explicitly approved.
