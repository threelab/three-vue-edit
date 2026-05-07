<template>
  <div class="scene-container">
    <div class="toolbar">
      <button 
        class="tool-btn" 
        :class="{ active: transformMode === 'translate' }"
        @click="setTransformMode('translate')"
        title="移动"
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
        title="旋转"
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
        title="缩放"
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
    </div>
    <div ref="containerRef" class="canvas-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { SceneManager } from '../core';

const containerRef = ref<HTMLElement | null>(null);
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate');
let sceneManager: SceneManager | null = null;

const setTransformMode = (mode: 'translate' | 'rotate' | 'scale') => {
  transformMode.value = mode;
  sceneManager?.setTransformMode(mode);
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
    sceneManager.addObject(cube);
  }
});

onUnmounted(() => {
  sceneManager?.destroy();
});
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
}

.toolbar {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(30, 30, 50, 0.9);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  z-index: 100;
}

.tool-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.tool-btn.active {
  background: #1890ff;
  color: #fff;
}
</style>
