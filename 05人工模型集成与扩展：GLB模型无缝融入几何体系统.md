# 人工模型集成与扩展：GLB模型无缝融入几何体系统

## 引言

在3D模型编辑器中，除了基础几何体和组合模型外，导入真实的人工模型（如GLB格式）是提升内容创作能力的关键。本文介绍如何将GLB模型功能无缝融入现有的几何体系统，实现与其他几何体一致的交互体验。

---

## 一、架构设计

### 1.1 模块组成

```
┌─────────────────────────────────────────────────────────────┐
│                  人工模型集成架构                         │
├─────────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────┐  ┌──────────────────────┐  │
│  │   GeometrySchema.ts      │  │  GeometryFactory.ts  │  │
│  │  (添加GLB模型类型定义)  ├→│   (扩展GLB加载)      │  │
│  └──────────────────────────┘  └──────────┬───────────┘  │
│                                           │                │
│                                           ▼                │
│                              ┌──────────────────────┐       │
│                              │   SceneView.vue      │       │
│                              │   (UI与预览逻辑)      │       │
│                              └──────────────────────┘       │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心设计原则

- **无缝集成**: GLB模型与其他几何体共用一套系统
- **统一交互**: 点击、预览、放置流程完全一致
- **资源管理**: 自动收集模型内的几何体和材质
- **容错处理**: 加载失败时显示占位模型
- **图片图标**: 支持自定义图片图标替代emoji

---

## 二、Schema 定义模块 (GeometrySchema 扩展)

### 2.1 GLB模型类型

在现有几何体Schema中新增GLB模型类型：

```typescript
// 18. 通用GLB模型
{
  type: 'glbModel',
  label: 'GLB模型',
  icon: '📦',
  properties: [
    { name: 'modelUrl', label: '模型地址', type: 'string', default: '' },
    { name: 'scale', label: '缩放', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1 }
  ],
  previewConfig: {
    scale: 1,
    position: [0, 0.5, 0]
  }
},
// 19. 机器人模型 (示例)
{
  type: 'glbCar',
  label: '机器人模型',
  icon: '/model/glb.png',  // 支持图片图标
  properties: [
    { name: 'scale', label: '缩放', type: 'number', default: 1, min: 0.5, max: 3, step: 0.1 }
  ],
  previewConfig: {
    scale: 1,
    position: [0, 0.5, 0]
  }
}
```

### 2.2 示例模型URL映射

```typescript
const EXAMPLE_MODEL_URLS = {
  glbCar: '/model/glb1.glb',        // 本地模型
  glbRobot: 'https://example.com/robot.glb',
  glbFurniture: 'https://example.com/furniture.glb'
};
```

### 2.3 图片图标支持

图标字段支持两种格式：
- **Emoji**: 字符串如 `'🚗'`、`'🤖'`
- **图片路径**: 以 `/` 开头的相对路径，如 `'/model/glb.png'`

---

## 三、工厂类扩展 (GeometryFactory)

### 3.1 接口重构

为了支持Group组合模型，重构GeometryInstance接口：

```typescript
export interface GeometryInstance {
  type: string;
  object: THREE.Object3D;  // 支持Mesh或Group
  geometries: THREE.BufferGeometry[];  // 所有几何体
  materials: THREE.Material[];  // 所有材质
}
```

### 3.2 GLTFLoader 初始化

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const gltfLoader = new GLTFLoader();
```

### 3.3 异步加载方法

```typescript
public async createGLBModel(type: string, options: CreateOptions = {}): Promise<GeometryInstance> {
  const schema = this.getSchema(type);
  if (!schema) {
    throw new Error(`Model type "${type}" not registered`);
  }

  const defaultProps = this.getDefaultProperties(schema);
  const props = { ...defaultProps, ...options.properties };
  
  // 获取模型URL
  let modelUrl: string;
  if (type === 'glbModel') {
    modelUrl = (props.modelUrl as string) || '';
  } else {
    modelUrl = (EXAMPLE_MODEL_URLS as any)[type] || '';
  }

  if (!modelUrl) {
    return this.create(type, options);
  }

  try {
    // 异步加载模型
    const gltf = await new Promise<THREE.GLTF>((resolve, reject) => {
      gltfLoader.load(
        modelUrl,
        resolve,
        undefined,
        (error) => {
          console.warn('Failed to load external model, using placeholder:', error);
          reject(error);
        }
      );
    });

    const modelGroup = gltf.scene;
    const scale = (props.scale as number) || 1;
    modelGroup.scale.set(scale, scale, scale);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    
    // 收集所有几何体和材质
    modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.geometry) geometries.push(child.geometry);
        if (child.material) {
          if (Array.isArray(child.material)) {
            materials.push(...child.material);
          } else {
            materials.push(child.material);
          }
        }
      }
    });

    // 设置位置
    if (options.position) {
      modelGroup.position.set(...options.position);
    } else {
      modelGroup.position.set(...schema.previewConfig.position);
    }

    modelGroup.userData = { type, properties: props };

    return {
      type,
      object: modelGroup,
      geometries,
      materials
    };
  } catch (error) {
    console.log('Using placeholder model due to loading error');
    return this.create(type, options);
  }
}
```

### 3.4 占位模型创建器

为每个示例模型类型注册代码生成的占位模型：

```typescript
// 机器人占位模型
this.registerCreator('glbCar', (props) => {
  const group = new THREE.Group();
  const size = (props.size as number) || 1;
  
  // 身体
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(size, size * 1.5, size * 0.8),
    new THREE.MeshStandardMaterial({ color: '#4a90d9' })
  );
  body.position.y = size * 0.75;
  group.add(body);
  
  // 头部
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.4, 16, 16),
    new THREE.MeshStandardMaterial({ color: '#6ab7ff' })
  );
  head.position.y = size * 1.8;
  group.add(head);
  
  // 眼睛
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: '#ff3b30', emissive: '#ff3b30' })
  );
  eye.position.set(size * 0.15, size * 1.8, size * 0.35);
  group.add(eye);
  const eye2 = eye.clone();
  eye2.position.x = -size * 0.15;
  group.add(eye2);
  
  return group;
});
```

---

## 四、UI集成 (SceneView.vue)

### 4.1 图片图标渲染

在左侧工具栏中判断图标类型并渲染：

```vue
<div class="geometry-tools">
  <div 
    v-for="schema in geometrySchemas" 
    :key="schema.type"
    class="geometry-tool-item"
    :class="{ active: isAddingGeometry && selectedGeometryType === schema.type }"
    @click="startAddGeometry(schema.type)"
    :title="schema.label"
  >
    <!-- 图片图标 -->
    <img v-if="schema.icon.startsWith('/')" class="geometry-tool-icon" :src="schema.icon" :alt="schema.label" />
    <!-- Emoji图标 -->
    <span v-else>{{ schema.icon }}</span>
  </div>
</div>

<style scoped>
.geometry-tool-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>
```

### 4.2 异步预览创建

修改 createPreviewGeometry 为异步方法：

```typescript
const createPreviewGeometry = async () => {
  if (!sceneManager) return;
  
  removePreviewGeometry();
  
  // 如果是 GLB 模型类型，异步加载真实模型作为预览
  if (isGLBModelType(selectedGeometryType.value)) {
    try {
      const instance = await geometryFactory.createGLBModel(selectedGeometryType.value, {
        position: [0, getGeometryYOffset(selectedGeometryType.value), 0],
        properties: { ...currentGeometryProperties.value }
      });
      
      // 应用半透明效果
      instance.materials.forEach(material => {
        if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhongMaterial) {
          material.transparent = true;
          material.opacity = 0.6;
          if (material instanceof THREE.MeshStandardMaterial) {
            material.emissive = new THREE.Color('#40a9ff');
            material.emissiveIntensity = 0.3;
          }
        }
      });
      
      previewGeometry = instance.object;
      previewGeometry.name = 'PreviewGeometry';
      sceneManager.scene.add(previewGeometry);
    } catch (error) {
      console.error('Failed to load preview model:', error);
      // 加载失败时使用占位几何体
      previewGeometry = sceneManager.createPreviewGeometry(selectedGeometryType.value, [0, 0.5, 0]);
      sceneManager.scene.add(previewGeometry);
    }
  } else {
    // 普通几何体使用常规预览
    previewGeometry = sceneManager.createPreviewGeometry(selectedGeometryType.value, [0, 0.5, 0]);
    sceneManager.scene.add(previewGeometry);
  }
};
```

### 4.3 放置逻辑

```typescript
const addGeometryAtPosition = async (x: number, z: number) => {
  if (!sceneManager) return;
  
  const yOffset = getGeometryYOffset(selectedGeometryType.value);
  const position: [number, number, number] = [
    Math.round(x * 10) / 10,
    yOffset,
    Math.round(z * 10) / 10
  ];
  
  let geometry: THREE.Object3D;
  
  // GLB相关类型都需要异步加载
  if (isGLBModelType(selectedGeometryType.value)) {
    try {
      const instance = await geometryFactory.createGLBModel(selectedGeometryType.value, {
        position,
        properties: { ...currentGeometryProperties.value }
      });
      geometry = instance.object;
    } catch (error) {
      console.error('Failed to load GLB model:', error);
      // 加载失败时创建占位几何体
      geometry = sceneManager.createGeometry({
        type: selectedGeometryType.value,
        position,
        properties: { ...currentGeometryProperties.value }
      });
    }
  } else {
    // 普通几何体类型直接创建
    geometry = sceneManager.createGeometry({
      type: selectedGeometryType.value,
      position,
      properties: { ...currentGeometryProperties.value }
    });
  }
  
  // 注册到场景和对象列表
  geometry.userData = { id: objectIdCounter, type: selectedGeometryType.value };
  sceneManager.addObject(geometry);
  // ... 添加到 sceneObjects 列表
};
```

---

## 五、完整交互流程

### 5.1 用户操作流程

```
点击左侧模型按钮
       ↓
  进入添加模式
       ↓
  异步加载真实模型
       ↓
  应用半透明预览效果
       ↓
  移动鼠标 → 模型跟随预览
       ↓
  点击场景 → 放置真实模型
       ↓
  添加完成
```

### 5.2 类型检测函数

```typescript
const isGLBModelType = (type: string): boolean => {
  return ['glbModel', 'glbCar', 'glbRobot', 'glbFurniture'].includes(type);
};
```

---

## 六、错误处理与容错

### 6.1 加载失败处理

```typescript
try {
  const gltf = await loadModel(modelUrl);
  // 使用真实模型
} catch (error) {
  console.warn('Model load failed, using placeholder');
  // 使用代码生成的占位模型
  return this.create(type, options);
}
```

### 6.2 占位模型

占位模型由代码生成，具有以下特点：
- 颜色明显，易于区分
- 形状代表真实模型的大致轮廓
- 支持同样的属性设置

---

## 七、新增模型类型流程

### 7.1 添加新模型的三步：

1. **在 GeometrySchema.ts 中定义**

```typescript
{
  type: 'myCharacter',
  label: '我的角色',
  icon: '/model/character.png',  // 或使用 emoji
  properties: [
    { name: 'scale', label: '缩放', type: 'number', default: 1 }
  ],
  previewConfig: { position: [0, 0.5, 0] }
}
```

2. **在 GeometryFactory.ts 中配置URL**

```typescript
const EXAMPLE_MODEL_URLS = {
  myCharacter: '/model/character.glb',
  // ...
};
```

3. **（可选）注册占位创建器**

```typescript
this.registerCreator('myCharacter', (props) => {
  const group = new THREE.Group();
  // 生成占位模型
  return group;
});
```

---

## 八、设计优势

### 8.1 无缝集成

- GLB模型与其他几何体共用同一套系统
- 交互方式完全一致，无需学习新流程
- 统一的属性面板和对象管理

### 8.2 可扩展性

- 新增模型类型只需添加Schema定义
- 支持本地和远程模型URL
- 支持自定义图片图标

### 8.3 容错性

- 加载失败自动降级到占位模型
- 用户不会因网络问题看到空白

### 8.4 用户体验

- 预览显示真实模型
- 半透明+蓝色发光效果提升辨识度
- 与几何体一致的操作习惯

---

## 九、与基础几何体的对比

| 特性 | 基础几何体 | GLB模型 |
|------|-----------|---------|
| 创建方式 | BufferGeometry | GLTFLoader 异步加载 |
| 预览 | 直接创建 | 异步加载真实模型 |
| 错误处理 | 无需处理 | 降级到占位模型 |
| 资源收集 | 单个geometry和material | 遍历收集所有 |
| 图标 | Emoji | Emoji 或 图片 |
| 放置流程 | 同步 | 异步 |

---

## 总结

将GLB模型功能融入几何体系统，实现了统一的交互体验。通过Schema扩展、异步加载、错误处理等机制，让用户可以像操作基础几何体一样添加复杂的人工模型。

**关键收获：**
1. 异步操作需要特别注意，保持交互流畅
2. 提供降级方案是提升用户体验的关键
3. 统一的API设计让扩展变得简单
4. 图片图标让模型类型更直观
5. 资源收集为后续功能（如导出）打下基础

---

**版权声明**：本文基于 Vue3 + Three.js 3D模型编辑器项目编写，仅供学习交流使用。

**项目地址**：three-edit (threelab团队开发)
