# 环境变量配置清单 (Config Summary)

**版本**: RC-20260303-01  
**环境**: Staging

---

## 后端环境变量 (Backend)

### 必填项

| 变量名 | 说明 | 示例值 | 敏感 |
|--------|------|--------|------|
| `DATABASE_URL` | MySQL连接字符串 | `mysql+pymysql://user:pass@host:3306/partyonce` | ⚠️ 是 |
| `SECRET_KEY` | JWT签名密钥 | `your-secret-key-min-32-chars` | ⚠️ 是 |
| `R2_ENDPOINT_URL` | Cloudflare R2端点 | `https://account.r2.cloudflarestorage.com` | 否 |
| `R2_ACCESS_KEY_ID` | R2访问密钥 | `your-access-key-id` | ⚠️ 是 |
| `R2_SECRET_ACCESS_KEY` | R2密钥 | `your-secret-key` | ⚠️ 是 |
| `R2_BUCKET_NAME` | 存储桶名称 | `partyonce-staging` | 否 |
| `R2_PUBLIC_URL` | 公共访问URL | `https://cdn.staging.partyonce.au` | 否 |

### 可选项

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI API密钥 | `sk-xxx` |
| `CORS_ORIGINS` | 允许的跨域来源 | `https://staging.partyonce.au` |
| `LOG_LEVEL` | 日志级别 | `INFO` |
| `ENVIRONMENT` | 环境标识 | `staging` |

### 完整 .env 文件模板

```bash
# ============================================
# PartyOnce Staging 环境变量
# ============================================

# 数据库 (必填)
DATABASE_URL=mysql+pymysql://username:password@hostname:3306/partyonce

# JWT安全 (必填)
SECRET_KEY=your-random-secret-key-min-32-characters-long

# R2对象存储 (必填)
R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=partyonce-staging
R2_PUBLIC_URL=https://pub-your-account-id.r2.dev

# OpenAI (可选)
OPENAI_API_KEY=sk-your-openai-api-key

# 其他配置
CORS_ORIGINS=https://staging-partyonce.vercel.app,http://localhost:5173
LOG_LEVEL=INFO
ENVIRONMENT=staging
```

---

## 前端环境变量 (Frontend)

### 必填项

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_URL` | 后端API地址 | `https://staging-partyonce.onrender.com/api` |

### 完整 .env 文件模板

```bash
# .env
VITE_API_URL=https://staging-partyonce.onrender.com/api

# 可选
VITE_APP_TITLE=PartyOnce Staging
VITE_ENABLE_DEBUG=true
```

---

## 数据库配置

### Railway MySQL

```
Host: containers-xxxxx.railway.app
Port: 3306
Database: railway
Username: root
Password: [从Railway控制台获取]
```

### 连接字符串格式

```
mysql+pymysql://root:password@containers-xxxxx.railway.app:3306/railway
```

---

## 第三方服务

### Cloudflare R2

1. 登录 https://dash.cloudflare.com
2. 进入 R2 存储
3. 创建存储桶 `partyonce-staging`
4. 生成 API Token（权限: 对象读+写）
5. 复制 Endpoint URL

### Render

1. 登录 https://render.com
2. 创建 Web Service
3. 设置环境变量（见上方）
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Vercel

1. 登录 https://vercel.com
2. 导入前端项目
3. 设置 `VITE_API_URL`
4. 部署

---

## 敏感信息处理

⚠️ **警告**: 以下信息必须保密，不得提交到Git仓库

- `DATABASE_URL` 中的密码
- `SECRET_KEY`
- `R2_SECRET_ACCESS_KEY`
- `OPENAI_API_KEY`

**推荐做法**:
1. 使用 `.env` 文件（已加入 `.gitignore`）
2. 使用平台自带的环境变量管理（Render/Vercel）
3. 生产环境使用密钥管理服务

---

## 验证清单

部署前检查:

- [ ] DATABASE_URL 可连接
- [ ] SECRET_KEY 长度 ≥ 32字符
- [ ] R2凭证有效
- [ ] CORS_ORIGINS 包含前端域名
- [ ] 环境变量在平台已设置

---

**配置维护人**: AI Agent (老四/Moses)  
**最后更新**: 2026-03-03 12:50 AEDT
