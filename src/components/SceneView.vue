<template>
  <div class="app-container">
    <!-- 顶部菜单栏 -->
    <header class="menu-bar">
      <div class="menu-left">
        <div class="logo">🎨 3D Editor</div>
        <nav class="menu-items">
          <button class="menu-item" @click="showMenu('file')">文件</button>
          <button class="menu-item" @click="showMenu('edit')">编辑</button>
          <button class="menu-item" @click="showMenu('view')">视图</button>
          <button class="menu-item" @click="showMenu('help')">帮助</button>
        </nav>
      </div>
      <div class="menu-right">
        <button class="tool-btn" title="新建场景">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </button>
        <button class="tool-btn" title="保存场景">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
            <polyline points="12 2 12 14"></polyline>
            <path d="M15 12H9"></path>
          </svg>
        </button>
        <button class="tool-btn" title="导入模型">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>
      </div>
    </header>

    <div class="main-content">
      <!-- 左侧工具栏 -->
      <aside class="toolbar-left">
        <button 
          class="tool-btn" 
          :class="{ active: transformMode === 'translate' }"
          @click="setTransformMode('translate')"
          title="移动 (W)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="5 3 15 14 10 14 10 21"></polyline>
            <line x1="15" y1="3" x2="20" y2="8"></line>
            <line x1="15" y1="14" x2="20" y2="19"></line>
          </svg>
        </button>
        <button 
          class="tool-btn" 
          :class="{ active: transformMode === 'rotate' }"
          @click="setTransformMode('rotate')"
          title="旋转 (E)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M4 22.5a5.5 5.5 0 0 1-1.38-10.68l9-9.03"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button 
          class="tool-btn" 
          :class="{ active: transformMode === 'scale' }"
          @click="setTransformMode('scale')"
          title="缩放 (R)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="21" y1="12" x2="12" y2="12"></line>
            <line x1="7" y1="12" x2="3" y2="12"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="7" x2="12" y2="3"></line>
            <line x1="17" y1="17" x2="12" y2="12"></line>
            <line x1="12" y1="12" x2="7" y2="7"></line>
          </svg>
        </button>
        <div class="toolbar-divider"></div>
        <div class="geometry-tools">
          <div 
            v-for="schema in geometrySchemas" 
            :key="schema.type"
            class="geometry-tool-item"
            :class="{ active: isAddingGeometry && selectedGeometryType === schema.type }"
            @click="startAddGeometry(schema.type)"
            :title="schema.label"
          >
            <img v-if="schema.icon.startsWith('/')" class="geometry-tool-icon" :src="schema.icon" :alt="schema.label" />
            <span v-else>{{ schema.icon }}</span>
          </div>
        </div>
        <div class="toolbar-divider"></div>
        <div class="light-tools">
          <div class="tool-group-label">灯光</div>
          <div 
            v-for="schema in lightSchemas" 
            :key="schema.type"
            class="light-tool-item"
            :class="{ active: isAddingLight && selectedLightType === schema.type }"
            @click="startAddLight(schema.type)"
            :title="schema.label"
          >
            <span>{{ schema.icon }}</span>
          </div>
        </div>
        <div class="toolbar-divider"></div>
        <button class="tool-btn" @click="deleteSelected" title="删除选中对象 (Del)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </aside>

      <!-- 中间3D场景 -->
      <main class="scene-area">
        <div ref="containerRef" class="canvas-wrapper"></div>
        <div class="scene-info">
          <span>场景: {{ sceneObjects.length }} 个对象</span>
          <span>|</span>
          <span>顶点: {{ totalVertices }}</span>
          <span>|</span>
          <span>面: {{ totalFaces }}</span>
        </div>
        <div v-if="isAddingGeometry" class="add-cube-hint">
          <span>{{ getCurrentGeometryIcon() }}</span>
          <span>移动鼠标到目标位置，点击添加{{ getCurrentGeometryLabel() }}</span>
        </div>
        <div v-if="isAddingLight" class="add-light-hint">
          <span>💡</span>
          <span>移动鼠标到目标位置，点击添加{{ getCurrentLightLabel() }}</span>
        </div>
      </main>

      <!-- 右侧面板 -->
      <aside class="panel-right">
        <!-- 图层控制 -->
        <div class="panel-section">
          <div class="panel-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
              <line x1="12" y1="22" x2="12" y2="15.5"></line>
            </svg>
            <span>图层</span>
          </div>
          <div class="layer-list">
            <div 
              v-for="obj in sceneObjects" 
              :key="obj.id"
              class="layer-item"
              :class="{ selected: selectedObjectId === obj.id }"
              @click="selectObjectById(obj.id)"
            >
              <div class="layer-icon">{{ obj.type === 'Mesh' ? '📦' : '⚪' }}</div>
              <div class="layer-name">{{ obj.name }}</div>
              <div class="layer-visibility">
                <button @click.stop="toggleVisibility(obj.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="obj.visible" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
                    <path v-if="obj.visible" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    <path v-else d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m0 0L21 21"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 灯光面板 -->
        <div class="panel-section" v-if="isAddingLight">
          <div class="panel-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span>灯光设置</span>
          </div>
          <LightPanel 
            :light-type="selectedLightType"
            @apply-preset="handleApplyPreset"
            @property-change="handleLightPropertyChange"
          />
        </div>
        <!-- 默认灯光面板 -->
        <div class="panel-section" v-else>
          <div class="panel-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span>灯光</span>
          </div>
          <LightPanel 
            @apply-preset="handleApplyPreset"
          />
        </div>

        <!-- 属性面板 -->
        <div class="panel-section">
          <div class="panel-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>属性</span>
          </div>
          <div class="property-panel" v-if="selectedObjectId !== null">
            <div class="property-section">
              <div class="property-label">名称</div>
              <input 
                type="text" 
                class="property-input" 
                v-model="selectedObject.name"
              />
            </div>
            <div class="property-section">
              <div class="property-label">位置</div>
              <div class="property-row">
                <div class="property-input-group">
                  <span class="property-axis">X</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.position.x" step="0.1" />
                </div>
                <div class="property-input-group">
                  <span class="property-axis">Y</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.position.y" step="0.1" />
                </div>
                <div class="property-input-group">
                  <span class="property-axis">Z</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.position.z" step="0.1" />
                </div>
              </div>
            </div>
            <div class="property-section">
              <div class="property-label">旋转</div>
              <div class="property-row">
                <div class="property-input-group">
                  <span class="property-axis">X</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.rotation.x" step="0.1" />
                </div>
                <div class="property-input-group">
                  <span class="property-axis">Y</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.rotation.y" step="0.1" />
                </div>
                <div class="property-input-group">
                  <span class="property-axis">Z</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.rotation.z" step="0.1" />
                </div>
              </div>
            </div>
            <div class="property-section">
              <div class="property-label">缩放</div>
              <div class="property-row">
                <div class="property-input-group">
                  <span class="property-axis">X</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.scale.x" step="0.1" />
                </div>
                <div class="property-input-group">
                  <span class="property-axis">Y</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.scale.y" step="0.1" />
                </div>
                <div class="property-input-group">
                  <span class="property-axis">Z</span>
                  <input type="number" class="property-input-small" v-model.number="selectedObject.scale.z" step="0.1" />
                </div>
              </div>
            </div>
          </div>
          <div class="property-panel empty" v-else>
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <p>选择一个对象以编辑属性</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import { SceneManager } from '../core';
import { geometryFactory, type GeometryProperties, type LightProperties } from '../factories';
import { lightSchemas } from '../schemas/LightSchema';
import LightPanel from './LightPanel.vue';
import * as THREE from 'three';

const containerRef = ref<HTMLElement | null>(null);
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate');
const selectedObjectId = ref<number | null>(null);
const isAddingGeometry = ref(false);
const selectedGeometryType = ref<string>('cube');
const currentGeometryProperties = ref<GeometryProperties>({});
const isAddingLight = ref(false);
const selectedLightType = ref<string>('point');
const currentLightProperties = ref<LightProperties>({});
const previewLight: { light?: THREE.Light; helper?: THREE.Object3D } = {};

interface SceneObjectInfo {
  id: number;
  name: string;
  type: string;
  geometryType: string;
  visible: boolean;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

const sceneObjects = ref<SceneObjectInfo[]>([]);
const selectedObject = reactive<SceneObjectInfo>({
  id: 0,
  name: '',
  type: '',
  geometryType: '',
  visible: true,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 0, y: 0, z: 0 }
});

const geometrySchemas = computed(() => geometryFactory.getAllSchemas());

const totalVertices = computed(() => sceneObjects.value.length * 24);
const totalFaces = computed(() => sceneObjects.value.length * 12);

let sceneManager: SceneManager | null = null;
let objectIdCounter = 1;
let selectedMesh: THREE.Object3D | null = null;
let previewGeometry: THREE.Object3D | null = null;
let raycaster: THREE.Raycaster | null = null;
let mouse: THREE.Vector2 | null = null;
let gridPlane: THREE.Plane | null = null;

const setTransformMode = (mode: 'translate' | 'rotate' | 'scale') => {
  transformMode.value = mode;
  sceneManager?.setTransformMode(mode);
};

const startAddGeometry = async (type: string) => {
  if (!sceneManager) return;
  
  if (isAddingGeometry.value && selectedGeometryType.value === type) {
    isAddingGeometry.value = false;
    removePreviewGeometry();
    return;
  }
  
  selectedGeometryType.value = type;
  isAddingGeometry.value = true;
  
  loadDefaultProperties(type);
  await createPreviewGeometry();
};

const loadDefaultProperties = (type: string) => {
  const schema = geometryFactory.getSchema(type);
  if (schema) {
    currentGeometryProperties.value = geometryFactory.getDefaultProperties(schema);
  }
};

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

const removePreviewGeometry = () => {
  if (previewGeometry && sceneManager) {
    sceneManager.scene.remove(previewGeometry);
    
    // 清理资源
    previewGeometry.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: THREE.Material) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
    
    previewGeometry = null;
  }
};

const updatePreviewGeometryPosition = (event: MouseEvent) => {
  if (!isAddingGeometry.value || !previewGeometry || !sceneManager || !containerRef.value) return;
  
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  if (!raycaster) {
    raycaster = new THREE.Raycaster();
  }
  if (!mouse) {
    mouse = new THREE.Vector2();
  }
  if (!gridPlane) {
    gridPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  }
  
  mouse.set(mouseX, mouseY);
  raycaster.setFromCamera(mouse, sceneManager.camera);
  
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(gridPlane, intersectPoint);
  
  if (intersectPoint) {
    previewGeometry.position.set(
      Math.round(intersectPoint.x * 10) / 10,
      getGeometryYOffset(selectedGeometryType.value),
      Math.round(intersectPoint.z * 10) / 10
    );
  }
};

const getCurrentGeometryIcon = (): string => {
  const schema = geometryFactory.getSchema(selectedGeometryType.value);
  return schema?.icon || '📦';
};

const getCurrentGeometryLabel = (): string => {
  const schema = geometryFactory.getSchema(selectedGeometryType.value);
  return schema?.label || selectedGeometryType.value;
};

const getCurrentLightLabel = (): string => {
  const schema = lightSchemas.find(s => s.type === selectedLightType.value);
  return schema?.label || selectedLightType.value;
};

const getGeometryYOffset = (type: string): number => {
  const schema = geometryFactory.getSchema(type);
  if (!schema) return 0.5;
  
  const props = geometryFactory.getDefaultProperties(schema);
  
  switch (type) {
    case 'cube':
      return ((props.height as number) || 1) / 2;
    case 'sphere':
      return props.radius as number || 0.5;
    case 'cylinder':
      return ((props.height as number) || 1) / 2;
    case 'cone':
      return (props.height as number) || 1;
    case 'torus':
      return 0.5;
    case 'plane':
      return 0;
    case 'teapot':
      return 0.5 * ((props.size as number) || 1);
    case 'chair':
      return 0.5 * ((props.size as number) || 1);
    case 'table':
      return 0.35 * ((props.size as number) || 1);
    case 'glbModel':
    case 'glbCar':
    case 'glbRobot':
    case 'glbFurniture':
      return 0.5;
    default:
      return schema.previewConfig.position[1];
  }
};

const isGLBModelType = (type: string): boolean => {
  return ['glbModel', 'glbCar', 'glbRobot', 'glbFurniture'].includes(type);
};

const handleSceneClick = async (event: MouseEvent) => {
  if (!isAddingGeometry.value || !sceneManager || !containerRef.value) return;
  
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  if (!raycaster) {
    raycaster = new THREE.Raycaster();
  }
  if (!mouse) {
    mouse = new THREE.Vector2();
  }
  if (!gridPlane) {
    gridPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  }
  
  mouse.set(mouseX, mouseY);
  raycaster.setFromCamera(mouse, sceneManager.camera);
  
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(gridPlane, intersectPoint);
  
  if (intersectPoint) {
    await addGeometryAtPosition(intersectPoint.x, intersectPoint.z);
  }
  
  isAddingGeometry.value = false;
  removePreviewGeometry();
};

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
  
  geometry.userData = { id: objectIdCounter, type: selectedGeometryType.value };
  sceneManager.addObject(geometry);
  
  const schema = geometryFactory.getSchema(selectedGeometryType.value);
  const label = schema?.label || selectedGeometryType.value;
  
  const newObjectInfo = {
    id: objectIdCounter,
    name: `${label}_${objectIdCounter}`,
    type: geometry instanceof THREE.Group ? 'Group' : 'Mesh',
    geometryType: selectedGeometryType.value,
    visible: true,
    position: { x: geometry.position.x, y: geometry.position.y, z: geometry.position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  };
  
  sceneObjects.value.push(newObjectInfo);
  
  // 自动选中刚创建的对象
  selectedObjectId.value = objectIdCounter;
  Object.assign(selectedObject, newObjectInfo);
  selectedMesh = geometry;
  sceneManager.selectObject(geometry);
  
  objectIdCounter++;
};

const deleteSelected = () => {
  if (!sceneManager || !selectedMesh) return;
  
  const index = sceneObjects.value.findIndex(obj => obj.id === selectedObjectId.value);
  if (index > -1) {
    sceneObjects.value.splice(index, 1);
  }
  
  sceneManager.removeObject(selectedMesh);
  selectedMesh = null;
  selectedObjectId.value = null;
  selectedObject.id = 0;
  selectedObject.name = '';
  selectedObject.type = '';
  selectedObject.position.x = 0;
  selectedObject.position.y = 0;
  selectedObject.position.z = 0;
  selectedObject.rotation.x = 0;
  selectedObject.rotation.y = 0;
  selectedObject.rotation.z = 0;
  selectedObject.scale.x = 0;
  selectedObject.scale.y = 0;
  selectedObject.scale.z = 0;
};

const selectObjectById = (id: number) => {
  if (isAddingGeometry.value) return;
  
  selectedObjectId.value = id;
  
  const objInfo = sceneObjects.value.find(obj => obj.id === id);
  if (objInfo) {
    Object.assign(selectedObject, objInfo);
    
    if (sceneManager) {
      // 使用我们自己的 getObjectById 方法，它会查找 userData.id
      const mesh = sceneManager.getObjectById(id);
      if (mesh) {
        selectedMesh = mesh;
        sceneManager.selectObject(mesh);
        console.log('Object selected, TransformControls should be visible');
      } else {
        console.log('Object not found with id:', id);
      }
    }
  }
};

const toggleVisibility = (id: number) => {
  const obj = sceneObjects.value.find((o: SceneObjectInfo) => o.id === id);
  if (obj) {
    obj.visible = !obj.visible;
    
    if (sceneManager) {
      const mesh = sceneManager.scene.getObjectById(id);
      if (mesh) {
        mesh.visible = obj.visible;
      }
    }
  }
};

const showMenu = (menu: string) => {
  console.log('Menu:', menu);
};

const startAddLight = (type: string) => {
  if (!sceneManager) return;
  
  // 如果点击的是当前选中的灯光类型，取消添加模式
  if (isAddingLight.value && selectedLightType.value === type) {
    isAddingLight.value = false;
    removePreviewLight();
    return;
  }
  
  // 设置选中的灯光类型
  selectedLightType.value = type;
  isAddingLight.value = true;
  isAddingGeometry.value = false;
  
  // 加载默认属性
  const schema = lightSchemas.find(s => s.type === type);
  if (schema) {
    currentLightProperties.value = {};
    schema.properties.forEach(prop => {
      currentLightProperties.value[prop.name] = prop.default;
    });
  }
  
  // 创建预览灯光
  createPreviewLight();
};

const createPreviewLight = () => {
  if (!sceneManager) return;
  
  // 移除已有的预览灯光
  removePreviewLight();
  
  const schema = lightSchemas.find(s => s.type === selectedLightType.value);
  if (!schema) return;
  
  let light: THREE.Light;
  const color = (currentLightProperties.value.color as string) || '#ffffff';
  const intensity = (currentLightProperties.value.intensity as number) || 1;
  
  switch (selectedLightType.value) {
    case 'ambient':
      light = new THREE.AmbientLight(color, intensity * 0.5);
      break;
    case 'directional':
      light = new THREE.DirectionalLight(color, intensity * 0.5);
      break;
    case 'point':
      light = new THREE.PointLight(color, intensity * 0.5);
      break;
    case 'spot':
      light = new THREE.SpotLight(color, intensity * 0.5);
      break;
    case 'hemisphere':
      const skyColor = (currentLightProperties.value.skyColor as string) || '#87ceeb';
      const groundColor = (currentLightProperties.value.groundColor as string) || '#696969';
      light = new THREE.HemisphereLight(skyColor, groundColor, intensity * 0.5);
      break;
    case 'rectArea':
      const width = (currentLightProperties.value.width as number) || 1;
      const height = (currentLightProperties.value.height as number) || 1;
      light = new THREE.RectAreaLight(color, intensity * 0.5, width, height);
      break;
    default:
      light = new THREE.PointLight(color, intensity * 0.5);
  }
  
  // 设置初始位置
  const defaultPos = schema.previewConfig.position;
  light.position.set(defaultPos[0], defaultPos[1], defaultPos[2]);
  light.name = 'PreviewLight';
  
  // 创建辅助对象
  let helper: THREE.Object3D | undefined;
  if (selectedLightType.value === 'point') {
    helper = new THREE.PointLightHelper(light as THREE.PointLight, 0.3);
  } else if (selectedLightType.value === 'spot') {
    helper = new THREE.SpotLightHelper(light as THREE.SpotLight);
  } else if (selectedLightType.value === 'directional') {
    helper = new THREE.DirectionalLightHelper(light as THREE.DirectionalLight, 1);
  }
  
  sceneManager.scene.add(light);
  if (helper) {
    sceneManager.scene.add(helper);
    previewLight.helper = helper;
  }
  previewLight.light = light;
};

const updatePreviewLightPosition = (event: MouseEvent) => {
  if (!isAddingLight.value || !previewLight.light || !sceneManager || !containerRef.value) return;
  
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  if (!raycaster) raycaster = new THREE.Raycaster();
  if (!mouse) mouse = new THREE.Vector2();
  if (!gridPlane) gridPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  
  mouse.set(mouseX, mouseY);
  raycaster.setFromCamera(mouse, sceneManager.camera);
  
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(gridPlane, intersectPoint);
  
  if (intersectPoint) {
    previewLight.light.position.set(
      Math.round(intersectPoint.x * 10) / 10,
      2,
      Math.round(intersectPoint.z * 10) / 10
    );
    
    // 更新辅助对象
    if (previewLight.helper) {
      (previewLight.helper.position as THREE.Vector3).set(
        previewLight.light.position.x,
        previewLight.light.position.y,
        previewLight.light.position.z
      );
    }
  }
};

const removePreviewLight = () => {
  if (!sceneManager) return;
  
  if (previewLight.light) {
    sceneManager.scene.remove(previewLight.light);
    previewLight.light.dispose?.();
    previewLight.light = undefined;
  }
  if (previewLight.helper) {
    sceneManager.scene.remove(previewLight.helper);
    previewLight.helper = undefined;
  }
};

const handleLightClick = () => {
  if (!isAddingLight.value || !previewLight.light || !sceneManager) return;
  
  // 获取预览灯光的位置
  const position: [number, number, number] = [
    previewLight.light.position.x,
    previewLight.light.position.y,
    previewLight.light.position.z
  ];
  
  // 添加正式灯光
  const newLight = sceneManager.addLight({
    type: selectedLightType.value,
    properties: { ...currentLightProperties.value },
    position
  });
  
  if (newLight) {
    // 设置灯光的userData，使其可以被选中和管理
    newLight.userData = { id: objectIdCounter, type: selectedLightType.value };
    
    // 添加到sceneObjects列表
    const schema = lightSchemas.find(s => s.type === selectedLightType.value);
    const label = schema?.label || selectedLightType.value;
    
    const newObjectInfo = {
      id: objectIdCounter,
      name: `${label}_${objectIdCounter}`,
      type: 'Light',
      geometryType: selectedLightType.value,
      visible: true,
      position: { x: position[0], y: position[1], z: position[2] },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    };
    
    sceneObjects.value.push(newObjectInfo);
    
    // 自动选中刚创建的灯光
    selectedObjectId.value = objectIdCounter;
    Object.assign(selectedObject, newObjectInfo);
    selectedMesh = newLight;
    sceneManager.selectObject(newLight);
    
    objectIdCounter++;
  }
  
  // 清除预览状态
  isAddingLight.value = false;
  removePreviewLight();
};

const handleApplyPreset = (presetName: string) => {
  if (!sceneManager) return;
  sceneManager.applyLightPreset(presetName);
};

const handleLightPropertyChange = (properties: LightProperties) => {
  currentLightProperties.value = properties;
  // 实时更新预览灯光
  updatePreviewLight();
};

const updatePreviewLight = () => {
  if (!sceneManager || !previewLight.light) return;
  
  const light = previewLight.light;
  
  if ('intensity' in light && currentLightProperties.value.intensity !== undefined) {
    (light as any).intensity = currentLightProperties.value.intensity as number;
  }
  
  if ('color' in light && currentLightProperties.value.color !== undefined) {
    (light as any).color.set(currentLightProperties.value.color as string);
  }
  
  if ('decay' in light && currentLightProperties.value.decay !== undefined) {
    (light as any).decay = currentLightProperties.value.decay as number;
  }
  
  if ('distance' in light && currentLightProperties.value.distance !== undefined) {
    (light as any).distance = currentLightProperties.value.distance as number;
  }
  
  if ('angle' in light && currentLightProperties.value.angle !== undefined) {
    (light as any).angle = currentLightProperties.value.angle as number;
  }
  
  if ('penumbra' in light && currentLightProperties.value.penumbra !== undefined) {
    (light as any).penumbra = currentLightProperties.value.penumbra as number;
  }
  
  if ('castShadow' in light && currentLightProperties.value.castShadow !== undefined) {
    (light as any).castShadow = currentLightProperties.value.castShadow as boolean;
  }
  
  if ('groundColor' in light && currentLightProperties.value.groundColor !== undefined) {
    (light as any).groundColor.set(currentLightProperties.value.groundColor as string);
  }
  
  if ('width' in light && currentLightProperties.value.width !== undefined) {
    (light as any).width = currentLightProperties.value.width as number;
  }
  
  if ('height' in light && currentLightProperties.value.height !== undefined) {
    (light as any).height = currentLightProperties.value.height as number;
  }
};

const syncObjectProperties = () => {
  if (!selectedMesh || selectedObjectId.value === null) return;
  
  selectedObject.position.x = selectedMesh.position.x;
  selectedObject.position.y = selectedMesh.position.y;
  selectedObject.position.z = selectedMesh.position.z;
  selectedObject.rotation.x = selectedMesh.rotation.x;
  selectedObject.rotation.y = selectedMesh.rotation.y;
  selectedObject.rotation.z = selectedMesh.rotation.z;
  selectedObject.scale.x = selectedMesh.scale.x;
  selectedObject.scale.y = selectedMesh.scale.y;
  selectedObject.scale.z = selectedMesh.scale.z;
  
  requestAnimationFrame(syncObjectProperties);
};

const handleMouseMove = (event: MouseEvent) => {
  if (isAddingGeometry.value) {
    updatePreviewGeometryPosition(event);
  } else if (isAddingLight.value) {
    updatePreviewLightPosition(event);
  }
};

const handleClick = (event: MouseEvent) => {
  // 如果正在使用 TransformControls，则不处理点击选择
  if (sceneManager && (sceneManager.transformControls as any).dragging) {
    return;
  }
  
  if (isAddingGeometry.value) {
    handleSceneClick(event);
  } else if (isAddingLight.value) {
    handleLightClick();
  } else {
    handleObjectSelection(event);
  }
};

const handleObjectSelection = (event: MouseEvent) => {
  if (!sceneManager || !containerRef.value) return;
  
  // 检查是否正在使用 TransformControls
  if ((sceneManager.transformControls as any).dragging) {
    return;
  }
  
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  if (!raycaster) {
    raycaster = new THREE.Raycaster();
  }
  if (!mouse) {
    mouse = new THREE.Vector2();
  }
  
  mouse.set(mouseX, mouseY);
  raycaster.setFromCamera(mouse, sceneManager.camera);
  
  const allObjects = sceneManager.getObjects();
  const intersects = raycaster.intersectObjects(allObjects, true);
  
  if (intersects.length > 0) {
    // 检测到 Mesh 对象
    let target = intersects[0].object;
    while (target.parent && !allObjects.includes(target)) {
      target = target.parent;
    }
    if (target.userData.id) {
      selectObjectById(target.userData.id);
    }
  } else {
    // 没有检测到 Mesh，尝试检测灯光
    const lights = sceneManager.getLights();
    let closestLight: THREE.Light | null = null;
    let closestDistance = Infinity;
    const threshold = 50; // 像素阈值
    
    lights.forEach(light => {
      if (light.userData.id) {
        // 将灯光位置转换为屏幕坐标
        const screenPos = light.position.clone();
        screenPos.project(sceneManager.camera);
        
        // 转换为像素坐标
        const screenX = (screenPos.x * 0.5 + 0.5) * rect.width;
        const screenY = (-screenPos.y * 0.5 + 0.5) * rect.height;
        
        // 计算与点击位置的距离
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const distance = Math.sqrt(Math.pow(screenX - clickX, 2) + Math.pow(screenY - clickY, 2));
        
        if (distance < threshold && distance < closestDistance) {
          closestDistance = distance;
          closestLight = light;
        }
      }
    });
    
    if (closestLight) {
      // 选中灯光
      selectObjectById(closestLight.userData.id);
    } else {
      // 什么都没点击到，取消选择
      sceneManager.deselectObject();
      selectedObjectId.value = null;
      selectedObject.id = 0;
      selectedObject.name = '';
      selectedObject.type = '';
      selectedObject.position.x = 0;
      selectedObject.position.y = 0;
      selectedObject.position.z = 0;
      selectedObject.rotation.x = 0;
      selectedObject.rotation.y = 0;
      selectedObject.rotation.z = 0;
      selectedObject.scale.x = 0;
      selectedObject.scale.y = 0;
      selectedObject.scale.z = 0;
      selectedMesh = null;
    }
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (isAddingGeometry.value) {
      isAddingGeometry.value = false;
      removePreviewGeometry();
    } else if (isAddingLight.value) {
      isAddingLight.value = false;
      removePreviewLight();
    }
  }
};

const handleContextMenu = (event: MouseEvent) => {
  if (isAddingGeometry.value) {
    event.preventDefault();
    isAddingGeometry.value = false;
    removePreviewGeometry();
  } else if (isAddingLight.value) {
    event.preventDefault();
    isAddingLight.value = false;
    removePreviewLight();
  }
};

onMounted(() => {
  if (containerRef.value) {
    sceneManager = new SceneManager({
      container: containerRef.value,
      cameraPosition: [3, 3, 5],
      cameraTarget: [0, 0.5, 0],
      backgroundColor: 0x1a1a2e
    });
    
    sceneManager.init();
    
    const cube = sceneManager.createGeometry({
      type: 'cube',
      position: [0, 0.5, 0],
      properties: { color: '#1890ff' }
    });
    cube.userData = { id: objectIdCounter, type: 'cube' };
    sceneManager.addObject(cube);
    
    sceneObjects.value.push({
      id: objectIdCounter,
      name: '立方体_1',
      type: 'Mesh',
      geometryType: 'cube',
      visible: true,
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });
    objectIdCounter++;
    
    selectObjectById(1);
    syncObjectProperties();
    
    containerRef.value.addEventListener('mousemove', handleMouseMove);
    containerRef.value.addEventListener('click', handleClick);
    containerRef.value.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  sceneManager?.destroy();
  removePreviewGeometry();
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousemove', handleMouseMove);
    containerRef.value.removeEventListener('click', handleClick);
    containerRef.value.removeEventListener('contextmenu', handleContextMenu);
  }
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: #fff;
}

/* 顶部菜单栏 */
.menu-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  background: #16162a;
  border-bottom: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.menu-items {
  display: flex;
  gap: 4px;
}

.menu-item {
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.menu-right {
  display: flex;
  gap: 4px;
}

/* 主内容区域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧工具栏 */
.toolbar-left {
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  background: #16162a;
  border-right: 1px solid #2a2a4a;
  gap: 4px;
  flex-shrink: 0;
}

.tool-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tool-btn.active {
  background: #1890ff;
  color: #fff;
}

.toolbar-divider {
  height: 1px;
  width: 24px;
  background: #2a2a4a;
  margin: 8px 0;
}

.geometry-tools {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 4px;
}

.geometry-tool-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
}

.geometry-tool-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.geometry-tool-item.active {
  background: #1890ff;
  color: #fff;
}

.geometry-tool-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 中间场景区域 */
.scene-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
}

.scene-info {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  font-size: 11px;
  color: #888;
  display: flex;
  gap: 8px;
}

.add-cube-hint {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(24, 144, 255, 0.9);
  border-radius: 20px;
  font-size: 13px;
  color: #fff;
}

.add-light-hint,
.add-model-hint {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(24, 144, 255, 0.9);
  border-radius: 20px;
  font-size: 13px;
  color: #fff;
}

.add-light-hint {
  background: rgba(255, 193, 7, 0.9);
}

.add-model-hint {
  background: rgba(76, 175, 80, 0.9);
}

/* 模型库 */
.model-library {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.model-tool-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a30;
  border: 1px solid #2a2a4a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
}

.model-tool-item:hover {
  background: #2a2a4a;
  border-color: #3a3a5a;
}

.model-tool-item.active {
  background: #1890ff;
  border-color: #1890ff;
}

/* 右侧面板 */
.panel-right {
  width: 280px;
  background: #16162a;
  border-left: 1px solid #2a2a4a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.panel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-section:first-child {
  border-bottom: 1px solid #2a2a4a;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #1f1f3a;
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
  border-bottom: 1px solid #2a2a4a;
}

/* 图层列表 */
.layer-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.layer-item.selected {
  background: rgba(24, 144, 255, 0.2);
}

.layer-icon {
  font-size: 14px;
}

.layer-name {
  flex: 1;
  font-size: 12px;
  color: #ccc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-visibility button {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px;
}

.layer-visibility button:hover {
  color: #fff;
}

/* 属性面板 */
.property-panel {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.property-panel.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #666;
}

.empty-state svg {
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 12px;
}

.property-section {
  margin-bottom: 12px;
}

.property-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-input {
  width: 100%;
  padding: 6px 8px;
  background: #1f1f3a;
  border: 1px solid #2a2a4a;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.property-input:focus {
  border-color: #1890ff;
}

.property-row {
  display: flex;
  gap: 4px;
}

.property-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.property-axis {
  font-size: 10px;
  color: #666;
  width: 16px;
}

.property-input-small {
  flex: 1;
  width: 100%;
  padding: 4px 6px;
  background: #1f1f3a;
  border: 1px solid #2a2a4a;
  border-radius: 3px;
  color: #fff;
  font-size: 11px;
  outline: none;
}

.property-input-small:focus {
  border-color: #1890ff;
}
</style>