# PARTYONCE_CUSTOMER_EXPERIENCE_CLOSED_LOOP_WORKPACK_20260510

生成时间：2026-05-12

## 1. 客户端现有页面盘点

本轮施工前盘点：

- `/my/inquiries`：已存在，页面为 `frontend/vue-app/src/views/InquiryList.vue`，使用浏览器 localStorage 展示客户咨询记录。
- `/my/quotes`：施工前不存在，本轮新增。
- `/my/quotes/:id`：施工前不存在，本轮新增。
- `/my/orders`：施工前不存在，本轮新增。
- `/my/orders/:id`：施工前不存在，本轮新增。
- `/orders`：已存在 legacy 订单页，页面为 `frontend/vue-app/src/views/Orders.vue`，仍保留原有 requiresAuth 行为。
- `/quotes`：施工前不存在，本轮新增 redirect 到 `/my/quotes`。

本轮选择：

- 优先硬化已有 `/my/inquiries` 和 legacy `/orders` 的周边入口，不重写它们。
- 新增客户侧只读 My Quotes / Quote Detail / My Orders / Order Detail。
- 使用 local/staging demo data 和本地 order skeleton，不启用真实 payment / webhook / n8n / outbound。

## 2. 本轮实际修改文件

新增：

- `frontend/vue-app/src/services/customerExperienceService.js`
- `frontend/vue-app/src/views/MyQuotes.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/MyOrders.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `docs/PARTYONCE_CUSTOMER_EXPERIENCE_CLOSED_LOOP_WORKPACK_20260510.md`

修改：

- `frontend/vue-app/src/router/index.js`
- `frontend/vue-app/src/components/NavHeader.vue`
- `frontend/vue-app/src/views/LocalDemoHub.vue`

未修改：

- backend
- payment / Stripe / webhook / n8n
- deployment
- `.env.production`
- `frontend/vue-app/dist`

## 3. My Quotes 完成情况

完成。

客户侧 `/my/quotes` 可展示：

- `quote_number`
- `status`
- status 中文说明
- theme / package / selection snapshot
- amount
- `valid_until`
- `created_at`
- next step

支持状态：

- `draft`：后台正在准备
- `sent`：报价已发送
- `accepted`：报价已接受
- `rejected`：报价已拒绝
- `expired`：报价已过期

边界：

- 只读展示。
- 不提供在线支付按钮。
- 不创建 PaymentIntent。

## 4. Quote Detail 完成情况

完成。

客户侧 `/my/quotes/:id` 可展示：

- quote number
- status / status meaning
- amount
- valid until
- theme
- package
- venue / location snapshot
- guest count
- event date
- customer summary
- line item snapshot
- next step

本轮 demo 详情样例：

- `/my/quotes/quote-local-501`

## 5. My Orders 完成情况

完成。

客户侧 `/my/orders` 可展示：

- `order_number`
- `status`
- status 中文说明
- quote number
- `event_date`
- `event_location`
- `total_amount`
- `deposit_amount` placeholder
- next step

支持状态：

- `draft`
- `pending_deposit`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`

边界：

- `pending_deposit` 只是业务状态。
- 本轮没有真实 Stripe 支付。

## 6. Order Detail 完成情况

完成。

客户侧 `/my/orders/:id` 可展示：

- order number
- quote number
- status / status meaning
- event date
- event location
- theme
- package
- guest count
- total amount
- deposit placeholder
- line item snapshot
- next step
- `pending_deposit` 非真实支付说明

本轮 demo 详情样例：

- `/my/orders/order-local-1002`

## 7. 本地验收结果

本轮使用安全 local/staging demo profile。

验收结果：

- Lead 创建：未重新触发真实 backend 创建；客户 inquiry 使用已有 `/my/inquiries` localStorage demo 链路，Local Demo Hub 可生成本地留资样例。
- Quote 创建：未重新触发 backend 创建；客户 My Quotes 使用 `customerExperienceService.js` 中 local/staging demo quote fixture，并可读取本地 inquiry 生成的 quote-like draft。
- Order 创建：未重新触发 backend 创建；客户 My Orders 使用既有 `adminOrders` local skeleton seed。
- 客户侧 My Quotes 可访问：通过。
- 客户侧 Quote Detail 可访问：通过。
- 客户侧 My Orders 可访问：通过。
- 客户侧 Order Detail 可访问：通过。
- 页面 route 返回 200：通过 Playwright browser navigation 验证。

说明：

- 当前没有真实 customer auth fixture。
- 本轮客户侧页面使用只读演示模式。
- 该模式可用于展示客户理解报价和订单进度，但不能当成真实线上客户账户能力。

## 8. 浏览器验收结果

使用 Vite dev server：

- URL：`http://127.0.0.1:3000/`
- 未运行 production build。
- 未提交 `dist`。

Playwright 验收路由：

- `/`：200，无 console error
- `/local-demo`：200，无 console error
- `/my/inquiries`：200，无 console error
- `/my/quotes`：200，无 console error
- `/my/quotes/quote-local-501`：200，无 console error
- `/my/orders`：200，无 console error
- `/my/orders/order-local-1002`：200，无 console error
- `/quotes`：200，无 console error，redirect 到 My Quotes 体验

浏览器验收结论：

- 通过。

## 9. 是否触发外部系统

否。

未触发：

- payment / Stripe
- PaymentIntent
- webhook
- n8n
- email
- SMS
- WhatsApp
- production deployment

## 10. 是否读取/修改 .env.production

否。

本轮未读取、未修改 `.env.production`。

## 11. 是否提交 dist

否。

本轮未运行 production build，未修改或提交 `frontend/vue-app/dist`。

## 12. blocker

无阻断本轮客户侧闭环演示的 blocker。

已知限制：

- 没有真实 customer auth fixture。
- My Quotes / My Orders 使用 local/staging demo data 和 skeleton seed。
- Lead / Quote / Order 的真实后端创建链路不在本轮扩展范围内。
- Payment / Stripe / webhook / n8n / deployment 仍然阻断。

## 13. commit hash

待本轮本地 commit 后回填。

## 14. 下一步建议

下一步建议进入第 2 块：customer-facing read-only API hardening。

建议范围：

- 明确客户身份 fixture 或 demo token。
- 为 customer quote/order read-only API 定义后端只读 skeleton。
- 继续保持 payment / webhook / n8n / deployment 阻断。
- 不进入 Stripe，直到客户侧 quote/order read-only auth 边界稳定。

