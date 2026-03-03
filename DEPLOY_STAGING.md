# PartyOnce Staging部署指南

## 1. 后端部署 (Render)

### 创建服务
1. 登录 https://render.com
2. 点击 "New +" → "Web Service"
3. 连接GitHub仓库或上传代码

### 环境变量配置
```bash
# 数据库
DATABASE_URL=mysql+pymysql://username:password@hostname:3306/partyonce

# JWT安全
SECRET_KEY=your-random-secret-key-min-32-characters

# R2对象存储 (Cloudflare)
R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=partyonce-staging
R2_PUBLIC_URL=https://pub-your-account-id.r2.dev

# OpenAI (AI策划功能)
OPENAI_API_KEY=sk-your-openai-key

# 其他
ENVIRONMENT=staging
CORS_ORIGINS=https://staging-partyonce.vercel.app,http://localhost:5173
```

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 2. 前端部署 (Vercel)

### 创建项目
1. 登录 https://vercel.com
2. 导入GitHub仓库
3. 选择 `frontend/vue-app` 目录

### 环境变量
```bash
VITE_API_URL=https://staging-partyonce.onrender.com/api
```

### Build Settings
- Framework: Vue.js
- Build Command: `npm run build`
- Output Directory: `dist`

---

## 3. 数据库 (Railway)

### 创建MySQL实例
1. 登录 https://railway.app
2. 点击 "New Project" → "Add MySQL"
3. 获取连接信息

### 初始化数据库
```bash
mysql -u root -p -h your-host railway < database/final_schema_v2.0.0.sql
```

---

## 4. 一键部署脚本

```bash
#!/bin/bash
# deploy_staging.sh

echo "🚀 PartyOnce Staging部署"

# 1. 检查环境变量
if [ -z "$DATABASE_URL" ]; then
    echo "❌ 缺少 DATABASE_URL"
    exit 1
fi

# 2. 数据库迁移
echo "📦 执行数据库迁移..."
mysql -u root -p partyonce < database/final_schema_v2.0.0.sql

# 3. 启动服务
echo "🚀 启动后端服务..."
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000

echo "✅ 部署完成"
echo "📝 Swagger文档: http://localhost:8000/docs"
```

---

## 5. 验证部署

部署后访问：
- **Swagger**: https://staging-partyonce.onrender.com/docs
- **前端**: https://staging-partyonce.vercel.app
- **健康检查**: https://staging-partyonce.onrender.com/api/health

---

## 6. 测试账号

```
测试邮箱: test@staging.com
测试密码: Test12
```

---

**部署完成后请运行四闭环验收测试！** 🎯
