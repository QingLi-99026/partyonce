# PartyOnce party_scene_config AI Engine Workpack

Date: 2026-05-14

Branch: `eye-lite-v2-release-candidate-20260512`

Baseline HEAD before workpack: `b0a37810`

## 1. 本轮目标

Upgrade the AI Concierge from a theme/package recommendation flow into a stable `party_scene_config` generator that can be reused by Quote, customer pages, Admin operations, visual rendering, and future 3D preview work.

The target chain is:

```text
AI answers
-> theme / package / venue recommendation
-> party_scene_config
-> quote prefill
-> inquiry payload
-> customer/admin scene summary
-> future 3D input
```

## 2. 修改/新增文件

- `frontend/vue-app/src/data/partySceneConfig.js`
- `frontend/vue-app/src/data/aiConciergeQuestions.js`
- `frontend/vue-app/src/data/recommendationRules.js`
- `frontend/vue-app/src/services/customerExperienceService.js`
- `frontend/vue-app/src/services/investorDemoService.js`
- `frontend/vue-app/src/views/AIVoiceIntake.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/MyQuotes.vue`
- `frontend/vue-app/src/views/MyOrders.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `docs/PARTYONCE_PARTY_SCENE_CONFIG_AI_ENGINE_WORKPACK_20260514.md`

## 3. party_scene_config schema

Added `frontend/vue-app/src/data/partySceneConfig.js` with a stable `v1` structure.

Core fields:

```text
version
source
generatedAt
theme / themeId / themeLabel
packageTier / packageTierLabel
venue
guest
layout
decor
visuals
suppliers
pricingExplanation
future3d
```

The structure deliberately separates `layout`, `decor`, `visuals`, and `suppliers` so future 2D rendering, 3D preview, supplier matching, and quote explanation can read the same configuration without hard-coding UI logic into pages.

## 4. AI 问题树升级

The existing AI Concierge question tree was preserved and extended with scene arrangement intent fields:

- `scenePriorities`: dessert/backdrop, photo arch, activity tables, or AI default.
- `stylingPreference`: simple, balanced, immersive, or budget-matched.

These fields let the AI flow capture whether the customer cares most about photo moments, dessert presentation, activity layout, or a lighter setup.

## 5. 推荐规则升级

`recommendationRules.js` now produces:

- `recommendedTheme`
- `recommendedTier`
- `recommendedVenue`
- `supplierSuggestions`
- `party_scene_config`
- `sceneConfigSummary`
- `pricingExplanation`

The scene config derives from the selected theme, tier, venue, guest count, scene priority, styling preference, visual assets, supplier suggestions, and package explanation rules.

Examples:

- Castle + Standard maps to blush/pink decor, castle backdrop, photo arch, dessert table, warm lighting, princess props.
- Space + Premium maps to midnight blue decor, galaxy backdrop, cool LED lighting, planets/rockets/stars, immersive arch/photo-zone emphasis.
- Forest + Basic maps to sage green decor, small balloon clusters, forest leaves, natural flowers, vines and small animal props.

## 6. Quote prefill 接入方式

The AI flow still uses staging-safe browser storage for prefill transport. The generated `party_scene_config` is written into the quote prefill payload and read by `/quote`.

`QuotePage.vue` reads scene config from:

```text
aiPrefill.party_scene_config
aiPrefill.selection.party_scene_config
aiPrefill.aiRecommendation.party_scene_config
```

The Quote page displays:

- recommended theme
- recommended package
- recommended venue
- layout summary
- decor summary
- supplier suggestions
- future 3D readiness route placeholder

## 7. inquiry / Lead payload 写入方式

When an inquiry is submitted from `/quote`, the payload now includes `party_scene_config` in multiple safe locations:

- top-level `party_scene_config`
- `selection.party_scene_config`
- `pricing.party_scene_config`
- `aiRecommendation.party_scene_config`

`customerExperienceService.js` also preserves the scene config when local/staging inquiries are transformed into demo quotes/orders, so customer-side and admin-side demo review can see the same scene context.

No Quote or Order is created by the AI flow directly. The existing inquiry/Lead skeleton remains the entry point.

## 8. 客户侧展示结果

Customer-side pages now display scene config summaries when available:

- `/quote`: full prefill scene summary before submission.
- `/my/quotes`: compact `AI 场景配置` summary on quote cards.
- `/my/orders`: compact `AI 场景配置` summary on order cards.

The customer can understand what the AI recommended, what the room layout implies, and which visual/decor direction is attached to their request.

## 9. 后台展示结果

Admin detail pages now display scene config summaries for operations review:

- `AdminQuoteDetail.vue`
- `AdminOrderDetail.vue`

The admin summary includes:

- `party_scene_config` label
- venue
- layout
- decor
- supplier count

If a historical quote/order lacks scene config, the detail pages can generate a fallback from the current theme/package visual context for local/staging explanation continuity.

## 10. 未来 3D 接入说明

This workpack does not implement a 3D editor.

The scene config includes a future-facing `future3d` section:

```text
engineReady: true
layoutCoordinateSystem: room_relative_v1
editableLayers: layout, decor, visuals, suppliers
suggestedRoute: /experimental/party-3d
```

Future PlayCanvas or Three.js work can consume:

- `layout` for room-relative placement.
- `decor` for material/color/theme layers.
- `visuals` for reference renders.
- `suppliers` for operational fulfillment objects.

## 11. 本地 build 结果

Passed.

Command:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_party_scene_config_build_final --emptyOutDir
```

Result:

```text
Vite build completed successfully.
Output written to /tmp/partyonce_party_scene_config_build_final.
frontend/vue-app/dist was not written by this build.
```

Known non-blocking output:

- Vite CJS Node API deprecation warning.
- Chunk size warning.

## 12. route smoke 结果

Local route smoke passed against local Vite dev server.

Routes checked:

```text
/
/ai-voice-intake
/quote
/my/quotes
/my/orders
/admin/quotes
/admin/orders
/payment/deposit
```

Result:

```text
route 200: passed
non-blank page: passed
broken images: 0
AI flow completion: passed
party_scene_config generation: passed
Quote prefill reads scene config: passed
inquiry payload contains scene config: passed
console errors: 0
```

AI-to-Quote smoke confirmed:

```text
prefill.party_scene_config: true
prefill.aiRecommendation.party_scene_config: true
/quote displays AI 场景配置摘要: true
inquiry.party_scene_config: true
inquiry.selection.party_scene_config: true
inquiry.pricing.party_scene_config: true
inquiry.aiRecommendation.party_scene_config: true
post-inquiry next steps visible: true
```

## 13. Preview redeploy 结果

Release candidate branch pushed after local validation.

Preview URL:

```text
https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/
```

Post-push public route check:

```text
/ 200
/ai-voice-intake 200
/quote 200
/payment/deposit 200
```

Vercel may still need a short redeploy propagation window before Dashboard shows the latest commit as active. The code-side release candidate has been pushed for Preview redeploy.

## 14. 是否读取/修改 .env.production

No.

`.env.production` was not read or modified.

## 15. 是否提交 dist

No.

Build output was directed to `/tmp`.

`frontend/vue-app/dist` must remain excluded from staging.

## 16. 是否 production deploy

No.

No production deploy, production database connection, or production migration was performed.

## 17. 是否触发 payment / webhook / n8n / 外发

No.

The work stayed within frontend/local-staging demo logic. It did not create PaymentIntents, trigger Stripe live mode, trigger webhook/n8n, or send email/SMS/WhatsApp.

## 18. blocker

No implementation blocker for the local/staging `party_scene_config` engine.

Remaining product work:

- Remote Preview should be checked after Vercel redeploy finishes.
- Backend persistence can later add a first-class `party_scene_config_json` field if production quotation storage needs structured query/reporting.
- Future 3D preview remains a separate workpack.

## 19. 下一步建议

Next recommended workpack:

```text
Persist party_scene_config in backend quote/lead storage and connect it to quote line items / PDF-ready quote export.
```

That should happen before real payment integration so deposit calculations can reference stable, auditable quote structure.
