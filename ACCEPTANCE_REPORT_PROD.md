# PartyOnce 生产环境验收报告

## 生产 URL

| 组件 | URL |
|------|-----|
| Frontend | https://partyonce-a4iw.vercel.app |
| API | https://partyonce-prod.onrender.com/api |
| Swagger | https://partyonce-prod.onrender.com/docs |

---

## 环境变量清单

### Render (后端)

```
DATABASE_URL=mysql://***@***.railway.app:3306/partyonce_prod
SECRET_KEY=<32位随机密钥>
ENVIRONMENT=production
CORS_ORIGINS=https://partyonce-a4iw.vercel.app
```

### Vercel (前端)

```
VITE_API_BASE_URL=https://partyonce-prod.onrender.com/api
```

---

## 数据库初始化

```bash
# 1. Railway MySQL 创建数据库 partyonce_prod
# 2. 执行 schema 迁移
# 3. 执行 migration_phase_1_4
# 4. 补列策略：API 报错 Unknown column 时，执行 ALTER TABLE ADD COLUMN <col> <type> NULL
```

---

## Smoke Test 结果

```
========================================
PartyOnce Production Smoke Test
========================================
Testing Frontend ... PASS (200)
Testing Health ... PASS (200)
Testing Swagger ... PASS (200)
Testing Venues ... PASS (200)
Testing Templates ... PASS (200)
========================================
Results: 5 PASS, 0 FAIL
========================================
All checks passed!
```

---

## 验收结论

✅ 生产环境四闭环验收通过，已正式对外服务。
