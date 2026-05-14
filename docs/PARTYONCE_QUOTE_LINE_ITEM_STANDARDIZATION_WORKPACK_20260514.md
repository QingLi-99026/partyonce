# PartyOnce Quote Line Item Standardization Workpack

Date: 2026-05-14

Branch: `eye-lite-v2-release-candidate-20260512`

Baseline HEAD before workpack: `2a2614ae`

## 1. 本轮目标

Standardize quote composition into stable line item types so AI recommendation, customer quote explanation, admin quote operations, future PDF quotes, and future deposit calculation can all reference the same pricing structure.

Required stable types:

- `venue_fee` / 场地费
- `decor_fee` / 装饰费
- `supplier_fee` / 供应商费
- `labor_fee` / 人工费
- `transport_fee` / 运输费
- `service_fee` / 服务费
- `optional_upgrade` / 可选升级项

## 2. 修改/新增文件

- `frontend/vue-app/src/data/quoteLineItems.js`
- `frontend/vue-app/src/data/partySceneConfig.js`
- `frontend/vue-app/src/data/recommendationRules.js`
- `frontend/vue-app/src/services/investorDemoService.js`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `docs/PARTYONCE_QUOTE_LINE_ITEM_STANDARDIZATION_WORKPACK_20260514.md`

## 3. 稳定 line item 类型

`quoteLineItems.js` now exposes `QUOTE_LINE_ITEM_SCHEMA_VERSION = quote_line_items_v1` and a stable type registry.

Every normalized line item now carries:

```text
schema_version
id
type
line_item_type
type_label
type_label_zh
customer_label
name
description
amount
amount_basis
calculation_note
customer_explanation
admin_edit_hint
source
party_scene_config_path
deposit_basis
customer_visible
editable
```

This turns each quote row from a loose display item into a pricing object that can later be edited, audited, exported to PDF, or used for deposit calculation.

## 4. party_scene_config 打通结果

`buildQuoteLineItemsFromSelection()` now accepts `partySceneConfig`.

The line items reference scene config paths:

```text
venue_fee -> venue
decor_fee -> decor
supplier_fee -> suppliers
labor_fee -> layout
transport_fee -> venue
service_fee -> pricingExplanation
optional_upgrade -> optionalUpgrades
```

`partySceneConfig.pricingExplanation` now includes:

- `lineItemSchemaVersion`
- `lineItemTypeHints`
- package recommendation explanation
- upgrade notes
- line item hints

This connects AI scene planning, visual rendering, supplier suggestions, and quote explanation into one structure.

## 5. Quote prefill / inquiry payload

`QuotePage.vue` now builds line items with `partySceneConfig`.

The inquiry pricing payload now includes:

- `lineItems`
- `lineItemSummary`
- `lineItemSchemaVersion`
- `depositReadiness.placeholderAmount`
- `depositReadiness.basis`
- `depositReadiness.enabled = false`

This remains staging-safe and does not create a quote, order, PaymentIntent, webhook, or outbound message.

## 6. 客户侧展示

Customer Quote Detail now shows:

- simplified grouped quote composition
- stable type labels
- amount basis
- deposit readiness placeholder

The customer can see why the quote is not just one opaque total.

## 7. 后台运营展示

Admin Quote Detail and Admin Order Detail now show:

- line item type
- name / basis
- amount
- source
- amount basis
- admin edit hint
- schema version
- deposit placeholder as readiness-only

This gives operations a direct explanation script and a clear place to verify future editable pricing fields.

## 8. AI 推荐价格依据

AI quote prefill now carries the standard line item type registry in `pricing.standardLineItemTypes`.

The customer-facing quote page uses this to show:

```text
场地费
装饰费
供应商费
人工费
运输费
服务费
可选升级项
```

Each type has a customer explanation and an admin edit hint.

## 9. Future payment / deposit readiness

The line item summary now returns:

```text
total
customer_visible_total
deposit_placeholder
deposit_note
```

The placeholder is currently 20% of the grouped total.

Important boundary:

```text
This does not create PaymentIntent, checkout, Stripe status, deposit_paid, webhook, n8n, or real collection.
```

It only prepares a clear amount basis for a later payment workpack.

## 10. 本地验证结果

Static checks passed:

```bash
node --check src/data/quoteLineItems.js
node --check src/data/partySceneConfig.js
node --check src/data/recommendationRules.js
node --check src/services/customerExperienceService.js
node --check src/services/investorDemoService.js
```

Vue SFC parse passed:

```text
src/views/QuotePage.vue
src/views/MyQuoteDetail.vue
src/views/AdminQuoteDetail.vue
src/views/AdminOrderDetail.vue
```

Build passed:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_quote_line_items_build --emptyOutDir
```

Route smoke passed:

```text
/ 200
/ai-voice-intake 200
/quote?theme=castle&package=standard&scene=restaurant-a 200
/my/quotes 200
/my/orders 200
/admin/quotes 200
/admin/orders 200
/payment/deposit 200
```

Quote page checks:

```text
stable types visible: true
optional upgrade visible: true
deposit placeholder visible: true
amount basis visible: true
broken images: 0
console errors: 0
```

## 11. 是否读取/修改 .env.production

No.

`.env.production` was not read or modified.

## 12. 是否提交 dist

No.

Build output was written to `/tmp/partyonce_quote_line_items_build`.

## 13. 是否 production deploy

No.

No production deploy, production DB connection, or production migration was performed.

## 14. 是否触发 payment / webhook / n8n / 外发

No.

Payment readiness remains placeholder-only.

## 15. blocker

No local/staging implementation blocker.

Remaining production blockers:

- Backend should later persist first-class `party_scene_config_json` and structured `line_items_json` with schema version.
- Admin editable line item UI is not yet implemented; this workpack prepares the display and edit-hint structure.
- Payment/deposit remains intentionally blocked until a dedicated Stripe test-mode workpack.

## 16. 下一步建议

Next workpack:

```text
Admin editable quote line item draft mode
```

This should let operations adjust amount, basis, and optional upgrades in local/staging before formal Quote PDF and Stripe test-mode deposit work.
