# PartyOnce Tracked Generated Files Cleanup Gate V1

Date: 2026-05-13

## 1. Current Branch / HEAD

- Branch: `eye-lite-v2-release-candidate-20260512`
- Starting HEAD: `9524d15f`

## 2. Tracked Forbidden Files Count

- Initial tracked forbidden/generated/evidence file count: `20469`
- Inventory file: `/tmp/partyonce_tracked_forbidden_files_20260512.txt`

The inventory was generated with a tracked-file scan for:

- `.DS_Store`
- `frontend/vue-app/dist/`
- `frontend/vue-app/node_modules/`
- `frontend/vue-app/.env.production`
- `backend/__pycache__/`
- `EvidencePack/`
- `test_evidence/`
- `test-results/`
- `.playwright-cli/`

## 3. Categories Removed From Git Index

The tracked files above were removed from the Git index with `git rm --cached --ignore-unmatch`.

This does not delete local files. It only stops Git from tracking generated, sensitive, cache, evidence, and dependency artifacts.

Removed categories:

- Generated frontend build output: `frontend/vue-app/dist/`
- Local frontend dependencies: `frontend/vue-app/node_modules/`
- Local production env file path: `frontend/vue-app/.env.production`
- Python bytecode cache: `backend/__pycache__/`
- Evidence/test output folders: `EvidencePack/`, `test_evidence/`, `test-results/`
- Local metadata and tool artifacts: `.DS_Store`, `.playwright-cli/`

## 4. `.gitignore` Updates

`.gitignore` was minimally updated to keep the same categories out of future release commits:

- `frontend/vue-app/node_modules/`
- `frontend/vue-app/.env.production`
- `.playwright-cli/`
- `EvidencePack/`

Existing ignore rules already covered several related paths, including `frontend/vue-app/dist/`, `.DS_Store`, `test-results/`, and `test_evidence/`.

No broad source-code ignore rules were added.

## 5. Local File Preservation Check

Local file/directory checks after `git rm --cached`:

- `frontend/vue-app/.env.production`: local file still exists
- `frontend/vue-app/dist`: local directory still exists
- `frontend/vue-app/node_modules`: local directory still exists

No `rm -rf`, `git clean`, or destructive deletion command was used.

## 6. Git Tracked Forbidden Scan

Post-cleanup tracked forbidden scan result:

- `git ls-files` forbidden/generated/evidence scan: clean, no output

## 7. Build Result

Frontend build command:

```bash
npm run build -- --outDir /tmp/partyonce_rc_after_cleanup_build_check
```

Result:

- Build passed
- Output directory was `/tmp/partyonce_rc_after_cleanup_build_check`
- `frontend/vue-app/dist` was not written by this build

Additional check:

- `git diff --check`: passed
- No existing local-safe smoke script was found in the repository for this gate; this gate therefore records build + tracked-index clean verification and keeps browser/API smoke evidence from the previous final clean verification as the current functional baseline.

## 8. `.env.production`

- `.env.production` content read: No
- `.env.production` modified: No
- `.env.production` submitted: No; it was removed from Git tracking only and remains as a local file.

## 9. `dist`

- `frontend/vue-app/dist` submitted: No
- Existing tracked `dist` files were removed from the Git index only.
- Local `dist` directory remains present.

## 10. Push / Deploy / External Systems

- Push: No
- Deploy: No
- Production DB connection: No
- Production migration: No
- Stripe/payment real trigger: No
- Webhook/n8n real trigger: No
- Email/SMS/WhatsApp external send: No

## 11. Remote Staging Deploy Preparation Readiness

This cleanup gate removes the tracked forbidden/generated/evidence blocker from the release candidate branch.

The release candidate can enter remote staging deploy preparation after the cleanup commit, with two cautions:

- Production remains No-Go.
- Existing untracked remote-staging preparation files are not part of this gate and require separate owner approval before staging or commit:
  - `docs/PARTYONCE_REMOTE_STAGING_DEPLOY_PREPARATION_V1_20260513.md`
  - `render.staging.yaml`

## 12. Production Go / No-Go

Production remains No-Go because:

- Production migration has not been executed.
- MySQL-compatible migration set still needs final production validation.
- Payment / webhook / n8n are not a real closed loop.
- Remote staging deploy preparation and approval are still pending.

## 13. Next Step

Proceed to remote staging deploy preparation only after this cleanup commit is reviewed. Keep production blocked until migration, real payment/webhook/n8n closure, and deployment runbook validation are complete.
