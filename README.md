# 3D Model Editor

基于 Vue3 + Three.js 构建的现代化3D模型编辑器框架。

## 声明

本项目仅用于**学习和研究**目的。

**版权所有** © 2026 threelab 团队

---

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Three.js** - WebGL 3D 图形库
- **Vite** - 下一代前端构建工具

## 功能特性

- ✅ 3D 场景管理
- ✅ 相机控制（旋转、平移、缩放）
- ✅ 对象变换（移动、旋转、缩放）
- ✅ 光照系统
- ✅ 对象选择与管理
- ✅ SDK 化设计

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build
```

## 项目结构

```
src/
├── core/
│   ├── SceneManager.ts   # 场景管理核心类
│   └── index.ts          # 统一导出入口
├── components/
│   └── SceneView.vue     # 3D场景视图组件
├── App.vue               # 应用主组件
└── main.ts               # 入口文件
```

## 许可证

仅供学习使用，未经授权不得用于商业用途。

## Git 配置

如需推送代码到远程仓库，请确保已正确配置 Git 远程地址：

```bash
# 查看当前远程配置
git remote -v

# 设置正确的远程仓库地址
git remote set-url origin git@github.com:threelab/three-vue-edit.git
```

**注意**: 如果遇到网络连接问题，请检查网络环境或使用 HTTPS 协议：
```bash
git remote set-url origin https://github.com/threelab/three-vue-edit.git
```