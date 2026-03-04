#!/bin/bash
# Staging 四闭环测试脚本
# 用法: BASE_URL=https://partyonce-api.onrender.com bash test_evidence/curl_commands_staging.sh

BASE_URL=${BASE_URL:-http://localhost:8000}

echo "=== Staging环境: $BASE_URL ==="

# 登录获取JWT
JWT=$(curl -s -X POST $BASE_URL/api/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@test.com&password=Test12" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)

if [ -z "$JWT" ]; then
  # 尝试注册
  curl -s -X POST $BASE_URL/api/users/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Test12","full_name":"测试用户"}' > /dev/null
  # 重新登录
  JWT=$(curl -s -X POST $BASE_URL/api/users/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=test@test.com&password=Test12" | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
fi

echo "JWT: ${JWT:0:20}..."

# A闭环
echo ""
echo "=== A: 供应商入驻 ==="
A=$(curl -s -X POST $BASE_URL/api/partners/apply \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Staging测试","category":"photo","contact_name":"张三","contact_phone":"0412345678","service_area":"悉尼"}')
echo "A: $(echo $A | python3 -c 'import sys,json; d=json.load(sys.stdin); print("PASS" if "id" in d or "already" in str(d) else "FAIL")' 2>/dev_null || echo 'FAIL')"

# B闭环
echo ""
echo "=== B: 模板→活动 ==="
B1=$(curl -s $BASE_URL/api/templates)
B2=$(curl -s -H "Authorization: Bearer $JWT" $BASE_URL/api/my/events)
B1_OK=$(echo $B1 | python3 -c 'import sys,json; d=json.load(sys.stdin); print("OK" if isinstance(d,list) else "FAIL")' 2>/dev/null)
B2_OK=$(echo $B2 | python3 -c 'import sys,json; d=json.load(sys.stdin); print("OK" if isinstance(d,list) else "FAIL")' 2>/dev/null)
echo "B: $(if [ "$B1_OK" = "OK" ] && [ "$B2_OK" = "OK" ]; then echo PASS; else echo FAIL; fi)"

# C闭环
echo ""
echo "=== C: 分享归因 ==="
C=$(curl -s -X POST $BASE_URL/api/shares \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"share_type":"template","target_id":1}')
SHARE_CODE=$(echo $C | python3 -c "import sys,json; print(json.load(sys.stdin).get('share_code',''))" 2>/dev/null)
if [ -n "$SHARE_CODE" ]; then
  C_TRACK=$(curl -s -X POST "$BASE_URL/api/shares/$SHARE_CODE/track" \
    -H "Content-Type: application/json" \
    -d '{"event_type":"click","referrer":"wechat"}')
  C_OK=$(echo $C_TRACK | python3 -c 'import sys,json; d=json.load(sys.stdin); print("PASS" if "event_id" in d else "FAIL")' 2>/dev/null)
  echo "C: $C_OK"
else
  echo "C: FAIL (no share_code)"
fi

# D闭环
echo ""
echo "=== D: 钱包返利 ==="
D=$(curl -s -H "Authorization: Bearer $JWT" $BASE_URL/api/wallet)
D_OK=$(echo $D | python3 -c 'import sys,json; d=json.load(sys.stdin); print("PASS" if "id" in d else "FAIL")' 2>/dev/null)
echo "D: $D_OK"

echo ""
echo "=== 完成 ==="
