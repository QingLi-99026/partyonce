# PartyOnce AI Concierge Intake Flow Workpack V1

## 1. 本轮目标

把 `/ai-voice-intake` 从视觉入口升级为可完成需求登记的 AI Concierge 流程：

客户进入首页 → 点击 AI 帮我推荐 → 分步回答问题 → 规则式推荐主题 / 套餐 / Restaurant A 样板 → 自动预填 `/quote` → 客户确认并提交 inquiry。

本轮仍为 local/staging/preview 能力，不接真实 payment、Stripe live mode、PaymentIntent、webhook、n8n、邮件、短信或 WhatsApp。

## 2. 修改 / 新增文件

- `frontend/vue-app/src/views/AIVoiceIntake.vue`
- `frontend/vue-app/src/services/aiVoiceIntakeService.js`
- `frontend/vue-app/src/data/aiConciergeQuestions.js`
- `frontend/vue-app/src/data/recommendationRules.js`
- `frontend/vue-app/src/views/QuotePage.vue`
- `docs/PARTYONCE_AI_CONCIERGE_INTAKE_FLOW_WORKPACK_20260514.md`

## 3. AI 引导问题树

本轮新增 10 步单问题采集：

1. 孩子年龄
2. 活动日期
3. 预计人数
4. 预算范围
5. 所在区域
6. 室内 / 室外偏好
7. 偏好主题
8. 是否已有场地 / 是否需要餐厅推荐
9. 联系人姓名
10. 联系方式

页面包含进度条、问题卡片、选项按钮、文本 / 日期输入、返回上一步、重新开始、语音开关、推荐结果卡和视觉预览图。

## 4. 推荐规则

新增 `recommendationRules.js`，使用规则式评分，不调用外部 AI：

- 年龄 3-5 岁偏向 Castle Princess / Forest Adventure。
- 年龄 6-8 岁在 Castle / Space / Forest 之间按偏好加权。
- 年龄 9-10 岁偏向 Space Explorer / Forest Adventure。
- 主题偏好直接强加权到 Castle / Space / Forest。
- 预算范围映射 Basic / Standard / Premium。
- 人数映射 small / medium / large capacity 场地建议。
- 室内优先推荐稳定室内样板；室外偏好加强 Forest Adventure。

推荐结果包含主题、套餐、推荐理由、适合人数、适合场地类型、Restaurant A 视觉图、供应商建议和下一步动作。

## 5. 自动预填 quote request 方式

AI Concierge 完成后调用 `saveIntakeForQuote()`，写入：

- `localStorage.partyonce_ai_concierge_intake_v1`
- `localStorage.partyonce_ai_concierge_quote_prefill_v1`
- `sessionStorage.partyonce_ai_concierge_quote_prefill_v1`

然后跳转：

`/quote?theme=<theme>&package=<tier>&scene=restaurant-a&source=ai_concierge`

`QuotePage.vue` 读取预填 payload，并自动带入：

- `customerInfo.name`
- `customerInfo.contact`
- `preferredDate`
- `notes`
- `selection.themeId / themeName`
- `selection.packageId / packageName`
- `selection.venueType`
- `selection.guestCount`
- `selection.restaurantVisual`
- `selection.packageVisual`
- `selection.supplierSuggestions`
- `pricing.packageTier / priceHint / estimatedLevel`
- `source = ai_concierge`

提交后继续走现有 inquiry 本地保存链路；如果本地/staging backend skeleton 开启 `dual_write_skeleton`，再尝试 `POST /api/leads`。Backend 不可用时不阻断本地演示。

本轮不创建 Quote，不创建 Order，不创建 PaymentIntent。

## 6. 语音处理原则

本轮保留浏览器 Web Speech API 的普通语音提示能力，并新增开关。默认不强制朗读，避免长段打扰。

未接入：

- 付费 TTS API
- voice cloning
- 真人声音训练
- 未授权声音素材

商业级真人发声留到上线前独立评估。

## 7. 本地 build 结果

命令：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_ai_concierge_build --emptyOutDir
```

结果：通过。

说明：输出目录为 `/tmp/partyonce_ai_concierge_build`，未写入 `frontend/vue-app/dist`。

## 8. Route smoke 结果

本地 dev server：`http://127.0.0.1:5177`

已验证：

- `/`：200，非空白，console error = 0，broken images = 0
- `/ai-voice-intake`：200，非空白，console error = 0，broken images = 0
- `/quote`：200，非空白，console error = 0，broken images = 0
- `/my/quotes`：200，非空白，console error = 0，broken images = 0
- `/admin/quotes`：200，本地未登录环境按现有 guard fallback 到首页，无 console error
- `/payment/deposit`：200，readiness 页面，无真实 payment

AI Concierge flow smoke：

- 完成 10 步问答
- 生成 Space Explorer / Standard 推荐结果
- 跳转 `/quote?theme=space&package=standard&scene=restaurant-a&source=ai_concierge`
- Quote 表单自动预填姓名、联系方式、日期和 AI notes
- 点击确认提交后写入 `localStorage.inquirySubmissions`
- 保存结果 `source = ai_concierge`
- 保存结果包含 `aiRecommendation`

## 9. Preview redeploy 结果

本地验证已通过。本轮提交后可 push release candidate branch 触发 Vercel Preview redeploy。

Preview URL 继续使用：

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

## 10. 是否读取 / 修改 `.env.production`

否。

## 11. 是否提交 dist

否。

## 12. 是否 production deploy

否。

## 13. 是否触发 payment / webhook / n8n / 外发

否。

`/payment/deposit` 仍为 readiness / placeholder 路由；AI Concierge 提交只保存 inquiry / Lead skeleton。

## 14. Blocker

无本轮代码 blocker。

Preview redeploy 需要在提交并 push release candidate branch 后由 Vercel 执行；仍禁止 production deploy。

## 15. 下一步建议

进入 Preview 验收：检查首页 AI 帮我推荐入口、`/ai-voice-intake` 问答体验、推荐结果卡、Quote 预填和 inquiry 保存结果。通过后再做投资人 walkthrough 录屏或 deck，不进入真实支付。
