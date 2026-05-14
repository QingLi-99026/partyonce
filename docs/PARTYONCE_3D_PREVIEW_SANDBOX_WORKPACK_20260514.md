# PartyOnce 3D Preview Sandbox Workpack V1

Date: 2026-05-14
Branch: `eye-lite-v2-release-candidate-20260512`
Starting commit: `a106965f`

## 1. 本轮目标

Build an experimental read-only route at `/experimental/party-3d` that can read `party_scene_config` and render a lightweight Restaurant A party scene preview for local/staging and investor demo review.

This is not a production 3D editor, not a construction drawing, and not a payment/deployment workpack.

## 2. 技术路线选择

Selected route: CSS 3D / SVG-style no-dependency pseudo-3D.

Reason:
- Lower build risk than adding Three.js or PlayCanvas.
- No remote model loading.
- No external 3D service.
- Keeps the experimental preview isolated from the main quote/order/payment paths.

## 3. 是否新增依赖

No new dependency was added.

No `package.json` or lockfile changes were required.

## 4. `party_scene_config` 输入方式

The sandbox reads scene config in this order:

1. `sessionStorage.party_scene_config`
2. `localStorage.party_scene_config`
3. AI Concierge quote prefill storage: `partyonce_ai_concierge_quote_prefill_v1`
4. AI Concierge intake storage: `partyonce_ai_concierge_intake_v1`
5. Default fallback: Restaurant A + Castle Princess + Standard

The service normalizes theme/tier and fills missing visual context with the current Restaurant A / supplier / package registry.

## 5. 展示元素

The preview renders:
- Venue boundary / room floor
- Back wall
- Backdrop
- Entrance arch / balloon arch
- 10 tables
- 18 chairs
- Main table
- Dessert table
- Photo zone
- Kids activity zone
- Theme props
- Scene summary and JSON panel

## 6. Castle / Space / Forest 主题映射

Castle Princess:
- Pink / purple / gold palette
- Castle backdrop
- Warm soft lighting
- Crowns / towers / fairy-light feel

Space Explorer:
- Dark blue / silver / cyan palette
- Galaxy backdrop feel
- Cool LED lighting
- Rockets / planets / star feel

Forest Adventure:
- Green / brown / warm natural palette
- Forest leaves backdrop feel
- Warm fairy lighting
- Vines / animals / wooden sign feel

## 7. Basic / Standard / Premium 层级映射

Basic:
- Light decor density
- Small balloon cluster
- Simple table detail

Standard:
- Balanced decor density
- Medium balloon arch
- Styled dessert table
- Backdrop and photo corner

Premium:
- Immersive decor density
- Large arch
- Extra props
- Stronger lighting and photo-zone presence

## 8. 接入口

Added:
- Route: `/experimental/party-3d`
- NavHeader menu entry: `3D Preview`
- Quote page scene-config block: `查看实验性 3D 场景预览`
- Admin Quote Detail ops explanation block: `View experimental 3D preview`

## 9. 本地 build 结果

Command:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_party3d_sandbox_build --emptyOutDir
```

Result: passed.

Output was written to `/tmp/partyonce_party3d_sandbox_build`, not to `frontend/vue-app/dist`.

## 10. Route smoke 结果

Local Vite server: `http://127.0.0.1:5194`

Routes checked:
- `/experimental/party-3d`
- `/ai-voice-intake`
- `/quote`
- `/admin/quotes`
- `/payment/deposit`

Result:
- Non-blank: passed
- Console error: 0
- Broken images: 0

## 11. Preview redeploy 结果

Release candidate branch was pushed and the Vercel Preview route was checked.

Preview branch:
`eye-lite-v2-release-candidate-20260512`

Preview URL:
`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

Preview checks:
- `/`: HTTP 200
- `/experimental/party-3d`: HTTP 200
- `/experimental/party-3d` browser smoke: non-blank, Party Scene 3D content visible, console error 0, broken images 0

Vercel Preview access was available during this check. If deployment protection is later re-enabled, that would be a Vercel access blocker, not an app route blocker.

## 12. 是否读取/修改 `.env.production`

No. `.env.production` was not read or modified.

## 13. 是否提交 `dist`

No. `frontend/vue-app/dist` was not generated or staged.

## 14. 是否 production deploy

No production deploy was performed.

## 15. 是否触发 payment / webhook / n8n / 外发

No.

The sandbox is read-only and does not create PaymentIntent, Stripe events, webhook calls, n8n triggers, email, SMS, WhatsApp, or other outbound messages.

## 16. Blocker

No local implementation blocker.

Preview public access may still depend on Vercel project deployment protection settings.

## 17. 下一步建议

1. Push the release candidate branch so Vercel can build the preview.
2. Verify `/experimental/party-3d` on Preview.
3. In a later workpack, consider adding a customer-facing "scene layers" explanation that maps the 3D preview elements to quote line items.
4. Keep this as a sandbox until real venue measurement and construction-drawing boundaries are defined.
