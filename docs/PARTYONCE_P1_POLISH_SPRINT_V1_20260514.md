# PartyOnce P1 Polish Sprint V1

Date: 2026-05-14
Branch: `eye-lite-v2-release-candidate-20260512`
Base HEAD before this sprint: `b98d4491`
Preview URL: `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

## 1. 本轮目标

This sprint cleans up the P1 issues from the full walkthrough review before internal review, small external review, and controlled investor demos:

- Reduce `/admin/orders` Preview/staging 401 console noise without weakening auth boundaries.
- Add AI Concierge quick demo / skip path for investor and tester walkthroughs.
- Improve `/quote` information hierarchy so customers understand the flow before seeing the detailed panels.
- Strengthen 3D Preview disclaimers so it is never mistaken for a construction drawing or supplier execution drawing.

## 2. 修改/新增文件

- `frontend/vue-app/src/services/adminOrderService.js`
- `frontend/vue-app/src/views/AdminOrders.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `frontend/vue-app/src/views/AIVoiceIntake.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/Party3DPreview.vue`
- `frontend/vue-app/src/components/PartyScenePreview3D.vue`
- `frontend/vue-app/src/components/PartySceneSummary.vue`
- `frontend/vue-app/src/views/InvestorDemoMode.vue`
- `docs/PARTYONCE_P1_POLISH_SPRINT_V1_20260514.md`

## 3. `/admin/orders` 401 Noise 处理结果

Completed.

`adminOrderService` now uses a controlled static preview fallback for Vercel Preview and local Vite static preview ports unless `VITE_ENABLE_REMOTE_ORDER_API=true` is explicitly enabled.

This avoids noisy remote admin order API calls during Preview/staging demos while preserving the auth boundary:

- It does not bypass production auth.
- It does not request production data.
- It labels the data source as `static preview fallback`.
- Admin Orders and Admin Order Detail show clear staging/static-preview guidance when fallback data is used.

## 4. AI Quick Mode / Skip Path 完成情况

Completed.

`/ai-voice-intake` now includes:

- `Quick demo recommendation`
- `Use sample and go Quote`

The quick demo fills a safe local/staging sample:

- Castle Princess Standard
- Restaurant A
- 16-25 guest range, representing the 20-guest demo scenario
- Indoor
- Mid budget
- `party_scene_config`
- Quote prefill

The full AI Concierge question flow remains available and was not removed.

## 5. Quote 页信息层级优化结果

Completed.

`/quote` now starts with a customer summary panel before the heavier detail sections. The hierarchy is:

1. Current customer selection / AI recommendation summary
2. Restaurant A visual preview and scene context
3. Package differences
4. Quote line items
5. Inquiry submission and next step

This keeps the detailed pricing, supplier, and scene-config panels available while giving customers a simple "start here" orientation.

## 6. 3D Preview 非施工图说明强化结果

Completed.

The 3D Preview warnings were strengthened in:

- `/experimental/party-3d`
- `PartyScenePreview3D`
- `PartySceneSummary`
- Quote 3D entry
- Investor Demo 3D entry

The copy now explicitly says the preview is:

- A visual planning preview only
- Not a construction drawing
- Not an architectural plan
- Not a venue measurement document
- Not a final supplier execution drawing

The warning appears in English and Chinese.

## 7. 本地 Build 结果

Passed.

Command:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_p1_polish_build --emptyOutDir
```

Result:

- Build passed.
- Output went to `/tmp/partyonce_p1_polish_build`.
- `frontend/vue-app/dist` was not written by this command.

SFC parse check also passed for touched Vue files.

## 8. Route Smoke 结果

Local static-preview smoke used `http://127.0.0.1:4174`.

| Route | Result | Console Errors | Broken Images |
| --- | --- | --- | --- |
| `/` | 200, non-blank | 0 | 0 |
| `/ai-voice-intake` | 200, non-blank | 0 | 0 |
| `/quote` | 200, non-blank | 0 | 0 |
| `/admin/orders` | 200, non-blank | 0 | 0 |
| `/admin/orders/1` | 200, non-blank | 0 | 0 |
| `/experimental/party-3d` | 200, non-blank | 0 | 0 |
| `/investor-demo` | 200, non-blank | 0 | 0 |
| `/payment/deposit` | 200, non-blank | 0 | 0 |

AI quick mode smoke:

- `Quick demo recommendation`: passed.
- Recommended result visible: passed.
- `Use sample and go Quote`: passed.
- Quote prefill visible: passed.
- Console errors: 0.

## 9. Preview Redeploy 结果

Completed after pushing the release candidate branch.

Preview:

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

Remote Preview smoke:

| Route | Result | Console Errors | Broken Images | P1 Signal |
| --- | --- | --- | --- | --- |
| `/ai-voice-intake` | 200, non-blank | 0 | 0 | Quick demo copy visible |
| `/quote` | 200, non-blank | 0 | 0 | Quote route healthy |
| `/admin/orders` | 200, non-blank | 0 | 0 | Static Preview fallback copy visible |
| `/experimental/party-3d` | 200, non-blank | 0 | 0 | Non-construction warning visible |

## 10. 是否读取/修改 `.env.production`

No.

This sprint did not read or modify `.env.production`.

## 11. 是否提交 `dist`

No.

The build output was written to `/tmp/partyonce_p1_polish_build`. `frontend/vue-app/dist` is not part of this sprint's staging scope.

## 12. 是否 Production Deploy

No.

No production deployment was performed.

## 13. 是否触发 Payment / Webhook / n8n / 外发

No.

This sprint did not trigger:

- PaymentIntent
- Stripe live mode
- webhook
- n8n
- email
- SMS
- WhatsApp
- real voucher issuance
- external platform API calls

## 14. Blocker

No P0 blocker.

Residual note:

- Preview redeploy still needs to finish after push before the remote URL can be re-smoked.
- The AI quick demo represents the 20-guest scenario through the existing `16-25` guest range option.

## 15. 下一步建议

After Preview redeploy:

1. Re-smoke `/ai-voice-intake`, `/quote`, `/admin/orders`, and `/experimental/party-3d` on Vercel Preview.
2. Use this version for internal review and small external review.
3. Keep production as No-Go until production migration, real payment, webhook/n8n, monitoring, and final security review are completed.
