<template>
  <div class="app-container">
    <SceneView />
  </div>
</template>

<script setup lang="ts">
import SceneView from './components/SceneView.vue';
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
}

.app-container {
  width: 100%;
  height: 100%;
}
</style>
