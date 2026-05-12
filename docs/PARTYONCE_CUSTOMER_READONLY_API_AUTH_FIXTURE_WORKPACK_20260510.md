# PARTYONCE_CUSTOMER_READONLY_API_AUTH_FIXTURE_WORKPACK_20260510

生成时间：2026-05-12

## 1. 本轮目标

把客户侧 My Quotes / Quote Detail / My Orders / Order Detail 从纯本地演示数据推进到 local/staging read-only API / auth fixture 可验收状态。

目标链路：

- 客户登录或 local/staging fixture 身份
- 只能看到自己的 quotes / orders
- My Quotes 读取客户相关 Quote
- Quote Detail 读取客户相关 Quote detail
- My Orders 读取客户相关 Order
- Order Detail 读取客户相关 Order detail
- 非本人或匿名访问被阻断，或 fallback 明确标注

本轮不做：

- payment / Stripe / PaymentIntent
- webhook / n8n
- email / SMS / WhatsApp
- customer self-service quote acceptance
- production deployment

## 2. 当前客户侧页面盘点

施工前状态：

- `customerExperienceService.js`：使用 local/staging demo data，未连接 customer read-only API，未按 customer identity 过滤。
- `MyQuotes.vue`：可展示 quote list，但来源是本地 demo data。
- `MyQuoteDetail.vue`：可展示 quote detail，但来源是本地 demo data。
- `MyOrders.vue`：可展示 order list，但来源是本地 admin order skeleton seed。
- `MyOrderDetail.vue`：可展示 order detail，但来源是本地 admin order skeleton seed。
- `router/index.js`：客户侧 routes 已存在，但未标记 customer fixture 边界。
- 现有 user store：`frontend/vue-app/src/store/index.js` 中已有 `token` / `userInfo` / `isLoggedIn` / `isAdmin` / `isPartner`。
- 现有 quote/order API：backend 已有 admin-only `/api/quotes*` 和 `/api/orders*` skeleton。

## 3. 是否接入 read-only API / fixture

已接入。

前端：

- `customerExperienceService.js` 现在优先尝试 customer read-only API：
  - `GET /api/my/quotes`
  - `GET /api/my/quotes/{quote_id}`
  - `GET /api/my/orders`
  - `GET /api/my/orders/{order_id}`
- 如果没有 customer token 或 numeric `customer_id` fixture，明确 fallback 到 `local/staging filtered fixture`。
- 默认 local/staging fixture customer：
  - `customer-local-41`
  - `Ava Thompson`
  - `ava.parent@example.test`
- fallback 数据按 customer id 过滤，只展示当前 fixture customer 的 quote/order。
- admin / manager token 不会被当作 customer token 使用。

后端：

- `backend/main.py` 新增 customer-facing read-only skeleton：
  - `GET /api/my/quotes`
  - `GET /api/my/quotes/{quote_id}`
  - `GET /api/my/orders`
  - `GET /api/my/orders/{order_id}`
- 支持 `X-PartyOnce-Customer-Id` local/staging fixture header。
- 支持非 admin 用户通过 email/contact 匹配 local SQLite customer。
- 匿名访问返回 `401 Customer auth fixture required`。
- admin / manager token 返回 `403 Admin token cannot be used as customer token`。
- 非本人 quote/order detail 返回 `404`。
- 不新增写接口，不创建 quote/order/payment，不触发外部系统。

## 4. My Quotes 验收结果

通过。

显示字段：

- `quote_number`
- `status`
- amount
- theme / package / selection snapshot
- `created_at`
- `valid_until`
- next step
- data source / customer identity / fallback reason

状态文案：

- `draft`：报价准备中
- `sent`：报价已发送
- `accepted`：报价已接受
- `rejected`：报价已拒绝
- `expired`：报价已过期

浏览器验证：

- `/my/quotes` 返回 200。
- 页面只显示 `customer-local-41` 的 `PE-Q-0501`。
- 不显示其它 fixture customer 的 `PE-Q-0502`。
- console error：无。

## 5. Quote Detail 验收结果

通过。

显示字段：

- `quote_number`
- `status`
- selection snapshot
- pricing / final total
- `created_at`
- `valid_until`
- next step
- data source / customer identity / fallback reason

边界：

- Accept Quote 按钮为 disabled / coming soon。
- Pay Deposit 按钮为 disabled / blocked。
- 不生成订单。
- 不触发 payment。

浏览器验证：

- `/my/quotes/quote-local-501` 返回 200，并显示当前 fixture customer 的 quote。
- `/my/quotes/quote-local-502` 返回 200 页面壳，但显示 `Quote not found`，不泄露其它 customer 的 quote 内容。
- console error：无。

## 6. My Orders 验收结果

通过。

显示字段：

- `order_number`
- `status`
- `quote_number`
- `event_date`
- `event_location`
- `total_amount`
- `deposit_amount` placeholder
- next step
- data source / customer identity / fallback reason

状态文案：

- `draft`
- `pending_deposit`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`

边界：

- `pending_deposit` 明确标注只是业务状态，不是 Stripe 付款状态。

浏览器验证：

- `/my/orders` 返回 200。
- 页面只显示 `customer-local-41` 的 `PE-ORD-1001`。
- 不显示其它 fixture customer 的 `PE-ORD-1002`。
- console error：无。

## 7. Order Detail 验收结果

通过。

显示字段：

- `order_number`
- `status`
- event details
- amount
- deposit placeholder
- quote reference
- next step

边界：

- Pay Deposit 按钮 disabled。
- Open Stripe 按钮 disabled。
- 不触发 Stripe / PaymentIntent / webhook / n8n。

浏览器验证：

- `/my/orders/order-local-1001` 返回 200，并显示当前 fixture customer 的 order。
- `/my/orders/order-local-1002` 返回 200 页面壳，但显示 `Order not found`，不泄露其它 customer 的 order 内容。
- console error：无。

## 8. auth / customer identity 当前真实状态

当前状态：

- frontend store 已有 token / userInfo。
- 本轮新增 customer read-only identity resolver。
- local/staging fallback 默认 fixture 为 `customer-local-41`。
- 如果存在非 admin user token 且可匹配 backend local SQLite customer，API 可按该 customer 返回数据。
- 如果存在 numeric `userInfo.customer_id` 或 `userInfo.customerId`，前端会通过 `X-PartyOnce-Customer-Id` 调用 read-only API。
- admin / manager token 不作为 customer token 使用。

真实限制：

- 仍没有生产级 customer auth fixture。
- 仍没有真实客户账户绑定流程。
- 本轮只达到 local/staging read-only API / fixture hardening。

## 9. 是否仍使用 demo data

是，但已从“全量 demo data”硬化为“按 local customer fixture 过滤的 demo data fallback”。

使用 demo data 的条件：

- 无 customer token。
- 无 numeric customer API fixture。
- local backend read-only API 不可用。

页面会展示 data source 和 fallback reason。

## 10. 本地/staging 验收结果

静态检查：

- `python3 -m py_compile backend/main.py`：通过。
- `git diff --check`：通过。

前端浏览器验收：

- Vite local dev server：`http://127.0.0.1:3000`
- `/my/quotes`：200，无 console error，只显示 own customer fixture。
- `/my/quotes/quote-local-501`：200，无 console error。
- `/my/quotes/quote-local-502`：200 页面壳，显示 not found，不泄露其它客户数据。
- `/my/orders`：200，无 console error，只显示 own customer fixture。
- `/my/orders/order-local-1001`：200，无 console error。
- `/my/orders/order-local-1002`：200 页面壳，显示 not found，不泄露其它客户数据。

后端 runtime 验收：

- 尝试使用 safe local profile 启动 backend：
  - `PYTHON_DOTENV_DISABLED=1`
  - `DATABASE_URL=sqlite:////tmp/partyonce_customer_readonly_backend_dummy.sqlite`
  - `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
  - `PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_customer_readonly.sqlite`
  - host `127.0.0.1`
- 当前本机 Python 环境缺少 `fastapi`，backend runtime 启动失败：
  - `ModuleNotFoundError: No module named 'fastapi'`
- 因此本轮未完成真实 backend HTTP route smoke test。

Lead / Quote / Order 创建验收：

- 未重新创建真实 Lead / Quote / Order。
- 原因：backend runtime 被本机依赖阻断。
- 页面端使用 filtered local fixture 完成 customer-only read-only 验收。

## 11. 是否触发外部系统

否。

未触发：

- Stripe
- PaymentIntent
- webhook
- n8n
- email
- SMS
- WhatsApp
- production deployment

## 12. 是否读取/修改 .env.production

否。

本轮未读取、未修改、未提交 `.env.production`。

## 13. 是否提交 dist

否。

本轮未运行 production build，未提交 `frontend/vue-app/dist`。

## 14. blocker

主要 blocker：

- 本机当前 Python 环境缺少 `fastapi`，无法启动 backend runtime 做 `/api/my/*` HTTP smoke test。

非阻断限制：

- 仍没有生产级 customer auth。
- local/staging fallback 仍使用 demo fixture。
- backend `/api/my/*` 已实现 read-only guard，但需要在依赖完整的 backend runtime 中补 smoke test。

## 15. commit hash

Implementation commit:

- `17ad8574` Harden customer read-only experience

## 16. 下一步建议

下一步建议：

1. 在 backend 依赖完整环境中补跑 `/api/my/quotes`、`/api/my/quotes/{id}`、`/api/my/orders`、`/api/my/orders/{id}` smoke test。
2. 建立稳定 customer auth fixture：非 admin customer token + local customer id mapping。
3. 继续保持 payment / webhook / n8n / deployment 阻断。
4. 暂不做 customer self-service quote acceptance，直到 read-only API 验收稳定。
