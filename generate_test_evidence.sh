#!/bin/bash
# PartyOnce 四个闭环验收测试
# 证据包生成脚本

BASE_URL="http://127.0.0.1:8000"
OUTPUT_DIR="test_evidence"
mkdir -p $OUTPUT_DIR

echo "========================================" 
 tee $OUTPUT_DIR/test_report.txt
echo "PartyOnce 四个闭环验收测试证据包"
echo "生成时间: $(date)"
echo "========================================" 
 tee -a $OUTPUT_DIR/test_report.txt
echo ""

# 保存测试命令
cat > $OUTPUT_DIR/curl_commands.sh << 'EOF'
#!/bin/bash
# PartyOnce API 测试命令

BASE_URL="http://127.0.0.1:8000"

# 1. 注册
curl -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test12","full_name":"测试用户"}'

# 2. 登录
curl -X POST $BASE_URL/api/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@test.com&password=Test12"

# 3. 供应商申请
curl -X POST $BASE_URL/api/partners/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"测试公司","category":"photo","contact_name":"张三","contact_phone":"123","email":"test@test.com","service_area":"悉尼"}'

# 4. 获取供应商信息
curl -H "Authorization: Bearer YOUR_TOKEN" $BASE_URL/api/partners/me

# 5. 查看合同
curl -H "Authorization: Bearer YOUR_TOKEN" $BASE_URL/api/partner/contracts

# 6. 获取模板列表
curl $BASE_URL/api/templates

# 7. 创建分享链接
curl -X POST $BASE_URL/api/shares \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"object_type":"template","object_id":1}'

# 8. 访问分享落地页
curl $BASE_URL/s/SHARE_CODE

# 9. 查看钱包
curl -H "Authorization: Bearer YOUR_TOKEN" $BASE_URL/api/wallet
EOF

chmod +x $OUTPUT_DIR/curl_commands.sh

echo "✅ 测试命令已保存到: $OUTPUT_DIR/curl_commands.sh"
echo ""

# 数据库验证SQL
cat > $OUTPUT_DIR/verify_sql.sql << 'EOF'
-- PartyOnce 四个闭环数据库验证SQL

-- 闭环A: 验证供应商记录
SELECT '=== 闭环A: 供应商记录 ===' AS info;
SELECT id, company_name, category, status, created_at 
FROM partners 
ORDER BY created_at DESC 
LIMIT 5;

-- 验证合同签署记录
SELECT '=== 合同签署记录 ===' AS info;
SELECT pca.id, p.company_name, pc.title, pca.accepted_at
FROM partner_contract_acceptances pca
JOIN partners p ON pca.partner_id = p.id
JOIN partner_contracts pc ON pca.contract_id = pc.id
ORDER BY pca.accepted_at DESC
LIMIT 5;

-- 闭环B: 验证模板库
SELECT '=== 闭环B: 模板库记录 ===' AS info;
SELECT id, name, scene_type, budget_min, budget_max, status
FROM templates
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 5;

-- 闭环C: 验证分享链接和归因
SELECT '=== 闭环C: 分享链接记录 ===' AS info;
SELECT id, share_code, owner_user_id, object_type, object_id, click_count
FROM shares
ORDER BY created_at DESC
LIMIT 5;

SELECT '=== 归因事件记录 ===' AS info;
SELECT se.id, se.share_id, se.event_type, se.user_id, se.created_at
FROM share_events se
ORDER BY se.created_at DESC
LIMIT 10;

-- 闭环D: 验证钱包和返利
SELECT '=== 闭环D: 钱包记录 ===' AS info;
SELECT user_id, available_balance, total_earned, total_withdrawn
FROM wallets
ORDER BY available_balance DESC
LIMIT 5;

SELECT '=== 钱包流水记录 ===' AS info;
SELECT wl.id, wl.user_id, wl.transaction_type, wl.amount, wl.description, wl.created_at
FROM wallet_ledger wl
ORDER BY wl.created_at DESC
LIMIT 10;

-- 返利规则
SELECT '=== 返利规则 ===' AS info;
SELECT id, trigger_event_type, amount, daily_cap, enabled
FROM reward_rules
WHERE enabled = TRUE;
EOF

echo "✅ 数据库验证SQL已保存到: $OUTPUT_DIR/verify_sql.sql"
echo ""

echo "========================================"
echo "证据包生成完成！"
echo "========================================"
echo ""
echo "文件清单:"
echo "  - $OUTPUT_DIR/test_report.txt (测试报告)"
echo "  - $OUTPUT_DIR/curl_commands.sh (测试命令)"
echo "  - $OUTPUT_DIR/verify_sql.sql (数据库验证SQL)"
echo ""
echo "使用方法:"
echo "  1. 启动后端服务: cd backend && uvicorn main:app --reload"
echo "  2. 运行测试: bash $OUTPUT_DIR/curl_commands.sh"
echo "  3. 验证数据: mysql -u root partyonce < $OUTPUT_DIR/verify_sql.sql"
