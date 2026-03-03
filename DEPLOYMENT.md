# PartyOnce 部署文档

本文档详细说明 PartyOnce 项目的完整部署流程，包括后端（FastAPI）、前端（Vue.js）、数据库和对象存储的部署配置。

## 1. 后端部署

### 1.1 Render 部署（推荐）

#### 前置准备
1. 注册 [Render](https://render.com) 账号
2. 将代码推送到 GitHub/GitLab 仓库
3. 准备好 MySQL 数据库（Railway/PlanetScale）
4. 准备好 Redis（Upstash）
5. 准备好 Cloudflare R2 对象存储

#### 创建 Web Service

1. 登录 Render Dashboard
2. 点击 **New +** → **Web Service**
3. 连接你的 Git 仓库
4. 配置以下参数：

| 参数 | 值 |
|------|-----|
| Name | partyonce-api |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Plan | Starter ($7/month) 或更高 |

#### 环境变量配置

在 Render Dashboard → Environment 中添加以下变量：

```bash
# 数据库
DATABASE_URL=mysql+pymysql://username:password@host:port/database

# JWT 密钥
SECRET_KEY=your-super-secret-jwt-key-min-32-characters-long

# OpenAI API（AI 策划功能需要）
OPENAI_API_KEY=sk-your-openai-api-key

# Cloudflare R2 对象存储
R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=partymaster-uploads
R2_PUBLIC_URL=https://pub-your-account-id.r2.dev

# Redis（可选，用于缓存）
REDIS_URL=rediss://default:password@host:port

# 环境
ENVIRONMENT=production
```

#### 数据库迁移

Render 的 Build Command 可以包含数据库迁移：

```bash
pip install -r requirements.txt && python -c "from main import Base, engine; Base.metadata.create_all(bind=engine)"
```

或者在部署后手动执行：

```bash
# 通过 Render Shell 执行
python -c "from main import Base, engine; Base.metadata.create_all(bind=engine)"
```

### 1.2 Railway 部署（备选）

#### 部署步骤

1. 登录 [Railway](https://railway.app)
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择你的仓库
4. Railway 会自动检测 Python 项目
5. 添加 MySQL 服务：
   - 点击 **New** → **Database** → **Add MySQL**
6. 配置环境变量（同上）
7. 部署会自动开始

#### Railway 特有配置

Railway 会自动设置 `PORT` 环境变量，不需要手动配置。

```bash
# 启动命令
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 1.3 Heroku 部署（备选）

#### 部署步骤

1. 安装 Heroku CLI
2. 登录并创建应用：

```bash
heroku login
heroku create partyonce-api
```

3. 添加 MySQL 插件：

```bash
heroku addons:create jawsdb:kitefin  # 免费 MySQL
```

4. 配置环境变量：

```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set OPENAI_API_KEY=your-openai-key
# ... 其他变量
```

5. 创建 `Procfile`：

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

6. 部署：

```bash
git push heroku main
```

---

## 2. 前端部署

### 2.1 Vercel 部署（推荐）

#### 前置准备
1. 注册 [Vercel](https://vercel.com) 账号
2. 将前端代码推送到 GitHub/GitLab

#### 部署步骤

1. 导入项目到 Vercel
2. 配置框架预设为 **Vue.js**
3. 设置构建命令和输出目录：

| 参数 | 值 |
|------|-----|
| Framework Preset | Vue.js |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

4. 配置环境变量：

```bash
VUE_APP_API_URL=https://partymaster-api.render.com
VUE_APP_R2_PUBLIC_URL=https://pub-your-account-id.r2.dev
```

5. 添加 `vercel.json` 配置文件（处理路由）：

```json
{
  "routes": [
    { "src": "/[^.]+", "dest": "/index.html" }
  ]
}
```

6. 点击 Deploy

### 2.2 Netlify 部署（备选）

#### 部署步骤

1. 登录 [Netlify](https://netlify.com)
2. 点击 **Add new site** → **Import an existing project**
3. 选择 Git 提供商和仓库
4. 构建设置：

| 参数 | 值 |
|------|-----|
| Build command | `npm run build` |
| Publish directory | `dist` |

5. 点击 **Show advanced** → **New variable**，添加环境变量

6. 添加 `_redirects` 文件（在 public 目录）：

```
/*    /index.html   200
```

7. 点击 Deploy site

### 2.3 前端 API 代理配置

#### Vercel (vercel.json)

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://partymaster-api.render.com/api/:path*"
    }
  ]
}
```

#### Netlify (netlify.toml)

```toml
[[redirects]]
  from = "/api/*"
  to = "https://partymaster-api.render.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 本地开发 (vue.config.js)

```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
}
```

---

## 3. 数据库部署

### 3.1 Railway MySQL（推荐）

1. 在 Railway Dashboard 创建新项目
2. 点击 **New** → **Database** → **Add MySQL**
3. 等待数据库创建完成
4. 点击数据库服务 → **Connect** 标签
5. 获取连接信息：
   - MYSQLHOST
   - MYSQLPORT
   - MYSQLDATABASE
   - MYSQLUSER
   - MYSQLPASSWORD

6. 构建 `DATABASE_URL`：

```
mysql+pymysql://MYSQLUSER:MYSQLPASSWORD@MYSQLHOST:MYSQLPORT/MYSQLDATABASE
```

### 3.2 PlanetScale（备选）

1. 注册 [PlanetScale](https://planetscale.com)
2. 创建数据库：`partyonce`
3. 创建分支：`main`
4. 获取连接字符串：
   - 进入数据库 → **Connect** → **Connect with** → **General**
   - 选择 **MySQL** 格式

5. 格式：

```
mysql+pymysql://username:password@host/database?ssl_ca=/etc/ssl/cert.pem
```

注意：PlanetScale 需要 SSL，确保在 SQLAlchemy 连接中启用。

### 3.3 数据库初始化

首次部署时需要创建表：

```python
# 在 Python 控制台执行
from main import Base, engine
Base.metadata.create_all(bind=engine)
```

或在部署脚本中自动执行：

```bash
# 添加到 Render Build Command
pip install -r requirements.txt && python -c "from main import Base, engine; Base.metadata.create_all(bind=engine)"
```

---

## 4. Redis 缓存部署

### 4.1 Upstash Redis（推荐）

1. 注册 [Upstash](https://upstash.com)
2. 创建 Redis 数据库
3. 选择区域（建议与后端同区域）
4. 获取连接信息：
   - Endpoint
   - Port
   - Password

5. 构建 `REDIS_URL`：

```
rediss://default:password@endpoint:port
```

---

## 5. Cloudflare R2 对象存储配置

### 5.1 创建 R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **R2** 服务
3. 点击 **Create bucket**
4. 名称：`partymaster-uploads`
5. 地区：选择离用户最近的区域

### 5.2 获取 API 凭证

1. 进入 **R2** → **Manage R2 API Tokens**
2. 点击 **Create API Token**
3. 权限选择：**Object Read & Write**
4. 复制：
   - Access Key ID
   - Secret Access Key

### 5.3 配置 CORS

1. 进入存储桶设置
2. 找到 **CORS Policy**
3. 添加以下配置：

```json
[
  {
    "AllowedOrigins": [
      "https://your-frontend-domain.vercel.app",
      "https://partyonce.netlify.app",
      "http://localhost:8080"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 300
  }
]
```

### 5.4 自定义域名（可选）

1. 在存储桶设置中找到 **Custom Domains**
2. 点击 **Connect Domain**
3. 输入你的域名，如 `cdn.partyonce.app`
4. 按提示添加 DNS 记录

### 5.5 公共访问配置

R2 的公共访问 URL 格式：

```
https://pub-<account-id>.r2.dev/<bucket-name>/<file-path>
```

或使用自定义域名：

```
https://cdn.partyonce.app/<file-path>
```

---

## 6. 完整环境变量清单

### 后端环境变量 (.env)

```bash
# ============================================
# PartyOnce 后端环境变量配置
# ============================================

# 应用配置
ENVIRONMENT=production
DEBUG=false
PORT=8000

# 数据库（必需）
DATABASE_URL=mysql+pymysql://username:password@host:port/partyonce

# JWT 安全配置（必需）
SECRET_KEY=your-super-secret-jwt-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI API（AI 策划功能必需）
OPENAI_API_KEY=sk-your-openai-api-key

# Cloudflare R2 对象存储（文件上传必需）
R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=partymaster-uploads
R2_PUBLIC_URL=https://pub-your-account-id.r2.dev

# Redis 缓存（可选）
REDIS_URL=rediss://default:password@host:port
REDIS_CACHE_TTL=3600

# 邮件服务（可选，用于发送报价邮件）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Sentry 错误追踪（可选）
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
```

### 前端环境变量 (.env.production)

```bash
# ============================================
# PartyOnce 前端环境变量配置
# ============================================

# API 基础 URL
VUE_APP_API_URL=https://partymaster-api.render.com

# R2 公共访问 URL（用于显示上传的文件）
VUE_APP_R2_PUBLIC_URL=https://pub-your-account-id.r2.dev

# 应用配置
VUE_APP_NAME=PartyOnce
VUE_APP_VERSION=1.0.0
```

---

## 7. 部署检查清单

在正式部署前，请确认以下事项：

### 后端检查项

- [ ] 数据库连接正常
- [ ] 所有表已创建（运行迁移脚本）
- [ ] JWT Secret Key 已设置且长度 >= 32
- [ ] OpenAI API Key 已设置（如使用 AI 功能）
- [ ] R2 配置完整（Endpoint、Key、Bucket、Public URL）
- [ ] CORS 已配置允许前端域名
- [ ] 健康检查端点 `/api/health` 可访问
- [ ] 用户注册/登录 API 测试通过

### 前端检查项

- [ ] API URL 指向正确的后端地址
- [ ] R2 Public URL 配置正确
- [ ] 生产构建成功无错误
- [ ] 所有路由可正常访问
- [ ] API 请求无 CORS 错误
- [ ] 文件上传功能正常

### 数据库检查项

- [ ] 数据库可连接
- [ ] 所有表结构正确
- [ ] 字符集为 utf8mb4（支持 emoji）
- [ ] 时区设置正确

### 对象存储检查项

- [ ] 存储桶已创建
- [ ] API Token 权限为 Read & Write
- [ ] CORS 已配置允许前端域名
- [ ] Presign URL 生成正常
- [ ] 文件上传和访问正常

---

## 8. 常见问题排查

### 问题 1：CORS 错误

**症状**：前端调用 API 时报错 `CORS policy: No 'Access-Control-Allow-Origin'`

**解决**：
1. 检查后端 `main.py` 中的 CORS 配置
2. 确保前端域名在 `allow_origins` 列表中
3. 如果使用代理，检查代理配置

### 问题 2：数据库连接失败

**症状**：启动时报 `pymysql.err.OperationalError: (2003, "Can't connect to MySQL server")`

**解决**：
1. 检查 `DATABASE_URL` 格式
2. 确认数据库服务正在运行
3. 检查防火墙/安全组设置
4. 确认用户名密码正确

### 问题 3：文件上传失败

**症状**：上传文件时报错或文件无法访问

**解决**：
1. 检查 R2 凭证是否正确
2. 确认存储桶存在且可写
3. 检查 CORS 配置是否包含前端域名
4. 验证 Presign URL 有效期

### 问题 4：OpenAI API 错误

**症状**：AI 策划功能报错或返回默认方案

**解决**：
1. 检查 `OPENAI_API_KEY` 是否设置
2. 确认 API Key 有效且有额度
3. 查看 OpenAI Dashboard 的使用情况

---

## 9. 域名配置（可选）

### 配置自定义域名

#### 后端域名（Render）

1. 在 Render Dashboard → 你的服务 → **Settings** → **Custom Domains**
2. 点击 **Add Custom Domain**
3. 输入域名：`api.partyonce.app`
4. 按提示添加 CNAME 记录

#### 前端域名（Vercel）

1. 在 Vercel Dashboard → 你的项目 → **Settings** → **Domains**
2. 输入域名：`partyonce.app`
3. 按提示添加 DNS 记录（A 或 CNAME）

#### Cloudflare R2 自定义域名

参考第 5.4 节配置。

---

## 10. 监控与日志

### Render 日志

在 Render Dashboard → 你的服务 → **Logs** 查看实时日志。

### Vercel 日志

在 Vercel Dashboard → 你的项目 → **Logs** 查看部署和运行时日志。

### 添加 Sentry 监控（可选）

1. 注册 [Sentry](https://sentry.io)
2. 创建项目并获取 DSN
3. 添加环境变量：`SENTRY_DSN=your-dsn`
4. 在后端代码中集成 Sentry SDK

---

## 11. 备份与恢复

### 数据库备份

#### Railway 自动备份
Railway 自动提供每日备份，可在 Dashboard → Backups 查看。

#### 手动备份

```bash
# 使用 mysqldump
mysqldump -h host -u user -p database > backup.sql

# 恢复
mysql -h host -u user -p database < backup.sql
```

### R2 存储备份

Cloudflare R2 自动提供数据冗余，跨区域复制可参考 Cloudflare 文档配置。

---

**部署完成！** 如有问题，请检查环境变量配置和日志输出。
