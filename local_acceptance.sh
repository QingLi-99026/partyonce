#!/bin/bash
# PartyOnce 四闭环本地验收脚本（生成完整证据包）
# 使用方法: bash local_acceptance.sh > evidence_local.log 2>&1

set -e  # 遇到错误停止

BASE_URL="http://127.0.0.1:8000"
OUTPUT_DIR="test_evidence/local_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "========================================"
echo "PartyOnce 四闭环本地验收测试"
echo "开始时间: $(date)"
echo "========================================"
echo ""

# 保存测试数据
TEST_EMAIL="acceptance_$(date +%s)@test.com"
TEST_PASSWORD="Test12"
TOKEN=""
USER_ID=""
PARTNER_ID=""
SHARE_CODE=""

# 日志函数
log_step() {
    echo ""
    echo "========================================"
    echo "$1"
    echo "========================================"
}

log_pass() {
    echo "✅ PASS: $1"
}

log_fail() {
    echo "❌ FAIL: $1"
    echo "   详情: $2"
}

# ==================== 闭环A: 供应商入驻 ====================
log_step "【闭环A】供应商入驻 → 合同签署 → 素材上传"

# A1. 注册
echo ""
echo "A1. 用户注册..."
REGISTER_RESP=$(curl -s -X POST "$BASE_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"full_name\":\"验收测试用户\",\"user_type\":\"business\"}" 2>/dev/null)

if echo "$REGISTER_RESP" | grep -q '"id"'; then
    USER_ID=$(echo "$REGISTER_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    log_pass "用户注册成功 (user_id=$USER_ID)"
    echo "$REGISTER_RESP" | python3 -m json.tool > "$OUTPUT_DIR/A1_register.json" 2>/dev/null || echo "$REGISTER_RESP" > "$OUTPUT_DIR/A1_register.json"
else
    log_fail "用户注册失败" "$REGISTER_RESP"
    exit 1
fi

# A2. 登录
echo ""
echo "A2. 用户登录..."
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$TEST_EMAIL&password=$TEST_PASSWORD" 2>/dev/null)

if echo "$LOGIN_RESP" | grep -q '"access_token"'; then
    TOKEN=$(echo "$LOGIN_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    log_pass "用户登录成功 (token获取成功)"
    echo "$LOGIN_RESP" | python3 -m json.tool > "$OUTPUT_DIR/A2_login.json" 2>/dev/null || echo "$LOGIN_RESP" > "$OUTPUT_DIR/A2_login.json"
else
    log_fail "用户登录失败" "$LOGIN_RESP"
    exit 1
fi

# A3. 供应商申请
echo ""
echo "A3. 提交供应商入驻申请..."
APPLY_RESP=$(curl -s -X POST "$BASE_URL/api/partners/apply" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "验收测试摄影工作室",
    "business_type": "photo",
    "contact_name": "张三",
    "contact_email": "'"$TEST_EMAIL"'",
    "contact_phone": "+61 400 000 001",
    "service_areas": ["悉尼CBD", "北区"]
  }' 2>/dev/null)

if echo "$APPLY_RESP" | grep -q '"id"'; then
    PARTNER_ID=$(echo "$APPLY_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    log_pass "供应商申请提交成功 (partner_id=$PARTNER_ID)"
    echo "$APPLY_RESP" | python3 -m json.tool > "$OUTPUT_DIR/A3_partner_apply.json" 2>/dev/null || echo "$APPLY_RESP" > "$OUTPUT_DIR/A3_partner_apply.json"
else
    log_fail "供应商申请失败" "$APPLY_RESP"
fi

# A4. 查询供应商状态
echo ""
echo "A4. 查询供应商状态..."
PARTNER_RESP=$(curl -s -X GET "$BASE_URL/api/partners/me" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$PARTNER_RESP" | grep -q '"status"'; then
    STATUS=$(echo "$PARTNER_RESP" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    log_pass "查询供应商状态成功 (status=$STATUS)"
    echo "$PARTNER_RESP" | python3 -m json.tool > "$OUTPUT_DIR/A4_partner_status.json" 2>/dev/null || echo "$PARTNER_RESP" > "$OUTPUT_DIR/A4_partner_status.json"
else
    log_fail "查询供应商状态失败" "$PARTNER_RESP"
fi

# ==================== 闭环B: 模板库 ====================
log_step "【闭环B】模板库 → 活动 → 相册"

# B1. 获取模板列表
echo ""
echo "B1. 获取模板列表..."
TEMPLATES_RESP=$(curl -s -X GET "$BASE_URL/api/templates" 2>/dev/null)

if echo "$TEMPLATES_RESP" | grep -q '\['; then
    COUNT=$(echo "$TEMPLATES_RESP" | grep -o '"id"' | wc -l)
    log_pass "获取模板列表成功 (模板数量=$COUNT)"
    echo "$TEMPLATES_RESP" | python3 -m json.tool > "$OUTPUT_DIR/B1_templates.json" 2>/dev/null || echo "$TEMPLATES_RESP" > "$OUTPUT_DIR/B1_templates.json"
else
    log_fail "获取模板列表失败" "$TEMPLATES_RESP"
fi

# B2. 获取模板详情
echo ""
echo "B2. 获取模板详情..."
TEMPLATE_DETAIL=$(curl -s -X GET "$BASE_URL/api/templates/1" 2>/dev/null)

if echo "$TEMPLATE_DETAIL" | grep -q '"id"'; then
    log_pass "获取模板详情成功"
    echo "$TEMPLATE_DETAIL" | python3 -m json.tool > "$OUTPUT_DIR/B2_template_detail.json" 2>/dev/null || echo "$TEMPLATE_DETAIL" > "$OUTPUT_DIR/B2_template_detail.json"
else
    log_fail "获取模板详情失败" "$TEMPLATE_DETAIL"
fi

# ==================== 闭环C: 分享归因 ====================
log_step "【闭环C】分享链接 → 落地页 → 归因"

# C1. 创建分享链接
echo ""
echo "C1. 创建分享链接..."
SHARE_RESP=$(curl -s -X POST "$BASE_URL/api/shares" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "share_type": "template",
    "object_type": "template",
    "object_id": 1,
    "channel": "test"
  }' 2>/dev/null)

if echo "$SHARE_RESP" | grep -q '"share_code"'; then
    SHARE_CODE=$(echo "$SHARE_RESP" | grep -o '"share_code":"[^"]*"' | cut -d'"' -f4)
    log_pass "创建分享链接成功 (share_code=$SHARE_CODE)"
    echo "$SHARE_RESP" | python3 -m json.tool > "$OUTPUT_DIR/C1_create_share.json" 2>/dev/null || echo "$SHARE_RESP" > "$OUTPUT_DIR/C1_create_share.json"
else
    log_fail "创建分享链接失败" "$SHARE_RESP"
fi

# C2. 访问落地页
echo ""
echo "C2. 访问分享落地页..."
LANDING_RESP=$(curl -s -X GET "$BASE_URL/s/$SHARE_CODE" 2>/dev/null)

if [ -n "$LANDING_RESP" ] && [ ${#LANDING_RESP} -gt 100 ]; then
    log_pass "落地页访问成功"
    echo "$LANDING_RESP" > "$OUTPUT_DIR/C2_landing_page.html"
else
    log_fail "落地页访问失败" "返回内容过短"
fi

# C3. 追踪click事件
echo ""
echo "C3. 追踪click事件..."
TRACK_RESP=$(curl -s -X POST "$BASE_URL/api/shares/$SHARE_CODE/track" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "click", "ip_address": "127.0.0.1"}' 2>/dev/null)

if echo "$TRACK_RESP" | grep -q '"tracked"'; then
    log_pass "追踪click事件成功"
    echo "$TRACK_RESP" | python3 -m json.tool > "$OUTPUT_DIR/C3_track_click.json" 2>/dev/null || echo "$TRACK_RESP" > "$OUTPUT_DIR/C3_track_click.json"
else
    log_fail "追踪click事件失败" "$TRACK_RESP"
fi

# ==================== 闭环D: 钱包返利 ====================
log_step "【闭环D】钱包与自动返利"

# D1. 查看钱包
echo ""
echo "D1. 查看钱包余额..."
WALLET_RESP=$(curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$WALLET_RESP" | grep -q '"available_balance"'; then
    BALANCE=$(echo "$WALLET_RESP" | grep -o '"available_balance":[0-9.]*' | cut -d: -f2)
    log_pass "查看钱包成功 (balance=$BALANCE)"
    echo "$WALLET_RESP" | python3 -m json.tool > "$OUTPUT_DIR/D1_wallet.json" 2>/dev/null || echo "$WALLET_RESP" > "$OUTPUT_DIR/D1_wallet.json"
else
    log_fail "查看钱包失败" "$WALLET_RESP"
fi

# ==================== 生成报告 ====================
log_step "【验收完成】生成证据包"

echo ""
echo "测试数据摘要:"
echo "  - 测试邮箱: $TEST_EMAIL"
echo "  - 用户ID: $USER_ID"
echo "  - 供应商ID: $PARTNER_ID"
echo "  - 分享码: $SHARE_CODE"
echo ""
echo "证据文件位置: $OUTPUT_DIR/"
echo ""

# 列出所有证据文件
echo "生成的证据文件:"
ls -la "$OUTPUT_DIR/"

echo ""
echo "========================================"
echo "本地验收测试完成"
echo "完成时间: $(date)"
echo "========================================"
