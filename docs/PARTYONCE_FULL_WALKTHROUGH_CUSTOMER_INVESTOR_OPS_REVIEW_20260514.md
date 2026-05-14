# PartyOnce Full Walkthrough Review: Customer / Investor / Ops

Date: 2026-05-14
Branch: `eye-lite-v2-release-candidate-20260512`
HEAD at review start: `1d8b1515`
Preview URL: `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

## 1. 本轮目标

Run an objective full walkthrough of the current Preview from three viewpoints:

- Customer view
- Investor view
- Admin / operations view

This review does not add product features and does not touch production, payment, webhook/n8n, outbound messages, `.env.production`, or `frontend/vue-app/dist`.

## 2. 当前 Branch / HEAD

- Branch: `eye-lite-v2-release-candidate-20260512`
- Starting HEAD: `1d8b1515`
- Scope: Preview walkthrough and report only

## 3. Preview URL

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

## 4. 客户视角 Walkthrough 结果

Path reviewed:

1. `/`
2. `/ai-voice-intake`
3. AI Concierge question flow
4. AI recommendation result
5. `/quote`
6. quote prefill and inquiry submission
7. `/my/quotes`
8. `/my/quotes/quote-local-501`
9. `/my/orders`
10. `/my/orders/order-local-1001`
11. `/experimental/party-3d`
12. `/my/rewards`
13. `/payment/deposit`

Result: customer flow is usable for staging preview and investor walkthrough.

What works well:

- The homepage clearly presents AI planning, theme entry points, Restaurant A visuals, and quote entry.
- AI Concierge asks one question at a time, which feels lighter than a long form.
- AI recommendation produces a clear customer brief, theme, package, Restaurant A sample, supplier suggestions, and `party_scene_config`.
- Quote prefill works: name, contact, date, notes, package, scene config, supplier suggestions, and pricing explanation are visible.
- Inquiry submission is staging-safe and stores to browser localStorage without creating Quote, Order, PaymentIntent, webhook, n8n, or outbound message.
- My Quote Detail and My Order Detail now show visual context, 3D Preview entry, line item explanation, supplier / venue context, and next-step guidance.
- Share reward submission works locally from Order Detail and is visible in rewards/admin review.
- Payment readiness explicitly says no live payment and no PaymentIntent.

Customer concerns:

- The AI flow has 12 steps. It is understandable, but for a real customer it may still feel a little long before the recommendation appears.
- The quote page is information-rich. It is good for trust, but a non-technical customer may need stronger hierarchy between "estimated price", "why this package", and "next step".
- The 3D Preview is useful, but it must remain clearly labeled experimental so customers do not mistake it for a construction drawing.

Customer verdict:

- Product is understandable.
- AI guidance is good enough for staging and investor demo.
- Visual/3D/Restaurant A flow is persuasive enough for a preview.
- Quote explanation is credible, though it needs more polishing before paid customer onboarding.

## 5. 投资人视角 Walkthrough 结果

Path reviewed:

1. `/investor-demo`
2. Guided Demo Mode sections
3. AI → Quote → Customer → Admin → Supplier → Payment readiness route board
4. Unified Customer/Admin Experience section
5. 3D Preview route
6. Social rewards and readiness routes

Result: investor demo is strong enough for controlled presentation.

What works well:

- The investor page tells a coherent story: AI intake, visual planning, quote request, customer workspace, admin workspace, supplier/readiness, launch plan.
- The new Unified Customer/Admin Experience section makes the platform value clearer: one shared context powers customer and operations screens.
- AI + 2D rendering + 3D Preview + line items + supplier context now feels like a connected planning/operations system, not just separate pages.
- Staging-only boundaries are visible: no real payment, no webhook/n8n, no outbound messaging, no production claim.
- Social rewards / UGC loop gives a growth angle beyond pure event booking.

Investor concerns:

- Some pages still expose local/staging wording heavily, which is correct for safety but makes the product feel pre-production.
- 3D Preview is a persuasive concept, but still visually a sandbox rather than a premium 3D editor.
- There is no real production integration yet for auth, supplier operations, payment, or notifications; this should be framed as a staged product roadmap.

Investor verdict:

- Strong as an investor preview if presented as a staging product demo.
- Not yet a production-ready launch demo.
- The most persuasive value is the connected chain: AI brief → visual scene → quote explanation → admin operations → reward loop.

## 6. 后台运营视角 Walkthrough 结果

Path reviewed:

1. Local/staging admin fixture via browser localStorage
2. `/admin/quotes`
3. `/admin/quotes/1`
4. `/admin/orders`
5. `/admin/orders/1`
6. `/admin/social-rewards`
7. `/admin/suppliers`
8. `/admin/notifications/dry-run`

Result: operations flow is usable for staging and internal evaluation.

What works well:

- Admin Quote Detail shows customer context, AI/package reasoning, `party_scene_config`, 2D visual, 3D Preview entry, editable line items, pricing basis, venue/supplier context, owner, next action, and internal note.
- Admin Order Detail shows order lifecycle, scene context, line items, supplier/venue context, social reward status, and ops fields.
- Admin Social Rewards shows submissions and approve/reject actions.
- Admin Suppliers gives a usable local/staging supplier data view.
- Notification dry-run generates evidence without external requests.

Ops concerns:

- `/admin/orders` attempts a backend/API call that returns one 401 resource error in console before fallback content remains usable. This is not a visual blocker, but it creates noise and should be cleaned up before external evaluator sessions.
- Backend persistence is still skeleton/local-staging for multiple flows. Operators can evaluate the workflow, but cannot rely on it as production data.
- Admin pages are dense. They now contain the right information, but a future pass should improve hierarchy and reduce scanning load.

Ops verdict:

- Good enough for internal operations review.
- Good enough to explain the intended workflow to investors.
- Not ready for real operator use without auth, production DB, permissions, and cleaner API error behavior.

## 7. 路由验收表

| Route | HTTP | Non-blank | Console errors | Broken images | Notes |
|---|---:|---:|---:|---:|---|
| `/` | 200 | Pass | 0 | 0 | Homepage visual and AI entries visible |
| `/investor-demo` | 200 | Pass | 0 | 0 | Guided demo and unified section visible |
| `/ai-voice-intake` | 200 | Pass | 0 | 0 | AI flow reachable |
| `/quote` | 200 | Pass | 0 | 0 | Quote prefill and line items visible |
| `/my/quotes` | 200 | Pass | 0 | 0 | Customer quote list visible |
| `/my/orders` | 200 | Pass | 0 | 0 | Customer order list visible |
| `/my/rewards` | 200 | Pass | 0 | 0 | Rewards/voucher placeholders visible |
| `/admin/quotes` | 200 | Pass | 0 | 0 | Admin quote queue visible |
| `/admin/orders` | 200 | Pass | 1 resource 401 | 0 | Fallback works; console noise remains |
| `/admin/social-rewards` | 200 | Pass | 0 | 0 | Reward review visible |
| `/admin/suppliers` | 200 | Pass | 0 | 0 | Supplier admin visible |
| `/suppliers` | 200 | Pass | 0 | 0 | Supplier categories visible |
| `/venues` | 200 | Pass | 0 | 0 | Venue list visible |
| `/venues/restaurant-a` | 200 | Pass | 0 | 0 | Restaurant A detail visible |
| `/experimental/party-3d` | 200 | Pass | 0 | 0 | 3D sandbox visible |
| `/payment/deposit` | 200 | Pass | 0 | 0 | Payment readiness visible |
| `/admin/notifications/dry-run` | 200 | Pass | 0 | 0 | Dry-run evidence visible |

## 8. Console Error / Broken Image 结果

- Broken images: 0 across required route checks.
- Console/page errors: 0 on all required routes except `/admin/orders`.
- `/admin/orders` console error: one failed resource with HTTP 401. The page still renders and fallback behavior works. This should be treated as a cleanup item before external evaluation.

## 9. AI 引导评估

AI Concierge can complete the customer intake:

- Child age
- Event date
- Guest range
- Budget / package level
- Area
- Indoor/outdoor preference
- Theme preference
- Venue status
- Scene priority
- Styling preference
- Name
- Contact

Recommendation output includes:

- Theme
- Package tier
- Venue / Restaurant A
- Customer brief
- Recommendation reason
- Budget fit
- Package inclusions
- Upgrade explanation
- `party_scene_config`
- Supplier suggestions
- Quote CTA

Assessment:

- Strong enough for staging preview.
- The one-question-at-a-time model works.
- The flow may be slightly long for production; future optimization should include "quick mode" or "skip optional scene questions".

## 10. 视觉 / 3D / 餐厅渲染评估

What is strong:

- Restaurant A original and variants give the product a tangible planning object.
- Castle / Space / Forest theme visuals make the concept easier to understand.
- 3D Preview makes `party_scene_config` feel like an engine, not just metadata.
- Customer and admin pages now share the same visual context.

What is still weak:

- 3D Preview is still sandbox-quality. It proves the data model, not a premium visualization product.
- Some visual panels are dense and need more refined information hierarchy.
- The generated renderings are good enough for demonstration but not yet equivalent to a professional venue mockup package.

## 11. 报价 / Line Item 解释评估

What works:

- Quote is split into stable types: venue, decor, supplier, labor, transport, service, optional upgrades.
- Customer sees simplified quote composition.
- Admin sees editable/detail-level line item basis and explanation.
- Deposit readiness placeholder is clearly separated from real payment.

Weakness:

- Customer-facing price explanation is credible but still text-heavy.
- Future PDF/official quote will need a more polished summary layout.

## 12. 供应商 / 场地数据库评估

What works:

- Restaurant A is now a real sample venue in the product story.
- Suppliers have categories, roles, price ranges, and theme/package mapping.
- Quote and Order detail pages show venue/supplier context on both customer and admin sides.

Weakness:

- Supplier data is still local/staging placeholder.
- No real availability, contact workflow, permissioning, or dispatch.
- Future production needs supplier verification and admin permissions.

## 13. 社交分享奖励评估

What works:

- Customer Order Detail can submit a UGC/share reward request locally.
- My Rewards shows points/voucher placeholders.
- Admin Social Rewards shows submissions with approve/reject controls.
- No external social post, email, SMS, WhatsApp, webhook, n8n, or payment action is triggered.

Weakness:

- Rewards are fully fixture/localStorage.
- Voucher redemption is placeholder only.
- Future production needs fraud/eligibility rules and real customer identity.

## 14. Payment Readiness 评估

Payment readiness route is clear:

- No live payment.
- No PaymentIntent.
- No Stripe checkout.
- Test-mode readiness only.
- Deposit is still a business-state placeholder.

Network/request check found no PaymentIntent, Stripe checkout, or payment API call.

## 15. Notification Dry-run 评估

Notification dry-run can generate evidence and payload preview.

Request check found no external webhook/n8n/outbound request when generating dry-run evidence.

This is suitable for staging review and payload design, not production messaging.

## 16. 最能打动客户 / 投资人的点

Most persuasive customer points:

- AI turns vague party ideas into a concrete theme/package/venue recommendation.
- Restaurant A visuals make the quote feel tangible.
- Quote line items explain where the money goes.
- 3D Preview helps customers imagine layout and decoration.
- Next-step messaging reduces anxiety around payment and follow-up.

Most persuasive investor points:

- The system now has a connected data spine: AI → `party_scene_config` → visual scene → quote → admin ops → rewards.
- Supplier/venue mapping suggests operational scalability.
- Line item standardization is a foundation for PDF quotes, deposits, and payments.
- UGC rewards add a growth loop.
- Staging boundaries are clear and controlled.

## 17. 最影响成交 / 理解的问题

- AI flow may be too long for impatient customers.
- Quote page has a lot of information; customers may need a more visual summary first.
- 3D Preview is experimental and not yet premium enough to be a selling hero.
- Admin API fallback/401 console noise undermines confidence if an evaluator opens DevTools.
- Production readiness is still No-Go due to auth, production DB/migration, real payment, real notification, and supplier data.

## 18. P0 / P1 / P2 问题清单

P0:

- None found for staging preview. No route is blank, no broken images, and no real external system was triggered.

P1:

- Clean up `/admin/orders` API auth/fallback behavior so it does not emit a 401 console resource error during preview.
- Add a short "quick AI mode" or optional skip path to reduce friction in AI Concierge.
- Tighten Quote page hierarchy: make estimated total, recommendation reason, and next step more visually dominant.
- Keep 3D Preview clearly marked as experimental and avoid overpromising venue construction accuracy.

P2:

- Improve 3D Preview visual polish and responsive composition.
- Add a polished customer quote summary/PDF preview.
- Add better empty/error states for remote backend unavailable conditions.
- Add stronger investor-facing metric/value copy around supplier database and UGC growth loop.
- Move from fixture rewards/suppliers to verified staging data when auth and DB are ready.

## 19. 是否可进入内部评测

Yes.

The app is ready for internal product/ops/investor-team evaluation under staging boundaries.

## 20. 是否可进入小规模外部评测

Yes, with caveats.

Recommended only for guided/small external review where the reviewer understands this is staging:

- No real payment
- No production supplier dispatch
- No real notifications
- Experimental 3D preview
- Local/staging data fixtures

Before broader external testing, fix the `/admin/orders` 401 console noise and reduce AI flow friction.

## 21. 是否可给投资人正式演示

Yes, as a controlled investor demo / staging preview.

Do not present it as production-ready. Present it as:

- Productized staging candidate
- AI + visual planning + quote explanation + admin ops proof
- Clear roadmap to production hardening

## 22. 下一步修复建议

Recommended next order:

1. Fix `/admin/orders` 401 console noise and backend fallback messaging.
2. Add a quick AI Concierge path and optional skip for scene-detail questions.
3. Refine Quote page information hierarchy for customer comprehension.
4. Polish 3D Preview visual quality without claiming construction accuracy.
5. Prepare a formal investor walkthrough script using `/investor-demo`.
6. After demo readiness, return to production Go/No-Go blockers: auth, DB migration, payment test-mode, webhook/n8n dry-run-to-real approval, supplier data governance.

## Safety Confirmation

- `.env.production` was not read or modified.
- `frontend/vue-app/dist` was not generated or staged.
- No production deploy was performed.
- No production DB was connected.
- No production migration was run.
- No PaymentIntent, Stripe live mode, webhook/n8n real trigger, email, SMS, WhatsApp, or external message was triggered.
