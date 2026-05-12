# PARTYONCE_CUSTOMER_FIXTURE_BOOTSTRAP_WORKPACK_20260510

生成时间：2026-05-12

## 1. 本轮目标

为 local/staging 验收增加一键 customer fixture bootstrap，让验收人员无需手动写 `localStorage` 或 header，就能进入 customer read-only demo 身份。

默认 fixture：

- customer id：`customer-local-41`
- customer name：`Ava Thompson`
- contact：`ava.parent@example.test`
- scope：`local_staging_only`

## 2. 实现内容

新增/增强：

- `customerExperienceService.js`
  - 导出 `localCustomerFixture`。
  - 新增 `bootstrapLocalCustomerFixture()`。
  - 新增 `clearLocalCustomerFixture()`。
  - bootstrap 只写本地 `userInfo` fixture，不写 customer token，不连接生产 auth。
- `LocalDemoHub.vue`
  - 增加“启用本地客户身份”按钮。
  - 增加 My Quotes / My Orders 快捷入口。
  - 增加 local/staging only 说明。
  - walkthrough 增加 bootstrap customer 步骤。
- `NavHeader.vue`
  - 未登录状态增加“本地客户身份”按钮。
  - 登录下拉增加“本地客户身份”命令。

## 3. 安全边界

本轮未做：

- 真实 payment / Stripe
- PaymentIntent
- webhook
- n8n
- email / SMS / WhatsApp 外发
- production deploy
- push
- build / dist

本轮未读取、未修改：

- `.env.production`

## 4. 验收结果

通过。

浏览器验收环境：

- Vite local dev server：`http://127.0.0.1:3000`
- Playwright headless Chromium

验收项：

- Local Demo Hub 可见 bootstrap 入口：通过。
- 点击 bootstrap 后写入本地 customer demo identity：通过。
- 页面跳转 My Quotes：通过。
- `localStorage.userInfo.customer_fixture_id` 为 `customer-local-41`：通过。
- My Quotes 显示 `customer-local-41` / `Ava Thompson`：通过。
- My Quotes 显示本人 quote `PE-Q-0501`：通过。
- My Quotes 不显示其它 fixture quote `PE-Q-0502`：通过。
- My Orders 显示 `customer-local-41` / `Ava Thompson`：通过。
- My Orders 显示本人 order `PE-ORD-1001`：通过。
- My Orders 不显示其它 fixture order `PE-ORD-1002`：通过。
- 页面明确显示 local/staging / payment blocked 边界：通过。
- 浏览器 console error：0。

## 5. 是否提交 dist

否。

## 6. 是否触发外部系统

否。

## 7. commit hash

待本地 commit 后回填。

## 8. 下一步建议

下一步建议将此 bootstrap 写入本地/staging 验收脚本，作为客户侧 read-only demo 的标准入口。

