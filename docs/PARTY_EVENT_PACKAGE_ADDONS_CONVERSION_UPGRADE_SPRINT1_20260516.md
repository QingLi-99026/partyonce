# Party Event Package + Add-ons Conversion Upgrade Sprint 1

## 1. 本轮目标

本轮把 Party Event 从“场地 / 主题 / 套餐可演示”继续推进到“澳洲中产与中高端家庭能理解报价价值、愿意提交 inquiry、运营能解释利润服务”的版本。

核心原则：

- 不恢复客户前台 AI 卖点。
- 不主推 3D；3D 仍由 feature flag 控制。
- 不接真实 Google Maps / Places API、真实餐厅库、真实 payment / Stripe、webhook / n8n 或外发消息。
- 当前 tracked dirty 修改作为施工基线，未回退、未清理历史 dirty。

## 2. 修改 / 新增文件

本轮实际新增 / 修改的核心文件：

- `frontend/vue-app/src/data/addOnServices.js`
- `frontend/vue-app/src/data/quoteLineItems.js`
- `frontend/vue-app/src/services/venueFinderService.js`
- `frontend/vue-app/src/views/VenueFinder.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/MyRewards.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `frontend/vue-app/src/services/socialRewardsService.js`
- `frontend/vue-app/src/services/customerExperienceService.js`
- `frontend/vue-app/src/mock/adminOrders.js`
- `frontend/vue-app/src/components/PackageShowcase.vue`
- `frontend/vue-app/scripts/check-i18n-residue.mjs`
- `frontend/vue-app/package.json`
- `frontend/vue-app/src/locales/en.json`
- `frontend/vue-app/src/locales/zh.json`
- `frontend/vue-app/src/locales/ko.json`
- `frontend/vue-app/src/locales/ar.json`
- `docs/PARTY_EVENT_PACKAGE_ADDONS_CONVERSION_UPGRADE_SPRINT1_20260516.md`

注意：施工前工作区已存在其他 tracked dirty 文件，本报告只声明本轮新增的套餐与附加服务升级范围。

## 3. Add-on Services 数据模型

新增 local/staging `addOnServices` 数据模型，覆盖 8 类高利润附加服务：

- 现场布置与主题造型
- 搭建、撤场与现场协调
- 儿童派对主持 / MC
- 音响 / 麦克风基础包
- 儿童互动表演 / 娱乐
- 主题蛋糕 / 甜品台
- 拍照区 / 背景板升级
- 活动后清理 / 撤场支持

服务按 4 个客户容易理解的价值分组：

- 省心执行 / Done-for-you execution
- 视觉升级 / Visual upgrades
- 孩子体验 / Kids experience
- 餐饮甜品 / Food & dessert

每项服务包含：

- `price`
- `group`
- `marginRole`
- 中英韩阿基础文案
- customer-facing value
- amount basis
- admin edit hint

## 4. Quote 页面升级

Quote 页面现在按更清晰的转化顺序呈现：

1. Venue Finder prefill / venue / guests / area / budget
2. 当前主题、场景、套餐
3. 标准化报价组成
4. 套餐差异解释
5. 可选附加服务
6. 提交 inquiry

修复了一个验收中发现的问题：

- Venue Finder 进入 `/quote` 后不再自动弹出 inquiry form。
- 用户可以先阅读套餐、报价组成和附加服务，再主动点击 Submit inquiry。

继续补强了 Venue Finder 到 Quote 的转化承接：

- Venue Finder 结果卡片显示 “Useful add-ons for this venue”。
- Venue Compare 增加 `Add-on upside`，让 owner / 家长能比较哪个场地更适合高利润服务。
- Venue detail 增加推荐高价值附加服务区。
- Venue Finder prefill 现在把推荐 add-ons 写入 `selection.addonSuggestions` 和 `venueFinder.recommendedAddons`。
- Quote 页面读取 Venue Finder 推荐 add-ons，并显示 “High-value services that fit this venue” 推荐区。
- 推荐 add-ons 不会自动加入总价，必须由客户主动点选，避免误导。

## 5. Quote Line Items 打通

附加服务继续使用现有稳定 line item 类型：

- `optional_upgrade`

每个被选中的 add-on 会进入 `buildQuoteLineItemsFromSelection()`，并带入：

- service name
- amount
- amount basis
- customer explanation
- admin edit hint
- source = `customer_selected_addon`

这为后续正式报价单、PDF、deposit 计算和后台运营解释保留了结构化基础。

## 6. 客户侧展示结果

`MyQuoteDetail` 和 `MyOrderDetail` 增加了附加服务价值说明。

客户侧展示：

- 附加服务名称
- 费用
- 为什么对家庭有价值
- 计费依据
- 明确说明不会自动扣款，正式报价前需人工确认

客户侧不展示：

- 内部 owner
- next action
- internal note
- admin-only edit hint

## 7. 后台运营展示结果

`AdminQuoteDetail` 和 `AdminOrderDetail` 增强了 “高利润附加服务” 解释。

运营可看到：

- add-on 名称
- 金额
- admin edit hint
- 是否需要确认供应商、场地限制、执行时长

运营可以直接把这些信息用于回答客户：

- 为什么建议加主持？
- 为什么拍照区值得升级？
- 为什么需要搭建 / 撤场服务？
- 哪些费用还需要人工复核？

## 8. 多语言最低信任修复

补齐了 Quote add-ons 入口的基础中英韩阿说明：

- English
- 中文
- 한국어
- العربية

Add-on services 数据本身也包含四语言基础文案，避免韩文 / 阿文页面大面积回退中文。

新增本地检查脚本：

```bash
npm run check:i18n
```

输出 evidence：

```text
/tmp/party_event_package_addons_upgrade_sprint1_20260516/i18n_residue_audit.json
```

当前结果：

- P0 i18n key leak：0
- P1 韩文 / 阿文中文残留：0
- P2 英文残留审查项：149

P2 主要来自品牌名、主题名、技术边界、local/staging 说明、已隐藏 AI 文案或可接受的平台名；仍建议后续做逐页人工润色，但本轮已经建立自动检查入口。

## 8A. 套餐对比与报价流程说明

Quote 页面新增更明确的四步人工复核说明：

1. 选择场地 / 主题 / 套餐
2. 提交需求
3. 人工复核正式报价
4. 订金准备

这让家长明确理解：

- 当前金额是 reviewable estimate。
- 提交 inquiry 不会自动扣款。
- 不会自动生成真实订单。
- 订金只是在正式报价确认后进入 test-mode readiness。

Quote 页面同时新增三档套餐对比表：

- 基础套餐
- 标准套餐
- 高级套餐

对比维度：

- 视觉目标
- 包含内容
- 适合家庭
- 适合年龄 / 人数
- 价格区间提示
- 升级后多了什么

## 8B. 分享返券 Skeleton 清晰化

现有 `/my/rewards`、`/share`、`/admin/social-rewards` 已保留为 local/staging skeleton。

本轮把客户侧规则改成更容易理解的三步：

1. 用自己的 TikTok / 小红书 / Instagram / Facebook / 私域渠道分享。
2. 提交 post link 或截图说明；未来可扩展为朋友提交 quote。
3. 后台人工审核，通过后显示固定 voucher / 免费升级 placeholder。

当前奖励组合：

- `$30 party upgrade voucher`
- `Free balloon upgrade placeholder`
- `Free photo-corner upgrade placeholder`

边界：

- 不收集社交账号密码。
- 不接真实社交平台 API。
- 不发放真实优惠券。
- 不影响 payment / deposit 计算。
- “通知用户结果”仅为 App 内状态可见。

## 9. Skill 调用记录

本轮实际使用：

- `playwright` skill：用于 Chromium route smoke、截图、console/page/network/broken image 检查。
- `computer-use` skill：用于桌面 Chrome owner 视角观察 Quote 页面，确认 Venue Finder prefill、报价组成和附加服务真实可见。
- `canva` skill：生成 add-on services 营销卡片候选，用于后续 owner 选择或 marketing deck，不作为本轮 App runtime asset。
- 本地报告 / evidence 生成：输出 JSON 与截图到 `/tmp/party_event_package_addons_upgrade_sprint1_20260516/`。

Canva 候选设计链接：

- `https://www.canva.com/d/0_ie6jyARC5rHZ3`
- `https://www.canva.com/d/nnTcaEaNBeyxQWW`
- `https://www.canva.com/d/kqiwA-JlfsKIH1Z`
- `https://www.canva.com/d/6kH6BysljMhPzeM`

本轮未触发：

- GitHub：未提交、未 push、未创建 PR。
- Slack：未发送消息；如需要，可下一步生成 owner/QA 汇报草稿。

## 10. Build 结果

命令：

```bash
npm run build -- --outDir /tmp/partyonce_package_addons_upgrade_build --emptyOutDir
```

结果：

- Build 通过。
- 输出到 `/tmp/partyonce_package_addons_upgrade_build`。
- 未写入 / 未提交 `frontend/vue-app/dist`。

## 11. Browser / Virtual Consumer QA

Evidence 路径：

```text
/tmp/party_event_package_addons_upgrade_sprint1_20260516/
```

检查路由：

- `/`
- `/venue-finder`
- `/venue-finder/venue-marrickville-family-room`
- `/quote`
- `/my/quotes`
- `/my/orders`
- `/admin/quotes`
- `/admin/orders`
- `/payment/deposit`

结果：

- 9 / 9 routes HTTP 200
- 页面主体均可见
- console errors = 0
- page errors = 0
- failed requests = 0
- broken images = 0

虚拟消费者路径：

```text
Venue Finder → Marrickville Family Dining Room → /quote?source=venue_finder → add-on selection
```

结果：

- Venue Finder prefill 可见。
- Marrickville Family Dining Room 可见。
- 30 guests 可见。
- Venue Finder 卡片可见推荐 add-ons。
- Quote 页面可见 Venue Finder add-on suggestion panel。
- Add-on services 可见。
- 选择一个 add-on 后，总价从 `$1,974` 变为 `$2,194`。
- inquiry form 不再自动挡住 add-on 选择。

新增验收结果：

- `venueFinderHasRecommendedAddons = true`
- `quoteHasVenueFinderPrefill = true`
- `quoteHasRecommendedAddOnPanel = true`
- `totalChangedAfterSelectingAddon = true`

Round 2 追加验收：

- `/quote` 可见人工复核报价流程。
- `/quote` 可见基础 / 标准 / 高级套餐对比表。
- `/my/rewards` 可见简化后的分享返券流程。
- `/my/rewards` 可见 `$30 voucher`、免费气球升级、免费拍照角升级 placeholder。
- `/admin/social-rewards` 仍可打开审核队列。
- 11 / 11 routes HTTP 200。
- console errors = 0。
- page errors = 0。
- failed requests = 0。
- broken images = 0。

Round 3 运营化补强：

- `addOnServices` 已补充 `estimatedCost`、`grossMarginPlaceholder`、`supplierCategory`、`opsChecklist`，让运营能判断附加服务是否值得推荐。
- `quoteLineItems` 已把客户选择的 add-ons 写入 `optional_upgrade` line items，并保留成本 / 毛利占位字段。
- `AdminQuoteDetail` / `AdminOrderDetail` 已显示附加服务的供应商类别、成本占位、毛利占位和运营复核清单。
- Venue Finder 场地详情已显示餐饮、过敏、包间费、最低消费、验证状态等正式报价前必须人工确认的信息。
- Quote 页面 Venue Finder prefill 已显示 food / allergy / room hire / minimum spend 的人工复核提醒。
- 新增 `supplierVenueImportTemplate.js`，定义真实场地 / 供应商数据导入字段和 readiness checklist，为下一阶段替换 fixture 做准备。
- `/suppliers` 已显示真实数据导入 readiness panel，明确当前是 fixture，不会真实联系供应商。

Round 3 验收：

- `git diff --check` 通过。
- Vue SFC parse 通过：`QuotePage`、`VenueFinder`、`AdminQuoteDetail`、`AdminOrderDetail`、`SuppliersMap`。
- `npm run check:i18n` 结果：P0 = 0，P1 = 0，P2 = 149。
- `npm run build -- --outDir /tmp/partyonce_package_addons_upgrade_build --emptyOutDir` 通过。
- Playwright route smoke：9 / 9 routes HTTP 200。
- console errors = 0。
- page errors = 0。
- failed requests = 0。
- broken images = 0。
- 验收 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round3_browser_check_summary.json`。
- 注意：`/admin/orders` 在当前本地 fixture 下仍会显示到首页/公共体验内容，未出现报错；这属于既有 admin guard / demo routing 行为，本轮未扩大修复。

Round 4 客户侧信任度补强：

- `MyQuoteDetail` 已新增“套餐适配与人工复核流程”，说明当前报价不是即时扣款，正式报价前还要人工确认场地、食物、过敏、供应商和布置限制。
- `MyOrderDetail` 已新增“套餐、报价与下一步”，说明订单上下文、订金准备和 staging/demo 边界。
- 客户侧 Quote / Order 的场地与供应商上下文已显示 food / allergy checks、room hire、minimum spend 等关键信任信息。
- i18n 检查脚本已增强输出：现在会显示 `p2_by_locale` 和 `top_p2_prefixes`，并支持 `I18N_STRICT_P2=1` 用于更严格的多语言发布门禁。
- 最新 i18n 检查结果：P0 = 0，P1 = 0，P2 = 149；P2 分布为韩文 75、阿文 74，主要集中在已隐藏 AI 相关文案、城市/品牌/技术词和主题英文名。
- 最新浏览器验收：7 / 7 routes HTTP 200，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round4_browser_check_summary.json`。

Round 5 多语言收敛：

- 客户路径文案继续从 AI 主线改为 Venue Finder / 人工复核报价主线。
- 韩文 / 阿文中的明显英文残留已继续收敛，包含客户 Quote / Order 空态、首页 intro、Footer 服务名、隐藏 AI/3D 安全提示等。
- `check-i18n-residue.mjs` 增加占位符忽略和更合理的品牌 / 城市 / 技术词白名单，避免 `{count}`、`{total}` 等变量被误判为英文残留。
- `npm run check:i18n` 最新结果：P0 = 0，P1 = 0，P2 = 0。
- 最新 build 通过：`npm run build -- --outDir /tmp/partyonce_package_addons_upgrade_build --emptyOutDir`。
- 最新 Playwright 浏览器验收：9 / 9 routes HTTP 200，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- 最新关键检查：Quote / Order 人工复核说明可见，food / allergy checks 可见，首页不再显示客户可见 AI pitch。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round5_browser_check_summary.json`。

Round 6 分享返券规则简化：

- `socialRewardsService` 新增 `fixedRewardOffers`，把客户可见奖励收敛为 3 个容易理解的选项：`$30 party voucher`、`Free balloon upgrade`、`Free photo-corner upgrade`。
- `/my/rewards` 新增 “Simple reward options” 主区块，明确积分只是 local/staging 审核记账层，面向家长的规则应保持固定券 / 免费升级。
- `/admin/social-rewards` 新增 “Customer-facing fixed rewards” 审核口径，方便运营核验分享证明时按固定奖励发放 placeholder。
- 本轮仍不接真实优惠券、支付折扣、社交平台 API、webhook、n8n 或外发通知；审核结果仅为应用内 localStorage 状态。
- `git diff --check` 通过。
- `npm run check:i18n` 通过：P0 = 0，P1 = 0，P2 = 0。
- Vue SFC parse 通过：`MyRewards`、`AdminSocialRewards`。
- build 通过：`npm run build -- --outDir /tmp/partyonce_package_addons_upgrade_build --emptyOutDir`。
- Rewards browser smoke：4 / 4 routes HTTP 200，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- Rewards 关键检查：`/my/rewards`、`/share`、`/admin/social-rewards` 均可见 `$30 party voucher` / `Free balloon upgrade` 等固定奖励说明。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round6_rewards_browser_check_summary.json`。

Round 7 家长信任 FAQ 补强：

- 新增 `parentTrustContent` 数据层，集中维护家长关心的 5 个核心问题：是否即时预订、是否会扣款、场地数据是否真实承诺、为什么附加服务单列、分享奖励是否是真券。
- `/quote` 在价格明细区新增 “Parent trust FAQ”，把人工复核、订金准备、场地 food / allergy / minimum spend 复核边界前置到提交前。
- `/my/quotes/:id` 与 `/my/orders/:id` 新增“家长常见疑问”，让客户在报价和订单详情中继续看到一致的边界说明。
- 本轮不新增功能、不接真实支付、不接真实供应商、不外发消息；只增强客户理解和信任。
- `git diff --check` 通过。
- `npm run check:i18n` 通过：P0 = 0，P1 = 0，P2 = 0。
- Vue SFC parse 通过：`QuotePage`、`MyQuoteDetail`、`MyOrderDetail`。
- build 通过：`npm run build -- --outDir /tmp/partyonce_package_addons_upgrade_build --emptyOutDir`。
- Parent trust browser smoke：3 / 3 routes HTTP 200，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round7_parent_trust_browser_check_summary.json`。

Round 8 客户列表页信任提示前移：

- `/my/quotes` 新增 “Quote review promise” trust strip，明确报价卡片用于理解预算和方案，不会自动预订场地或触发订金支付。
- `/my/orders` 新增 “Order readiness promise” trust strip，明确订单状态仍需人工确认场地与供应商，订金准备不会自动扣款、派单或外发消息。
- 两个列表页复用 `parentTrustContent` 的 checklist，让客户在列表层就能看到 human review / no instant payment / food allergy checks / optional add-ons / staging demo 的关键边界。
- `git diff --check` 通过。
- `npm run check:i18n` 通过：P0 = 0，P1 = 0，P2 = 0。
- Vue SFC parse 通过：`MyQuotes`、`MyOrders`。
- build 通过：`npm run build -- --outDir /tmp/partyonce_package_addons_upgrade_build --emptyOutDir`。
- Customer list trust browser smoke：2 / 2 routes HTTP 200，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round8_customer_list_trust_browser_check_summary.json`。

Round 9 后台队列运营解释前移：

- `/admin/quotes` 新增 “Ops quote explanation” 面板，提醒运营在正式报价前确认场地规则、food/allergy、供应商可用性和可推荐的高利润附加服务。
- `/admin/orders` 新增 “Ops delivery readiness” 面板，提醒运营在订单队列层确认服务交付边界、订金 readiness 和供应商确认状态。
- 两个后台列表页都展示人工复核 checklist 和高利润服务入口：On-site styling、Setup/pack-down、Kids party host、Cake/dessert。
- 后台 Quote / Order 队列在本地前端 preview 环境默认使用安全 fallback，除非显式设置 `VITE_ENABLE_REMOTE_QUOTE_API=true` / `VITE_ENABLE_REMOTE_ORDER_API=true`，避免无后端时产生 CORS console noise。
- 本轮不新增后端字段、不触发外部系统，只把运营解释从详情层前移到队列层。
- `git diff --check` 通过。
- `npm run check:i18n` 通过：P0 = 0，P1 = 0，P2 = 0。
- Vue SFC parse 通过：`AdminQuotes`、`AdminOrders`。
- build 通过：`npm run build -- --outDir /tmp/partyonce_package_addons_upgrade_build --emptyOutDir`。
- Admin ops queue browser smoke：2 / 2 routes HTTP 200，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round9_admin_ops_queue_browser_check_summary.json`。

Round 10 场地筛选与支付准备页信任边界收口：

- `/venue-finder` 新增 “For parents comparing venues” trust strip，明确 Venue Finder 是帮助家长筛选 shortlist，不是实时预订、真实餐厅库或自动扣款。
- `/payment/deposit` 新增 “Parent-safe payment boundary” 面板，明确 preview 中不会扣卡，必须先经过人工复核正式报价，再进入单独批准的订金步骤。
- 两个页面复用 `parentTrustContent` 的 checklist，保持 human review / no instant payment / food allergy checks / optional add-ons / staging demo 的表述一致。
- `git diff --check` 通过。
- `npm run check:i18n` 通过：P0 = 0，P1 = 0，P2 = 0。
- Vue SFC parse 通过：`VenueFinder`、`PaymentDeposit`。
- build 通过：`npm run build -- --outDir /tmp/partyonce_package_addons_upgrade_build --emptyOutDir`。
- Parent trust boundary browser smoke：2 / 2 routes HTTP 200，page body non-empty，trust copy visible，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round10_trust_payment_venue_browser_check_summary.json`。

Round 11 全主线复验：

- 验收路线：
  - `/`
  - `/venue-finder`
  - `/venue-finder/venue-marrickville-family-room`
  - `/quote?source=venue_finder&venue=venue-marrickville-family-room&theme=space&scene=restaurant-a&package=standard`
  - `/my/quotes`
  - `/my/orders`
  - `/my/rewards`
  - `/admin/quotes`
  - `/admin/orders`
  - `/admin/social-rewards`
  - `/payment/deposit`
- Result: 11 / 11 routes HTTP 200，page body non-empty，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- Safety text scan:
  - customer-facing AI entry detected: 0 routes.
  - visible PaymentIntent / payment intent wording: 0 routes.
  - visible Stripe wording: 0 routes.
- Mainline coverage:
  - Home keeps Venue Finder visible and AI customer entry hidden.
  - Venue Finder shows venue shortlist, add-ons, and human review boundary.
  - Venue detail shows food / allergy / room hire / minimum spend checks.
  - Quote shows Venue Finder prefill, package comparison, optional add-ons, line items, and human review boundary.
  - Customer quote / order list pages show trust boundaries and add-on context.
  - Rewards pages show fixed voucher / free upgrade placeholder flow.
  - Admin queues show ops explanation and fallback without API console noise.
  - Payment readiness page uses test / preview wording without customer-visible PaymentIntent or Stripe copy.
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round11_full_sprint_browser_check_summary.json`。

Round 12 虚拟澳洲家长转化验收：

- Persona:
  - 澳洲中产家长。
  - 10 adults + 20 kids，总计 30 guests。
  - 目标区域：Marrickville / Mascot。
  - 预算：中等，约 `$25-$45` per person。
  - 优先级：先找场地，再理解主题 / 套餐 / 附加服务，最后提交人工复核报价。
- 验收路径：
  - `/venue-finder`
  - click `Use 30 guest family sample`
  - click `Use this venue for quote`
  - `/quote?source=venue_finder&venue=venue-marrickville-family-room&theme=castle&scene=restaurant-a&package=standard`
  - select 3 add-on service cards.
- 结果：
  - Venue Finder 可显示 Marrickville、30 guests、中等预算、add-ons、formal quote / manual review boundary。
  - Quote prefill 可显示 Venue Finder prefill、Marrickville Family Dining Room、30 guests、套餐对比、line items、人工复核边界。
  - Quote 可选择 3 个高利润附加服务，显示 selected add-ons subtotal，并且没有 PaymentIntent / payment intent 文案或真实支付触发。
  - console errors = 0，page errors = 0，failed requests = 0，broken images = 0。
- P0：无。
- P1：无。
- P2：
  - 仍使用 local/staging fixture venues，不是真实餐厅数据。
  - Add-on services 已清楚，但仍需要真实供应商图片和成本验证。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round12_virtual_consumer_conversion_acceptance.json`。

Round 13 家长社会证明 / 常见选择样例：

- 新增 `parentSocialProof` 数据层，包含 staging sample parent proof 和 common family choice patterns。
- 所有样例都明确标注不是正式真实客户评价，public launch 前必须替换为 verified testimonials。
- `/venue-finder` 新增 “Common family choices · staging samples” 区块，帮助家长理解 30 人中等预算通常可以从 Standard package + setup / dessert table / photo corner 开始。
- `/quote` 新增 “Family decision patterns · staging samples” 区块，在报价页解释 budget-control、most practical starting point、high-impact photo path 的区别。
- Browser smoke:
  - `/venue-finder`
  - `/quote?source=venue_finder&venue=venue-marrickville-family-room&theme=castle&scene=restaurant-a&package=standard`
  - Result: 2 / 2 HTTP 200，family choice samples visible，staging disclosure visible，AI customer entry hidden，console errors 0，page errors 0，failed requests 0，broken images 0。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round13_social_proof_browser_check_summary.json`。

Round 14 套餐对比前置：

- 新增 `/packages` 页面，把 Basic / Standard / Premium 对比从 Quote 页前置成可直接访问的客户教育入口。
- 页面内容包括：
  - 三档套餐价格区间和适合家庭。
  - 详细对比表：视觉目标、包含内容、适合客群、年龄/人数、价格区间、升级差异。
  - 高利润附加服务分组：省心执行、视觉升级、孩子体验、餐饮甜品。
  - 人工复核 / 不即时预订 / 不即时扣款信任边界。
- `NavHeader` 新增 Packages / 套餐 / 패키지 / الباقات 入口。
- `/packages` 的 “Use this package” CTA 可进入 `/quote?package=...`。
- Browser smoke:
  - `/` nav package entry visible。
  - `/packages` HTTP 200，三档套餐、对比表、add-ons、trust boundary 可见，broken images = 0。
  - `/quote?package=basic` HTTP 200，Quote 可承接 package query，PaymentIntent 文案不可见。
  - console errors 0，page errors 0，failed requests 0。
- 最新 evidence：`/tmp/party_event_package_addons_upgrade_sprint1_20260516/round14_package_guide_browser_check_summary.json`。

## 12. Safety Boundaries

本轮没有触发：

- 真实 payment / Stripe / PaymentIntent
- webhook / n8n
- email / SMS / WhatsApp / 社交平台外发
- Google Maps / Places API
- 真实餐厅库
- production deploy
- production database

本轮未读取或修改：

- `.env.production`

本轮未提交：

- `dist`
- `node_modules`
- `EvidencePack`
- `test_evidence`
- `.DS_Store`
- `backend/__pycache__`

## 13. P0 / P1 / P2

P0：

- 无。

P1：

- 当前 add-ons 仍是 local/staging fixture，未接真实供应商报价。
- 附加服务已有 Canva 营销卡片候选，但尚未由 owner 选择并导出为正式 App runtime asset。
- 附加服务仍缺少真实 before/after 现场图片，后续可用 Canva 或真实素材增强转化。
- Quote 页面仍有部分旧的 dark visual language，后续可进一步装修为更温暖亲子风格。

P2：

- 可继续细化每个 add-on 的适合年龄、适合人数、准备时间。
- 可将真实 supplier availability 从占位字段升级为后台可编辑字段。
- 可继续把 food / allergy / room hire 字段扩展到所有 fixture 场地，而不只是首批样板。

## 14. Completion Status

本轮套餐 + 高利润附加服务转化升级已完成到 local/staging 可验收状态。

可交付结果：

- 数据层：add-on services 结构化完成。
- Venue Finder：可按场地能力推荐附加服务。
- Quote：可展示并选择附加服务，进入 `optional_upgrade` line items。
- Quote：已新增人工复核报价流程说明。
- Quote：已新增基础 / 标准 / 高级套餐对比表。
- Package Guide：已新增 `/packages` 独立套餐对比页，让家长进入 Quote 前即可理解三档差异和附加服务。
- Venue Finder：已补充家长信任说明，明确这是 shortlist，不是实时预订或扣款。
- Payment readiness：已补充家长安全边界，明确 preview 不会扣卡，必须先人工复核正式报价。
- Payment wording：全主线复验确认客户可见 PaymentIntent / Stripe 字样为 0。
- Quote inquiry：已新增食物 / 过敏 / 蛋糕甜品 / 家长优先级字段，让人工复核能处理真实澳洲家庭关心的餐食、过敏和现场省心需求。
- Customer detail：可解释套餐与附加服务价值。
- Virtual consumer QA：30 人 Marrickville/Mascot 中等预算路径通过，能从 Venue Finder 进入 Quote 并选择高利润附加服务。
- Social proof：已新增 staging sample 家长常见选择模式，但明确不是正式真实评价。
- Admin detail：可看到报价依据和运营解释。
- Admin detail：可看到 add-on 成本 / 毛利 / 供应商类别占位和复核清单。
- Rewards：已清晰化为分享证明提交 + 后台审核 + voucher / free upgrade placeholder。
- Venue / Supplier readiness：已建立真实数据导入字段和人工复核 checklist。
- i18n：已建立本地残留检查脚本并清理 P0/P1。
- i18n：韩文 / 阿文 P2 英文残留已收敛到 0。
- 多语言：附加服务核心文案已补齐中英韩阿。
- 技能调用：Playwright / Computer Use / Canva 均已纳入工作流。
- 构建与浏览器验收：通过，最新全主线 11 / 11 routes 通过。
- Round 15 Quote form 验收：`/quote` Venue Finder prefill 路径可填写并提交食物、过敏、蛋糕甜品和家长优先级信息；console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round15_food_allergy_quote_form_check_summary.json`。
- Round 16 Detail context 验收：客户 Quote Detail、客户 Order Detail、后台 Quote Detail、后台 Order Detail 均可展示 Family Requirements Review / 家庭餐食与现场需求；静态预览下 Admin Quote Detail 不再请求远端 Quote API，避免 CORS console 噪音。4 / 4 routes 通过，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round16_family_requirements_detail_pages_check_summary.json`。
- Round 17 Venue Finder parent checks：场地结果卡新增 Parent checks before quote，Compare 面板新增 Food check / Allergy check / Min spend，让家长在 shortlist 阶段即可看到餐食、过敏和最低消费风险。`/venue-finder` 验收通过，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round17_venue_finder_parent_checks_summary.json`。
- Round 18 Quote-to-deposit clarity：新增统一四步流程数据源，并在 My Quote Detail、My Order Detail、Payment readiness 中展示“选择场地/主题/套餐 → 提交需求 → 人工复核 → 订金准备”路径，强化不会即时扣款的边界。3 / 3 routes 通过，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round18_quote_process_payment_clarity_summary.json`。
- Round 19 Venue Detail conversion bridge：`/venues/restaurant-a` 已补充 Parent decision checks、Food options、Allergy handling、Room hire、Minimum spend 与 Quote process，不再只是视觉资产页；`Use in Quote Request` 会通过现有 Venue Finder prefill 机制进入 `/quote?source=venue_finder...`，并带入 Marrickville Family Dining Room、30 guests、food/allergy/room/minimum spend 信息。2 / 2 flow checks 通过，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round19_venue_detail_quote_bridge_summary.json`。
- Round 20 Admin ops alignment：Admin Quote Detail 与 Admin Order Detail 已加入 Ops quote-to-deposit checklist，后台运营与客户侧使用同一套“选择方案 → 提交需求 → 人工复核 → 订金准备”解释口径；`pending_deposit` 仍明确为 business status / readiness-only。2 / 2 admin routes 通过，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round20_admin_quote_order_process_check_summary.json`。
- Round 21 Package Guide family choice patterns：`/packages` 已加入 staging sample family choice patterns，说明 25-35 人中等预算家庭通常可从 Standard package + setup / cake / photo corner 开始；页面明确这些不是正式真实评价，只是 preview testing patterns，避免误导。`/packages` 200，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round21_package_guide_family_choices_summary.json`。
- Round 22 Customer list process clarity：`/my/quotes` 与 `/my/orders` 列表页已加入统一四步流程 strip，让家长在列表层即可看到“选择场地/主题/套餐 → 提交需求 → 人工复核 → 订金准备”；两个页面继续明确不会自动预订、扣款、派单或外发。2 / 2 customer routes 通过，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round22_customer_list_process_steps_summary.json`。
- Round 23 Customer detail family choice patterns：`/my/quotes/quote-local-501` 与 `/my/orders/order-local-1001` 详情页已加入“类似家庭通常怎么选”说明，帮助家长理解为什么 25-35 人中等预算场景通常从 Standard package、setup support、cake / dessert、photo corner 等组合开始；页面明确这些是 staging sample planning patterns，不是真实客户评价。2 / 2 detail routes 通过，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round23_customer_detail_family_choices_summary.json`。
- Round 24 Final route smoke：重新执行 build 后对 12 条主线路由做浏览器 smoke：`/`、`/venue-finder`、`/venue-finder/venue-marrickville-family-room`、`/packages`、Venue Finder → `/quote` prefill、`/my/quotes`、`/my/quotes/quote-local-501`、`/my/orders`、`/my/orders/order-local-1001`、`/admin/quotes/1`、`/admin/orders/order-local-1001`、`/payment/deposit?source=quote_readiness&quote=quote-local-501`。12 / 12 routes 通过，HTTP 200，页面非空，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round24_final_package_addons_route_smoke_summary.json`。
- Round 25 Add-on value story guide：`/quote` 附加服务区新增 Add-on value guide，用 Before / After 的家长语言解释三类高利润服务价值：省心执行、照片出片、孩子参与；卡片内的服务按钮可直接勾选对应 add-on 并进入 selected add-ons subtotal。`/quote?source=venue_finder...` 通过，HTTP 200，value guide 可见，按钮可点，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round25_quote_addon_value_story_check_summary.json`。
- Round 26 Customer detail add-on story extension：`/my/quotes/quote-local-501` 与 `/my/orders/order-local-1001` 已复用 add-on value stories，让客户在 Quote / Order 详情中继续看到“家长不用自己搬、摆、收”“照片更像主题派对”“孩子真的参与”等价值解释；两个页面仍明确 staging / 人工确认 / 不自动扣款边界。2 / 2 routes 通过，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round26_customer_detail_addon_story_extension_summary.json`。
- Round 27 Final local release gate：重新执行 `npm run check:i18n`，结果 P0 = 0、P1 = 0、P2 = 0，中文 / 韩文 / 阿文残留均为 0；重新执行 build 到 `/tmp/partyonce_package_addons_upgrade_build` 通过；随后浏览器 smoke 14 条主线路由：`/`、`/venue-finder`、`/venue-finder/venue-marrickville-family-room`、`/packages`、Venue Finder → `/quote` prefill、`/my/quotes`、`/my/quotes/quote-local-501`、`/my/orders`、`/my/orders/order-local-1001`、`/my/rewards`、`/admin/quotes/1`、`/admin/orders/order-local-1001`、`/admin/social-rewards`、`/payment/deposit?source=quote_readiness&quote=quote-local-501`。14 / 14 routes 通过，HTTP 200，页面非空，console errors = 0，page errors = 0，failed requests = 0，broken images = 0。Evidence: `/tmp/party_event_package_addons_upgrade_sprint1_20260516/round27_final_i18n_build_route_gate_summary.json`。

仍不属于本轮完成范围：

- 真实供应商报价。
- 真实餐厅数据库。
- 真实 payment / Stripe。
- 真实 webhook / n8n。
- 正式 Canva 图导出与 App runtime 接入。
- production deploy。

## 14. 下一步建议

建议下一步不恢复 AI / 3D，而是继续沿当前主线推进：

1. 为 3 个最重要 add-ons 补 before/after 或 Canva 视觉卡片：拍照区、主持、甜品台。
2. 把 add-on 成本 / 毛利占位字段接入后台可编辑草稿，而不只是从 fixture 生成。
3. 用新建的真实供应商 / 场地导入模板收集首批 10-20 个真实餐厅和服务商。
4. 对韩文 / 阿文 P2 英文审查项做逐页人工润色。
5. 进行 10 个虚拟澳洲家长二轮测试，重点看 add-ons 是否提高提交 inquiry 意愿。
