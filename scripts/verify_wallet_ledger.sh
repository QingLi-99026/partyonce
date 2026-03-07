#!/bin/bash
# Wallet Ledger 自动化验证脚本
# 目标：无 token 返回 401，带有效 token 不再返回 500

BASE_URL="https://partyonce-prod.onrender.com"

echo "=========================================="
echo "Wallet Ledger API 验证"
echo "=========================================="
echo ""

# 测试 1: 无 token 访问
echo "Test 1: GET /api/wallet/ledger (无 token)"
STATUS1=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${BASE_URL}/api/wallet/ledger")
echo "   状态码: $STATUS1"
if [ "$STATUS1" = "401" ] || [ "$STATUS1" = "403" ]; then
    echo "   ✅ PASS (未授权访问被拒绝)"
else
    echo "   ❌ FAIL (期望 401/403, 实际 $STATUS1)"
fi
echo ""

# 测试 2: 无效 token 访问
echo "Test 2: GET /api/wallet/ledger (无效 token)"
STATUS2=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer invalid_token_xyz" \
    "${BASE_URL}/api/wallet/ledger")
echo "   状态码: $STATUS2"
if [ "$STATUS2" = "401" ] || [ "$STATUS2" = "403" ]; then
    echo "   ✅ PASS (无效 token 被拒绝)"
else
    echo "   ❌ FAIL (期望 401/403, 实际 $STATUS2)"
fi
echo ""

# 测试 3: 尝试注册测试用户
echo "Test 3: 注册测试用户"
REGISTER_RESPONSE=$(curl -s --max-time 10 -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test_wallet_'$(date +%s)'@example.com","password":"test123456","full_name":"Test User"}' \
    "${BASE_URL}/api/users/register" 2>/dev/null)
echo "   响应: $REGISTER_RESPONSE"

# 测试 4: 登录获取 token
TEST_EMAIL="test_wallet_$(date +%s)@example.com"
TEST_PASS="test123456"

echo ""
echo "Test 4: 注册用户并登录"
REGISTER=$(curl -s --max-time 10 -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\",\"full_name\":\"Test User\"}" \
    "${BASE_URL}/api/users/register" 2>/dev/null)

echo "   注册响应: $REGISTER"

# 尝试登录
LOGIN=$(curl -s --max-time 10 -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$TEST_EMAIL&password=$TEST_PASS" \
    "${BASE_URL}/api/users/login" 2>/dev/null)

echo "   登录响应: $LOGIN"

# 提取 token
TOKEN=$(echo "$LOGIN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo ""
    echo "Test 5: GET /api/wallet/ledger (有效 token)"
    STATUS5=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
        -H "Authorization: Bearer $TOKEN" \
        "${BASE_URL}/api/wallet/ledger")
    echo "   状态码: $STATUS5"
    
    if [ "$STATUS5" = "200" ]; then
        echo "   ✅ PASS (带有效 token 返回 200)"
    elif [ "$STATUS5" = "500" ]; then
        echo "   ❌ FAIL (返回 500 服务器错误)"
    else
        echo "   ⚠️  其他状态码: $STATUS5"
    fi
    
    # 显示响应内容
    echo ""
    echo "   响应内容:"
    curl -s --max-time 10 \
        -H "Authorization: Bearer $TOKEN" \
        "${BASE_URL}/api/wallet/ledger" | head -200
else
    echo ""
    echo "❌ 无法获取有效 token，跳过 Test 5"
fi

echo ""
echo "=========================================="
echo "验证完成"
echo "=========================================="
