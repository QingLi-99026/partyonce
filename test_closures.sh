#!/bin/bash
# PartyOnce 四个闭环验收测试脚本
# 使用方法: bash test_closures.sh

BASE_URL="http://127.0.0.1:8000"
TOKEN=""
USER_ID=""
PARTNER_ID=""
SHARE_CODE=""

echo "========================================"
echo "PartyOnce 四个闭环验收测试"
echo "========================================"
echo ""

# ==================== 闭环A: 供应商入驻 → 合同 → 素材上传 ====================
echo "【闭环A】供应商入驻 → 合同签署 → 素材上传"
echo "----------------------------------------"

# 1. 注册用户
echo "1. 注册测试用户..."
REGISTER_RESP=$(curl -s -X POST "$BASE_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supplier_test@example.com",
    "password": "Test123!",
    "full_name": "测试供应商",
    "user_type": "business"
  }')
echo "响应: $REGISTER_RESP"
USER_ID=$(echo $REGISTER_RESP | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "用户ID: $USER_ID"
echo ""

# 2. 登录获取token
echo "2. 用户登录..."
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=supplier_test@example.com&password=Test123!")
echo "响应: $LOGIN_RESP"
TOKEN=$(echo $LOGIN_RESP | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:30}..."
echo ""

# 3. 提交供应商申请
echo "3. 提交供应商入驻申请..."
APPLY_RESP=$(curl -s -X POST "$BASE_URL/api/partners/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "company_name": "测试摄影工作室",
    "category": "photo",
    "contact_name": "张三",
    "contact_phone": "+61 400 000 001",
    "email": "supplier_test@example.com",
    "service_area": "悉尼CBD, 北区",
    "abn_optional": "12345678901"
  }')
echo "响应: $APPLY_RESP"
PARTNER_ID=$(echo $APPLY_RESP | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "供应商ID: $PARTNER_ID"
echo ""

# 4. 查询供应商状态
echo "4. 查询供应商状态..."
curl -s -X GET "$BASE_URL/api/partners/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 5. 查看合同列表
echo "5. 查看合同列表..."
curl -s -X GET "$BASE_URL/api/partner/contracts" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 6. 确认签署合同（假设合同ID=1）
echo "6. 确认签署合同..."
curl -s -X POST "$BASE_URL/api/partner/contracts/1/accept" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "✅ 闭环A测试完成"
echo ""

# ==================== 闭环B: 模板库 → 订单绑定 → 活动相册 ====================
echo "【闭环B】模板库 → 订单绑定 → 活动相册"
echo "----------------------------------------"

# 1. 获取模板列表
echo "1. 获取模板列表..."
TEMPLATES=$(curl -s -X GET "$BASE_URL/api/templates")
echo "模板列表: $TEMPLATES" | jq '.'
echo ""

# 2. 获取模板详情
echo "2. 获取模板详情 (ID=1)..."
curl -s -X GET "$BASE_URL/api/templates/1" | jq '.'
echo ""

echo "✅ 闭环B测试完成（需先有订单才能完整测试）"
echo ""

# ==================== 闭环C: 分享链接 → 落地页 → 归因 ====================
echo "【闭环C】分享链接 → 落地页 → 归因统计"
echo "----------------------------------------"

# 1. 创建分享链接
echo "1. 创建分享链接..."
SHARE_RESP=$(curl -s -X POST "$BASE_URL/api/shares" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "object_type": "template",
    "object_id": 1,
    "channel": "test"
  }')
echo "响应: $SHARE_RESP"
SHARE_CODE=$(echo $SHARE_RESP | grep -o '"share_code":"[^"]*"' | cut -d'"' -f4)
echo "分享码: $SHARE_CODE"
echo ""

# 2. 访问分享落地页（记录click）
echo "2. 访问分享落地页..."
curl -s -X GET "$BASE_URL/s/$SHARE_CODE" | jq '.'
echo ""

# 3. 追踪注册事件
echo "3. 追踪注册事件..."
curl -s -X POST "$BASE_URL/api/shares/$SHARE_CODE/track" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "signup",
    "user_id": '"$USER_ID"'
  }' | jq '.'
echo ""

echo "✅ 闭环C测试完成"
echo ""

# ==================== 闭环D: 钱包自动入账 ====================
echo "【闭环D】钱包与自动返利"
echo "----------------------------------------"

# 1. 查看钱包
echo "1. 查看钱包余额..."
curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 2. 查看钱包流水
echo "2. 查看钱包流水..."
curl -s -X GET "$BASE_URL/api/wallet/ledger" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 3. 追踪click事件触发返利
echo "3. 追踪click事件触发返利..."
curl -s -X POST "$BASE_URL/api/shares/$SHARE_CODE/track" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "click"
  }' | jq '.'
echo ""

# 4. 再次查看钱包（验证返利入账）
echo "4. 验证返利入账..."
curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "✅ 闭环D测试完成"
echo ""

# ==================== 数据库验证 ====================
echo "【数据库验证】关键表记录"
echo "----------------------------------------"
echo "请执行以下SQL查询验证数据:"
echo ""
echo "-- 1. 验证供应商记录"
echo "SELECT * FROM partners WHERE email='supplier_test@example.com';"
echo ""
echo "-- 2. 验证合同签署记录"
echo "SELECT * FROM partner_contract_acceptances WHERE partner_id=$PARTNER_ID;"
echo ""
echo "-- 3. 验证分享记录"
echo "SELECT * FROM shares WHERE share_code='$SHARE_CODE';"
echo ""
echo "-- 4. 验证归因事件"
echo "SELECT * FROM share_events WHERE share_id=(SELECT id FROM shares WHERE share_code='$SHARE_CODE');"
echo ""
echo "-- 5. 验证钱包记录"
echo "SELECT * FROM wallets WHERE user_id=$USER_ID;"
echo ""
echo "-- 6. 验证钱包流水"
echo "SELECT * FROM wallet_ledger WHERE user_id=$USER_ID;"
echo ""

echo "========================================"
echo "四个闭环验收测试完成！"
echo "========================================"
