# PartyOnce Vercel Preview Build Fix 2026-05-13

## 1. Vercel Preview Build Failure Cause

The Vercel preview deployment failed with:

```text
npm run build exited with code 1
```

The likely cause is that Vercel ran `npm run build` from the repository root. The root `package.json` does not define a `build` script, so root-level build exits with code 1.

## 2. Why Repo Root `npm run build` Fails

Root command verification:

```bash
npm run build
```

Result:

```text
npm error Missing script: "build"
```

This is expected for the current repository layout because the frontend app lives under:

```text
frontend/vue-app
```

The frontend package there defines:

```text
"build": "vite build"
```

## 3. Frontend Build Verification Result

Frontend build command:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_vercel_fix_build --emptyOutDir
```

Result:

- Build passed.
- Output was written to `/tmp/partyonce_vercel_fix_build`.
- `frontend/vue-app/dist` was not generated or submitted by this verification.
- Vite chunk-size warnings remain informational and are not the cause of the failed preview build.

## 4. Configuration Files Modified

Modified:

- `vercel.json`

The previous root-level Vercel config targeted the backend Python entrypoint. For the frontend preview deployment, it now explicitly builds the Vite app from `frontend/vue-app`:

```json
{
  "version": 2,
  "framework": "vite",
  "installCommand": "cd frontend/vue-app && npm install",
  "buildCommand": "cd frontend/vue-app && npm run build",
  "outputDirectory": "frontend/vue-app/dist"
}
```

It also includes a SPA rewrite to `index.html` for client-side routes.

## 5. Vercel Dashboard Settings To Confirm

In Vercel, confirm the preview project uses the same intent:

- Project type: frontend preview
- Install Command: `cd frontend/vue-app && npm install`
- Build Command: `cd frontend/vue-app && npm run build`
- Output Directory: `frontend/vue-app/dist`
- Framework: Vite

If Vercel project settings already set the root directory to `frontend/vue-app`, then the dashboard equivalent is:

- Root Directory: `frontend/vue-app`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Do not configure production secrets or `.env.production` values for this preview fix.

## 6. `.env.production`

- `.env.production` content read: No
- `.env.production` modified: No
- `.env.production` submitted: No

## 7. `dist`

- `frontend/vue-app/dist` submitted: No
- Local verification output went to `/tmp/partyonce_vercel_fix_build`.

## 8. Push / Deploy / External Systems

- Push: No
- Vercel redeploy triggered: No
- Render / Railway / other deploy triggered: No
- Production DB connection: No
- Stripe/payment trigger: No
- Webhook/n8n trigger: No
- Email/SMS/WhatsApp send: No

## 9. Next Step

After this commit is reviewed, it is reasonable to re-trigger the Vercel preview redeploy for the release candidate branch. Keep production blocked and do not connect real payment, webhook/n8n, or production infrastructure from this preview build.
