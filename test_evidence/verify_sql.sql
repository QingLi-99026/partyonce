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
