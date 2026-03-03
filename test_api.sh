#!/bin/bash
# PartyOnce API 测试脚本
# 测试用户系统和场地系统

echo "🧪 PartyOnce API 测试"
echo "===================="
echo ""

BASE_URL="http://localhost:8000"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "1. 测试根目录..."
response=$(curl -s $BASE_URL/)
if [[ $response == *"PartyOnce API"* ]]; then
    echo -e "${GREEN}✅ 根目录测试通过${NC}"
else
    echo -e "${RED}❌ 根目录测试失败${NC}"
fi
echo ""

echo "2. 测试用户注册..."
register_response=$(curl -s -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User",
    "user_type": "personal",
    "role": "user",
    "phone": "+61400000000"
  }')

if [[ $register_response == *"id"* ]]; then
    echo -e "${GREEN}✅ 用户注册测试通过${NC}"
    echo "响应: $register_response"
else
    echo -e "${RED}❌ 用户注册测试失败${NC}"
    echo "响应: $register_response"
fi
echo ""

echo "3. 测试用户登录..."
login_response=$(curl -s -X POST $BASE_URL/api/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpassword123")

if [[ $login_response == *"access_token"* ]]; then
    echo -e "${GREEN}✅ 用户登录测试通过${NC}"
    TOKEN=$(echo $login_response | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "获取到Token"
else
    echo -e "${RED}❌ 用户登录测试失败${NC}"
    echo "响应: $login_response"
fi
echo ""

echo "4. 测试场地列表..."
venues_response=$(curl -s $BASE_URL/api/venues)

if [[ $venues_response == *"["* ]]; then
    echo -e "${GREEN}✅ 场地列表测试通过${NC}"
    echo "场地数量: $(echo $venues_response | grep -o '"id"' | wc -l)"
else
    echo -e "${RED}❌ 场地列表测试失败${NC}"
    echo "响应: $venues_response"
fi
echo ""

echo "5. 测试合作场地筛选..."
partner_venues=$(curl -s "$BASE_URL/api/venues?partner_only=true")

if [[ $partner_venues == *"is_partner"* ]]; then
    echo -e "${GREEN}✅ 合作场地筛选测试通过${NC}"
else
    echo -e "${RED}❌ 合作场地筛选测试失败${NC}"
fi
echo ""

echo "6. 测试场地详情..."
venue_detail=$(curl -s $BASE_URL/api/venues/1)

if [[ $venue_detail == *"name"* ]]; then
    echo -e "${GREEN}✅ 场地详情测试通过${NC}"
else
    echo -e "${RED}❌ 场地详情测试失败${NC}"
fi
echo ""

echo "===================="
echo "🎉 测试完成！"
echo ""
echo "要启动后端服务器，请运行："
echo "cd ~/.openclaw/workspace/projects/PartyOnce/backend"
echo "pip install -r requirements.txt"
echo "uvicorn main:app --reload"
