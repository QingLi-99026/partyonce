# PartyOnce Staging 部署配置 (Stage-0)
# 部署平台: Render + Railway + Vercel

## 1. Railway MySQL 数据库
- 平台: https://railway.app
- 步骤: New Project → Add MySQL
- 获取连接信息: Variables → 复制 Internal URL
- 或手动获取: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
- DATABASE_URL 格式模板:
  ```
  mysql+pymysql://USER:PASSWORD@HOST:PORT/DB
  ```

## 2. Railway SQL 执行
- 执行顺序:
  1. `database/migration_phase_1_4.sql`
  2. `database/patch_create_events.sql`
- 验证: Connect → Query `SHOW TABLES;` (应≥15个表)

## 3. Render 后端部署
- 平台: https://render.com
- 新建: Web Service → Connect GitHub
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- 环境变量 (Values不在聊天传输):
  - `DATABASE_URL` (Railway Internal URL)
  - `SECRET_KEY` (随机32位字符串)
  - `CORS_ORIGINS` (包含Vercel域名: `https://your-app.vercel.app,http://localhost`)
- 部署后: 访问 `/docs` 确认 health endpoint 路径

## 4. Vercel 前端部署
- 平台: https://vercel.com
- 导入: GitHub → 目录 `frontend/vue-app`
- Build: `npm run build`
- 环境变量:
  - `VITE_API_URL=https://your-render-app.onrender.com/api`

## 5. 部署验证
- 部署后提供以下URL用于四闭环复测:
  - 前端: `https://your-app.vercel.app`
  - API: `https://your-render-app.onrender.com`
  - Swagger: `/docs` (确认 health 路由)
