#!/bin/bash
# PartyOnce Staging 四闭环复测脚本
# 使用方法: BASE_URL=https://xxx.onrender.com bash curl_commands_staging.sh

BASE_URL=${BASE_URL:-https://partyonce-api.onrender.com}

echo "========================================"
echo "PartyOnce Staging 四闭环复测"
echo "环境: $BASE_URL"
echo "========================================"

# ========== 获取JWT ==========
echo ""
echo "[1/5] 获取JWT Token..."
LOGIN_RESP=$(curl -s --max-time 10 -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@test.com&password=Test12")

JWT=$(echo $LOGIN_RESP | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)

if [ -z "$JWT" ]; then
  echo "尝试注册新账号..."
  curl -s --max-time 10 -X POST "$BASE_URL/api/users/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Test12","full_name":"测试用户"}' > /dev/null
  
  LOGIN_RESP=$(curl -s --max-time 10 -X POST "$BASE_URL/api/users/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=test@test.com&password=Test12")
  JWT=$(echo $LOGIN_RESP | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
fi

if [ -z "$JWT" ]; then
  echo "❌ JWT获取失败"
  echo "登录响应: $LOGIN_RESP"
  exit 1
fi

echo "✅ JWT获取成功"

# ========== A闭环: 供应商入驻 ==========
echo ""
echo "[2/5] A: 供应商入驻闭环..."
A_RESP=$(curl -s --max-time 10 -X POST "$BASE_URL/api/partners/apply" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Staging测试公司","category":"photo","contact_name":"张三","contact_phone":"0412345678","service_area":"悉尼"}')

A_STATUS=$(echo $A_RESP | python3 -c 'import sys,json; d=json.load(sys.stdin); print("PASS" if ("id" in d or "already" in str(d)) else "FAIL")' 2>/dev/null || echo "FAIL")
echo "A: $A_STATUS"

# ========== B闭环: 模板→活动 ==========
echo ""
echo "[3/5] B: 模板→活动闭环..."
B_TEMPLATES=$(curl -s --max-time 10 "$BASE_URL/api/templates")
B_EVENTS=$(curl -s --max-time 10 -H "Authorization: Bearer $JWT" "$BASE_URL/api/my/events")

B1_OK=$(echo $B_TEMPLATES | python3 -c 'import sys,json; d=json.load(sys.stdin); print("OK" if isinstance(d,list) else "FAIL")' 2>/dev/null || echo "FAIL")
B2_OK=$(echo $B_EVENTS | python3 -c 'import sys,json; d=json.load(sys.stdin); print("OK" if isinstance(d,list) else "FAIL")' 2>/dev/null || echo "FAIL")

if [ "$B1_OK" = "OK" ] && [ "$B2_OK" = "OK" ]; then
  echo "B: PASS"
else
  echo "B: FAIL (templates:$B1_OK, events:$B2_OK)"
fi

# ========== C闭环: 分享归因 ==========
echo ""
echo "[4/5] C: 分享归因闭环..."
C_RESP=$(curl -s --max-time 10 -X POST "$BASE_URL/api/shares" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"share_type":"template","target_id":1}')

SHARE_CODE=$(echo $C_RESP | python3 -c "import sys,json; print(json.load(sys.stdin).get('share_code',''))" 2>/dev/null)

if [ -n "$SHARE_CODE" ]; then
  C_TRACK=$(curl -s --max-time 10 -X POST "$BASE_URL/api/shares/$SHARE_CODE/track" \
    -H "Content-Type: application/json" \
    -d '{"event_type":"click","referrer":"wechat"}')
  
  C_STATUS=$(echo $C_TRACK | python3 -c 'import sys,json; d=json.load(sys.stdin); print("PASS" if "event_id" in d else "FAIL")' 2>/dev/null || echo "FAIL")
  echo "C: $C_STATUS"
else
  echo "C: FAIL (无法创建分享)"
fi

# ========== D闭环: 钱包返利 ==========
echo ""
echo "[5/5] D: 钱包返利闭环..."
D_WALLET=$(curl -s --max-time 10 -H "Authorization: Bearer $JWT" "$BASE_URL/api/wallet")

D_STATUS=$(echo $D_WALLET | python3 -c 'import sys,json; d=json.load(sys.stdin); print("PASS" if "id" in d else "FAIL")' 2>/dev/null || echo "FAIL")
echo "D: $D_STATUS"

# ========== 汇总 ==========
echo ""
echo "========================================"
echo "四闭环复测结果"
echo "========================================"
echo "A: $A_STATUS"
echo "B: $([ "$B1_OK" = "OK" ] && [ "$B2_OK" = "OK" ] && echo PASS || echo FAIL)"
echo "C: $([ "$SHARE_CODE" ] && echo $C_STATUS || echo FAIL)"
echo "D: $D_STATUS"
echo "========================================"

# 关键数据摘要
if [ -n "$JWT" ]; then
  echo ""
  echo "[数据摘要]"
  TEMPLATE_COUNT=$(echo $B_TEMPLATES | python3 -c 'import sys,json; d=json.load(sys.stdin); print(len(d))' 2>/dev/null || echo 0)
  EVENT_COUNT=$(echo $B_EVENTS | python3 -c 'import sys,json; d=json.load(sys.stdin); print(len(d))' 2>/dev/null || echo 0)
  WALLET_BALANCE=$(echo $D_WALLET | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("available_balance",0))' 2>/dev/null || echo 0)
  
  echo "模板数: $TEMPLATE_COUNT"
  echo "活动数: $EVENT_COUNT"
  echo "钱包余额: $WALLET_BALANCE"
fi

echo ""
echo "测试完成"
