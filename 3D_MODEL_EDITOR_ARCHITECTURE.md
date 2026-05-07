# 3D模型编辑器 - 完整架构方案

## 目录

1. [技术栈](#1-技术栈)
2. [架构概述](#2-架构概述)
3. [核心设计思想](#3-核心设计思想)
4. [分层架构设计](#4-分层架构设计)
5. [目录结构](#5-目录结构)
6. [核心类设计](#6-核心类设计)
7. [Schema系统](#7-schema系统)
8. [工厂模式实现](#8-工厂模式实现)
9. [插件系统](#9-插件系统)
10. [资产包系统](#10-资产包系统)
11. [源码导出功能](#11-源码导出功能)
12. [实施路线图](#12-实施路线图)
13. [SDK包设计标准](#13-sdk包设计标准)

---

## 1. 技术栈

### 核心技术

| 分类             | 技术                          | 版本    | 说明             |
| ---------------- | ----------------------------- | ------- | ---------------- |
| **3D渲染引擎**   | Three.js                      | 0.183.0 | 核心渲染能力     |
| **物理材质支持** | Three.js MeshPhysicalMaterial | 内置    | PBR材质支持      |
| **模型加载**     | GLTFLoader + DRACOLoader      | 内置    | GLB/GLTF模型支持 |
| **骨骼动画**     | Skeleton + SkinnedMesh        | 内置    | 角色动画支持     |

### 前端框架

| 分类         | 技术         | 版本   | 说明         |
| ------------ | ------------ | ------ | ------------ |
| **前端框架** | Vue          | 3.5.x  | 响应式UI框架 |
| **类型系统** | TypeScript   | ~5.7.2 | 类型安全     |
| **状态管理** | Pinia        | 2.3.x  | 全局状态管理 |
| **路由**     | Vue Router   | 4.0.x  | 页面路由     |
| **UI组件库** | Element Plus | 2.9.x  | UI组件库     |
| **构建工具** | Vite         | 6.1.x  | 快速构建     |

### 工具库

| 分类         | 技术              | 版本  | 说明          |
| ------------ | ----------------- | ----- | ------------- |
| **3D工具**   | @tweenjs/tween.js | ~23.x | 动画补间      |
| **数学计算** | gl-matrix         | 3.4.x | 向量/矩阵运算 |
| **文件解析** | file-saver        | ~2.x  | 文件导出下载  |
| **本地存储** | idb-keyval        | ~6.x  | IndexedDB封装 |

### 开发工具

| 分类         | 技术                | 说明          |
| ------------ | ------------------- | ------------- |
| **代码规范** | ESLint + Prettier   | 代码风格统一  |
| **样式规范** | Stylelint           | CSS规范检查   |
| **Git钩子**  | Husky + lint-staged | 提交前检查    |
| **单元测试** | Vitest              | 组件/模块测试 |

### 技术选型理由

| 技术             | 选型理由                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| **Three.js 183** | LTS版本，稳定可靠，支持所有核心功能（GLTF加载、Physical材质、后期处理） |
| **Vue 3**        | 组合式API适合复杂交互，响应式系统完善                                   |
| **TypeScript**   | 类型安全，减少运行时错误，提升代码质量                                  |
| **Pinia**        | Vue3官方推荐，轻量级，API简洁                                           |
| **Element Plus** | 组件丰富，适合后台管理系统                                              |
| **Vite**         | 快速热更新，开发体验好，兼容性好                                        |

---

## 2. 架构概述

本方案设计了一个**可扩展、可维护、高性能**的3D模型场景编辑器框架，核心特性包括：

- **配置化驱动**：通过Schema定义属性，支持动态UI渲染
- **工厂模式**：统一创建入口，支持插件化扩展
- **资产包系统**：GLB+JSON双产物导出，支持展示/编辑两种模式
- **插件系统**：支持自定义几何体、材质、特效扩展
- **源码导出**：支持TypeScript/Vue/React代码生成

---

## 3. 核心设计思想

| 设计原则       | 说明                                     |
| -------------- | ---------------------------------------- |
| **分层架构**   | UI层 → Controller层 → Factory层 → Core层 |
| **单一职责**   | 每个类只负责一个功能                     |
| **工厂模式**   | 统一对象创建入口，支持扩展               |
| **Schema驱动** | 配置化管理属性，支持条件显示             |
| **插件化**     | 高扩展性，支持自定义功能                 |

---

## 4. 分层架构设计

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: UI层                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PropertyEditor (通用属性编辑器)                     │    │
│  │  PluginPanel (插件面板)                             │    │
│  │  SceneView (场景视图)                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  Layer 3: Controller层                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SceneController (场景控制)                          │    │
│  │  ObjectController (对象控制)                         │    │
│  │  ExportController (导出控制)                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  Layer 2: Factory层                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Geometry    │  │ Material    │  │ Plugin      │          │
│  │ Factory     │  │ Factory     │  │ Registry    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                           │                                 │
│                           ▼                                 │
│  Layer 1: Core层                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SceneManager (场景管理)                             │    │
│  │  ResourceManager (资源管理)                          │    │
│  │  AssetManager (资产管理)                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 目录结构

```
src/
├── core/                    # 核心模块
│   ├── SceneManager.ts      # 场景管理
│   ├── ResourceManager.ts   # 资源管理
│   └── AssetManager.ts      # 资产管理
├── factories/               # 工厂模块
│   ├── GeometryFactory.ts   # 几何体工厂
│   ├── MaterialFactory.ts   # 材质工厂
│   └── TextFactory.ts       # 文字工厂
├── plugins/                 # 插件模块
│   ├── PluginBase.ts        # 插件基类
│   ├── PluginRegistry.ts    # 插件注册表
│   ├── FencePlugin.ts       # 围栏插件示例
│   └── NeonMaterialPlugin.ts # 霓虹材质插件示例
├── types/                   # 类型定义
│   ├── schema.ts            # Schema类型
│   ├── asset.ts             # 资产类型
│   └── plugin.ts            # 插件类型
├── utils/                   # 工具模块
│   ├── AssetExporter.ts     # 资产导出
│   ├── AssetImporter.ts     # 资产导入
│   └── MaterialBaker.ts     # 材质烘焙
├── generators/              # 代码生成器
│   └── CodeGenerator.ts     # 源码导出
├── components/              # UI组件
│   ├── PropertyEditor/      # 属性编辑器
│   ├── SceneView/           # 场景视图
│   └── PluginPanel/         # 插件面板
├── store/                   # 状态管理
│   └── modelEditStore.ts    # 模型编辑状态
└── main.ts                  # 入口文件
```

---

## 6. 核心类设计

### 5.1 SceneManager

```typescript
class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  init(container: HTMLElement): void;
  addObject(object: THREE.Object3D): void;
  removeObject(object: THREE.Object3D): void;
  export(): SceneConfig;
  import(config: SceneConfig): void;
  dispose(): void;
}
```

### 5.2 ResourceManager

```typescript
class ResourceManager {
  private resources: WeakSet<THREE.Object3D>;

  track(resource: THREE.Object3D): void;
  dispose(resource: THREE.Object3D): void;
  loadModel(url: string): Promise<THREE.Group>;
  loadTexture(url: string): Promise<THREE.Texture>;
}
```

### 5.3 AssetManager

```typescript
class AssetManager {
  packages: Record<string, AssetPackage>;

  loadPackage(path: string): Promise<AssetPackage>;
  savePackage(package: AssetPackage, path: string): void;
  listPackages(): string[];
}
```

---

## 7. Schema系统

### 6.1 PropertySchema

```typescript
interface PropertySchema<T = any> {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'color' | 'select' | 'texture';
  default?: T;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
  condition?: {
    field: string;
    operator: '==' | '!=' | '<' | '>';
    value: any;
  };
  validator?: (value: T) => boolean;
}
```

### 6.2 MaterialSchema

```typescript
interface MaterialSchema {
  type: string;
  name: string;
  properties: PropertySchema[];
}
```

### 6.3 SceneConfig

```typescript
interface SceneConfig {
  version: string;
  metadata: {
    name: string;
    author?: string;
    exportedAt: string;
  };
  objects: SceneObject[];
  camera: CameraConfig;
  environment: EnvironmentConfig;
}
```

---

## 8. 工厂模式实现

### 7.1 GeometryFactory

```typescript
class GeometryFactory {
  private static creators: Record<
    string,
    (config: any) => THREE.BufferGeometry
  >;

  static register(
    type: string,
    creator: (config: any) => THREE.BufferGeometry
  ): void;
  static create(type: string, config: any): THREE.BufferGeometry;
  static getTypes(): string[];
}
```

### 7.2 MaterialFactory

```typescript
class MaterialFactory {
  private static creators: Record<string, (config: any) => THREE.Material>;
  private static schemas: Record<string, MaterialSchema>;

  static register(
    type: string,
    creator: (config: any) => THREE.Material,
    schema: MaterialSchema
  ): void;
  static create(type: string, config: any): THREE.Material;
  static getSchema(type: string): MaterialSchema | null;
  static getTypes(): string[];
}
```

---

## 9. 插件系统

### 8.1 PluginBase

```typescript
abstract class PluginBase {
  abstract type: string;
  abstract name: string;

  abstract create(config: Record<string, any>): THREE.Object3D;
  abstract update?(object: THREE.Object3D, config: Record<string, any>): void;
  abstract getSchema?(): PluginConfig;
}
```

### 8.2 PluginRegistry

```typescript
class PluginRegistry {
  private static plugins: Record<string, PluginBase>;

  static register(plugin: PluginBase): void;
  static get(type: string): PluginBase | undefined;
  static create(
    type: string,
    config: Record<string, any>
  ): THREE.Object3D | null;
  static getAll(): PluginConfig[];
}
```

### 8.3 插件开发示例

```typescript
class FencePlugin extends PluginBase {
  type = 'Fence';
  name = '围栏';

  create(config: FenceConfig): THREE.Group {
    // 创建围栏几何体
  }

  update(object: THREE.Group, config: Partial<FenceConfig>): void {
    // 更新围栏配置
  }
}

// 注册插件
PluginRegistry.register(new FencePlugin());
```

---

## 10. 资产包系统

### 9.1 AssetPackage结构

```typescript
interface AssetPackage {
  version: string;
  asset: {
    id: string;
    name: string;
    originalUrl?: string;
    exportedAt: string;
    thumbnail?: string;
  };
  fileHash: string;
  sceneConfig: {
    objectConfigs: ObjectConfig[];
  };
  materialOverrides: MaterialOverrideConfig[];
  effects?: EffectConfig[];
  animations?: AnimationConfig[];
}
```

### 9.2 导出流程

```
编辑器场景 → MaterialBaker烘焙 → 生成baked.glb → 生成meta.json → 打包资产包
```

### 9.3 导入流程

```
加载资产包 → 判断模式 → 展示模式(baked.glb) / 编辑模式(原始模型+meta.json)
```

---

## 11. 源码导出功能

### 10.1 CodeGenerator

```typescript
interface CodeGeneratorOptions {
  format: 'javascript' | 'typescript' | 'vue' | 'react';
  includeComments: boolean;
  minified: boolean;
}

class CodeGenerator {
  static generate(
    sceneConfig: SceneConfig,
    options: CodeGeneratorOptions
  ): string;
}
```

### 10.2 导出格式支持

| 格式       | 扩展名 | 用途           |
| ---------- | ------ | -------------- |
| TypeScript | .ts    | 开发和类型安全 |
| JavaScript | .js    | 通用脚本       |
| Vue        | .vue   | Vue组件        |
| React      | .tsx   | React组件      |

---

## 12. 实施路线图

### 第一阶段：核心基础设施（第1-2周）

| 任务            | 描述                                 |
| --------------- | ------------------------------------ |
| 拆分renderModel | 创建SceneManager、ResourceManager    |
| 实现工厂模式    | 创建GeometryFactory、MaterialFactory |
| 建立类型系统    | 定义Schema类型                       |
| 实现插件注册表  | 建立PluginRegistry                   |

### 第二阶段：核心编辑器功能（第3-4周）

| 任务           | 描述                           |
| -------------- | ------------------------------ |
| 重构属性面板   | 实现Schema驱动的PropertyEditor |
| 实现资产包导出 | 支持GLB+JSON双产物导出         |
| 实现资产包导入 | 支持展示/编辑两种模式          |
| 优化渲染性能   | 使用shallowRef和按需更新       |

### 第三阶段：高级功能扩展（第5-6周）

| 任务               | 描述                     |
| ------------------ | ------------------------ |
| 实现插件系统       | 支持围栏、霓虹材质等插件 |
| 添加自定义材质支持 | 支持自定义着色器和模板   |
| 实现源码导出       | 支持多语言导出           |
| 添加国际化支持     | 支持多语言切换           |

### 第四阶段：优化和完善（第7-8周）

| 任务         | 描述                   |
| ------------ | ---------------------- |
| 完善错误处理 | 添加参数校验和错误提示 |
| 添加单元测试 | 覆盖核心模块           |
| 优化资源管理 | 完善dispose机制        |
| 添加性能监控 | FPS、DrawCall监控面板  |

---

## 附录：关键设计模式总结

| 设计模式       | 应用场景           | 实现位置                         |
| -------------- | ------------------ | -------------------------------- |
| **工厂模式**   | 统一对象创建       | GeometryFactory、MaterialFactory |
| **策略模式**   | 不同材质类型处理   | MaterialFactory                  |
| **观察者模式** | 事件监听和状态同步 | Pinia Store                      |
| **命令模式**   | 撤销/重做功能      | HistoryModules                   |
| **模板方法**   | 插件扩展框架       | PluginBase                       |

---

## 13. SDK包设计标准

### 13.1 设计原则

| 原则 | 说明 |
| ---- | ---- |
| **类实例化** | 使用 `new` 关键字创建实例，禁止单例模式 |
| **配置驱动** | 通过配置对象初始化，支持灵活配置 |
| **生命周期管理** | 明确的 `init()` / `destroy()` 方法 |
| **类型导出** | 所有接口类型对外导出 |
| **方法可见性** | 使用 `public` / `private` 修饰符 |

### 13.2 SceneManager SDK标准接口

```typescript
export interface SceneManagerConfig {
  container: HTMLElement;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  backgroundColor?: number;
  enableShadow?: boolean;
  enableGrid?: boolean;
}

export interface ObjectTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot';
  color?: string;
  intensity?: number;
  position?: [number, number, number];
}

export interface CreateCubeOptions {
  size?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

class SceneManager {
  // 公共只读属性
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly orbitControls: OrbitControls;
  public readonly transformControls: TransformControls;

  // 构造函数
  constructor(config: SceneManagerConfig);
  
  // 生命周期
  public init(): void;
  public destroy(): void;

  // 对象管理
  public addObject(object: THREE.Object3D): void;
  public removeObject(object: THREE.Object3D): void;
  public clearScene(): void;
  public getObjects(): THREE.Object3D[];
  public getObjectByName(name: string): THREE.Object3D | undefined;
  public getObjectById(id: string): THREE.Object3D | undefined;

  // 对象创建
  public createCube(options?: CreateCubeOptions): THREE.Mesh;

  // 对象变换
  public selectObject(object: THREE.Object3D): void;
  public deselectObject(): void;
  public getSelectedObject(): THREE.Object3D | null;
  public setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void;
  public getObjectTransform(object: THREE.Object3D): ObjectTransform;
  public setObjectTransform(object: THREE.Object3D, transform: ObjectTransform): void;

  // 光照管理
  public addLight(config: LightConfig): THREE.Light | null;
}
```

### 13.3 使用示例

```typescript
import { SceneManager } from '@3d-editor/core';

// 创建实例
const container = document.getElementById('canvas-container');
const sceneManager = new SceneManager({
  container,
  cameraPosition: [3, 3, 5],
  cameraTarget: [0, 0.5, 0],
  backgroundColor: 0x1a1a2e
});

// 初始化
sceneManager.init();

// 创建并添加对象
const cube = sceneManager.createCube({
  size: 1,
  color: '#1890ff',
  position: [0, 0.5, 0]
});
sceneManager.addObject(cube);

// 销毁
sceneManager.destroy();
```

### 13.4 导出配置

在 `src/core/index.ts` 中统一导出：

```typescript
export { 
  SceneManager, 
  type SceneManagerConfig, 
  type ObjectTransform, 
  type LightConfig, 
  type CreateCubeOptions 
} from './SceneManager';

export default SceneManager;
```

---

## 附录：关键设计模式总结

| 设计模式       | 应用场景           | 实现位置                         |
| -------------- | ------------------ | -------------------------------- |
| **工厂模式**   | 统一对象创建       | GeometryFactory、MaterialFactory |
| **策略模式**   | 不同材质类型处理   | MaterialFactory                  |
| **观察者模式** | 事件监听和状态同步 | Pinia Store                      |
| **命令模式**   | 撤销/重做功能      | HistoryModules                   |
| **模板方法**   | 插件扩展框架       | PluginBase                       |

---

**文档版本**: v1.1  
**创建日期**: 2026-05-07  
**适用场景**: 3D模型场景编辑器架构设计
