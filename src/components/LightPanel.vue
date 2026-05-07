<template>
  <div class="light-panel">
    <h3 class="panel-title">灯光</h3>
    
    <!-- 预设模板 -->
    <div class="preset-section">
      <label class="section-label">预设模板</label>
      <div class="preset-buttons">
        <button
          v-for="preset in presets"
          :key="preset.name"
          @click="applyPreset(preset.name)"
          class="preset-btn"
          :class="{ active: activePreset === preset.name }"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <!-- 当前灯光类型信息 -->
    <div v-if="currentSchema" class="current-type-section">
      <label class="section-label">{{ currentSchema.icon }} {{ currentSchema.label }}</label>
    </div>

    <!-- 属性面板 -->
    <div class="properties-section">
      <label class="section-label">属性</label>
      
      <div v-for="prop in currentSchema?.properties" :key="prop.name" class="property-item">
        <span class="property-label">{{ prop.label }}</span>
        
        <!-- 颜色选择器 -->
        <input
          v-if="prop.type === 'color'"
          type="color"
          v-model="currentProperties[prop.name]"
          class="property-input color-input"
          @change="onPropertyChange"
        />
        
        <!-- 数字输入 -->
        <input
          v-else-if="prop.type === 'number'"
          type="number"
          v-model.number="currentProperties[prop.name]"
          :min="prop.min"
          :max="prop.max"
          :step="prop.step"
          class="property-input number-input"
          @change="onPropertyChange"
        />
        
        <!-- 布尔开关 -->
        <label v-else-if="prop.type === 'boolean'" class="toggle-label">
          <input
            type="checkbox"
            v-model="currentProperties[prop.name]"
            class="toggle-input"
            @change="onPropertyChange"
          />
          <span class="toggle-text">{{ currentProperties[prop.name] ? '开启' : '关闭' }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { lightFactory, type LightProperties } from '../factories';
import type { LightSchema, LightPreset } from '../schemas/LightSchema';

const props = defineProps<{
  lightType?: string;
}>();

const emit = defineEmits<{
  (e: 'apply-preset', presetName: string): void;
  (e: 'property-change', properties: LightProperties): void;
}>();

const schemas = ref<LightSchema[]>(lightFactory.getAllSchemas());
const presets = ref<LightPreset[]>(lightFactory.getAllPresets());
const currentProperties = ref<LightProperties>({});
const activePreset = ref<string>('');

const currentSchema = computed(() => {
  if (props.lightType) {
    return schemas.value.find(s => s.type === props.lightType);
  }
  return undefined;
});

watch(() => props.lightType, (newType) => {
  if (newType) {
    loadDefaultProperties();
  }
});

const loadDefaultProperties = () => {
  const schema = currentSchema.value;
  if (schema) {
    currentProperties.value = lightFactory.getDefaultProperties(schema);
    onPropertyChange();
  }
};

const onPropertyChange = () => {
  emit('property-change', { ...currentProperties.value });
};

const applyPreset = (presetName: string) => {
  activePreset.value = presetName;
  emit('apply-preset', presetName);
};

if (props.lightType) {
  loadDefaultProperties();
}
</script>

<style scoped>
.light-panel {
  padding: 16px;
  background: #1e1e2e;
  border-radius: 8px;
}

.panel-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.section-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: #8892b0;
}

.preset-section,
.current-type-section,
.properties-section {
  margin-bottom: 16px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preset-btn {
  padding: 4px 10px;
  font-size: 11px;
  border: none;
  border-radius: 4px;
  background: #2a2a3e;
  color: #a8b2d1;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #3a3a4e;
  color: #fff;
}

.preset-btn.active {
  background: #49b882;
  color: #fff;
}

.current-type-section .section-label {
  padding: 6px 8px;
  background: #2a2a3e;
  border-radius: 4px;
  color: #49b882;
  font-weight: 500;
}

.property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.property-label {
  font-size: 12px;
  color: #a8b2d1;
}

.property-input {
  padding: 4px 6px;
  font-size: 12px;
  border: 1px solid #3a3a4e;
  border-radius: 4px;
  background: #2a2a3e;
  color: #fff;
}

.color-input {
  width: 40px;
  height: 24px;
  padding: 0;
  cursor: pointer;
}

.number-input {
  width: 80px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.toggle-input {
  width: 16px;
  height: 16px;
}

.toggle-text {
  font-size: 11px;
  color: #a8b2d1;
}
</style>
