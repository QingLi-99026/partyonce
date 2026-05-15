# Party Event Owner / Investor Demo Guide

## Current Recommended Demo Route

Use the Venue Finder mainline as the controlled demo path:

1. Home
2. Venue Finder
3. Marrickville / Mascot + 30 guests + $25-$45
4. Compare 2-3 venues
5. Marrickville Family Dining Room detail
6. Use this venue for quote
7. Quote prefill
8. Payment readiness

Latest walkthrough result: 8/8 passed.

Evidence:

`/tmp/party_event_venue_finder_mainline_walkthrough_20260515/`

## Step-by-Step Demo Script

### 1. Home

Demo action:

Open the Preview home page.

Talking points:

- "This is now positioned as a practical party planning platform, starting from venue selection rather than an unfinished AI assistant."
- "The customer can begin with a clear action: find a suitable venue, view themes, or request a quote."
- "The visible AI entry has been hidden for now because it is not yet strong enough to be the first selling point."

Owner review focus:

- Does the first screen clearly feel like a party planning product?
- Is the Venue Finder entry easy to spot?
- Does the page avoid half-finished AI wording?

### 2. Venue Finder

Demo action:

Open `/venue-finder`.

Talking points:

- "The customer can search by practical constraints: suburb, distance, adults, kids, total guest count, budget, venue type, and decoration permissions."
- "This is currently a local/staging fixture, but the interaction model is the intended product direction."
- "The goal is to help a parent narrow down venue choices the way they might compare homes, cars, or restaurants."

Owner review focus:

- Are filters understandable to a non-technical parent?
- Does the page feel useful before themes or packages are discussed?

### 3. Marrickville / Mascot + 30 Guests + $25-$45

Demo action:

Use or confirm the sample scenario:

- Area: Marrickville or Mascot
- Adults: 10
- Kids: 20
- Total guests: 30
- Budget: $25-$45 per person

Talking points:

- "This is the current target consumer journey: a parent planning for around 30 guests with a medium budget."
- "The app turns the vague problem into searchable constraints."
- "The matching venues are demo fixtures, but the filtering logic is real front-end behavior."

Owner review focus:

- Does the filter result make sense for the stated family scenario?
- Is the budget and guest count carried through clearly?

### 4. Compare 2-3 Venues

Demo action:

Click Compare on 2-3 venue cards.

Talking points:

- "The compare panel helps the customer evaluate venue choices side by side."
- "It compares distance, capacity, budget, package fit, theme fit, and watch-outs."
- "This supports the future purchase journey because parents can understand tradeoffs before requesting a quote."

Owner review focus:

- Does comparison reduce decision friction?
- Are the watch-outs useful rather than scary?

### 5. Marrickville Family Dining Room Detail

Demo action:

Open `Marrickville Family Dining Room`.

Talking points:

- "The detail page explains venue capacity, price range, theme fit, package fit, and practical constraints."
- "It also shows visual planning images so customers can understand how a normal room becomes a party setup."
- "This is still a demo venue, clearly marked as local/staging."

Owner review focus:

- Does the venue detail feel credible enough for a customer demo?
- Are the theme and package links understandable?

### 6. Use This Venue for Quote

Demo action:

Click "Use this venue for quote".

Talking points:

- "This is the key handoff from browsing to conversion."
- "The venue choice is carried into the quote request instead of making the customer re-enter details."
- "No real booking, payment, or supplier contact is triggered."

Owner review focus:

- Does the transition feel natural?
- Does it clearly move the user from venue discovery into quote intent?

### 7. Quote Prefill

Demo action:

Show the Quote page after venue selection.

Talking points:

- "The quote page now displays the venue image, venue name, guest count, theme, package, area, and budget."
- "This makes the quote request easier to understand and gives the operator more context."
- "The page still uses local/staging pricing logic and does not create a formal quote or order."

Owner review focus:

- Does the quote page explain what has been selected?
- Can a parent understand why this venue/package is being used?

### 8. Payment Readiness

Demo action:

Open `/payment/deposit`.

Talking points:

- "This is a payment readiness preview only."
- "Deposit payment is not enabled in this Preview."
- "No PaymentIntent, no real Stripe charge, no webhook, and no external payment event is triggered."

Owner review focus:

- Is it clear that payment is not live?
- Does the wording avoid misleading the customer or investor?

## Owner Recheck Focus

Owner should focus on:

- Whether the first 30 seconds communicate a party planning product.
- Whether the Venue Finder flow is understandable without explanation.
- Whether the quote prefill confirms the venue and guest context clearly.
- Whether any page still feels blank, broken, or half-finished.
- Whether payment readiness is safely described as preview/test-only.

## Investor Controlled Demo Focus

For investor demos, keep the path controlled:

- Home shows positioning.
- Venue Finder shows the core practical product direction.
- Compare demonstrates decision support.
- Venue detail shows marketplace/data potential.
- Quote prefill shows conversion handoff.
- Payment readiness shows future monetization path without pretending payment is live.

Key value points:

- The platform can guide families from venue discovery to quote intent.
- Venue/theme/package data can become structured operational context.
- The Quote handoff can later support sales, supplier coordination, and payment.
- The current version is best framed as an interactive staging preview, not a full commercial launch.

## Areas Not Recommended for Free Clicking

Do not invite free exploration of every route yet.

Avoid or control these areas:

- AI / AI Concierge routes: AI is hidden from customer front-end because it is not currently commercial quality.
- Full 3D routes: 3D remains beta / visual planning preview.
- Admin pages: useful for internal explanation, but not polished for investor free-clicking.
- Supplier backend workflows: still local/staging and fixture-based.
- Payment pages beyond readiness explanation: not live payment.
- Notification dry-run: internal technical proof only, not customer-facing.

## Current Demo Boundaries

The current Preview is a controlled staging demo.

Boundaries:

- Local/staging fixture data.
- Not connected to real Google Maps or Places API.
- Not connected to a real restaurant database.
- Not connected to real payment.
- No real Stripe PaymentIntent or charge.
- No real webhook or n8n production trigger.
- No outbound email, SMS, WhatsApp, or supplier notification.
- 3D is beta / visual planning preview only.
- AI has been hidden from the customer-facing front end.

## If Asked About AI

Suggested answer:

"We tested an AI concierge direction, but we intentionally hid it from the customer-facing demo because the current version is not yet strong enough to be a commercial selling point. The product direction has shifted to a clearer venue-first planning flow. AI can come back later as an assistant layer once it can reliably understand natural language, venue constraints, budget, and quote intent."

Do not claim:

- Real AI is live.
- AI can fully plan events automatically.
- AI is connected to real venue inventory.

## If Asked About 3D

Suggested answer:

"3D is currently treated as a beta visual planning preview. It helps explain layout and decoration ideas, but it is not a production-grade 3D editor, construction drawing, or supplier execution plan. We will only restore 3D as a main selling point after quality validation."

Do not claim:

- It is a final 3D design tool.
- It is a formal construction drawing.
- It can generate supplier-ready build plans.

## If Asked About Payment

Suggested answer:

"Payment is readiness-only in this Preview. Deposit payment is not enabled, no real Stripe charge is triggered, and no PaymentIntent is created. Payment will be integrated later through a separate Stripe test-mode and production approval workstream."

Do not claim:

- Real deposits can be paid now.
- Stripe live mode is active.
- The preview can collect customer money.

## Next Stage Roadmap

Recommended next phase:

1. Venue Finder data enhancement
   - Add richer fixture coverage across more suburbs.
   - Improve scoring explanations and edge-case empty states.

2. Venue detail visual enhancement
   - Add stronger detail-page imagery and clearer venue suitability sections.
   - Better explain restrictions and setup requirements.

3. Restaurant A high-quality render library
   - Expand from showcase boards into consistent, higher-fidelity venue/package/theme galleries.
   - Make Basic / Standard / Premium differences more visually obvious.

4. Real restaurant data integration assessment
   - Evaluate whether to use owner-curated data, partner data, manual admin entry, or external APIs.
   - Do not connect real Google Maps / Places until data rights and product needs are clear.

5. 3D quality validation
   - Keep 3D as beta until visual quality is high enough.
   - Decide later whether it returns as a product selling point or remains an internal planning aid.

## Current Recommendation

Owner can recheck the Venue Finder mainline.

Investor demo is acceptable only as a controlled walkthrough, not as an open-ended free-click product demo.
