#!/bin/bash
# PartyOnce 一键部署脚本 (Render/Railway)
# 使用方法: bash deploy.sh

echo "========================================"
echo "PartyOnce 后端部署脚本"
echo "========================================"
echo ""

# 检查环境变量
check_env() {
    local missing=()
    
    [[ -z "$DATABASE_URL" ]] && missing+=("DATABASE_URL")
    [[ -z "$SECRET_KEY" ]] && missing+=("SECRET_KEY")
    [[ -z "$R2_ENDPOINT_URL" ]] && missing+=("R2_ENDPOINT_URL")
    [[ -z "$R2_ACCESS_KEY_ID" ]] && missing+=("R2_ACCESS_KEY_ID")
    [[ -z "$R2_SECRET_ACCESS_KEY" ]] && missing+=("R2_SECRET_ACCESS_KEY")
    [[ -z "$R2_BUCKET_NAME" ]] && missing+=("R2_BUCKET_NAME")
    [[ -z "$R2_PUBLIC_URL" ]] && missing+=("R2_PUBLIC_URL")
    
    if [ ${#missing[@]} -ne 0 ]; then
        echo "❌ 缺少环境变量:"
        printf '%s\n' "${missing[@]}"
        echo ""
        echo "请设置以下环境变量:"
        cat << 'EOF'
export DATABASE_URL="mysql+pymysql://user:pass@host/db"
export SECRET_KEY="your-secret-key"
export R2_ENDPOINT_URL="https://your-account.r2.cloudflarestorage.com"
export R2_ACCESS_KEY_ID="your-key"
export R2_SECRET_ACCESS_KEY="your-secret"
export R2_BUCKET_NAME="partyonce-media"
export R2_PUBLIC_URL="https://cdn.partyonce.au"
EOF
        exit 1
    fi
    
    echo "✅ 环境变量检查通过"
}

# 数据库迁移
run_migration() {
    echo ""
    echo "🔄 执行数据库迁移..."
    
    if command -v mysql &> /dev/null; then
        mysql -u root -e "source database/migration_phase_1_4.sql" 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ 数据库迁移完成"
        else
            echo "⚠️  数据库迁移可能已执行过或出错"
        fi
    else
        echo "⚠️  未找到mysql命令，请手动执行 migration_phase_1_4.sql"
    fi
}

# 安装依赖
install_deps() {
    echo ""
    echo "📦 安装依赖..."
    pip install -r requirements.txt -q
    echo "✅ 依赖安装完成"
}

# 启动服务
start_server() {
    echo ""
    echo "🚀 启动服务..."
    echo "服务将在 http://0.0.0.0:8000 启动"
    echo "Swagger文档: http://0.0.0.0:8000/docs"
    echo ""
    
    uvicorn main:app --host 0.0.0.0 --port 8000
}

# 主流程
check_env
run_migration
install_deps
start_server
