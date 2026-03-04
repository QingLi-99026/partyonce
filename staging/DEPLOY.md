# PartyOnce Staging 部署指南

**版本**: RC-20260303-01  
**部署方式**: Docker Compose

---

## 快速开始 (30分钟内部署)

### 1. 准备环境 (5分钟)

```bash
# 安装 Docker 和 Docker Compose
# macOS:
brew install docker docker-compose

# Linux:
sudo apt-get install docker docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 配置环境变量 (5分钟)

```bash
cd staging
cp .env.example .env

# 编辑 .env 文件，填写实际值
nano .env  # 或 vim/code
```

**必填项**:
- `SECRET_KEY`: 随机32位字符串
- `DB_ROOT_PASSWORD`: 数据库root密码
- `DB_PASSWORD`: 数据库用户密码

### 3. 一键部署 (10分钟)

```bash
bash deploy.sh
```

或手动执行:
```bash
docker-compose up -d
```

### 4. 验证部署 (10分钟)

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 健康检查
curl http://localhost:8000/api/health

# 访问前端
open http://localhost
```

---

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost | 用户界面 |
| 后端API | http://localhost:8000 | REST API |
| Swagger | http://localhost:8000/docs | API文档 |
| 数据库 | localhost:3306 | MySQL |

---

## 测试账号

部署后使用以下账号测试:

```
邮箱: test@staging.com
密码: Test12
```

---

## 常用命令

```bash
# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# 重启服务
docker-compose restart backend

# 停止所有服务
docker-compose down

# 完全重置（删除数据）
docker-compose down -v
docker-compose up -d

# 进入数据库
docker-compose exec db mysql -u root -p
```

---

## 故障排查

### 问题1: 端口被占用

```bash
# 检查端口占用
lsof -i :8000
lsof -i :3306
lsof -i :80

# 停止占用端口的进程或修改 docker-compose.yml 端口映射
```

### 问题2: 数据库连接失败

```bash
# 查看数据库日志
docker-compose logs db

# 检查环境变量是否正确
cat .env | grep DB_

# 手动连接测试
docker-compose exec db mysql -u partyonce -p
```

### 问题3: 后端启动失败

```bash
# 查看详细日志
docker-compose logs backend

# 检查依赖安装
docker-compose exec backend pip list
```

---

## 生产部署注意事项

1. **修改 SECRET_KEY**: 使用随机生成的强密钥
2. **配置 HTTPS**: 使用 Let's Encrypt 或 Cloudflare
3. **设置防火墙**: 只开放必要端口
4. **配置备份**: 设置自动数据库备份
5. **监控告警**: 配置日志监控和告警

---

## 联系支持

**部署问题**: 查看 logs 或联系开发团队

---

**部署指南维护人**: AI Agent (老四/Moses)  
**最后更新**: 2026-03-03 13:10 AEDT
