# PartyOnce Package Pricing Explanation System Workpack

Date: 2026-05-14
Branch: eye-lite-v2-release-candidate-20260512

## 1. 本轮目标

Phase 3 目标是把 Basic / Standard / Premium 从“套餐名和价格层级”升级为客户能理解、投资人能看懂、运营能解释的报价说明系统。

本轮重点回答五个问题：

- Basic / Standard / Premium 到底差在哪里
- 为什么推荐这一档
- 价格差异来自哪里
- 升级后多了什么
- 这个方案为什么适合当前客户

本轮不接真实 payment，不创建 PaymentIntent，不触发 webhook / n8n，不外发 email / SMS / WhatsApp，不处理 production deploy。

## 2. 修改 / 新增文件

- `frontend/vue-app/src/data/packageExplanation.js`
- `frontend/vue-app/src/data/visualAssets.js`
- `frontend/vue-app/src/data/recommendationRules.js`
- `frontend/vue-app/src/views/AIVoiceIntake.vue`
- `frontend/vue-app/src/components/PackageShowcase.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/MyQuotes.vue`
- `frontend/vue-app/src/views/MyOrders.vue`
- `docs/PARTYONCE_PACKAGE_PRICING_EXPLANATION_SYSTEM_WORKPACK_20260514.md`

## 3. 套餐差异系统

新增 `packageExplanation.js` 作为统一套餐解释注册表，包含：

- Basic：控制预算，先把主题感和基础拍照点做出来。
- Standard：完整体验，兼顾预算、视觉冲击和可交付性。
- Premium：沉浸式视觉，强调仪式感、拍照区和全场包装。

每一档都包含：

- 定位说明
- 适合客户
- 推荐理由
- 包含内容
- 价格驱动因素
- 升级后新增价值
- 客户适配说明
- quote explanation 文案

`visualAssets.js` 已接入统一解释数据，主题套餐视觉数据不再只承载图片和价格，也承载运营解释。

## 4. 推荐理由与价格解释

`recommendationRules.js` 已把推荐结果从主题 / 套餐扩展为完整解释：

- `packageIncludes`
- `priceDrivers`
- `upgradeExplanation`
- `customerFit`
- `quoteExplanation`

AI Concierge 的推荐结果会说明：

- 为什么推荐这一档
- 预算如何匹配
- 价格差异主要来自哪些装饰和人工
- 如果升级到下一档会多什么
- 当前方案为什么适合客户需求

## 5. 页面接入结果

### AI Concierge

`/ai-voice-intake` 推荐结果卡已接入：

- 价格差异来自哪里
- 这个方案为什么适合我
- 升级后多了什么
- package includes
- supplier / venue / rendering preview

### Quote Request

`/quote` 已新增 Package explanation 面板：

- 套餐到底差在哪里
- 为什么推荐这一档
- 价格差异来自哪里
- 升级价值
- 为什么适合当前客户

Quote payload 的 pricing snapshot 中也带入：

- `packageExplanation`
- `upgradeExplanation`

### Package Showcase / Home

首页套餐矩阵和 Package Showcase 已展示：

- 每档包含内容
- 为什么选这一档
- 价格主要来自哪里

### My Quotes / My Orders

客户侧 My Quotes / My Orders 已在卡片层接入套餐解释：

- My Quotes：展示套餐适配理由和价格驱动摘要
- My Orders：展示报价解释和升级价值摘要

说明：自动 smoke 中 `/my/quotes` 当前 fixture 状态未稳定出现 quote card，但组件层已经接入解释块；后续可结合稳定 customer fixture 再做更细的客户侧数据验收。

## 6. 本地验证结果

### Vue SFC parse

已通过：

- `src/views/AIVoiceIntake.vue`
- `src/views/QuotePage.vue`
- `src/components/PackageShowcase.vue`
- `src/views/MyQuotes.vue`
- `src/views/MyOrders.vue`

### JS syntax check

已通过：

- `frontend/vue-app/src/data/packageExplanation.js`
- `frontend/vue-app/src/data/visualAssets.js`
- `frontend/vue-app/src/data/recommendationRules.js`

### Build

命令：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_package_explainer_build --emptyOutDir
```

结果：通过。

说明：仅输出到 `/tmp/partyonce_package_explainer_build`，未写入或提交 `frontend/vue-app/dist`。

## 7. Route Smoke 结果

本地 route smoke 覆盖：

- `/`
- `/ai-voice-intake`
- `/themes`
- `/quote`
- `/my/quotes`
- `/my/orders`
- `/admin/quotes`
- `/payment/deposit`

结果：

- 页面状态：全部 200
- 页面非空白：通过
- console error：0
- broken images：0
- `/quote` 直接访问可见 `Standard 到底差在哪里`、`为什么推荐这一档`、`价格差异来自哪里`、`从 Standard 升级到 Premium 会多什么`

## 8. AI Flow Smoke 结果

自动完成 AI Concierge 10 步问答后，推荐结果包含：

- price drivers：通过
- upgrade explanation：通过
- customer fit：通过

AI 进入 `/quote` 后，quote prefill / pricing snapshot 包含：

- price drivers：通过
- upgrade explanation：通过
- customer fit：通过

## 9. Vercel Preview 状态

公开 Preview URL：

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

本轮代码侧会在 commit 后 push release candidate branch，触发 Vercel Preview redeploy。

Owner 提到 `/`、`/themes`、`/quote` 已返回 200；这证明公开路由可访问，但“是否已经切到最新 deployment”仍需要 Vercel Dashboard 最终确认。当前本地 Vercel CLI 无登录凭据，不能直接读取 Dashboard deployment 列表。

后续确认建议：

1. 打开 Vercel Dashboard。
2. 进入 project `partyonce`。
3. 检查 branch `eye-lite-v2-release-candidate-20260512` 最新 deployment。
4. 确认 commit hash 与本轮 commit 一致。
5. 打开 Preview `/quote?theme=castle&package=standard&scene=restaurant-a`，确认页面出现 `Standard 到底差在哪里`。

## 10. 安全边界

- 是否读取 / 修改 `.env.production`：否
- 是否提交 `frontend/vue-app/dist`：否
- 是否 production deploy：否
- 是否触发真实 payment / Stripe / PaymentIntent：否
- 是否触发 webhook / n8n：否
- 是否外发 email / SMS / WhatsApp：否
- 是否连接 production DB：否

## 11. Blocker

- Vercel Dashboard 最新 deployment 状态需要 owner 登录 Dashboard 确认，或提供 Vercel token / MCP access 后由 Codex 读取。
- My Quotes 的解释块已接入组件，但自动 smoke 依赖稳定 customer fixture 才能稳定看到 quote card。

## 12. 下一步建议

下一步建议进入 Phase 4：把套餐解释继续下沉到后台运营报价依据，让 Admin Quote / Order 在运营视角能看到：

- 客户为什么被推荐该套餐
- 哪些供应商 / 场地 / 装饰项构成价格
- 如果客户犹豫，运营可以如何解释升级价值

Production 仍保持 No-Go，待 staging / payment / webhook / production migration 全部完成后再复审。
