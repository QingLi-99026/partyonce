# PartyOnce Supplier / Venue Database + Restaurant Rendering Deep Binding Workpack V1

## 1. 本轮目标

把 AI Concierge 推荐出的主题、套餐、Restaurant A 渲染图、推荐场地和供应商建议，从“AI 推荐结果”进一步绑定到前台客户页面和后台运营页面。

本轮仍为 local/staging/preview 深度接入，不接真实供应商外部系统，不派单，不签合同，不触发 payment、webhook、n8n、email、SMS 或 WhatsApp。

## 2. 修改 / 新增文件

- `frontend/vue-app/src/data/visualAssets.js`
- `frontend/vue-app/src/data/recommendationRules.js`
- `frontend/vue-app/src/services/supplierLightService.js`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/Venues.vue`
- `frontend/vue-app/src/views/SuppliersMap.vue`
- `frontend/vue-app/src/views/MyQuotes.vue`
- `frontend/vue-app/src/views/MyOrders.vue`
- `frontend/vue-app/src/views/AdminQuotes.vue`
- `frontend/vue-app/src/views/AdminOrders.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `docs/PARTYONCE_SUPPLIER_VENUE_RENDERING_DEEP_BINDING_WORKPACK_20260514.md`

## 3. 数据库 / seed 绑定

`visualAssets.js` 现在作为 local/staging visual database registry：

- `venueDisplaySeeds` 增强为可被 AI 推荐和场地库复用的场地 seed。
- `supplierDisplaySeeds` 增强为可被 Quote / Order / Admin 使用的供应商 seed。
- 新增/固化字段：
  - `bestPackageTiers`
  - `layoutImage`
  - `renderings`
  - `aiRecommendationRole`
  - `supportedTiers`
  - `quoteRole`
  - `operationsRole`

新增共享 helper：

- `normalizeThemeId()`
- `normalizeTierId()`
- `getRecommendedVenue()`
- `getRecommendedSuppliers()`
- `buildVisualRecommendationSnapshot()`
- `getVisualContext()` 返回 `packageVisual`、`restaurant`、`primaryVenue`、`venues`、`suppliers`。

## 4. AI → Quote 绑定

`recommendationRules.js` 现在把 AI 推荐结果带入 quote prefill：

- `venueId`
- `venueName`
- `venueCapacity`
- `venueLayoutImage`
- `restaurantVisual`
- `packageVisual`
- `supplierSuggestions`

`QuotePage.vue` 提交 inquiry 时会保存这些字段到 `selection` snapshot，并保留 `source = ai_concierge`。

## 5. 前台展示绑定

已接入：

- `/quote`：视觉方案依据展示 Restaurant A 主题/套餐渲染图、推荐场地、供应商建议和报价依据。
- `/venues`：fallback 场地库优先展示 `venueDisplaySeeds`，包含 Restaurant A、主题适配和推荐用途。
- `/suppliers`：供应商地图/列表改为从 `supplierDisplaySeeds` + `venueDisplaySeeds` 生成 local/staging 展示项。
- `/my/quotes`：客户 quote card 显示 Restaurant A 渲染图、推荐场地和供应商建议。
- `/my/orders`：客户 order card 显示 Restaurant A 渲染图、推荐场地和供应商建议。

## 6. 后台运营绑定

已接入：

- `/admin/quotes`：Quote queue 列表展示 Restaurant A 渲染图、推荐场地和供应商。
- `/admin/orders`：Order queue 列表展示 Restaurant A 渲染图和供应商。
- `/admin/quotes/:id`：Quote detail 新增 Visual Delivery Context 和 Quote Basis 面板。
- `/admin/orders/:id`：Order detail 新增 Visual Delivery Context 面板。

运营可在详情页看到：

- 客户选择的主题 / 套餐
- Restaurant A 渲染图
- 推荐场地
- 推荐供应商角色
- 报价依据 / 装饰层说明

## 7. 本地 build 结果

命令：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_supplier_venue_binding_build --emptyOutDir
```

结果：通过。

说明：输出目录为 `/tmp/partyonce_supplier_venue_binding_build`，未写入 `frontend/vue-app/dist`。

## 8. Route smoke 结果

本地 dev server：`http://127.0.0.1:5178`

已验证：

- `/`
- `/ai-voice-intake`
- `/quote`
- `/venues`
- `/suppliers`
- `/my/quotes`
- `/my/orders`
- `/admin/quotes`
- `/admin/orders`
- `/payment/deposit`

验收目标：route 200、非空白、console error = 0、broken images = 0。

## 9. 是否读取 / 修改 `.env.production`

否。

## 10. 是否提交 dist

否。

## 11. 是否 production deploy

否。

## 12. 是否触发 payment / webhook / n8n / 外发

否。

## 13. Blocker

无本轮代码 blocker。

仍需注意：当前仍是 local/staging visual database registry，不是真实供应商派单系统，不含真实合同签署、自动审核或真实付款。

## 14. 下一步建议

下一步建议做投资人 Preview walkthrough：从首页 AI 推荐进入 Quote，确认客户侧 My Quotes / My Orders 和后台 Quote / Order 视觉上下文能讲成一个完整故事。
