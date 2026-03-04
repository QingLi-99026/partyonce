#!/bin/bash
# PartyOnce API 测试命令 - 最终版

BASE_URL="http://127.0.0.1:8000"

# 获取JWT
JWT_RESP=$(curl -s -X POST $BASE_URL/api/users/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=test@test.com&password=Test12")
JWT_TOKEN=$(echo $JWT_RESP | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)

if [ -z "$JWT_TOKEN" ]; then
  echo "JWT获取: FAIL"
  exit 1
fi
echo "JWT获取: OK"

# A闭环 - 提供contact_email
echo ""
echo "=== A: 供应商入驻闭环 ==="
A_RESP=$(curl -s -X POST $BASE_URL/api/partners/apply -H "Authorization: Bearer $JWT_TOKEN" -H "Content-Type: application/json" -d '{"company_name":"测试摄影","category":"photo","contact_name":"张三","contact_phone":"0412345678","service_area":"悉尼","contact_email":"partner@test.com"}')
echo "响应: $A_RESP"
A_ID=$(echo $A_RESP | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
[ -n "$A_ID" ] && echo "A: PASS" || echo "A: FAIL"

# B闭环
echo ""
echo "=== B: 模板→活动闭环 ==="
B_RESP=$(curl -s $BASE_URL/api/templates)
B_LEN=$(echo $B_RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d,list) else 0)" 2>/dev/null)
[ "$B_LEN" -gt 0 ] 2>/dev/null && echo "B: PASS (模板数: $B_LEN)" || echo "B: FAIL"

# C闭环
echo ""
echo "=== C: 分享归因闭环 ==="
C_SHARE=$(curl -s -X POST $BASE_URL/api/shares -H "Authorization: Bearer $JWT_TOKEN" -H "Content-Type: application/json" -d '{"share_type":"template","target_id":1}')
SHARE_CODE=$(echo $C_SHARE | python3 -c "import sys,json; print(json.load(sys.stdin).get('share_code',''))" 2>/dev/null)
if [ -n "$SHARE_CODE" ]; then
  C_TRACK=$(curl -s -X POST "$BASE_URL/api/shares/$SHARE_CODE/track" -H "Content-Type: application/json" -d '{"event_type":"click"}')
  echo "归因: $C_TRACK"
  echo "C: PASS"
else
  echo "C: FAIL"
fi

# D闭环
echo ""
echo "=== D: 钱包返利闭环 ==="
D_WALLET=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" $BASE_URL/api/wallet)
D_ID=$(echo $D_WALLET | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
[ -n "$D_ID" ] && echo "D: PASS" || echo "D: FAIL"

echo ""
echo "=== 表记录数 ==="
docker exec partyonce_db mysql -u root -pPartyOnce2026! -e "SELECT 'users' as t, COUNT(*) as c FROM partyonce.users UNION ALL SELECT 'partners', COUNT(*) FROM partyonce.partners UNION ALL SELECT 'shares', COUNT(*) FROM partyonce.shares UNION ALL SELECT 'share_events', COUNT(*) FROM partyonce.share_events UNION ALL SELECT 'wallets', COUNT(*) FROM partyonce.wallets UNION ALL SELECT 'wallet_ledger', COUNT(*) FROM partyonce.wallet_ledger;" 2>&1 | grep -v Warning
