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
        <button 
          class="tool-btn" 
          :class="{ active: isAddingCube }"
          @click="startAddCube"
          title="添加立方体 (C)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </button>
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
        <div v-if="isAddingCube" class="add-cube-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span>移动鼠标到目标位置，点击添加立方体</span>
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
import * as THREE from 'three';

const containerRef = ref<HTMLElement | null>(null);
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate');
const selectedObjectId = ref<number | null>(null);
const isAddingCube = ref(false);

interface SceneObjectInfo {
  id: number;
  name: string;
  type: string;
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
  visible: true,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 0, y: 0, z: 0 }
});

const totalVertices = computed(() => sceneObjects.value.length * 24);
const totalFaces = computed(() => sceneObjects.value.length * 12);

let sceneManager: SceneManager | null = null;
let objectIdCounter = 1;
let selectedMesh: THREE.Object3D | null = null;
let previewCube: THREE.Mesh | null = null;
let raycaster: THREE.Raycaster | null = null;
let mouse: THREE.Vector2 | null = null;
let gridPlane: THREE.Plane | null = null;

const setTransformMode = (mode: 'translate' | 'rotate' | 'scale') => {
  transformMode.value = mode;
  sceneManager?.setTransformMode(mode);
};

const startAddCube = () => {
  if (!sceneManager) return;
  
  isAddingCube.value = !isAddingCube.value;
  
  if (isAddingCube.value) {
    createPreviewCube();
  } else {
    removePreviewCube();
  }
};

const createPreviewCube = () => {
  if (!sceneManager) return;
  
  const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const material = new THREE.MeshStandardMaterial({
    color: '#1890ff',
    metalness: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: 0.7
  });
  
  previewCube = new THREE.Mesh(geometry, material);
  previewCube.name = 'PreviewCube';
  previewCube.visible = true;
  
  sceneManager.scene.add(previewCube);
};

const removePreviewCube = () => {
  if (previewCube && sceneManager) {
    sceneManager.scene.remove(previewCube);
    previewCube.geometry.dispose();
    (previewCube.material as THREE.Material).dispose();
    previewCube = null;
  }
};

const updatePreviewCubePosition = (event: MouseEvent) => {
  if (!isAddingCube.value || !previewCube || !sceneManager || !containerRef.value) return;
  
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
    previewCube.position.set(
      Math.round(intersectPoint.x * 10) / 10,
      0.4,
      Math.round(intersectPoint.z * 10) / 10
    );
  }
};

const handleSceneClick = (event: MouseEvent) => {
  if (!isAddingCube.value || !sceneManager || !containerRef.value) return;
  
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
    addCubeAtPosition(intersectPoint.x, intersectPoint.z);
  }
  
  isAddingCube.value = false;
  removePreviewCube();
};

const addCubeAtPosition = (x: number, z: number) => {
  if (!sceneManager) return;
  
  const cube = sceneManager.createCube({
    size: 1,
    color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
    position: [Math.round(x * 10) / 10, 0.5, Math.round(z * 10) / 10]
  });
  
  cube.userData = { id: objectIdCounter };
  sceneManager.addObject(cube);
  
  sceneObjects.value.push({
    id: objectIdCounter,
    name: `Cube_${objectIdCounter}`,
    type: 'Mesh',
    visible: true,
    position: { x: cube.position.x, y: cube.position.y, z: cube.position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  });
  
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
  if (isAddingCube.value) return;
  
  selectedObjectId.value = id;
  
  const objInfo = sceneObjects.value.find(obj => obj.id === id);
  if (objInfo) {
    Object.assign(selectedObject, objInfo);
    
    if (sceneManager) {
      const mesh = sceneManager.scene.getObjectById(id);
      if (mesh) {
        selectedMesh = mesh;
        sceneManager.selectObject(mesh);
      }
    }
  }
};

const toggleVisibility = (id: number) => {
  const obj = sceneObjects.value.find(o => o.id === id);
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
  if (!isAddingCube.value) return;
  updatePreviewCubePosition(event);
};

const handleClick = (event: MouseEvent) => {
  if (isAddingCube.value) {
    handleSceneClick(event);
  } else {
    handleObjectSelection(event);
  }
};

const handleObjectSelection = (event: MouseEvent) => {
  if (!sceneManager || !containerRef.value) return;
  
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
  
  const objects = sceneManager.scene.children.filter((obj) => obj instanceof THREE.Mesh && obj.name !== 'PreviewCube');
  const intersects = raycaster.intersectObjects(objects);
  
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object as THREE.Mesh;
    if (clickedObject.userData.id) {
      selectObjectById(clickedObject.userData.id);
    }
  } else {
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
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (isAddingCube.value) {
      isAddingCube.value = false;
      removePreviewCube();
    }
  }
};

const handleContextMenu = (event: MouseEvent) => {
  if (isAddingCube.value) {
    event.preventDefault();
    isAddingCube.value = false;
    removePreviewCube();
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
    
    const cube = sceneManager.createCube({
      size: 1,
      color: '#1890ff',
      position: [0, 0.5, 0]
    });
    cube.userData = { id: objectIdCounter };
    sceneManager.addObject(cube);
    
    sceneObjects.value.push({
      id: objectIdCounter,
      name: 'Cube_1',
      type: 'Mesh',
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
  removePreviewCube();
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