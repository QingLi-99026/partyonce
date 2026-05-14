# PartyOnce Quote Line Item Backend Persistence Workpack 20260514

## 1. 本轮目标

把 Admin Quote Detail 中可编辑的 quote line items 从 browser localStorage fallback 推进到 local/staging-only SQLite backend persistence skeleton。

本轮仍然不是正式发票、合同、payment amount finalization，也不创建 PaymentIntent、不触发 Stripe、webhook、n8n 或任何外发消息。

## 2. 修改/新增文件

- `backend/main.py`
- `backend/migrations/004_create_quote_line_item_storage.sql`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `docs/PARTYONCE_QUOTE_LINE_ITEM_BACKEND_PERSISTENCE_WORKPACK_20260514.md`

`frontend/vue-app/src/views/MyQuoteDetail.vue` 未做代码修改；客户侧通过 existing quote detail line_items / pricing snapshot 读取简化报价组成。

## 3. Schema / Migration 方案

新增 migration：`backend/migrations/004_create_quote_line_item_storage.sql`。

新增表：`quote_line_items`。

字段覆盖：

- `id`
- `quote_id`
- `client_item_id`
- `schema_version`
- `line_item_type`
- `label`
- `amount`
- `amount_basis`
- `customer_explanation`
- `admin_edit_hint`
- `party_scene_config_path`
- `is_optional`
- `is_selected`
- `display_order`
- `raw_json`
- `created_at`
- `updated_at`

约束：

- `quote_id` foreign key -> `quotes.id`
- `line_item_type` CHECK:
  - `venue_fee`
  - `decor_fee`
  - `supplier_fee`
  - `labor_fee`
  - `transport_fee`
  - `service_fee`
  - `optional_upgrade`
- `amount >= 0`
- `is_optional` / `is_selected` in `0, 1`

`ensure_stage2_quote_sqlite_schema` 在 local/staging SQLite profile 下会自动执行 004 migration，以兼容旧 `/tmp` 验收库。

## 4. API Endpoint

新增 admin-only local/staging skeleton endpoints：

- `GET /api/quotes/{quote_id}/line-items`
- `PUT /api/quotes/{quote_id}/line-items`

行为：

- 校验 quote 存在。
- `GET` 读取 `quote_line_items`，若为空则 fallback 到 `quotes.line_items_json`。
- `PUT` 替换当前 quote draft line items。
- `PUT` 同步更新 `quotes.line_items_json`、`subtotal`、`final_total` preview。
- 不创建 Order。
- 不创建 PaymentIntent。
- 不触发 payment、Stripe、webhook、n8n、email、SMS、WhatsApp 或合同。

## 5. AdminQuoteDetail 保存路径

Admin Quote Detail 现在：

1. 加载时优先 `GET /api/quotes/{id}/line-items`。
2. 如果 backend line item API 不可用，fallback 到 browser localStorage 或 existing quote line_items。
3. 保存时优先 `PUT /api/quotes/{id}/line-items`。
4. 保存成功后清理本地 fallback draft。
5. 保存失败时保留 localStorage fallback。
6. 继续支持新增、编辑、删除 draft line item。
7. 继续重算 subtotal / final_total preview。

## 6. MyQuoteDetail 简化展示

客户侧继续读取 quote detail 中的 `line_items` 或 existing pricing snapshot，并仅展示简化报价组成。

后台字段 `admin_edit_hint` 只用于 admin draft 编辑，不作为客户侧解释内容展示。

## 7. Fallback 策略

Fallback 仍保留：

- Backend API 不可用时，Admin Quote Detail 保存到 localStorage。
- Quote detail 不可用时，Admin Quote Detail 使用 local/staging fallback quote。
- Customer side 仍可从 demo/fixture quote 或 pricing snapshot 显示报价组成。

## 8. Migration Dry-run 结果

通过。

执行顺序：

1. `001_create_lead_storage.sql`
2. `002_create_quote_storage.sql`
3. `003_create_order_storage.sql`
4. `004_create_quote_line_item_storage.sql`

Dry-run database：

`/tmp/partyonce_quote_line_item_migration_dry_run_v2.sqlite`

结果：

- valid quote line item insert：通过
- invalid `quote_id`：被 foreign key 拒绝
- invalid `line_item_type`：被 CHECK constraint 拒绝

## 9. API Smoke 结果

通过。

Safe local/staging profile：

- `PYTHON_DOTENV_DISABLED=1`
- `ENVIRONMENT=staging`
- `DATABASE_URL=sqlite:////tmp/partyonce_quote_line_item_backend_dummy_v2.sqlite`
- `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
- `PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_quote_line_item_api_v2.sqlite`

Smoke coverage：

- `GET /api/health` -> 200
- `POST /api/leads` -> 201
- `PATCH /api/leads/{id}` qualified -> 200
- `POST /api/quotes` -> 201
- `PUT /api/quotes/{id}/line-items` -> 200
- `GET /api/quotes/{id}/line-items` -> 200
- `GET /api/quotes/{id}` -> 200 and returns line_items

Saved line item count：4

Selected total preview：2720.00 AUD

## 10. Backend Restart Persistence 结果

通过。

Backend restart 后，使用同一 SQLite 文件重新读取：

- `GET /api/quotes/1/line-items` -> 200
- line item count：4
- selected_total：2720.00 AUD

说明 line items 已持久化在 local/staging SQLite 中，不是进程内临时数据。

## 11. Frontend Build / Route Smoke 结果

Frontend build：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_quote_line_item_backend_build --emptyOutDir
```

结果：通过。

未写入 `frontend/vue-app/dist`。

Vue SFC parse：

- `AdminQuoteDetail.vue`：通过
- `MyQuoteDetail.vue`：通过

Route smoke：

- `/admin/quotes/1` -> 200, non-blank, console error 0, broken images 0
- `/my/quotes` -> 200, non-blank, console error 0, broken images 0
- `/my/quotes/1` -> 200, non-blank, console error 0, broken images 0
- `/quote` -> 200, non-blank, console error 0, broken images 0
- `/payment/deposit` -> 200, non-blank, console error 0, broken images 0

## 12. 是否读取/修改 .env.production

否。

本轮没有读取、修改或 staged `.env.production`。

## 13. 是否提交 dist

否。

Build 输出到 `/tmp/partyonce_quote_line_item_backend_build`，没有提交 `frontend/vue-app/dist`。

## 14. 是否 production deploy

否。

没有 production deploy，没有 push production，没有连接 production DB，没有 production migration。

## 15. 是否触发 payment / webhook / n8n / 外发

否。

本轮 endpoints 明确为 Quote line item draft skeleton，不触发：

- PaymentIntent
- Stripe live mode
- webhook
- n8n
- email
- SMS
- WhatsApp
- contract
- invoice

## 16. Blocker

无本轮 blocker。

仍需注意：

- 这是 local/staging skeleton，不是 production invoicing schema。
- 后续正式报价单 / PDF / deposit amount 需要单独的 approval 和 production migration plan。

## 17. 下一步建议

进入 Quote PDF / formal quote preview 前置工作：

1. 锁定客户侧显示字段。
2. 锁定后台可编辑字段。
3. 设计 quote PDF data contract。
4. 在不接 payment 的前提下生成 staging-only formal quote preview。
