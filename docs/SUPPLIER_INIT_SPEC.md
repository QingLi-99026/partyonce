# PartyOnce 供应商数据初始化规范

## 初始化入口

**API 端点**: `POST /api/admin/suppliers/init`

**用途**: 首次部署或重置时批量导入基础供应商数据

**特点**:
- 幂等设计：重复执行不会重复插入
- 分类完整：覆盖核心供应商类型
- 真实坐标：基于悉尼实际地址
- 可扩展：后续可追加更多供应商

---

## 数据分类标准

### 1. 种子数据（Seed Data）- 系统必需
用于演示和测试，标记 `is_seed = true`

### 2. 模板数据（Template）- 参考示例
用于展示完整字段填写，标记 `is_template = true`

### 3. 真实数据（Real）- 生产使用
实际合作供应商，标记 `is_real = true`

---

## 第一批供应商（5家种子数据）

| 分类 | 名称 | 说明 |
|------|------|------|
| 场地类 | Wannabees Family Play Town | 室内儿童乐园，Frenchs Forest |
| 物料类 | Balloons By Design | 气球装饰，全城配送 |
| 现场服务类 | Little Party Faces | 派对主持+脸部彩绘 |
| 餐饮类 | Cake Mail Sydney | 定制蛋糕+配送 |
| 搭建类 | Sydney Party Decorators | 场地布置+撤场服务 |

---

## 字段清单（必填 vs 选填）

### 必填字段
- `name` - 供应商名称
- `category_level_1` - 一级分类
- `suburb` - 所在区域
- `city` - 城市（默认 Sydney）
- `lat`, `lng` - 经纬度坐标

### 选填字段
- `contact_name` - 联系人
- `phone` - 电话
- `email` - 邮箱
- `address` - 详细地址
- `price_level` - 价格档位（低/中/高/豪华）
- `max_capacity` - 最大容纳人数
- `service_tags` - 服务标签数组
- `cover_image_url` - 封面图URL

---

## 使用方式

```bash
# 执行初始化
curl -X POST https://partyonce-prod.onrender.com/api/admin/suppliers/init \
  -H "Authorization: Bearer <token>"

# 响应
{
  "message": "Suppliers initialized successfully",
  "inserted": 5,
  "categories": ["场地类", "物料类", "现场服务类", "餐饮类", "搭建类"]
}
```
