# PartyOnce Objective Customer + Investor Evaluation

## 1. Executive Conclusion

PartyOnce Preview has moved beyond a functional skeleton. It now has a believable customer story:

首页视觉 → AI Concierge 推荐 → Restaurant A 渲染 → Quote 预填 → inquiry 提交 → My Quotes / My Orders → 后台运营 skeleton → supplier / venue support.

The strongest current value is not payment or automation. The strongest value is that a customer can quickly understand what kind of party they may get, and an investor can see a credible direction for AI-assisted party planning.

The weakest current point is demo continuity: some flows are visually connected, but operational state is still split between localStorage, fixture data, backend skeleton, and protected admin routes. A non-technical investor may not understand which parts are real, staged, or placeholder unless guided carefully.

## 2. What Can Move Customers

### 2.1 AI Concierge Lowers Planning Friction

The AI Concierge is the most persuasive customer-facing feature right now.

Why it works:

- It asks one question at a time instead of showing a long form.
- It feels more like a service assistant than a generic inquiry page.
- It turns vague needs into a concrete recommendation.
- It automatically carries the result into the quote page.

Customer impact:

Parents who do not know where to start can still move forward. This is emotionally important because party planning is often stressful, fuzzy, and visual.

### 2.2 Visual Theme Choice Is Easy to Understand

Castle Princess, Space Explorer, and Forest Adventure are clear enough for customers to understand quickly.

Why it works:

- The themes are intuitive.
- The names are memorable.
- The visuals give the customer a sense of outcome, not just a service category.

Customer impact:

Customers can imagine the party before they understand the operational details.

### 2.3 Restaurant A Rendering Makes the Product Concrete

Restaurant A is a strong demo asset because it turns “party decoration” into a visible transformation.

Why it works:

- The customer can see a real spatial concept.
- The same venue can support different themes and package tiers.
- The rendering helps justify why a quote depends on theme, package, and venue.

Customer impact:

This makes PartyOnce feel less like a directory and more like a planning product.

### 2.4 Quote Prefill Feels Useful

The AI-to-Quote handoff is one of the strongest functional moments.

Why it works:

- The customer does not need to retype answers.
- The quote page explains the selected theme, package, venue, supplier suggestions, and notes.
- The inquiry stores `source = ai_concierge`, so the flow has traceability.

Customer impact:

This creates a satisfying “the system understood me” moment.

### 2.5 My Quotes / My Orders Adds Trust

Customer read-only pages help show that PartyOnce is not just a landing page.

Why it works:

- Customers can see quote/order status.
- Next-step text reduces uncertainty.
- Visual context links the quote/order back to the original theme and rendering.

Customer impact:

This makes the platform feel more reliable and less like a one-off contact form.

## 3. What Still Feels Weak

### 3.1 Post-Inquiry Handoff Is Still Too Quiet

After submitting an inquiry, the customer receives a success message, but the product does not strongly guide them to the next step.

Why it feels weak:

- The customer may wonder: “What happens now?”
- The flow does not automatically point to My Inquiries or My Quotes.
- There is no strong timeline card such as “Step 1 submitted, Step 2 consultant review, Step 3 quote prepared.”

Impact:

This weakens customer confidence right after the most important conversion action.

### 3.2 Package Tier Differences Need More Visual Contrast

Basic / Standard / Premium exist in data and copy, but the buying difference could be clearer.

Why it feels weak:

- Customers may not immediately understand why Standard costs more than Basic.
- Premium needs stronger “what changes visually” explanation.
- A side-by-side comparison would be easier to buy than text descriptions.

Impact:

This may reduce upsell clarity.

### 3.3 Supplier Database Still Feels Like Fixture Data

The supplier/venue database now supports the story, but it still feels staged.

Why it feels weak:

- Supplier names and service details are plausible but clearly demo-like.
- There is no verification status, availability, real quote range confidence, or fulfilment history.
- Supplier cards could better explain their role in the customer’s selected theme/package.

Impact:

Customers may believe the concept, but investors may ask how supply will be sourced and verified.

### 3.4 Admin Experience Requires Demo Setup

Admin Quote / Order pages are protected by auth guard and require fixture/admin setup.

Why it feels weak:

- A direct admin URL may redirect to home.
- Remote API auth may show 401 while the UI shell remains usable.
- This is correct from a safety standpoint, but awkward for investor walkthrough.

Impact:

If unmanaged, an investor may mistake auth protection or skeleton API behavior for product instability.

### 3.5 Payment Readiness Is Not a Checkout

Payment readiness is correctly blocked, but it must be narrated carefully.

Why it feels weak:

- `/payment/deposit` proves readiness posture, not real payment completion.
- There is no customer-facing payment confidence yet.
- Deposit status remains a business placeholder.

Impact:

Investors may ask whether revenue capture is truly ready. The honest answer is: not yet; payment is intentionally deferred.

## 4. What May Confuse Investors

### 4.1 “Real” vs “Fixture” Boundary Is Not Always Obvious

The product now looks strong enough that viewers may assume more is real than actually is.

Potential confusion:

- AI Concierge is rule-based, not a live AI model.
- Supplier and venue data are local/staging seed data.
- My Quotes / My Orders are read-only/demo-friendly.
- Admin APIs are skeleton/local-staging hardening, not production operations.
- Payment is readiness-only.

Investor risk:

If these boundaries are not explained, the demo can create credibility risk.

### 4.2 Too Many Routes Exposed in Navigation

The app currently exposes customer, supplier, admin, local demo, and readiness routes together.

Potential confusion:

- Investors may not know which path to follow.
- Customers would not normally need to see admin links.
- The demo can feel powerful but also busy.

Investor risk:

The product story may feel less polished than the underlying feature progress deserves.

### 4.3 Backend Readiness Is Mixed

The app has many real skeletons, but not all remote staging APIs are production-like.

Potential confusion:

- Some pages use localStorage fallback.
- Some pages expect fixture auth.
- Some admin data is skeleton/fallback.

Investor risk:

Without a guided demo, the investor may focus on technical seams instead of product value.

## 5. Investor-Ready Strengths

The current Preview can already support a credible investor narrative:

1. Party planning is emotionally visual and operationally complex.
2. PartyOnce uses AI intake to reduce planning friction.
3. Themes and restaurant renderings make the result tangible.
4. Quote prefill shows automation value.
5. Customer quote/order tracking shows platform continuity.
6. Admin queues show the operational backbone.
7. Supplier/venue mapping shows the marketplace/database direction.

This is enough to demonstrate product vision and early execution.

## 6. Investor-Ready Weaknesses

The current Preview is not yet a self-explanatory investor demo.

Main weaknesses:

- It needs a guided demo path.
- It needs clearer fixture/staging labels.
- It needs stronger post-inquiry next-step guidance.
- It needs a more polished package comparison.
- It needs a clean admin demo bootstrap.
- It must not imply real payment or production readiness.

## 7. Objective Go / No-Go for Investor Demo

Investor Preview Demo: Conditional Go.

Conditions:

- Use the official `partyonce` Preview URL.
- Start from homepage, not admin URLs.
- Use AI Concierge as the main story.
- Explain that supplier/venue data is staging seed.
- Explain payment is readiness-only.
- Use fixture/admin setup before showing backend.

Not ready for:

- Production launch.
- Real customer payment.
- Real supplier dispatch.
- Unsupervised investor exploration of all routes.

## 8. Best Next Step

Build an Investor Demo Mode / Guided Demo Hub.

It should provide one controlled path:

1. Start investor demo.
2. Bootstrap customer fixture.
3. Bootstrap admin fixture.
4. Seed one AI inquiry.
5. Show recommended theme / package / Restaurant A rendering.
6. Submit quote request.
7. Open My Quotes / My Orders.
8. Open Admin Quote / Order.
9. End at Payment readiness and Notification dry-run with clear “not live” labels.

This is the highest-leverage next step because it turns the current strong but scattered work into a coherent, investor-safe story.
