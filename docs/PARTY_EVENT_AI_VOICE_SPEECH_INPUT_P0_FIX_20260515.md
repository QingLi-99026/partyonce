# Party Event AI Voice Speech Input P0 Fix - 2026-05-15

## Summary

The AI voice entry previously behaved like one-way narration because `/ai-voice-intake` only exposed speech synthesis for "listen to current question" and a "Voice preview / Coming soon" label. It did not create a browser speech recognizer, did not request microphone input, did not convert speech into the existing AI Concierge text flow, and therefore user speech produced no visible response.

This patch adds a local/staging-only browser speech input path using native Web Speech API:

- `window.SpeechRecognition`
- `window.webkitSpeechRecognition`

No real AI API is connected. No external speech recognition API is connected. No real voice recording is uploaded or saved.

## Implemented Behavior

- `/ai-voice-intake` now shows a visible speech input area with:
  - Start speaking
  - Stop
  - Say again
  - Use text input
- Chrome can use browser-native speech recognition when the API is available.
- Safari/WebKit or any unsupported browser shows a clear fallback message and keeps text input usable.
- Permission denial, no microphone, no speech, blocked service, and browser errors are surfaced instead of failing silently.
- Recognized speech is placed into the existing AI Concierge input, displayed as "I heard...", and analyzed by the local rule engine.
- The local rule engine now recognizes the P0 test sentence:
  - intent: `needs_ai_planning`
  - child age: `7`
  - guest count: `20`
  - budget: `standard`
  - venue status: `need_venue`
  - next step: theme recommendation and follow-up questions
- When `/ai-voice-intake?theme=castle-princess` is opened from the homepage follow-up, the selected theme remains carried into the AI recommendation unless the user explicitly names a different theme.

## AI Response

For the test input:

> 我不太了解这个 App，希望你帮我做一个策划。我想办一个 7 岁孩子的生日派对，大概 20 人，预算中等，还没有场地。

The local AI Concierge responds:

> 明白了，我会按 7 岁孩子、约 20 人、中等预算、需要场地推荐 来帮你策划。我们先从主题开始。

The flow continues to show recognized fields, missing fields, a quote-ready summary, the guided step list, and the recommendation panel.

## Quote Handoff

`saveIntakeForQuote()` stores the AI Concierge payload in local/session storage under the existing prefill keys. `/quote` reads that payload through `readQuotePrefill()` and shows:

- AI Concierge prefill notice
- Quote-ready summary
- Age
- Budget
- Package recommendation
- Venue recommendation
- Missing fields

Verified quote URL:

`/quote?theme=castle&package=standard&scene=restaurant-a&source=ai`

## Safety Boundary

- Uploads real voice: No
- Saves real recordings: No
- Calls external speech recognition API: No
- Calls OpenAI/Gemini/DeepSeek/Claude or other external AI API: No
- Triggers payment/Stripe/PaymentIntent: No
- Triggers webhook/n8n: No
- Sends email/SMS/WhatsApp: No
- Touches production database or production deploy: No
- Reads or modifies `.env.production`: No
- Triggers external systems: No

## Verification

Local verification was run against Vite on `http://127.0.0.1:5173`.

- `npm run build`: passed
- Chrome local browser run:
  - `/ai-voice-intake?theme=castle-princess` loads
  - Speech controls are visible
  - Text simulation of recognized speech displays "我听到的是..."
  - AI response appears
  - Theme remains Castle Princess
  - Summary and next questions appear
  - Quote handoff opens `/quote`
  - `/quote` displays AI Concierge prefill
- Final console check:
  - Errors: 0
  - Warnings: 0

Evidence directory:

`/tmp/party_event_ai_voice_speech_input_p0_fix_20260515/`

Key files:

- `browser_check_summary.json`
- `speech_input_result.json`
- `fallback_result.json`
- `ai_response_result.json`
- `quote_prefill_result.json`
- `console_errors.json`
- `page_errors.json`
- `broken_images.json`
- `contact-sheet.png`
- `ai-intake-final.png`
- `quote-prefill-final.png`

## Owner Review

Owner should review the Preview again, especially in Chrome with microphone permission enabled, because actual speech recognition availability depends on the browser and OS permission state. Safari/WebKit should be checked for the fallback path; unsupported speech recognition must show text input and a clear message rather than doing nothing.
