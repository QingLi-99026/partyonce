# ============================================
# PartyOnce 配置检查清单
# ============================================
# 在部署前逐项检查，确保所有配置正确
# ============================================

## 1. 数据库配置

### Railway MySQL
- [ ] 已在 Railway 创建 MySQL 服务
- [ ] 已获取 DATABASE_URL
- [ ] 已测试数据库连接
- [ ] 已运行数据库迁移（创建所有表）

### PlanetScale（如使用）
- [ ] 已在 PlanetScale 创建数据库
- [ ] 已创建 main 分支
- [ ] 已获取连接字符串
- [ ] 已配置 SSL CA 证书路径

### 本地开发
- [ ] 已安装 MySQL
- [ ] 已创建数据库 `partyonce`
- [ ] 已配置数据库用户权限

---

## 2. Cloudflare R2 对象存储配置

### 创建存储桶
- [ ] 已登录 Cloudflare Dashboard
- [ ] 已进入 R2 服务
- [ ] 已创建存储桶 `partymaster-uploads`
- [ ] 已选择合适地区

### API 凭证
- [ ] 已创建 R2 API Token
- [ ] 已选择权限：Object Read & Write
- [ ] 已保存 Access Key ID
- [ ] 已保存 Secret Access Key
- [ ] 已复制 Endpoint URL

### CORS 配置
- [ ] 已进入存储桶设置
- [ ] 已添加 CORS Policy
- [ ] 已添加本地开发域名 `http://localhost:8080`
- [ ] 已添加生产域名 `https://your-frontend.vercel.app`
- [ ] 已允许方法：GET, PUT, POST, DELETE
- [ ] 已允许 Headers: *

### 公共访问
- [ ] 已记录 Public URL（格式：https://pub-<account-id>.r2.dev）
- [ ] 已测试文件上传（使用测试脚本）
- [ ] 已测试文件访问（通过 Public URL）

### 自定义域名（可选）
- [ ] 已配置自定义域名
- [ ] 已添加 DNS 记录
- [ ] 已验证域名可用

---

## 3. 后端部署

### 通用检查项
- [ ] 已更新 requirements.txt（包含 boto3）
- [ ] 已配置所有环境变量
- [ ] 已更新 CORS 允许的域名
- [ ] 已设置正确的 SECRET_KEY（至少 32 字符）

### Render 部署
- [ ] 已连接 Git 仓库
- [ ] 已设置 Build Command: `pip install -r requirements.txt`
- [ ] 已设置 Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] 已添加所有环境变量
- [ ] 已部署并测试健康检查端点 `/api/health`
- [ ] 已测试用户注册 API
- [ ] 已测试用户登录 API
- [ ] 已测试文件上传 Presign URL API

### Railway 部署（如使用）
- [ ] 已连接 Git 仓库
- [ ] 已添加 MySQL 服务
- [ ] 已配置环境变量
- [ ] 已部署成功

---

## 4. 前端部署

### 通用检查项
- [ ] 已配置 API 基础 URL
- [ ] 已配置 R2 Public URL
- [ ] 已测试生产构建 `npm run build`

### Vercel 部署
- [ ] 已导入项目
- [ ] 已选择 Vue.js 框架
- [ ] 已配置环境变量
- [ ] 已配置路由重写规则（vercel.json）
- [ ] 已部署成功
- [ ] 已验证所有页面可访问
- [ ] 已测试 API 调用无 CORS 错误
- [ ] 已测试文件上传功能

### Netlify 部署（如使用）
- [ ] 已连接 Git 仓库
- [ ] 已配置构建设置
- [ ] 已配置环境变量
- [ ] 已添加 `_redirects` 文件
- [ ] 已部署成功

---

## 5. 功能测试

### 用户认证
- [ ] 用户注册正常
- [ ] 用户登录正常
- [ ] Token 刷新正常
- [ ] 受保护路由访问正常

### AI 策划
- [ ] 已配置 OpenAI API Key
- [ ] 生成策划方案正常
- [ ] 获取方案列表正常
- [ ] 选择方案正常

### 场地管理
- [ ] 场地列表正常
- [ ] 场地详情正常
- [ ] 场地搜索正常

### 报价系统
- [ ] 报价计算正常
- [ ] 创建报价正常
- [ ] 更新报价正常
- [ ] 发送报价正常
- [ ] 审批/拒绝报价正常

### 3D 设计
- [ ] 创建设计正常
- [ ] 保存设计正常
- [ ] 获取设计正常
- [ ] 复制设计正常

### 文件上传
- [ ] 获取 Presign URL 正常
- [ ] 前端直传文件正常
- [ ] 文件访问 URL 正常
- [ ] 删除文件正常

---

## 6. 安全与监控

### 安全配置
- [ ] 已更改默认 SECRET_KEY
- [ ] 已启用生产环境 DEBUG=false
- [ ] 已配置正确的 CORS 域名（非通配符）
- [ ] 已配置 HTTPS 强制跳转
- [ ] 数据库密码强度足够

### 监控（可选）
- [ ] 已配置 Sentry（如使用）
- [ ] 已配置日志收集
- [ ] 已配置健康检查告警

---

## 7. 性能优化

### 数据库
- [ ] 已添加必要索引
- [ ] 已配置连接池

### 缓存（可选）
- [ ] 已配置 Redis
- [ ] 已配置查询缓存

### 静态资源
- [ ] 已配置 CDN（R2 + 自定义域名）
- [ ] 已启用文件压缩

---

## 8. 文档与备份

### 文档
- [ ] 已更新 API 文档
- [ ] 已更新部署文档
- [ ] 已记录环境变量清单

### 备份
- [ ] 已配置数据库自动备份
- [ ] 已测试数据恢复流程
- [ ] 已记录备份策略

---

## 部署验证命令

```bash
# 1. 健康检查
curl https://your-api.render.com/api/health

# 2. 用户注册测试
curl -X POST https://your-api.render.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'

# 3. 获取上传 URL 测试
curl -X POST "https://your-api.render.com/api/upload/url" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.jpg","content_type":"image/jpeg"}'

# 4. 前端访问测试
curl https://your-frontend.vercel.app
```

---

## 问题排查

### CORS 错误
1. 检查后端 CORS 配置中的 allow_origins
2. 检查前端 API URL 是否正确
3. 检查是否使用 HTTPS

### 数据库连接失败
1. 检查 DATABASE_URL 格式
2. 确认数据库服务运行中
3. 检查防火墙/安全组设置

### 文件上传失败
1. 检查 R2 环境变量
2. 测试 R2 连接：`cd backend && python r2_storage.py`
3. 检查 CORS 配置是否包含前端域名

### 内存不足（Render Free）
- 升级到付费计划
- 优化数据库查询
- 使用缓存减少计算

---

## 联系与支持

- 项目文档: https://github.com/your-org/partyonce
- 问题反馈: https://github.com/your-org/partyonce/issues
- 技术支持: support@partymaster.app

---

**最后更新**: 2024-03-03  
**版本**: v1.0.0
