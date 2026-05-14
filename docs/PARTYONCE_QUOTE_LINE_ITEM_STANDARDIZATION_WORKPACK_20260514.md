# PartyOnce Quote Line Item Standardization Workpack

Date: 2026-05-14
Branch: eye-lite-v2-release-candidate-20260512

## 1. 本轮目标

本轮目标是把 Quote 构成从“笼统套餐价 / 场景费 / 附加项”推进到稳定 line item 类型，为后续正式报价能力打基础。

标准类型包括：

- 场地费 `venue_fee`
- 装饰费 `decor_fee`
- 供应商费 `supplier_fee`
- 人工费 `labor_fee`
- 运输费 `transport_fee`
- 服务费 `service_fee`
- 可选升级项 `optional_upgrade`

这一步仍是 local/staging skeleton，不接真实 payment，不生成正式 PDF，不做 production deploy。

## 2. 修改 / 新增文件

- `frontend/vue-app/src/data/quoteLineItems.js`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `frontend/vue-app/src/services/customerExperienceService.js`
- `frontend/vue-app/src/services/adminOrderService.js`
- `frontend/vue-app/src/services/investorDemoService.js`
- `frontend/vue-app/src/mock/adminOrders.js`
- `docs/PARTYONCE_QUOTE_LINE_ITEM_STANDARDIZATION_WORKPACK_20260514.md`

## 3. 标准 line item 数据层

新增 `quoteLineItems.js`，提供：

- `quoteLineItemTypes`
- `quoteLineItemOrder`
- `normalizeQuoteLineItemType`
- `normalizeQuoteLineItem`
- `normalizeQuoteLineItems`
- `summarizeQuoteLineItems`
- `buildQuoteLineItemsFromSelection`

该层统一处理旧字段别名，例如：

- `venue_package` / `scene_fee` -> `venue_fee`
- `decor` / `styling` -> `decor_fee`
- `vendor` / `cake` / `photo` -> `supplier_fee`
- `setup` -> `labor_fee`
- `addon` / `upgrade` -> `optional_upgrade`

## 4. Quote Request 接入

`QuotePage.vue` 已把价格明细改为标准类型汇总：

- 场地费
- 装饰费
- 供应商费
- 人工费
- 运输费
- 服务费
- 可选升级项

同时新增 “Standardized line items” 说明卡，明确这些类型后续用于：

- 后台编辑报价依据
- 客户侧简化报价组成
- Quote PDF / 正式报价单
- future deposit calculation

提交 inquiry 时，`pricing` snapshot 新增：

- `lineItems`
- `lineItemSummary`

说明：本轮保持原有前端估算总价逻辑，不接 server-side pricing validation。

## 5. 客户侧接入

`MyQuoteDetail.vue`：

- `Quote Items` 改为 `简化报价组成`
- 按标准类型展示客户可理解的报价组成
- 展示类型中文名、客户标签、依据说明、金额

`MyOrderDetail.vue`：

- `Order Items` 改为 `简化订单组成`
- 订单详情沿用标准报价类型
- 保留 payment blocked / pending_deposit placeholder 边界

## 6. 后台运营接入

`AdminQuoteDetail.vue`：

- `Line Items Snapshot` 改为 `Standardized Line Items Snapshot`
- 显示标准类型、客户标签、basis、amount、source
- Ops Pricing Explanation 的价格依据改为按标准类型汇总

`AdminOrderDetail.vue`：

- `Line Items` 改为 `Standardized Line Items`
- fallback / API order line items 均会 normalize 到稳定类型
- Ops Pricing Explanation 使用标准 line item summary 做报价依据

## 7. Fixture / Demo 数据接入

`customerExperienceService.js`：

- 客户 quote fixtures 改为标准 line item 类型
- 从 local inquiry 生成 quote 时优先使用 `pricing.lineItems`
- 旧 inquiry 没有 lineItems 时做兼容 fallback
- Quote / Order normalize 时统一标准化 line items

`adminOrderService.js`：

- Admin Order API / fallback normalize 时统一标准化 line items

`adminOrders.js`：

- Admin Order fallback seed 改为标准 line item 类型

`investorDemoService.js`：

- Guided Demo inquiry pricing snapshot 写入标准 line items 和 summary

## 8. 本地验证结果

### Static checks

通过：

- `node --check frontend/vue-app/src/data/quoteLineItems.js`
- `node --check frontend/vue-app/src/services/investorDemoService.js`
- `node --check frontend/vue-app/src/services/customerExperienceService.js`
- `node --check frontend/vue-app/src/services/adminOrderService.js`

### Vue SFC parse

通过：

- `src/views/QuotePage.vue`
- `src/views/MyQuoteDetail.vue`
- `src/views/MyOrderDetail.vue`
- `src/views/AdminQuoteDetail.vue`
- `src/views/AdminOrderDetail.vue`

### Build

命令：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_line_item_standardization_build_final --emptyOutDir
```

结果：通过。

说明：仅输出到 `/tmp/partyonce_line_item_standardization_build_final`，未写入或提交 `frontend/vue-app/dist`。

### Route smoke

本地 frontend `127.0.0.1:5185`：

- `/quote?theme=castle&package=standard&scene=restaurant-a`：200，非空白，标准 line item 类型可见，broken images = 0
- `/my/quotes/quote-local-501`：200，非空白，简化报价组成可见，broken images = 0
- `/my/orders/order-local-1001`：200，非空白，简化订单组成可见，broken images = 0

本地 safe backend profile + staging admin fixture：

- `/admin/quotes/1`：200，非空白，Standardized Line Items Snapshot 可见，Ops Pricing Explanation 可见，broken images = 0
- `/admin/orders/1`：200，非空白，Standardized Line Items 可见，Ops Pricing Explanation 可见，broken images = 0

## 9. 安全边界

- 是否读取 / 修改 `.env.production`：否
- 是否提交 `frontend/vue-app/dist`：否
- 是否 production deploy：否
- 是否触发真实 payment / Stripe / PaymentIntent：否
- 是否触发 webhook / n8n：否
- 是否外发 email / SMS / WhatsApp：否
- 是否连接 production DB：否
- 是否运行 production migration：否

## 10. 当前限制

- 标准 line items 仍是 frontend/local-staging skeleton，不是最终后端 pricing engine。
- 后端 Quote / Order DB schema 尚未持久化 item type 字段为一等结构；当前 API snapshot 可兼容读取。
- PDF / 正式报价单尚未生成。
- Deposit calculation 仍未进入 payment scope。

## 11. 下一步建议

下一步建议进入 “Admin Quote Line Item Editing V1”：

- Admin Quote Detail 可编辑 line item 类型、名称、金额、是否客户可见
- 保存到 local/staging SQLite Quote snapshot 或 quote_items skeleton
- 客户 Quote Detail 只显示 customer-visible 简化组成
- 为 Quote PDF 和 deposit 计算预留字段

Production 仍保持 No-Go。
