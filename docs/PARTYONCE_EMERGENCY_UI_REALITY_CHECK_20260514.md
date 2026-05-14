# PartyOnce Emergency Full UI Reality Check

Date: 2026-05-14
Branch: `eye-lite-v2-release-candidate-20260512`
HEAD checked: `3021d598`
Preview URL: `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`
Screenshot evidence root: `/tmp/partyonce_emergency_ui_reality_check/`
Result JSON: `/tmp/partyonce_emergency_ui_reality_check/results.json`
Contact sheet: `/tmp/partyonce_emergency_ui_reality_check/contact-sheet.png`

## 1. 本轮目标

This was a real browser / screenshot based emergency review. It did not use `curl` or HTTP 200 as the only signal. The goal was to check what the Preview actually looks like from customer, investor, and operations perspectives, and to call out pages that open but do not yet feel like an investable/customer-ready product.

No code changes were made in this check.

## 2. Method

Used Chromium/Playwright against the live Preview. A local/staging customer/admin fixture was injected into browser `localStorage` so admin/customer routes could be viewed without touching production auth.

Checks captured per page:

- HTTP status and final URL
- Full-page screenshot
- Page text / headings / visible CTAs
- Console warnings/errors
- Request failures
- Broken images
- Visual/product-readiness judgment

## 3. Screenshot Evidence

| Page | Screenshot |
| --- | --- |
| `/` | `/tmp/partyonce_emergency_ui_reality_check/home.png` |
| `/investor-demo` | `/tmp/partyonce_emergency_ui_reality_check/investor-demo.png` |
| `/ai-voice-intake` | `/tmp/partyonce_emergency_ui_reality_check/ai-voice-intake.png` |
| `/quote` | `/tmp/partyonce_emergency_ui_reality_check/quote.png` |
| `/themes` | `/tmp/partyonce_emergency_ui_reality_check/themes.png` |
| `/venues` | `/tmp/partyonce_emergency_ui_reality_check/venues.png` |
| `/venues/restaurant-a` | `/tmp/partyonce_emergency_ui_reality_check/venue-restaurant-a.png` |
| `/suppliers` | `/tmp/partyonce_emergency_ui_reality_check/suppliers.png` |
| `/my/quotes` | `/tmp/partyonce_emergency_ui_reality_check/my-quotes.png` |
| `/my/orders` | `/tmp/partyonce_emergency_ui_reality_check/my-orders.png` |
| `/my/rewards` | `/tmp/partyonce_emergency_ui_reality_check/my-rewards.png` |
| `/admin/quotes` | `/tmp/partyonce_emergency_ui_reality_check/admin-quotes.png` |
| `/admin/orders` | `/tmp/partyonce_emergency_ui_reality_check/admin-orders.png` |
| `/admin/social-rewards` | `/tmp/partyonce_emergency_ui_reality_check/admin-social-rewards.png` |
| `/admin/suppliers` | `/tmp/partyonce_emergency_ui_reality_check/admin-suppliers.png` |
| `/experimental/party-3d` | `/tmp/partyonce_emergency_ui_reality_check/party-3d.png` |
| `/payment/deposit` | `/tmp/partyonce_emergency_ui_reality_check/payment-deposit.png` |
| `/admin/notifications/dry-run` | `/tmp/partyonce_emergency_ui_reality_check/admin-notifications-dry-run.png` |

## 4. Page Reality Table

| Page | Technical Result | Visual/Product Reality | Verdict |
| --- | --- | --- | --- |
| `/` | 200, console error 0, 1 broken image | Not a whiteboard. It has hero, AI double entry, themes, package sections. But first impression is dark sci-fi/investor-preview heavy, not warm family/Party Event welcome. One Restaurant A image is broken. | P1, with P0 broken-image defect |
| `/investor-demo` | 200, console error 0 | Clear demo script and staging boundary. It explains the story, but is still text-heavy and not visually persuasive enough by itself. | P1 |
| `/ai-voice-intake` | 200, console error 0 | Functional and reasonably polished. Still feels like a guided form with an AI card, not a fully conversational party concierge. Visual cues exist below the fold. | P1 |
| `/quote` | 200, console error 0 | Better hierarchy than before. Pricing explanation is useful. Still text-heavy and starts with little visual impact; visual proof appears lower. | P1 |
| `/themes` | 200, console error 0, 1 broken image | Same as homepage route. Theme cards exist and are visually rich, but one restaurant variant image is broken and the route appears to reuse homepage rather than a dedicated theme catalog. | P1, with P0 broken-image defect |
| `/venues` | 200, console error 0 | Venue list is usable and has images. It mixes local Restaurant A mockups with generic stock-like event venues; credible but not fully integrated with the AI story. | P1 |
| `/venues/restaurant-a` | 200, console error 0 | One of the stronger pages. Restaurant A original and variants are visible with mapping to themes/packages. Still mockup-like, but product value is understandable. | Pass for controlled demo |
| `/suppliers` | 200, console error 0 | Major visual weakness. Large grey blank map area dominates the page; only one fixture card appears. It looks like an unfinished map shell, not a supplier database product. | P0 |
| `/my/quotes` | 200, console error 0 | Empty state only. No visual context, no quote cards, no AI/scene config. For customer demo, this fails unless pre-seeded via guided flow. | P0 for default Preview demo |
| `/my/orders` | 200, console error 0 | Empty state only. No order card, no Restaurant A, no line items/rewards/next step visible. | P0 for default Preview demo |
| `/my/rewards` | 200, console error 0 | Functional local/staging rewards page. Mostly form/status content, acceptable for ops demo but not emotionally persuasive. | P1 |
| `/admin/quotes` | 200, console error 0; one aborted API request | Page opens but queue is empty and shows little operational context. Backend request abort is not a console error but the page does not demonstrate Admin Quote value by default. | P1/P0 depending demo path |
| `/admin/orders` | 200, console error 0 | Improved: fallback data appears and page is usable. Looks operational rather than visual, but acceptable for admin queue demo. | Pass / P2 polish |
| `/admin/social-rewards` | 200, console error 0 | Clear review queue and voucher rules. Mostly utilitarian but acceptable for admin demo. | Pass / P2 polish |
| `/admin/suppliers` | 200, console error 0 | Shows supplier table and categories. Operationally useful, visually plain. Better than `/suppliers`. | P1 polish |
| `/experimental/party-3d` | 200, console error 0 | Experimental preview is visible and labeled as non-construction. It communicates layout concept, but is clearly a sandbox, not high-end 3D. | Pass as sandbox, not investor wow |
| `/payment/deposit` | 200, console error 0 | Readiness boundary is clear. Visually utilitarian; acceptable because payment is explicitly not live. | Pass |
| `/admin/notifications/dry-run` | 200, console error 0 | Dry-run lab is clear and safe. Mostly developer/admin oriented. | Pass |

## 5. 首页是否合格

Not fully.

The homepage is not blank and not a simple whiteboard. It has a strong dark hero, AI double entry, theme cards, package sections, and CTA. However, it does not fully match the desired original emotional direction:

- It feels more like `Investor Preview / Visual Story Mode` than a warm customer welcome page.
- The first screen leans heavily into Space Explorer / sci-fi styling; Castle / Forest/family warmth is less visible above the fold.
- One image is broken on the homepage: `/party-assets/venues/restaurant-a/restaurant-a-space-premium.png`.
- The page is visually rich but not yet strongly “dreamy parent-child party concierge” in the first 5 seconds.

Conclusion: homepage is usable for internal review, but not ready for owner/investor viewing without caveat. The broken image is P0. The emotional/brand mismatch is P1.

## 6. AI 引导是否合格

Partially.

Present:

- AI Concierge route exists.
- Quick demo path exists.
- Question steps and voice toggle exist.
- It can drive Quote prefill.

Weak:

- The page still reads as a structured questionnaire with an AI panel, not a real customer-service concierge.
- Voice is present as a simple button/toggle, but it is not emotionally central.
- Theme visual cues are below the main question area; customer may not feel the magic immediately.

Verdict: P1, not P0.

## 7. 视觉资产是否合格

Partially.

Present:

- Castle / Space / Forest visuals are present on homepage/themes and AI page.
- Restaurant A mockups and variants are present.
- Venue list contains images.

Broken:

- `/party-assets/venues/restaurant-a/restaurant-a-space-premium.png` is broken on `/` and `/themes`.

Weak:

- Visual style is inconsistent: dark sci-fi app mockups, simple generated Restaurant A diagrams, and generic venue photos are mixed.
- Some pages have zero images even where customer/investor context would benefit from them.

Verdict: P0 for broken image, P1 for style consistency.

## 8. 餐厅渲染是否合格

Partially.

Restaurant A detail page is one of the stronger parts: original and theme/package variants are visible and explain what changes. However:

- The renderings are still diagram/mockup style, not emotionally rich “restaurant before/after” visuals.
- One premium Space image is broken elsewhere.
- The homepage and Quote page use Restaurant A context, but the strongest visual proof is not always above the fold.

Verdict: P1. It can support controlled demo but not yet “highly persuasive customer sales visual.”

## 9. 供应商/场地数据库是否合格

Not fully.

Venues:

- `/venues` is usable and has multiple cards/images.
- `/venues/restaurant-a` is useful and credible enough for controlled demo.

Suppliers:

- `/suppliers` is a major weak point. It is dominated by a blank grey map and only one visible fixture card. It looks like an unfinished shell.
- `/admin/suppliers` is more useful operationally, but the customer-facing supplier page does not yet feel like a real supplier database.

Verdict: `/suppliers` is P0 for product presentation. Venue pages are P1/pass.

## 10. 后台体验是否合格

Mixed.

Pass / acceptable:

- `/admin/orders` shows fallback queue data and no console noise.
- `/admin/social-rewards` is clear.
- `/admin/suppliers` is usable.
- `/admin/notifications/dry-run` is clear and safe.

Weak:

- `/admin/quotes` opens but appears empty and gives little visual/quote context in default Preview. There was one aborted request to the staging quote API, though no console error.
- Admin pages are functional but mostly table/form style; the visual planning context is not obvious unless detail pages are entered with seeded data.

Verdict: P1 overall. Admin Orders passes; Admin Quotes default Preview is weak.

## 11. Original Design Content Check

| Item | Status | Notes |
| --- | --- | --- |
| AI 引导 | present / weak | Route exists and works; still form-like. |
| 语音引导 | weak | Voice toggle/button exists; not a full voice-led experience. |
| 首页欢迎图 | weak | Hero exists, but is dark/sci-fi/investor-mode rather than warm welcome. |
| Castle Princess 主题图 | present | Visible in homepage/themes/AI cues. |
| Space Explorer 主题图 | present | Strongly present, perhaps overdominant. |
| Forest Adventure 主题图 | present | Present, less prominent above fold. |
| Restaurant A 原貌 | present | Visible on venue detail and venue list. |
| Restaurant A 主题装饰渲染 | weak / broken | Variants exist; one Space Premium asset broken. Mockups remain diagram-like. |
| Basic / Standard / Premium 差异 | present | Homepage and Quote explain package tiers. |
| 供应商 / 场地数据库 | weak | Venues usable; Suppliers customer page looks unfinished. |
| 餐厅装饰说明 | present | Appears in venue detail / quote, but can be more visual. |
| 分享奖励机制 | present | My Rewards and admin rewards exist. |
| 后台图文运营上下文 | weak | Some admin pages show context, but default Admin Quotes is empty. |

## 12. P0 Issues

1. Broken image on homepage and `/themes`: `/party-assets/venues/restaurant-a/restaurant-a-space-premium.png`.
2. `/suppliers` customer-facing page looks unfinished: huge blank grey map, only one fixture supplier card, no strong supplier database experience.
3. `/my/quotes` default Preview is empty; customer cannot see Quote experience unless demo data is seeded through a separate path.
4. `/my/orders` default Preview is empty; customer cannot see Order experience unless demo data is seeded through a separate path.

## 13. P1 Issues

1. Homepage is visually rich but brand/emotion mismatch remains: too dark/sci-fi/investor-mode, not enough warm Party Event / parent-child welcome above the fold.
2. AI Concierge still feels like a questionnaire, not a live concierge/chat/customer-service guide.
3. Quote page is useful but text-heavy; key visual proof appears lower than ideal.
4. Restaurant A renderings are present but still mockup/diagram style rather than persuasive before/after sales visuals.
5. `/admin/quotes` default Preview is empty/weak and had one aborted staging quote API request.
6. Visual language is inconsistent across dark story pages, white admin/customer pages, simple mockups, and generic venue photos.
7. Top navigation is crowded and may feel internal/tool-like rather than customer-first.
8. Footer overlaps/feels visually heavy on several shorter pages.

## 14. P2 Issues

1. Payment readiness page is safe but plain.
2. Notification dry-run page is technically clear but not investor-friendly.
3. Admin supplier table is operational but visually plain.
4. Rewards pages are functional but not emotionally tied into customer success story.
5. Some labels mix English/Chinese inconsistently.

## 15. Pages That Open But Are Not Product-Ready

- `/suppliers`: opens, but visually reads as an unfinished map shell.
- `/my/quotes`: opens, but default empty state fails the customer quote demo.
- `/my/orders`: opens, but default empty state fails the customer order demo.
- `/admin/quotes`: opens, but default empty queue weakens operations demo.
- `/quote`: opens and is understandable, but still needs stronger immediate visual proof and customer story.
- `/ai-voice-intake`: opens and works, but still feels too form-like.

## 16. 是否可继续让 owner / 投资人看

Owner:

- Not recommended as-is for owner review if the expectation is “restored original visual experience.” Owner will likely notice the supplier shell, customer empty states, broken image, and homepage tone mismatch.

Investor:

- Not recommended for unsupervised investor viewing.
- Acceptable only for controlled demo where the presenter starts from `/investor-demo` or AI quick mode, avoids `/suppliers` as a proof point, and explains staging/demo boundaries.

Internal Review:

- Yes, with P0 list attached.

Small External Review:

- Not until P0 items are fixed.

## 17. 下一步整改建议

Recommended immediate fix order:

1. Fix broken image asset path for `restaurant-a-space-premium.png`; verify `/` and `/themes` broken images are 0.
2. Seed or bootstrap customer demo data so `/my/quotes` and `/my/orders` show a meaningful quote/order by default in Preview demo mode.
3. Replace or redesign `/suppliers`: remove blank map dominance; show supplier category cards, service roles, theme/package fit, and several credible placeholder suppliers.
4. Rework homepage first viewport toward the original Party Event emotional direction: warm welcome, AI concierge, parent-child party promise, Castle/Space/Forest visible without overcommitting to Space Explorer.
5. Make AI Concierge feel more conversational: chat-like message flow, one warm AI prompt at a time, recommendation preview visible beside the current question.
6. Strengthen Quote first viewport with rendered scene image and “why this package” before line item density.
7. Make `/admin/quotes` default Preview show one safe demo quote with scene/line-item/supplier context.

## 18. Safety Confirmation

- Did not read or modify `.env.production`.
- Did not submit `frontend/vue-app/dist`.
- Did not deploy production.
- Did not trigger PaymentIntent, Stripe live mode, webhook, n8n, email, SMS, WhatsApp, or external outbound message.
- Did not modify source code in this emergency check.
