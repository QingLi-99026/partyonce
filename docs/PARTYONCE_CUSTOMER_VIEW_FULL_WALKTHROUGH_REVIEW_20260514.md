# PartyOnce Investor Preview Full Walkthrough + Customer-View Evaluation

## 1. Walkthrough Scope

Preview URL:

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

Current branch / HEAD:

- Branch: `eye-lite-v2-release-candidate-20260512`
- HEAD before this report: `080948a8`

Walkthrough covered:

- 首页
- AI 帮我推荐
- 主题 / 餐厅渲染
- Quote 预填
- 客户 My Quotes / My Orders
- 后台 Quote / Order
- 供应商页面
- Payment readiness
- Notification dry-run

This review did not trigger production deploy, Stripe live mode, PaymentIntent, webhook, n8n, email, SMS, WhatsApp, or production database access.

## 2. Route Smoke Summary

Public routes returned HTTP 200:

- `/`
- `/ai-voice-intake`
- `/themes`
- `/quote`
- `/my/quotes`
- `/my/orders`
- `/admin/quotes`
- `/admin/orders`
- `/suppliers`
- `/partner/apply`
- `/payment/deposit`
- `/admin/notifications/dry-run`

Browser route smoke:

- Console errors: none on public customer routes.
- Broken images: transient first pass reported `restaurant-a-space-premium.png`; direct asset request returned 200 and repeat homepage check returned broken images = 0.
- Screenshots captured locally:
  - `/tmp/partyonce_walkthrough_home_20260514.png`
  - `/tmp/partyonce_walkthrough_ai_20260514.png`
  - `/tmp/partyonce_walkthrough_quote_20260514.png`
  - `/tmp/partyonce_walkthrough_suppliers_20260514.png`
  - `/tmp/partyonce_walkthrough_payment_20260514.png`

## 3. 首页 Evaluation

Result: pass for investor preview.

Observed:

- 首页可打开。
- “自己来策划” and “AI 帮我推荐” are visible.
- Castle / Space / Forest theme signals are present.
- Restaurant A visual context is visible.
- Page is no longer a plain skeleton; it communicates a visual party-planning product.

Customer-view assessment:

- Customers can understand that the product helps them choose a theme and request a quote.
- Investor first impression is substantially stronger than a bare SaaS form.
- Remaining issue: homepage is visually compelling, but the navigation still exposes many operational links. For a polished investor demo, a guided demo mode could hide some admin-heavy nav items.

## 4. AI Concierge Flow Evaluation

Result: pass.

Remote Preview flow executed:

首页 / AI entry → `/ai-voice-intake` → answer 10-step intake → recommendation generated → continue to quote.

AI collected:

- Child age
- Event date
- Guest count
- Budget tier
- Area
- Indoor/outdoor preference
- Theme preference
- Venue status
- Customer name
- Contact

Observed recommendation:

- Theme: `Space Explorer`
- Package: `Standard`
- Restaurant rendering: Restaurant A Space Standard
- Supplier suggestions:
  - Balloon Bloom Sydney
  - Mini Cake Lab
  - Kids Show Crew

Customer-view assessment:

- The AI feels more like a concierge than a form because it asks one question at a time.
- The recommendation result is understandable and actionable.
- Voice is appropriately lightweight; it does not pretend to be commercial-grade TTS.
- Remaining issue: the AI is rule-based, which is fine for preview, but final copy should explain “AI-assisted recommendation” rather than implying a live generative model.

## 5. Quote Prefill Evaluation

Result: pass.

Observed redirect:

`/quote?theme=space&package=standard&scene=restaurant-a&source=ai_concierge`

Observed quote prefill:

- `AI CONCIERGE PREFILL` notice visible.
- Contact name prefilled.
- Contact method prefilled.
- Event date prefilled.
- Notes include AI summary, event details, venue preference, and recommendation reason.
- Quote visual context shows Restaurant A and supplier suggestions.

Submission test:

- Inquiry submitted through Preview browser localStorage.
- Saved `source = ai_concierge`.
- Saved `theme = space`.
- Saved `package = standard`.
- Saved `aiRecommendation = true`.
- Saved supplier suggestions.

Customer-view assessment:

- The handoff from AI to quote is clear.
- The customer does not need to retype core planning details.
- The no-payment boundary is clear enough for staging.
- Remaining issue: after submit, the customer is not automatically guided into “My Inquiries” or “My Quotes.” A post-submit next-step card would improve confidence.

## 6. Theme / Restaurant Rendering Evaluation

Result: pass with one watch item.

Observed:

- Restaurant A image assets are publicly accessible.
- Direct check for:
  - `/party-assets/venues/restaurant-a/restaurant-a-space-premium.png`
  - `/party-assets/venues/restaurant-a/restaurant-a-space-standard.png`
  - `/party-assets/venues/restaurant-a/restaurant-a-original.png`
  returned HTTP 200.
- Quote and customer views show Restaurant A context.

Customer-view assessment:

- Restaurant A makes the experience more concrete and believable.
- The concept of “same restaurant, different theme/package layer” is now visible enough for investor preview.
- Remaining issue: customer-facing copy should eventually explain that Restaurant A is a sample rendering, not a guaranteed exact venue photo.

## 7. Customer My Quotes / My Orders Evaluation

Result: pass for read-only preview.

Observed:

- `/my/quotes` loads.
- `/my/orders` loads.
- Both pages show Restaurant A context and supplier suggestions.
- Payment is not active; `pending_deposit` remains business-state only.

Customer-view assessment:

- Customer can understand quote/order status and next action.
- Visual context helps connect quote/order to the original AI recommendation.
- Remaining issue: the submitted inquiry does not immediately become a backend Quote/Order in Preview. This is correct for current scope, but investor narration must clarify the distinction between inquiry submission and admin-generated Quote/Order.

## 8. Admin Quote / Order Evaluation

Result: conditional pass.

Direct unauthenticated behavior:

- `/admin/quotes`, `/admin/orders`, and `/admin/notifications/dry-run` are protected by existing auth guard and redirect to home if no admin fixture is present.

With local admin fixture injected in browser localStorage:

- `/admin/quotes` loads Quote Review.
- `/admin/orders` loads Order Review.
- `/admin/notifications/dry-run` loads Notification dry-run.
- Quote / Order pages may show 401 API errors in remote Preview because the remote backend/auth fixture is not fully connected, but the UI shell remains inspectable.

Customer / investor assessment:

- Backend/admin experience is credible once the demo uses an admin fixture.
- For investor demo, do not ask investors to type admin URLs directly without fixture setup.
- Recommended demo path: provide a one-click local/staging admin fixture bootstrap or guided Local Demo Hub entry before showing admin queues.

## 9. Suppliers Page Evaluation

Result: pass for visual supplier database preview.

Observed:

- `/suppliers` loads.
- Restaurant A appears as a local/staging venue/supplier display item.
- No broken images.

Customer-view assessment:

- The page demonstrates that PartyOnce has a supplier/venue database direction.
- The supplier database is still fixture-like; it is good enough for investor preview but not a real marketplace.
- Remaining issue: supplier cards should eventually show stronger theme-role labels such as “Balloon arch vendor,” “Cake/dessert table,” and “Kids activity host” in a more polished layout.

## 10. Payment Readiness Evaluation

Result: pass for readiness-only boundary.

Observed:

- `/payment/deposit` loads.
- Page remains Stripe test-mode readiness / placeholder.
- No PaymentIntent creation was triggered.
- No real payment was attempted.

Customer-view assessment:

- Good for demonstrating payment readiness boundary.
- Not yet a customer payment experience.
- Keep this out of the investor “customer purchase” story unless explicitly framed as next-stage readiness.

## 11. Notification Dry-run Evaluation

Result: conditional pass.

Observed:

- Admin dry-run route is protected by admin guard.
- With local admin fixture, `/admin/notifications/dry-run` loads.
- No webhook, n8n, email, SMS, or WhatsApp was triggered.

Assessment:

- Good operational proof point for backend readiness.
- Needs a clean investor demo access path because unauthenticated direct link redirects home.

## 12. Safety Results

- `.env.production` read/modified: no.
- `frontend/vue-app/dist` submitted: no.
- Production deploy: no.
- Production DB: no.
- Payment / Stripe live mode / PaymentIntent: no.
- Webhook / n8n: no.
- Email / SMS / WhatsApp outbound: no.

## 13. Overall Customer-View Evaluation

Can a customer understand the product?

Yes. The current Preview now communicates: choose a theme, let AI recommend, see a visual restaurant rendering, submit a quote request, then track quotes/orders.

Will the customer be visually attracted?

Mostly yes. The homepage, AI Concierge, Restaurant A renderings, and theme cards create a much stronger emotional first impression than the earlier skeleton.

Is the AI guidance clear?

Yes. The one-question-at-a-time flow is clear and lowers friction.

Are theme and restaurant renderings convincing?

Good enough for investor preview. They are consistent and tied to quote context. Final commercial version should label sample renderings clearly and add real venue photos when available.

Are package differences clear?

Moderately clear. Basic / Standard / Premium are present in the data and copy. A more visual comparison inside the quote page would make purchase decisions easier.

Is the quote flow natural?

Yes. AI → Quote prefill is the strongest flow in this walkthrough.

Is backend operations credible?

Credible as a staging/admin skeleton, but remote Preview needs an admin fixture or demo mode to avoid auth friction during investor walkthrough.

## 14. Purchase Decision Risks

Key issues that still affect buying confidence:

1. Post-inquiry customer handoff should be stronger: after submit, guide the user to My Inquiries / My Quotes and explain response timing.
2. Admin demo requires fixture setup; direct admin links are protected and will redirect if no admin identity exists.
3. Supplier database is still staged fixture data, not real verified supplier inventory.
4. Payment is readiness-only; do not imply customer can pay online yet.
5. Package tier differences should become more visual and less text-only.

## 15. Recommended Next Step

Next best workpack:

Add an Investor Demo Mode / Guided Demo Hub that can safely bootstrap:

- customer fixture
- admin fixture
- sample AI inquiry
- sample Quote / Order context

Then route investors through one clear path instead of exposing raw admin links.
