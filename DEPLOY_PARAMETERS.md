# PartyOnce 部署参数清单
# 生成时间: 2026-03-05
# 版本: Stage-0 (无R2)

## 一、Render 后端环境变量

### 必需变量
| 变量名 | 格式/值 | 来源 |
|--------|---------|------|
| DATABASE_URL | mysql+pymysql://USER:PASSWORD@HOST:PORT/DB | Railway Internal URL |
| SECRET_KEY | 随机32位字符串 | openssl rand -hex 32 |
| CORS_ORIGINS | https://xxx.vercel.app,http://localhost:5173 | Vercel部署后填写 |
| ENVIRONMENT | staging | 固定值 |

### 可选变量（Stage-0可不填）
| 变量名 | 用途 |
|--------|------|
| OPENAI_API_KEY | AI策划功能 |
| R2_* | 云存储（暂不启用） |

### Build/Start 命令
```
Build: pip install -r requirements.txt
Start: uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 二、Vercel 前端环境变量

### 必需变量
| 变量名 | 格式 | 说明 |
|--------|------|------|
| VITE_API_URL | https://xxx.onrender.com/api | Render部署后的URL + /api |

### Build 命令（由package.json决定）
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```
Vercel自动识别，无需手动填写

## 三、验收标准（3条自测）

### 1. Swagger文档
- URL: `https://后端域名/docs`
- 预期: 显示FastAPI自动生成的API文档
- 测试: 能看到 `/api/users/login` 等接口列表

### 2. 健康检查
- URL: `https://后端域名/api/health`
- 预期: HTTP 200 + `{"status":"healthy"}`
- 测试: curl或浏览器访问正常返回

### 3. 前端联调
- 打开 `https://前端域名`
- 点击登录/注册，预期: 请求发送到Render后端（非localhost:8000）
- 检查: Network面板看到请求指向 `https://xxx.onrender.com/api/...`

## 四、curl_commands_staging.sh 使用方式

### 修改脚本中的 BASE_URL
```bash
# 第4行修改为Render后端URL
BASE_URL=${BASE_URL:-https://your-render-app.onrender.com}
```

### 执行测试
```bash
cd partyonce
export BASE_URL=https://your-render-app.onrender.com
bash test_evidence/curl_commands_staging.sh
```

### 四闭环判定规则
| 闭环 | 成功标志 |
|------|----------|
| A-供应商入驻 | 返回包含`id`或`already submitted` |
| B-模板→活动 | 模板列表返回数组 + 我的活动返回数组（可为空） |
| C-分享归因 | 创建分享返回`share_code` + track返回`event_id` |
| D-钱包返利 | 返回钱包对象含`available_balance` |

## 五、最常见8个坑排查顺序

### 1. DB连接失败
**现象**: Render日志显示`Can't connect to MySQL`
**排查**: 
- Railway Variables中复制完整Internal URL
- 确认DATABASE_URL格式: `mysql+pymysql://...`（不是`mysql://`）

### 2. CORS错误
**现象**: 前端控制台`CORS policy blocked`
**排查**: 
- Render env中CORS_ORIGINS必须包含Vercel域名
- 格式: `https://xxx.vercel.app,http://localhost:5173`
- 修改后需Redeploy

### 3. 前端仍指向localhost
**现象**: Network面板看到请求发给`localhost:8000`
**排查**: 
- Vercel环境变量VITE_API_URL是否正确
- 重新部署Vercel（环境变量修改后需重新build）

### 4. Render环境变量未生效
**现象**: 日志显示`DATABASE_URL is None`
**排查**: 
- 修改env后必须点击"Manual Deploy" → "Deploy latest commit"
- 或重启服务

### 5. Swagger路径不一致
**现象**: `/docs`打不开或显示404
**排查**: 
- 确认访问的是`https://后端域名/docs`
- 不是`/api/docs`

### 6. 数据库表不存在
**现象**: `Table 'partyonce.events' doesn't exist`
**排查**: 
- Railway SQL Console中执行顺序是否正确
- 先`migration_phase_1_4.sql`后`patch_create_events.sql`

### 7. bcrypt版本冲突
**现象**: 注册500错误
**排查**: 
- 已修复（requirements.txt中`bcrypt==4.0.1`）
- 如仍报错，检查Render是否用了最新代码

### 8. 前端Build失败
**现象**: Vercel部署显示Build Error
**排查**: 
- 检查是否设置了`VITE_API_URL`
- 检查Root Directory是否为`frontend/vue-app`

## 六、快速诊断命令

```bash
# 测试后端健康
curl https://your-render-app.onrender.com/api/health

# 测试登录（获取JWT）
curl -X POST https://your-render-app.onrender.com/api/users/login \
  -d "username=test@test.com&password=Test12"

# 查看Render日志（Dashboard → Logs）
```

---
**生成人**: 老四/Moses
**用途**: Staging部署参考手册
