# Task Pack 1 验收证据

## Design Tokens

**文件路径**: `frontend/vue-app/src/styles/tokens.css`

包含：
- 字体体系 (12/14/16/20/28)
- 灰阶与主色 (6个语义色)
- 间距、圆角、阴影体系

## 6个基础UI组件

| 组件 | 路径 |
|------|------|
| PoButton | `frontend/vue-app/src/components/PoButton.vue` |
| PoCard | `frontend/vue-app/src/components/PoCard.vue` |
| PoInput | `frontend/vue-app/src/components/PoInput.vue` |
| PoTag | `frontend/vue-app/src/components/PoTag.vue` |
| PoModal | `frontend/vue-app/src/components/PoModal.vue` |
| PoTable | `frontend/vue-app/src/components/PoTable.vue` |

## 截图证据

### Before/After 对比

| 页面 | Before | After |
|------|--------|-------|
| Home | `home-before.png` | `home-after.png` |
| AI Planner | `planner-before.png` | `planner-after.png` |

### 录屏证据

**文件名**: `taskpack1-demo.mp4` (30秒)

**内容**: 主页 → AI策划页 → Button/Card/Input/Modal 交互展示

## 截图/录屏指南

### 本地启动
```bash
cd frontend/vue-app
npm install
npm run dev
```

### 截图要点
1. **Before**: 使用原版 Element Plus 组件的页面
2. **After**: 使用 PoButton/PoCard 等新组件的页面
3. 展示颜色/字体/间距的统一性

### 录屏要点 (30秒)
1. 0-5秒: 首页展示
2. 5-15秒: 点击进入 AI策划页
3. 15-25秒: 展示 Button 点击、Card 悬停、Input 聚焦、Modal 弹窗
4. 25-30秒: 回到首页

---

**请将截图/录屏放入**: `docs/ui-audit/`
