# Task Pack 1 验收证据

## Design Tokens

**文件路径**: `frontend/vue-app/src/styles/tokens.css`

包含：
- 字体体系：12/14/16/20/28，行高1.6/1.25
- 灰阶体系：--gray-0 到 --gray-900
- 主色体系：--primary-50 到 --primary-900（紫罗兰）
- 语义色：背景/边框/文字/按钮（6个核心语义色）
- 间距/圆角/阴影/动画统一规范

## 6个基础UI组件

| 组件 | 路径 | 说明 |
|------|------|------|
| PoButton | `frontend/vue-app/src/components/PoButton.vue` | 主/次/文字/危险按钮 |
| PoCard | `frontend/vue-app/src/components/PoCard.vue` | 卡片容器，带hover效果 |
| PoInput | `frontend/vue-app/src/components/PoInput.vue` | 输入框，带前缀后缀 |
| PoTag | `frontend/vue-app/src/components/PoTag.vue` | 标签，5种类型 |
| PoModal | `frontend/vue-app/src/components/PoModal.vue` | 弹窗，带动画 |
| PoTable | `frontend/vue-app/src/components/PoTable.vue` | 表格，带排序/空状态 |

## 验收点 Checklist

- [ ] tokens.css 已导入 main.js
- [ ] 6个组件文件已创建
- [ ] 组件使用 CSS Variables，无散落hex色值
- [ ] 首页展示 Button/Card 效果
- [ ] 业务页展示 Input/Modal 交互

## 证据文件

| 类型 | 文件名 | 状态 |
|------|--------|------|
| 首页Before | `before_home.png` | ⬜ 待替换 |
| 首页After | `after_home.png` | ⬜ 待替换 |
| 业务页Before | `before_anypage.png` | ⬜ 待替换 |
| 业务页After | `after_anypage.png` | ⬜ 待替换 |
| 30秒演示 | `demo_30s.mp4` | ⬜ 待替换 |

---

**请将素材放入**: `docs/ui-audit/taskpack1/`
