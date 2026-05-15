# Party Event AI Voice Conversation Loop P0 Fix

## Problem

Owner testing showed the AI voice intake felt like a one-time transcription tool instead of a party advisor conversation. After a user said they did not understand the app and wanted help planning, the page did not reliably respond, extract known details, ask the next missing question, or move toward a quote-ready summary.

## Fix

This round adds a local/staging-only AI conversation mode on `/ai-voice-intake`.

- Adds visible AI and user conversation bubbles.
- Adds a fixed conversation state machine:
  - intent
  - theme
  - child age
  - guest count
  - budget
  - venue status
  - special needs
  - summary
- Keeps browser SpeechRecognition as a user-click, one-shot input path.
- Adds text fallback for Safari or browsers where speech recognition is unavailable or blocked.
- Parses the owner test sentence locally and extracts:
  - age: 7
  - guests: 20
  - budget: Standard
  - venue: needs venue recommendation
- Skips already known fields and asks the next missing question instead of restarting.
- Generates an AI planning summary.
- Sends the local/staging quote prefill into `/quote`.
- Keeps homepage theme handoff through `/ai-voice-intake?theme=castle-princess`.

## Boundaries

- Real AI API: No.
- Real speech service API: No.
- Infinite/background microphone listening: No.
- Recording upload: No.
- Payment / Stripe / PaymentIntent: No.
- Webhook / n8n: No.
- Email / SMS / WhatsApp: No.
- Production deploy or production DB: No.
- `.env.production` read/modified: No.

The flow is a deterministic local rule-based AI-style guided flow. The user must click per answer so the browser can control microphone permission safely.

## Speech Handling

The browser-native SpeechRecognition path remains one-shot per click. If the browser does not support SpeechRecognition, or permission is blocked, the same conversation loop continues through text input.

## Quote Prefill

The conversation summary updates the existing local intake answer model and `saveIntakeForQuote` flow. `/quote` receives the same local/staging AI source query and reads the stored prefill.

## Validation

Build:

```text
npm run build -- --outDir /tmp/partyonce_ai_voice_conversation_loop_p0_fix_build --emptyOutDir
Result: Pass
```

Chrome / Chromium automation:

```text
/ai-voice-intake nonblank: Pass
AI conversation mode visible: Pass
Owner sentence extracted age 7 / guests 20 / Standard / needs venue: Pass
Known questions skipped: Pass
Summary generated: Pass
/quote opened with AI prefill: Pass
Homepage theme handoff visible: Pass
/ai-voice-intake?theme=castle-princess prefilled: Pass
Console errors: 0
Page errors: 0
Broken images: 0
```

Safari real browser automation:

```text
Safari opened /ai-voice-intake: Pass
Page nonblank: Pass
Conversation mode visible: Pass
Speech/text fallback visible: Pass
Screenshot saved: Pass
```

Playwright WebKit was not used after local macOS WebKit crashes were observed; Safari validation used real Safari through `open -a Safari`, AppleScript, and `screencapture`.

## Evidence

```text
/tmp/party_event_ai_voice_conversation_loop_p0_fix_20260515/
```

Key files:

```text
browser_check_summary.json
chrome_acceptance_result.json
safari_real_browser_result.json
console_errors.json
page_errors.json
broken_images.json
contact-sheet.png
screenshots/
```

## Owner Review

Recommended owner review pages:

```text
/ai-voice-intake
/ai-voice-intake?theme=castle-princess
/quote
/
```

