# Party Event AI Voice Guided Flow P0 Fix

## Summary

This patch closes the remaining local/staging AI voice guided-flow gap after `2f9201b5`.

The prior AI Concierge work already provided local rule-based intake, free-text analysis, quote-ready summary generation, and `/quote` prefill. The remaining P0 issue was on the homepage theme voice path: the Chinese immersive hero `听一听` action only played a one-off line and did not show a clear next step for the customer.

## What Changed

- Homepage `听一听` now opens an AI theme guidance panel after the voice intro.
- The panel asks whether the customer wants to continue planning with the selected theme.
- The primary follow-up button routes to `/ai-voice-intake?theme=castle-princess`, `/ai-voice-intake?theme=space-explorer`, or `/ai-voice-intake?theme=forest-adventure`.
- `/ai-voice-intake` now reads the theme query and pre-fills the theme preference locally.
- Four locale files now include the new homepage theme-listen copy and AI prefill message.

## AI / Voice Boundary

- Real AI API: No.
- Real speech recognition API: No.
- Real voice upload: No.
- `speechSynthesis`: The existing browser-native speech playback remains best-effort. If the browser blocks audio, the visible follow-up panel still appears and the flow remains usable.
- External systems: No payment, Stripe, webhook, n8n, email, SMS, WhatsApp, or outbound message was triggered.

## Quote Handoff

The existing local/session storage handoff remains:

- `partyonce_ai_concierge_intake_v1`
- `partyonce_ai_concierge_quote_prefill_v1`

After the AI intake summary, clicking Continue to Quote routes to `/quote?source=ai`, and the quote page displays the AI Concierge prefill card and quote-ready summary.

## Validation

- Locale JSON parse: passed.
- Locale key parity: passed.
- Build: passed.
  - `npm run build -- --outDir /tmp/partyonce_ai_voice_guided_flow_p0_fix_build --emptyOutDir`
- HTTP smoke: passed.
  - `/`
  - `/ai-voice-intake?theme=castle-princess`
  - `/quote`
- Chrome Playwright smoke: passed.
  - Homepage opened.
  - `听一听` exposed follow-up buttons.
  - `继续用这个主题策划` navigated to `/ai-voice-intake?theme=castle-princess`.
  - Free-text AI intake generated advisor feedback and quote-ready summary.
  - Continue to Quote navigated to `/quote?theme=space&package=standard&scene=restaurant-a&source=ai`.
  - `/quote` displayed AI Concierge prefill and summary.
- WebKit/Safari-like Playwright: blocked because local Playwright WebKit is not installed.

## Evidence

Evidence path:

`/tmp/party_event_ai_voice_guided_flow_p0_fix_20260514/`

Files:

- `browser_check_summary.json`
- `ai_voice_flow_result.json`
- `homepage_theme_listen_result.json`
- `quote_prefill_result.json`
- `console_errors.json`
- `page_errors.json`
- `broken_images.json`
- `screenshots/ai-theme-prefill.png`
- `screenshots/quote-prefill.png`

## Remaining Risk

Owner should still perform a manual Safari check because Playwright WebKit was not installed locally.

Production remains No-Go. This patch is local/staging-only.
