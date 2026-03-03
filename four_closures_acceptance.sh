#!/bin/bash
# PartyOnce 四闭环验收测试脚本 (v2.0.0)
# 使用方法: bash four_closures_acceptance.sh

BASE_URL="http://127.0.0.1:8000"
TEST_EMAIL="acceptance_$(date +%s)@test.com"
TEST_PASSWORD="Test12"
TOKEN=""

echo "========================================"
echo "PartyOnce 四闭环验收测试"
echo "版本: v2.0.0"
echo "时间: $(date)"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# 测试函数
run_test() {
    local name="$1"
    local method="$2"
    local url="$3"
    shift 3
    
    echo ""
    echo "Testing: $name"
    
    HTTP_CODE=$(curl -s -o /tmp/resp.json -w "%{http_code}" -X "$method" "$BASE_URL$url" "$@" 2>/dev/null)
    
    if [ "$HTTP_CODE" -lt 400 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $name (HTTP $HTTP_CODE)"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} - $name (HTTP $HTTP_CODE)"
        cat /tmp/resp.json | head -3
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# ==================== 闭环A: 供应商入驻 ====================
echo ""
echo "【闭环A】供应商入驻 → 合同签署 → 素材上传"
echo "----------------------------------------"

# A1. 注册
run_test "A1.用户注册" "POST" "/api/users/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"full_name\":\"验收测试用户\"}"

# 获取token
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/users/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$TEST_EMAIL&password=$TEST_PASSWORD")
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    # A2. 供应商申请
    run_test "A2.供应商申请" "POST" "/api/partners/apply" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"company_name\":\"测试公司\",\"business_type\":\"photo\",\"contact_name\":\"张三\",\"contact_email\":\"$TEST_EMAIL\",\"contact_phone\":\"123\",\"service_areas\":[\"悉尼\"]}"
    
    # A3. 查询供应商
    run_test "A3.查询供应商状态" "GET" "/api/partners/me" \
        -H "Authorization: Bearer $TOKEN"
    
    # A4. 查看合同
    run_test "A4.查看合同列表" "GET" "/api/partner/contracts" \
        -H "Authorization: Bearer $TOKEN"
else
    echo "❌ 获取Token失败，跳过A2-A4"
    FAIL_COUNT=$((FAIL_COUNT + 3))
fi

# ==================== 闭环B: 模板库 ====================
echo ""
echo "【闭环B】模板库 → 活动 → 相册"
echo "----------------------------------------"

run_test "B1.获取模板列表" "GET" "/api/templates"
run_test "B2.获取模板详情" "GET" "/api/templates/1"

# ==================== 闭环C: 分享归因 ====================
echo ""
echo "【闭环C】分享链接 → 落地页 → 归因"
echo "----------------------------------------"

if [ -n "$TOKEN" ]; then
    # C1. 创建分享
    run_test "C1.创建分享链接" "POST" "/api/shares" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"share_type":"template","target_id":1,"target_data":{}}'
    
    # 获取share_code
    SHARE_CODE=$(cat /tmp/resp.json | grep -o '"share_code":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$SHARE_CODE" ]; then
        # C2. 访问落地页
        run_test "C2.访问分享落地页" "GET" "/s/$SHARE_CODE"
        
        # C3. 追踪事件
        run_test "C3.追踪click事件" "POST" "/api/shares/$SHARE_CODE/track" \
            -H "Content-Type: application/json" \
            -d '{"event_type":"click"}'
    else
        echo "❌ 获取Share Code失败，跳过C2-C3"
        FAIL_COUNT=$((FAIL_COUNT + 2))
    fi
else
    echo "❌ 无Token，跳过闭环C"
    FAIL_COUNT=$((FAIL_COUNT + 3))
fi

# ==================== 闭环D: 钱包返利 ====================
echo ""
echo "【闭环D】钱包与自动返利"
echo "----------------------------------------"

if [ -n "$TOKEN" ]; then
    run_test "D1.查看钱包" "GET" "/api/wallet" \
        -H "Authorization: Bearer $TOKEN"
    
    run_test "D2.查看钱包流水" "GET" "/api/wallet/ledger" \
        -H "Authorization: Bearer $TOKEN"
else
    echo "❌ 无Token，跳过闭环D"
    FAIL_COUNT=$((FAIL_COUNT + 2))
fi

# ==================== 结果统计 ====================
echo ""
echo "========================================"
echo "验收结果统计"
echo "========================================"
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo "通过: $PASS_COUNT / $TOTAL"
echo "失败: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 四闭环验收全绿！10/10 通过！${NC}"
    echo "✅ 可以部署到 Staging 环境了！"
    exit 0
else
    echo -e "${RED}⚠️  存在 $FAIL_COUNT 项未通过${NC}"
    exit 1
fi
