#!/bin/bash
# PartyOnce Staging 一键部署脚本
# 使用方法: bash staging/deploy.sh

set -e  # 遇到错误停止

echo "🚀 PartyOnce Staging 部署脚本"
echo "================================"
echo ""

# 检查命令
command -v docker-compose >/dev/null 2>&1 || { echo "❌ 需要 docker-compose"; exit 1; }

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，使用示例配置..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件设置正确的环境变量"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' .env | xargs)

echo "📦 步骤 1/5: 构建镜像..."
docker-compose build

echo ""
echo "📦 步骤 2/5: 启动数据库..."
docker-compose up -d db
sleep 5  # 等待数据库启动

echo ""
echo "📦 步骤 3/5: 执行数据库迁移..."
docker-compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD $DB_NAME < ../database/final_schema_v2.0.0.sql || {
    echo "⚠️  迁移可能已执行过，继续..."
}

echo ""
echo "📦 步骤 4/5: 启动后端服务..."
docker-compose up -d backend

echo ""
echo "📦 步骤 5/5: 启动前端服务..."
docker-compose up -d frontend

echo ""
echo "================================"
echo "✅ 部署完成！"
echo "================================"
echo ""
echo "访问地址:"
echo "  • 前端: http://localhost:80"
echo "  • 后端API: http://localhost:8000"
echo "  • Swagger文档: http://localhost:8000/docs"
echo "  • 数据库: localhost:3306"
echo ""
echo "健康检查:"
curl -s http://localhost:8000/api/health | python3 -m json.tool 2>/dev/null || echo "服务启动中，请稍后再试..."
echo ""
echo "查看日志:"
echo "  docker-compose logs -f backend"
echo ""
