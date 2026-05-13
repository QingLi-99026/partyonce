# PartyOnce AI Voice Intake Recovery Workpack 2026-05-13

## 1. Goal

Restore AI as a customer-facing guide, not only a form. The first version is local/staging only and gives customers a voice-style guided path into theme and quote selection.

## 2. Implemented

- Added `frontend/vue-app/src/views/AIVoiceIntake.vue`.
- Added `frontend/vue-app/src/services/aiVoiceIntakeService.js`.
- Added route `/ai-voice-intake`.
- Updated homepage AI CTA and navigation to point to the new AI guide.

## 3. Flow

Customer path:

```text
Homepage
→ AI 帮我推荐
→ AI welcome / voice-style guide
→ choose guest count, age, budget, style, venue preference
→ recommendation: Castle / Space / Forest + package tier
→ carry into /quote with local/staging intake summary
```

## 4. Voice Boundary

- Uses browser Web Speech API when available.
- No real speech recognition.
- No paid TTS provider.
- No external AI API call.
- No outbound message.
- No webhook/n8n.
- No payment or PaymentIntent.

## 5. Visual Context

The recommendation uses `visualAssets.js` to show:

- recommended theme package visual
- Restaurant A rendering context
- supplier suggestions
- venue fit
- price hint and decoration scope

## 6. Validation

- Vue SFC parse: passed for `AIVoiceIntake.vue`.
- JS syntax check: passed for `aiVoiceIntakeService.js`.
- Build result is recorded in the master workpack after full validation.

## 7. Next Step

If owner wants real voice later, add a provider layer behind the current service. Do not add a paid TTS or speech-recognition API without a separate approval gate.
