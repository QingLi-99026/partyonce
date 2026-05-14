# PartyOnce Admin Editable Quote Line Items Workpack

Date: 2026-05-14

Branch: `eye-lite-v2-release-candidate-20260512`

Baseline commit: `b7c92db3`

## 1. 本轮目标

Move standardized quote line items from display-only into local/staging editable draft mode for Admin Quote Detail.

Supported line item types:

- `venue_fee`
- `decor_fee`
- `supplier_fee`
- `labor_fee`
- `transport_fee`
- `service_fee`
- `optional_upgrade`

This is not a formal invoice, not a contract, not payment amount finalization, and not a Stripe/payment workflow.

## 2. 修改/新增文件

- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `docs/PARTYONCE_ADMIN_EDITABLE_QUOTE_LINE_ITEMS_WORKPACK_20260514.md`

## 3. editable line item draft mode 完成情况

Admin Quote Detail now includes an `Editable Line Item Draft` panel.

Supported admin operations:

- View current normalized line items.
- Add a new line item.
- Edit fee type.
- Edit label/title.
- Edit amount.
- Edit `amount_basis`.
- Edit `customer_explanation`.
- Edit `admin_edit_hint`.
- Toggle optional upgrade status by switching type to/from `optional_upgrade`.
- Delete a draft line item.
- Recalculate draft subtotal and final total preview.
- Save the draft locally.
- Reset the draft from the current Quote snapshot.

The draft panel clearly states that it is local/staging only and does not create payment, invoice, contract, webhook, n8n, or outbound actions.

## 4. 是否 backend 持久化或 localStorage fallback

This workpack uses localStorage fallback only.

Draft storage key:

```text
partyonce_quote_line_item_draft_<quoteId>
```

Saved payload includes:

```text
quote_id
saved_at
persistence
items
summary
```

Backend persistence is not enabled in this workpack. This is intentional because the current backend Quote skeleton does not yet expose a dedicated safe PATCH contract for line item draft storage.

If the Quote detail API is unavailable, Admin Quote Detail now creates a local/staging fallback quote so the draft editor can still be reviewed.

## 5. 客户侧简化展示

Customer Quote Detail now shows simplified customer-facing quote groups:

- 场地费用
- 装饰费用
- 供应商服务
- 人工与运输
- 可选升级

Customer view does not expose `admin_edit_hint`.

## 6. AI / party_scene_config 打通情况

AI Concierge and `/quote` still preserve:

- `party_scene_config`
- package tier
- supplier suggestions
- pricing explanation
- standardized line items

This workpack does not remove or bypass the Phase A/B data path.

## 7. 本地 build 结果

Passed.

Command:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_admin_editable_line_items_build --emptyOutDir
```

Result:

```text
Vite build completed successfully.
Build output was written to /tmp/partyonce_admin_editable_line_items_build.
frontend/vue-app/dist was not written.
```

Known non-blocking output:

- Vite CJS Node API deprecation warning.
- Chunk size warning.

## 8. route smoke 结果

Static checks passed:

```text
AdminQuoteDetail.vue SFC parse ok
MyQuoteDetail.vue SFC parse ok
QuotePage.vue SFC parse ok
AdminOrderDetail.vue SFC parse ok
```

Route smoke passed with local admin fixture and stubbed local `/api/*` responses:

```text
/admin/quotes 200
/admin/quotes/1 200
/my/quotes 200
/quote 200
/ai-voice-intake 200
/payment/deposit 200
```

Browser checks:

```text
non-blank pages: passed
broken images: 0
console errors: 0
Admin Quote Detail editor visible: true
Add line item: passed
Edit line item title/amount: passed
Save local draft: passed
Draft item count after add: 7
Draft total preview: 2133 AUD
```

Note: a direct backend smoke was not used because this environment does not currently have backend Python dependencies such as `fastapi` available in the default `python3` runtime. The implementation therefore keeps draft persistence in browser localStorage and documents backend persistence as a follow-up.

## 9. 是否读取/修改 .env.production

No.

`.env.production` was not read or modified.

## 10. 是否提交 dist

No.

No `frontend/vue-app/dist` files were staged or committed.

## 11. 是否 production deploy

No.

No production deploy, production DB connection, or production migration was performed.

## 12. 是否触发 payment / webhook / n8n / 外发

No.

No PaymentIntent, Stripe live/test charge, webhook, n8n workflow, email, SMS, or WhatsApp was triggered.

## 13. blocker

No frontend/local-staging blocker.

Remaining backend/product blocker:

- Quote line item draft persistence is localStorage fallback only.
- Backend needs a dedicated local/staging-safe line item draft field or endpoint before this can become shared team state.

## 14. 下一步建议

Next workpack:

```text
Backend quote line item draft persistence skeleton
```

Add a safe local/staging-only backend persistence path for line item drafts, still without payment, invoice, contract, production migration, or outbound automation.
