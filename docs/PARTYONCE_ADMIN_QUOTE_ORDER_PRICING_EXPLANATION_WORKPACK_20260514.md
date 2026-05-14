# PartyOnce Admin Quote / Order Pricing Explanation Workpack

Date: 2026-05-14
Branch: eye-lite-v2-release-candidate-20260512

## 1. 本轮目标

本轮目标是把前台客户能理解的套餐 / 报价解释，同步接入后台运营 Quote / Order 详情页，让运营人员也能解释：

- 客户为什么被推荐这个套餐
- 价格由哪些场地 / 供应商 / 装饰项构成
- 套餐升级理由
- 报价依据
- 可以直接引用给客户的说明口径

这让 Quote 说服链路从“客户侧理解报价”延伸到“后台运营能复述报价依据”。

## 2. 修改文件

- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `docs/PARTYONCE_ADMIN_QUOTE_ORDER_PRICING_EXPLANATION_WORKPACK_20260514.md`

本轮复用已存在的：

- `frontend/vue-app/src/data/packageExplanation.js`
- `frontend/vue-app/src/data/visualAssets.js`

## 3. Admin Quote Detail 完成情况

`AdminQuoteDetail.vue` 新增 `Ops Pricing Explanation` 面板，展示：

- 套餐定位
- 客户为什么被推荐这个套餐
- 为什么这个套餐适合客户
- 价格由哪些部分构成
- 场地 / 餐厅样板
- Restaurant A 渲染层
- 供应商建议和价格区间
- 装饰项和 package scope
- line item snapshot 摘要
- 套餐升级理由

同时新增 `Customer Explanation Script`，运营人员可以直接引用给客户解释报价。该脚本只显示在后台，不会自动外发。

## 4. Admin Order Detail 完成情况

`AdminOrderDetail.vue` 新增同样的后台报价解释层，面向订单跟进场景展示：

- 当前订单沿用的主题 / 套餐
- 客户为什么适合这个套餐
- 场地、供应商、装饰层和 line items 构成
- 升级价值
- 可引用客户解释话术

订单页仍保持 payment blocked：`pending_deposit` 只是业务状态，不触发 Stripe / PaymentIntent。

## 5. 报价依据来源

本轮没有新增后端 pricing engine，也没有修改数据库。

后台解释层的数据来自：

- `packageExplanation.js`：套餐差异、价格驱动、升级价值、客户适配说明
- `visualAssets.js`：主题、套餐视觉、Restaurant A 渲染、场地 seed、供应商 seed
- Quote / Order detail 当前记录：金额、line items、selection snapshot、order event

## 6. 运营可引用话术

Quote / Order 详情页都会生成一段只读话术，说明：

- 推荐的是哪个主题和套餐
- 为什么推荐
- 客户为什么适合
- 价格主要由场地、装饰、供应商、人工构成
- 如果升级会多什么

该话术不会自动复制、不会自动发送、不会触发 email / SMS / WhatsApp / n8n。

## 7. 本地验证结果

### SFC parse

已通过：

- `src/views/AdminQuoteDetail.vue`
- `src/views/AdminOrderDetail.vue`

### Build

命令：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_admin_pricing_explainer_build --emptyOutDir
```

结果：通过。

说明：仅输出到 `/tmp/partyonce_admin_pricing_explainer_build`，未写入或提交 `frontend/vue-app/dist`。

### Local admin route smoke

使用安全 local/staging backend profile：

- `PYTHON_DOTENV_DISABLED=1`
- `DATABASE_URL=sqlite:////tmp/partyonce_admin_pricing_backend_dummy.sqlite`
- `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
- `PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_admin_pricing.sqlite`
- backend host: `127.0.0.1:8000`
- frontend host: `127.0.0.1:5184`

先调用 staging-only admin fixture endpoint 生成虚构 Quote / Order smoke 数据：

- `POST /api/admin/staging-fixtures/admin-data-smoke`
- `Authorization: Bearer staging-smoke-admin`
- `X-PartyOnce-Staging-Fixture: admin-data-smoke-v1`

验收结果：

- `/admin/quotes/1`：200，非空白，`Ops Pricing Explanation` 可见，`Customer Explanation Script` 可见，价格构成可见，供应商 / 场地依据可见，broken images = 0
- `/admin/orders/1`：200，非空白，`Ops Pricing Explanation` 可见，`Customer Explanation Script` 可见，价格构成可见，供应商 / 场地依据可见，broken images = 0

说明：普通浏览器上下文下本地 API CORS 会拦截 `127.0.0.1:5184 -> 127.0.0.1:8000` 的 admin detail API 请求；为验证页面渲染，本轮使用本地 Playwright 禁用 web security 的测试上下文完成只读 smoke。代码和环境配置未因此修改。

## 8. 安全边界

- 是否读取 / 修改 `.env.production`：否
- 是否提交 `frontend/vue-app/dist`：否
- 是否 production deploy：否
- 是否触发真实 payment / Stripe / PaymentIntent：否
- 是否触发 webhook / n8n：否
- 是否外发 email / SMS / WhatsApp：否
- 是否连接 production DB：否
- 是否修改后端 / 数据库 schema：否

## 9. Blocker

- 本地 dev server 到 backend 的 CORS 仍需要统一 local-safe profile 或 Vite proxy/env 设置；本轮不扩大到 CORS 配置修复。
- 这仍是解释层和 skeleton data 结合，不是最终 server-side pricing validation engine。

## 10. 下一步建议

下一步建议进入“报价构成明细规则化”：

- 把场地费、装饰费、供应商费、人工费、运输费拆成稳定 line item 类型
- Admin Quote 可编辑每类报价依据
- 客户侧 Quote Detail 可展示简化版报价组成
- 后续再接真实 pricing engine / payment test mode

Production 仍保持 No-Go。
