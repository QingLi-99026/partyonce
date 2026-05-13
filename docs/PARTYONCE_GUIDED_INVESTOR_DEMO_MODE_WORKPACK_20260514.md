# PartyOnce Guided Demo Mode / 投资人引导演示模式 Workpack V1

## 1. 本轮目标

新增一个受控的投资人演示入口，让 Preview 不再依赖投资人自行探索所有路由。

目标路径：

欢迎首页 → AI 帮我推荐 → 主题 / 套餐 / 餐厅渲染 → 自动预填 Quote → 客户 My Quotes / My Orders → 后台 Admin Quote / Order → 供应商与支付 readiness → staging 状态与上线计划。

## 2. 修改 / 新增文件

- `frontend/vue-app/src/views/InvestorDemoMode.vue`
- `frontend/vue-app/src/services/investorDemoService.js`
- `frontend/vue-app/src/router/index.js`
- `frontend/vue-app/src/components/NavHeader.vue`
- `docs/PARTYONCE_GUIDED_INVESTOR_DEMO_MODE_WORKPACK_20260514.md`

## 3. 新增入口

新增路由：

`/investor-demo`

导航新增：

`Investor Demo`

## 4. Demo bootstrap 行为

`investorDemoService.js` 提供：

- `startInvestorGuidedDemo()`
- `bootstrapInvestorCustomerFixture()`
- `bootstrapInvestorAdminFixture()`
- `seedInvestorAiInquiry()`
- `clearInvestorGuidedDemo()`

写入内容只限浏览器本地：

- `localStorage.userInfo`
- `localStorage.token`（仅 admin demo fixture）
- `localStorage.inquirySubmissions`
- `localStorage.partyonce_ai_concierge_intake_v1`
- `localStorage.partyonce_ai_concierge_quote_prefill_v1`
- `sessionStorage.partyonce_ai_concierge_quote_prefill_v1`

不连接生产 auth，不连接生产数据库，不触发外部系统。

## 5. Guided Demo 页面结构

`InvestorDemoMode.vue` 包含：

1. 欢迎首页和演示边界说明
2. 一键开始投资人演示
3. 一键启用后台演示身份
4. 清除演示样例
5. 六步 progress：
   - 首页
   - AI 推荐
   - Quote 预填
   - 客户侧 Quote / Order
   - 后台 Admin Quote / Order
   - 供应商 / 支付 readiness
6. 快速路由板：
   - Customer Story
   - Operations Story
   - Supply / Readiness
7. Staging 当前状态与下一步上线计划

## 6. 安全边界

本轮没有：

- production deploy
- production DB
- `.env.production` 读取或修改
- `frontend/vue-app/dist` 提交
- Stripe live mode
- PaymentIntent
- webhook / n8n
- email / SMS / WhatsApp 外发
- 真实 supplier dispatch

## 7. 本地验证

执行：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_guided_demo_build --emptyOutDir
```

结果：通过。

Route smoke 覆盖：

- `/investor-demo`
- `/`
- `/ai-voice-intake`
- `/quote?theme=space&package=standard&scene=restaurant-a&source=ai_concierge`
- `/my/quotes`
- `/my/orders`
- `/admin/quotes`
- `/admin/orders`
- `/suppliers`
- `/payment/deposit`
- `/admin/notifications/dry-run`

## 8. Preview 计划

本地验证通过后 push release candidate branch，触发 Vercel Preview redeploy。

Preview URL：

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

建议投资人入口：

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/investor-demo`

## 9. 下一步建议

下一步可以围绕 `/investor-demo` 做一次真实人眼 walkthrough，确认：

- 投资人是否能按页内路径完成演示
- admin fixture 是否足够顺滑
- staging / production No-Go 边界是否清楚
- 是否需要隐藏普通导航中的过多工程入口
