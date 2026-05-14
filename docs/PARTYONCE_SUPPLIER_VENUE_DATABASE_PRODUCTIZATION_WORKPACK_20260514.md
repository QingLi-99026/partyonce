# PartyOnce Supplier / Venue Database Productization Workpack 20260514

## 1. 本轮目标

把供应商和场地从 local/staging fixture 推进为更像真实运营资产的数据体系，并继续与 AI Concierge、party_scene_config、Quote、Order、Restaurant A 视觉渲染和后台运营解释打通。

本轮仍然不接真实供应商系统、不做自动派单、不触发 payment、Stripe、webhook、n8n 或任何外发消息。

## 2. 修改/新增文件

- `frontend/vue-app/src/data/visualAssets.js`
- `frontend/vue-app/src/data/partySceneConfig.js`
- `frontend/vue-app/src/data/recommendationRules.js`
- `frontend/vue-app/src/services/supplierLightService.js`
- `frontend/vue-app/src/views/Venues.vue`（沿用现有 Restaurant A 列表接入）
- `frontend/vue-app/src/views/VenueDetail.vue`
- `frontend/vue-app/src/views/SuppliersMap.vue`
- `frontend/vue-app/src/views/SupplierDetail.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `frontend/vue-app/src/views/AdminSuppliers.vue`
- `docs/PARTYONCE_SUPPLIER_VENUE_DATABASE_PRODUCTIZATION_WORKPACK_20260514.md`

## 3. 场地数据结构

Restaurant A 已作为正式 local/staging 样板场地固化在 `venueDisplaySeeds`。

字段覆盖：

- `venue_id`
- `venue_name`
- `venue_type`
- `capacity`
- `capacityNumber`
- `tables`
- `chairs`
- `layoutImage`
- `original_image`
- `theme_compatibility`
- `supported_packages`
- `location`
- `price_range`
- `notes`
- `operationsNotes`
- `renderings`

Restaurant A 已关联：

- original / reference scene
- Castle Basic / Standard / Premium
- Space Basic / Standard / Premium
- Forest Basic / Standard / Premium

`/venues/restaurant-a` 现在展示场地原貌、容量、桌椅、主题适配、三主题九档渲染图和推荐供应商职责。

## 4. 供应商数据结构

供应商 seed 已扩展为更接近真实运营资产的类别与字段。

类别覆盖：

- `venue`
- `florist`
- `balloon_decorator`
- `cake_dessert`
- `kids_entertainment`
- `photography`
- `setup_service`

字段覆盖：

- `supplier_id`
- `name`
- `category`
- `categoryLabel`
- `serviceArea`
- `priceRange`
- `supportedThemes`
- `supportedTiers`
- `supported_package_tiers`
- `supported_themes`
- `materials_or_services`
- `lead_time`
- `contact_placeholder`
- `status`
- `responsibility`
- `operationsRole`
- `quoteRole`
- `note`

`/suppliers/:id` 现在展示支持主题、支持套餐、服务内容、提前期、价格区间、适配职责和 quote line item 关系。

## 5. 主题 / 套餐 / 供应商映射

系统现在可以通过 `getVisualContext(theme, tier)` 回答：

- Castle Princess Standard 推荐哪些供应商
- Space Explorer Premium 需要哪些供应商
- Forest Adventure Basic 可以使用哪些低成本装饰 / 甜品 / 搭建组合
- Restaurant A 适合哪些主题和套餐

映射源：

- `venueDisplaySeeds`
- `supplierDisplaySeeds`
- `getRecommendedVenue`
- `getRecommendedSuppliers`
- `buildVisualRecommendationSnapshot`
- `buildPartySceneConfig`

映射会被以下链路读取：

- AI Concierge recommendation payload
- `party_scene_config.suppliers`
- QuotePage visual context
- MyQuoteDetail customer summary
- MyOrderDetail customer summary
- AdminQuoteDetail ops explanation
- AdminOrderDetail ops explanation
- Supplier / Venue pages

## 6. 前台展示结果

前台完成：

- `/venues`：Restaurant A 样板场地在场地列表中可见。
- `/venues/restaurant-a`：展示场地原貌、三主题九套餐渲染、容量、桌椅、价格区间、运营备注和推荐供应商。
- `/suppliers`：供应商分类扩展为 venue / florist / balloon / cake / entertainment / photography / setup service。
- `/suppliers/:id`：展示供应商类别、支持主题、支持套餐、服务内容、提前期、价格区间和 quote line item 关系。
- `/quote`：继续显示 Restaurant A、供应商建议、party_scene_config 与 quote prefill 关系。
- `/my/quotes` / `/my/orders`：列表层继续保留 venue / supplier context。
- `/my/quotes/:id` / `/my/orders/:id`：新增客户可读的场地和供应商上下文。

## 7. 后台展示结果

后台完成：

- Admin Quote Detail 显示推荐场地、Restaurant A 渲染、供应商类别、供应商职责和报价依据。
- Admin Order Detail 显示推荐场地、供应商类别、供应商职责、报价解释和交付说明。
- Admin Suppliers 使用扩展供应商类别、职责、支持主题和支持套餐展示运营资产。

后台仍然是 local/staging skeleton，不会真实联系供应商或派单。

## 8. 与 AI / party_scene_config / quote line items 的关系

AI Concierge 和 recommendation rules 现在把供应商建议输出为更完整的结构：

- supplier id
- name
- category
- categoryLabel
- role
- responsibility
- priceRange

`party_scene_config.suppliers` 同步包含：

- category / categoryLabel
- service area
- price range
- operations role
- responsibility
- lead time
- materials/services

Quote line items 的关系：

- venue -> `venue_fee`
- florist / balloon decorator -> `decor_fee` 或 `optional_upgrade`
- cake dessert / kids entertainment / photography -> `supplier_fee` 或 `optional_upgrade`
- setup service -> `labor_fee` / `transport_fee` / `service_fee`

这让客户能理解报价组成，后台运营能解释为什么推荐某些场地和供应商。

## 9. 本地 Build 结果

通过。

执行：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_supplier_venue_productization_build --emptyOutDir
```

结果：

- build passed
- 输出目录：`/tmp/partyonce_supplier_venue_productization_build`
- 未写入 `frontend/vue-app/dist`

SFC parse 通过：

- `VenueDetail.vue`
- `SupplierDetail.vue`
- `SuppliersMap.vue`
- `MyQuoteDetail.vue`
- `MyOrderDetail.vue`
- `AdminQuoteDetail.vue`
- `AdminOrderDetail.vue`
- `AdminSuppliers.vue`
- `QuotePage.vue`

## 10. Route Smoke 结果

通过。

本地 Vite：

`http://127.0.0.1:5188`

Route smoke：

- `/` -> 200, non-blank, console error 0, broken images 0
- `/venues` -> 200, non-blank, console error 0, broken images 0, Restaurant A visible
- `/venues/restaurant-a` -> 200, non-blank, console error 0, broken images 0, Restaurant A visible
- `/suppliers` -> 200, non-blank, console error 0, broken images 0, supplier category visible
- `/suppliers/balloon-bloom-sydney` -> 200, non-blank, console error 0, broken images 0
- `/quote` -> 200, non-blank, console error 0, broken images 0
- `/my/quotes` -> 200, non-blank, console error 0, broken images 0
- `/my/orders` -> 200, non-blank, console error 0, broken images 0
- `/admin/quotes` -> 200, non-blank, console error 0, broken images 0
- `/admin/orders` -> 200, non-blank, console error 0, broken images 0
- `/admin/suppliers` -> 200, non-blank, console error 0, broken images 0
- `/payment/deposit` -> 200, non-blank, console error 0, broken images 0

## 11. Preview Redeploy 结果

本地验证通过后，本轮允许 push release candidate branch 触发 Vercel Preview redeploy。

Preview URL：

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

如 Vercel Preview 仍受 access protection 影响，应按既有 owner checklist 关闭 Preview protection 或提供 share link；这不是本轮 App route failure。

## 12. 是否读取/修改 .env.production

否。

本轮未读取、未修改、未 staging `.env.production`。

## 13. 是否提交 dist

否。

Build 输出到 `/tmp`，未提交 `frontend/vue-app/dist`。

## 14. 是否 production deploy

否。

没有 production deploy，没有生产数据库连接，没有 production migration。

## 15. 是否触发 payment / webhook / n8n / 外发

否。

本轮没有触发：

- PaymentIntent
- Stripe live mode
- webhook
- n8n
- email
- SMS
- WhatsApp
- supplier contact
- supplier dispatch

## 16. Blocker

无本轮本地 blocker。

仍需注意：

- 供应商 / 场地数据仍为 local/staging registry，不是真实供应商合同或库存系统。
- 未来 production 前需要单独做供应商数据审核、联系人权限、隐私边界和生产 DB migration。
- Preview 可访问性仍取决于 Vercel Preview protection 设置。

## 17. 下一步建议

进入 `Formal Quote Preview / Quote PDF data contract`：

1. 复用 quote line items。
2. 复用 venue / supplier registry。
3. 生成 staging-only 正式报价预览。
4. 仍然不接 payment，直到 Stripe test-mode integration 单独审批。
