# Party Event AI Concierge Interaction Sprint 1

## 1. 本轮目标

把 `/ai-voice-intake` 从语音式/步骤式介绍增强为 local/staging-only 的可交互 AI 派对顾问 skeleton：

- 支持自由文本输入。
- 本地规则提取年龄、性别/偏好、预算、主题、服务需求和缺失信息。
- 生成顾问式正向反馈、推荐方向、quote-ready summary。
- 可继续进入 `/quote?source=ai` 并显示 AI prefill summary。

本轮不接真实外部 AI、真实语音 API、payment、webhook、n8n 或外发消息。

## 2. Skill Match Preflight

- `playwright`: 用于 route smoke、消费者路径验收、截图、console/page/network error capture。
- `computer-use`: 本轮未使用；Playwright 已覆盖本地浏览器验收。
- `software.acceptance_gate`: 当前没有可调用 MCP tool，已用 `/tmp/partyonce_ai_concierge_sprint1/software_acceptance_gate.json` 结构化执行。
- `frontend.route_structure_review`: 用 route smoke 记录 `/ai-voice-intake`、`/quote`、`/`。
- `frontend.build_static_check`: 执行 Vite build 到 `/tmp`。
- `validation.local_change_gate` / `file.diff_review`: 执行 `git diff --check`，并确认未修改 `.env.production`、`dist`、backend。
- `report.audit_pack_generator`: 用本地报告和 `/tmp/partyonce_ai_concierge_sprint1/` evidence 代替。

## 3. PM 任务拆解

- PM / Scheduler: 限定为 AI Concierge skeleton，不扩大到真实 AI、语音、支付或后端。
- Developer: 新增本地规则分析服务，增强 AI 页面自由文本互动，最小接入 Quote prefill。
- QA / Acceptance: 用消费者输入样例验证 AI 是否会问、会提取、会推荐、会承接 Quote。
- Fixer: Round 1 仅修正 QA 判定脚本的中文缺失字段 regex；代码无 P0/P1 返工。
- Release Gate: build、route smoke、browser QA、diff check 均通过；等待 owner review 后再进入 commit gate。

## 4. 修改/新增文件

- `frontend/vue-app/src/services/aiConciergeService.js`
- `frontend/vue-app/src/services/aiVoiceIntakeService.js`
- `frontend/vue-app/src/views/AIVoiceIntake.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/locales/zh.json`
- `frontend/vue-app/src/locales/en.json`
- `frontend/vue-app/src/locales/ko.json`
- `frontend/vue-app/src/locales/ar.json`
- `docs/PARTY_EVENT_AI_CONCIERGE_INTERACTION_SPRINT1_20260515.md`

## 5. 标准问询模板清单

页面提供 starter prompts：

- 我想给孩子办生日派对
- 不知道选什么主题
- 预算有限怎么办
- 想办得高级一点
- 想要适合女孩子/男孩子
- 想在餐厅办
- 想要拍照好看
- 想先看报价
- 想知道 Basic / Standard / Premium 差别
- 需要推荐场地

English / Korean / Arabic 均提供基础本地化版本。

## 6. 非标准咨询分析规则

本地规则式分析支持：

- `age`: 从中文“18岁”、英文 years/yo、韩文 세、阿文年龄表达或数字中提取。
- `gender_preference`: 识别女儿/女孩/girl/daughter/딸/بنت，男孩/son/boy 等。
- `budget_range`: 识别预算有限、别太夸张、limited budget、premium/luxury 等。
- `theme_preference`: 识别 castle/space/forest，以及高级、不幼稚、拍照好看等 photo-ready 诉求。
- `indoor_outdoor`: 识别餐厅、室内、户外、花园。
- `service_needs`: 识别 catering、photography、decor、host。
- `missing_fields`: 默认追问 date、area、guest_count、budget、indoor/outdoor 中缺失项。

测试输入：

> 我女儿快18岁了，想办得高级一点，不要太幼稚，拍照要好看，预算别太夸张。

识别结果：

- 年龄：18
- 性别/偏好：girl / feminine preference
- 预算：mid_controlled
- 主题/风格：premium_photo
- 服务需求：photography
- 缺失信息：date / area / guest_count / indoor_outdoor
- 推荐：Standard + Restaurant A / private dining room sample

## 7. 营销话术 / 情绪价值策略

AI advisor message 不只机械追问，会先给正向反馈：

- “这个想法是可以办得很好看的。”
- “先按 Standard 方向规划，既能保留拍照亮点，也能避免预算一开始就失控。”
- 接着只追问最关键缺失项，降低决策压力。
- 推荐理由说明预算、拍照、场地样板和下一步 Quote 的关系。

## 8. 多语言支持说明

- 中文：自然顾问语气。
- English：清晰 advisor tone。
- 한국어：基础韩文 starter prompts、输入说明、推荐卡片。
- العربية：基础阿文 starter prompts、输入说明、推荐卡片，并为互动面板设置 RTL。

当前仍保留部分品牌/技术词，例如 Party Event、AI Concierge、Quote、Restaurant A、Basic / Standard / Premium。

## 9. Quote 承接

- `/ai-voice-intake` 点击 Continue to Quote 后进入 `/quote?source=ai`。
- AI summary 写入 existing localStorage/sessionStorage quote prefill。
- `/quote` 接受 `source=ai` 和 `source=ai_concierge` 两种入口。
- `/quote` 的 AI prefill card 显示 quote-ready summary，包括 emotional summary、age、budget、package、venue、missing fields。

## 10. 本地 build / static check

- JSON parse: passed.
- Vue SFC parse:
  - `src/views/AIVoiceIntake.vue`: passed.
  - `src/views/QuotePage.vue`: passed.
- `git diff --check`: passed.
- Build command:
  - `npm run build -- --outDir /tmp/partyonce_ai_concierge_sprint1_build --emptyOutDir`
- Build result: passed.
- Output was written to `/tmp`, not `frontend/vue-app/dist`.

## 11. QA 结果

Evidence directory:

- `/tmp/partyonce_ai_concierge_sprint1/`

Generated evidence:

- `software_acceptance_gate.json`
- `route_smoke.json`
- `console_errors.json`
- `ai-voice-intake-before.png`
- `ai-voice-intake-analysis.png`
- `quote-ai-prefill.png`
- `ai-voice-intake-zh.png`
- `ai-voice-intake-en.png`
- `ai-voice-intake-ko.png`
- `ai-voice-intake-ar.png`

Route smoke:

- `/ai-voice-intake`: 200
- `/quote`: 200
- `/`: 200

Acceptance gate:

- free text input: passed
- field extraction: passed
- missing-field follow-up: passed
- recommendation visible: passed
- quote-ready summary: passed
- continue to quote: passed
- quote reads prefill: passed
- no external AI / voice / payment / webhook / n8n: passed

Console/page/network:

- console errors: 0
- page errors: 0
- failed external requests: 0

## 12. P0 / P1 / P2

- P0: none.
- P1: none blocking owner review.
- P2:
  - Recommendation is rule-based and intentionally coarse.
  - Korean/Arabic copy is basic, not final marketing translation.
  - The current skeleton does not ask a long free-form follow-up conversation; it extracts and then pushes toward quote-ready summary.

## 13. 自动修复轮次记录

- Round 1 implementation completed.
- Build passed.
- Route smoke passed.
- Browser QA passed.
- One QA evidence regex initially failed to detect Chinese missing-question wording, although UI displayed the questions; evidence JSON was corrected without code change.
- No Round 2 / Round 3 code fixes were required.

## 14. 安全边界

- No backend changes.
- No external AI API.
- No real TTS / STT / Whisper.
- No audio upload.
- No payment / Stripe / PaymentIntent.
- No webhook / n8n.
- No email / SMS / WhatsApp / 微信 / 企业微信.
- No production deploy.
- No production DB.
- No `.env.production` read or modification.
- No `dist` submission.
- No `git add`.
- No commit.
- No push.
- No LaCie backup.

## 15. 下一步建议

建议进入 owner review / commit gate。

Commit gate 时只允许白名单 stage 本轮相关文件，继续排除当前仓库中无关 untracked evidence / zip / scripts。
