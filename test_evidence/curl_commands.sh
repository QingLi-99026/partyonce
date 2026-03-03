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
