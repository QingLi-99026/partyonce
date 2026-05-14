# PartyOnce Customer + Admin Unified Experience Workpack

Date: 2026-05-14
Branch: `eye-lite-v2-release-candidate-20260512`
Starting HEAD: `5189192d`

## 1. 本轮目标

Unify the customer-side and admin-side experience so AI Concierge, `party_scene_config`, Restaurant A visuals, experimental 3D Preview, quote line items, venue/supplier context, and social rewards feel like one connected planning flow.

This work remains local/staging/preview only.

## 2. 修改/新增文件

Added:
- `frontend/vue-app/src/components/PartySceneSummary.vue`
- `frontend/vue-app/src/components/SocialRewardsPanel.vue`
- `docs/PARTYONCE_CUSTOMER_ADMIN_UNIFIED_EXPERIENCE_WORKPACK_20260514.md`

Updated:
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `frontend/vue-app/src/views/InvestorDemoMode.vue`

## 3. 客户侧统一体验完成情况

`MyQuoteDetail` now shows:
- AI / visual planning context through `PartySceneSummary`
- Restaurant A rendered scene image
- `party_scene_config` summary
- Experimental 3D Preview entry
- Simplified pricing line items
- Venue / supplier context
- Share rewards entry through `SocialRewardsPanel`
- Next step and non-payment quote confirmation placeholder

`MyOrderDetail` now shows:
- Order status and next step
- AI / scene / 3D context through `PartySceneSummary`
- Restaurant A rendered scene image
- Simplified order line items
- Venue / supplier context
- Existing UGC share submission panel
- Reward summary and My Rewards entry
- Payment remains blocked and explicitly marked as readiness-only

Customer pages do not expose admin edit hints, internal notes, owner, or next_action fields.

## 4. 后台侧统一体验完成情况

`AdminQuoteDetail` now shows:
- Existing customer/quote ops context
- AI recommendation / package explanation
- `party_scene_config` summary
- 2D visual context
- Experimental 3D Preview entry
- Editable line items and pricing explanation
- Venue / supplier context
- Social rewards status panel for the customer
- Owner / next action / internal note remains in the ops section

`AdminOrderDetail` now shows:
- Order lifecycle and controls
- AI / scene / 3D order context through `PartySceneSummary`
- 2D rendering and venue/supplier context
- Quote line items summary
- Social rewards status panel for the order/customer
- Owner / next action / internal note
- Payment, webhook/n8n, outbound, supplier dispatch, and contracts remain blocked

## 5. Investor Demo 更新

`/investor-demo` now includes a `Unified Customer/Admin Experience` section explaining:
- What customers see
- What admin/ops sees
- How AI, 2D rendering, 3D Preview, quote line items, venue/supplier data, and social rewards connect

Added direct demo buttons:
- Customer quote detail
- Customer order detail
- Admin quote detail
- Admin order detail
- 3D Preview
- My Rewards

Route boards were also expanded with customer/admin detail paths and 3D/rewards paths.

## 6. 3D Preview 入口接入方式

3D Preview entry now exists from:
- NavHeader
- Quote page
- Admin Quote Detail
- `PartySceneSummary` component used by My Quote Detail, My Order Detail, Admin Quote Detail, and Admin Order Detail
- Investor Demo

The component writes the active `party_scene_config` to browser storage via `writePartySceneConfig()` before routing to `/experimental/party-3d`.

Fallback remains Restaurant A Castle Standard, so the sandbox cannot render blank.

## 7. pricing / line items / supplier / venue / rewards 统一情况

Unified panels now connect:
- `party_scene_config`
- Restaurant A 2D rendering
- 3D Preview route
- Simplified customer line item view
- Admin editable line item draft/persistence view
- Venue / supplier context
- Customer/order reward summary

Social rewards remain local/staging placeholders and do not post to social platforms or send outbound messages.

## 8. 本地 build 结果

Command:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_unified_experience_build --emptyOutDir
```

Result: passed.

Output was written to `/tmp/partyonce_unified_experience_build`, not to `frontend/vue-app/dist`.

## 9. Route smoke 结果

Local Vite server: `http://127.0.0.1:5195`

Routes checked:
- `/my/quotes`
- `/my/quotes/quote-local-501`
- `/my/orders`
- `/my/orders/order-local-1001`
- `/admin/quotes`
- `/admin/quotes/1`
- `/admin/orders`
- `/admin/orders/1`
- `/investor-demo`
- `/experimental/party-3d`
- `/payment/deposit`

Result:
- Non-blank: passed
- Console error: 0
- Broken images: 0
- Customer detail routes showed unified visual / 3D / pricing / supplier context
- Admin detail routes showed unified ops / visual / pricing / supplier / rewards context

## 10. Preview redeploy 结果

Release candidate branch was pushed and the Preview routes were checked.

Preview URL:
`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

Preview routes checked:
- `/my/quotes/quote-local-501`
- `/my/orders/order-local-1001`
- `/admin/quotes/1`
- `/admin/orders/1`
- `/investor-demo`
- `/experimental/party-3d`

Result:
- HTTP 200: passed
- Non-blank: passed
- Unified context marker visible: passed
- Console error: 0
- Broken images: 0

## 11. 是否读取/修改 `.env.production`

No. `.env.production` was not read or modified.

## 12. 是否提交 dist

No. `frontend/vue-app/dist` was not generated or staged.

## 13. 是否 production deploy

No production deploy was performed.

## 14. 是否触发 payment / webhook / n8n / 外发

No.

No PaymentIntent, Stripe live mode, webhook, n8n, email, SMS, WhatsApp, supplier dispatch, or external post action was triggered.

## 15. Blocker

No local implementation blocker.

Preview access still depends on Vercel deployment protection remaining open for the shared Preview URL.

## 16. 下一步建议

1. Push the release candidate branch and verify the six Preview routes above.
2. Add a formal investor walkthrough checklist using the unified detail pages.
3. In a later production-readiness phase, replace local/staging auth and reward fixtures with real role-based customer/admin data.
