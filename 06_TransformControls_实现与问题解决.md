# 第6部分：TransformControls 实现与问题解决

在本章中，我们将实现一个强大的3D变换控制器——TransformControls，允许用户通过直观的界面来移动、旋转和缩放场景中的对象。这个控制器是3D编辑器的核心交互组件。

## 6.1 TransformControls 简介

TransformControls 是 Three.js 官方提供的一个强大的控制器，它提供：
- 移动（translate）：在XYZ轴向上移动对象
- 旋转（rotate）：在XYZ轴向上旋转对象
- 缩放（scale）：在XYZ轴向上缩放对象
- 本地/世界坐标切换
- 对齐到网格的吸附功能

### 关键特性
- 无需手动创建复杂的3D控制界面
- 自动处理与轨道控制器的交互冲突
- 支持键盘快捷键
- 可配置大小和可见性

## 6.2 实现架构

### 核心文件
1. `SceneManager.ts` - 控制器的初始化和管理
2. `SceneView.vue` - 控制器的UI集成和事件处理

### 组件关系图
```
SceneView.vue (Vue组件)
    ↓
SceneManager (管理3D场景)
    ↓
TransformControls (控制) → TransformControlsHelper (可视化辅助)
    ↓
OrbitControls (相机控制，与TransformControls协调)
```

## 6.3 核心实现

### SceneManager 中的初始化

```typescript
// SceneManager.ts
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class SceneManager {
  public readonly transformControls: TransformControls;
  public readonly transformControlsHelper: THREE.Object3D;
  
  constructor(config: SceneManagerConfig) {
    // ... 其他初始化代码
    
    // 创建 TransformControls
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    
    // 重要：获取并添加控制器的可视化辅助对象到场景中
    this.transformControlsHelper = this.transformControls.getHelper();
    this.scene.add(this.transformControlsHelper);
    
    // 设置事件监听器
    this.setupEventListeners();
  }
}
```

### 事件监听器设置

```typescript
private setupEventListeners(): void {
  // 使用 dragging-changed 事件 - 这是最可靠的方式
  (this.transformControls as any).addEventListener('dragging-changed', (event: any) => {
    // 当用户开始拖动时，禁用轨道控制器
    // 当用户停止拖动时，启用轨道控制器
    this.orbitControls.enabled = !event.value;
  });

  // 监听对象变换事件
  this.transformControls.addEventListener('objectChange', () => {
    this.onObjectChange();
  });
}
```

### 对象选择与控制

```typescript
public selectObject(object: THREE.Object3D): void {
  if (this.selectedObject === object) return;
  
  console.log('Selecting object:', object.name, object);
  
  this.deselectObject();
  this.selectedObject = object;
  
  // 将对象附加到控制器
  this.transformControls.attach(object);
  
  console.log('TransformControls attached to:', object.name);
}

public deselectObject(): void {
  if (this.selectedObject) {
    // 将对象从控制器分离
    this.transformControls.detach();
    this.selectedObject = null;
  }
}
```

### 变换模式切换

```typescript
public setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void {
  this.transformControls.setMode(mode);
}
```

## 6.4 遇到的问题及解决方案

### 问题1：TransformControls 不显示

#### 错误现象
- 创建了 TransformControls 但在场景中看不到任何控制器界面
- 控制台没有报错，但控制器就是不显示

#### 错误代码
```typescript
// 错误做法
this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
this.scene.add(this.transformControls); // ❌ 错误！
```

#### 问题分析
**关键点**：TransformControls 不是 THREE.Object3D 的子类！

TransformControls 是一个控制器类，它本身不继承自 Object3D，不能直接添加到场景中。官方示例中明确说明了需要调用 `getHelper()` 方法。

#### 解决方案
```typescript
// 正确做法
this.transformControls = new TransformControls(this.camera, this.renderer.domElement);

// 获取可视化辅助对象
this.transformControlsHelper = this.transformControls.getHelper();

// 将辅助对象添加到场景中
this.scene.add(this.transformControlsHelper);
```

#### 为什么这样做？
- `transformControls` - 负责逻辑控制，处理用户输入
- `transformControlsHelper` - 负责视觉显示，是一个真正的 Object3D
- 两者配合工作，缺一不可

---

### 问题2：拖动控制器时相机也会转动

#### 错误现象
- 用户点击控制器的箭头试图移动对象
- 但同时相机也跟着旋转了
- 操作很不流畅，总是误触相机

#### 错误代码
```typescript
// 早期实现 - 仅使用 mouseDown/mouseUp
this.transformControls.addEventListener('mouseDown', () => {
  this.orbitControls.enabled = false;
});

this.transformControls.addEventListener('mouseUp', () => {
  this.orbitControls.enabled = true;
});
```

#### 问题分析
`mouseDown/mouseUp` 事件不够可靠，特别是：
- 如果用户在画布外松开鼠标，可能收不到 mouseUp 事件
- 事件时序可能有问题
- 某些情况下可能不触发

#### 解决方案
```typescript
// 使用 dragging-changed 事件 - 官方推荐方式
(this.transformControls as any).addEventListener('dragging-changed', (event: any) => {
  // event.value 为 true 时表示正在拖动
  this.orbitControls.enabled = !event.value;
});
```

#### 优势
- 事件由 TransformControls 内部状态管理，更可靠
- 自动处理边界情况
- 官方文档推荐的方式

---

### 问题3：点击控制器时会取消对象选择

#### 错误现象
- 用户选中了一个对象，显示了控制器
- 当用户点击控制器的箭头准备移动时
- 对象被取消选中了！控制器消失了

#### 问题分析
在 SceneView.vue 中，我们的点击检测代码：
```typescript
const handleObjectSelection = (event: MouseEvent) => {
  // ...
  const intersects = raycaster.intersectObjects(allObjects, true);
  
  if (intersects.length > 0) {
    // 选中对象
  } else {
    // 没有点击到对象 - 取消选择
    sceneManager.deselectObject(); // ❌ 问题在这里
  }
}
```

问题是：用户点击的是 TransformControlsHelper，但它不在 `allObjects` 数组中！

#### 解决方案
```typescript
const handleObjectSelection = (event: MouseEvent) => {
  if (!sceneManager || !containerRef.value) return;
  
  // 首先检查是否正在拖动控制器
  if ((sceneManager.transformControls as any).dragging) {
    return; // 正在拖动，不处理选择
  }
  
  // ... 其余代码
}
```

#### 额外优化
在 `handleClick` 中也增加检查：
```typescript
const handleClick = (event: MouseEvent) => {
  // 如果正在使用 TransformControls，则不处理
  if (sceneManager && (sceneManager.transformControls as any).dragging) {
    return;
  }
  
  // ... 其余代码
}
```

---

### 问题4：创建对象后没有自动选中

#### 错误现象
- 用户点击创建几何体
- 几何体被添加到场景中
- 但需要用户再次点击才能选中并编辑

#### 解决方案
在 `addGeometryAtPosition` 中自动选择：

```typescript
// SceneView.vue
const addGeometryAtPosition = async (x: number, z: number) => {
  // ... 创建对象代码
  
  // 自动选中刚创建的对象
  selectedObjectId.value = objectIdCounter;
  Object.assign(selectedObject, newObjectInfo);
  selectedMesh = geometry;
  
  // 关键：附加到 TransformControls
  sceneManager.selectObject(geometry);
  
  objectIdCounter++;
}
```

同样处理灯光创建：
```typescript
const handleLightClick = () => {
  // ... 创建灯光代码
  
  // 自动选中刚创建的灯光
  const newLightInfo = { /* ... */ };
  sceneObjects.value.push(newLightInfo);
  selectedObjectId.value = objectIdCounter;
  Object.assign(selectedObject, newLightInfo);
  sceneManager.selectObject(light);
  
  objectIdCounter++;
}
```

---

### 问题5：SceneManager 的 init() 中重复设置点击事件

#### 错误现象
- 场景中的点击事件被处理了两次
- 选择对象时出现意外行为

#### 问题分析
SceneManager 中有自己的 `setupClickHandler()`，而 SceneView.vue 也在处理点击事件，造成冲突。

#### 解决方案
```typescript
public init(): void {
  // ... 
  this.container.appendChild(this.renderer.domElement);
  
  // 注释掉 SceneManager 自己的点击处理
  // this.setupClickHandler(); 
  
  // 由 SceneView.vue 统一处理点击事件
  this.startRenderLoop();
  this.isInitialized = true;
}
```

## 6.5 UI 集成 - 变换模式按钮

在 SceneView.vue 中，我们添加了模式切换按钮：

```vue
<div class="top-bar">
  <button 
    :class="['tool-btn', { active: transformMode === 'translate' }]"
    @click="setTransformMode('translate')"
    title="移动模式 (T)"
  >
    🖐️
  </button>
  <button 
    :class="['tool-btn', { active: transformMode === 'rotate' }]"
    @click="setTransformMode('rotate')"
    title="旋转模式 (R)"
  >
    🔄
  </button>
  <button 
    :class="['tool-btn', { active: transformMode === 'scale' }]"
    @click="setTransformMode('scale')"
    title="缩放模式 (S)"
  >
    📐
  </button>
</div>
```

对应的 Vue 代码：

```typescript
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate');

const setTransformMode = (mode: 'translate' | 'rotate' | 'scale') => {
  transformMode.value = mode;
  if (sceneManager) {
    sceneManager.setTransformMode(mode);
  }
};
```

## 6.6 完整工作流程

### 用户操作流程
1. **创建阶段**
   - 用户点击左侧工具栏选择类型
   - 在场景中点击放置对象
   - 对象自动被选中，显示 TransformControls

2. **编辑阶段**
   - 用户看到彩色的控制箭头/圆环/方块
   - 拖动箭头移动对象 → 轨道控制器自动禁用
   - 拖动圆环旋转对象
   - 拖动方块缩放对象
   - 松开鼠标 → 轨道控制器重新启用

3. **切换阶段**
   - 点击顶部按钮切换变换模式
   - 点击场景中的其他对象 → 切换选择
   - 点击空白区域 → 取消选择

## 6.7 最终实现的完整功能

### ✅ 已实现功能
- [x] 创建对象后自动选中并显示控制器
- [x] 移动、旋转、缩放三种变换模式
- [x] 通过按钮切换变换模式
- [x] 拖动控制器时禁用轨道控制器
- [x] 点击控制器时不取消选择
- [x] 点击场景空白区域取消选择
- [x] 灯光对象也支持变换控制
- [x] TransformControls 正确显示

### 关键代码文件
- `SceneManager.ts` - 控制器核心逻辑
- `SceneView.vue` - UI 交互和事件处理

## 6.8 经验总结

### 1. 仔细阅读官方示例
官方示例是最好的参考！在 `misc_controls_transform.html` 中明确展示了：
```javascript
const gizmo = control.getHelper();
scene.add(gizmo);
```

### 2. 不要重复造轮子
Three.js 官方已经提供了完善的 TransformControls，使用它比自己实现要可靠得多。

### 3. 事件处理要谨慎
- 优先使用控制器提供的专用事件（`dragging-changed`）
- 避免事件冲突，特别是在多个控制器之间
- 考虑边缘情况（鼠标在画布外松开等）

### 4. UI/UX 细节很重要
- 创建对象后自动选中，减少用户操作步骤
- 控制器要清晰可见，颜色要有区分
- 模式切换要直观

## 6.9 下一章预告

编辑版权有 threelab 编辑
