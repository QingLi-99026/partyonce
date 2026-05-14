# PartyOnce AI Concierge Experience Hardening Workpack 20260514

## 1. 本轮目标

将 `/ai-voice-intake` 从基础问答升级为更像真实客服的 AI Concierge 流程：分步采集客户需求，生成可读 customer brief，推荐 Castle / Space / Forest 主题、Basic / Standard / Premium 套餐、Restaurant A 场地样板，并自动预填 `/quote` inquiry。

本轮仍为 local/staging/preview 能力，不接真实 payment、Stripe live mode、PaymentIntent、webhook、n8n、email、SMS 或 WhatsApp。

## 2. 修改 / 新增文件

- `frontend/vue-app/src/data/aiConciergeQuestions.js`
- `frontend/vue-app/src/data/recommendationRules.js`
- `frontend/vue-app/src/views/AIVoiceIntake.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `docs/PARTYONCE_AI_CONCIERGE_EXPERIENCE_HARDENING_WORKPACK_20260514.md`

## 3. AI 问题树优化内容

保留 10 步客服式问题树，每一步只问一个问题，并继续支持返回上一步、重新开始和进度显示：

1. 孩子年龄
2. 活动日期
3. 预计人数
4. 预算范围
5. 所在区域
6. 室内 / 室外偏好
7. 喜欢的主题
8. 是否已有场地 / 是否需要餐厅推荐
9. 姓名
10. 联系方式

文案已从表单式提示调整为顾问式口吻，例如强调“先选大概日期，顾问后续人工确认”“不会触发付款，也不会创建 PaymentIntent”。

## 4. 推荐规则和推荐理由

推荐仍采用 rule-based local/staging 规则，不调用外部 AI API：

- 年龄、主题偏好、室内/室外偏好会累计 Castle / Space / Forest 分数。
- 预算范围直接映射 Basic / Standard / Premium。
- 人数映射 small / medium / large capacity 场地提示。
- 场地状态决定 Restaurant A 样板、客户自有场地或 flexible venue search。

推荐结果新增：

- `reasonHeadline`
- `budgetMatch`
- `packageIncludes`
- `nextStepSuggestion`
- `venueRecommendation`
- supplier suggestions with role / price range

## 5. 客户需求摘要生成方式

`recommendationRules.js` 新增 `buildCustomerBrief()`，生成可读 customer brief，例如：

`Customer is planning a 6-8 岁 birthday party for around 16-25 人 in Sydney CBD / Inner West, with a Standard · 完整体验 budget...`

该摘要写入：

- quote request `customerInfo.notes`
- quote request `customerInfo.customerBrief`
- Lead skeleton payload `customer_brief`
- Lead skeleton payload `intake_notes`
- `localStorage` 的 `inquirySubmissions`

## 6. Quote prefill 字段

AI Concierge 进入 `/quote` 时通过 `localStorage` / `sessionStorage` staging-safe prefill，包含：

- `customerInfo.name`
- `customerInfo.contact`
- `customerInfo.preferredDate`
- `customerInfo.notes`
- `customerInfo.customerBrief`
- `selection.theme`
- `selection.themeId`
- `selection.themeName`
- `selection.packageTier`
- `selection.packageId`
- `selection.packageName`
- `selection.venueType`
- `selection.guestCount`
- `selection.budgetRange`
- `selection.venueId`
- `selection.venueName`
- `selection.supplierSuggestions`
- `pricing.snapshot_note`
- `pricing.aiEstimate`
- `source = ai_concierge`
- `aiRecommendation`

## 7. Post-inquiry 下一步说明

`QuotePage.vue` 新增提交后的下一步说明卡：

- 我们已收到你的派对需求
- 团队会根据 Restaurant A 样板、主题视觉和供应商建议确认方案
- 客户可以在 My Quotes 查看报价进度
- 客户可以在 My Orders 查看后续订单状态
- 当前为 staging preview，不触发真实支付、PaymentIntent、webhook、n8n 或外发消息
- 显示 local-only / Lead skeleton 同步状态

## 8. 语音处理原则

本轮仅保留普通 Web Speech API：

- 默认不强制朗读
- 提供声音开关
- 可朗读欢迎语和当前问题
- 不接付费 TTS
- 不做 voice cloning
- 不上传真人声音
- 不使用商业语音 API

## 9. 本地 build 结果

命令：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_ai_concierge_hardening_build --emptyOutDir
```

结果：通过。

说明：build 输出到 `/tmp/partyonce_ai_concierge_hardening_build`，未写入 `frontend/vue-app/dist`。Vite 仅输出既有 chunk size warning。

## 10. Route smoke 结果

本地 dev server：`http://127.0.0.1:5180/`

验证 routes：

- `/`：200，非空白，broken images = 0
- `/ai-voice-intake`：200，非空白，broken images = 0
- `/quote`：200，非空白，broken images = 0
- `/my/quotes`：200，非空白，broken images = 0
- `/my/orders`：200，非空白，broken images = 0
- `/admin/quotes`：200，非空白，broken images = 0
- `/payment/deposit`：200，非空白，broken images = 0

Console error：0。

Flow smoke：

- AI Concierge 问答完成：通过
- 推荐结果生成：通过
- `/quote?source=ai_concierge` prefill：通过
- customer brief 写入 notes：通过
- inquiry / Lead local submission：通过
- post-inquiry 下一步说明：通过

## 11. Preview redeploy 结果

待本轮白名单 commit 并 push release candidate branch 后，由 Vercel Preview 自动 redeploy。

目标 Preview URL：

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

## 12. 是否读取 / 修改 `.env.production`

否。本轮未读取、未修改 `.env.production`。

## 13. 是否提交 dist

否。build 输出到 `/tmp`，未提交 `frontend/vue-app/dist`。

## 14. 是否 production deploy

否。本轮不做 production deploy。

## 15. 是否触发 payment / webhook / n8n / 外发

否。未创建 PaymentIntent，未触发 webhook / n8n，未发送 email / SMS / WhatsApp。

## 16. Blocker

无代码 blocker。Preview redeploy 状态需在 push 后观察；如 Vercel Preview protection 仍开启，则属于 Vercel access setting blocker，不是 App route blocker。

## 17. 下一步建议

进入供应商 / 场地数据库与 AI 推荐结果的深度绑定验收：确认 AI 推荐的主题、套餐、Restaurant A 渲染图、供应商建议在客户侧 Quote、My Quotes、My Orders 和后台 Quote / Order 中持续一致展示。
