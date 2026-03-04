# PartyOnce Staging 部署步骤

## 1. Railway MySQL 数据库
- 登录 railway.app
- 创建新项目
- 添加 MySQL 插件
- 复制 DATABASE_URL

## 2. Render 后端
- 登录 render.com
- New Web Service
- 连接 GitHub 仓库
- Build: pip install -r backend/requirements.txt
- Start: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
- 添加环境变量

## 3. Vercel 前端
- 登录 vercel.com
- Import Git Repository
- 选择 frontend/vue-app
- Build: npm run build
- Output: dist

## Staging URL
- API: https://partyonce-api.onrender.com
- Frontend: https://partyonce-staging.vercel.app
- Docs: https://partyonce-api.onrender.com/docs
