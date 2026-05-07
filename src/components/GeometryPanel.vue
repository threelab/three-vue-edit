<template>
  <div class="geometry-panel">
    <div class="panel-header">
      <h3>几何体创建</h3>
    </div>
    
    <div class="geometry-types">
      <div 
        v-for="schema in schemas" 
        :key="schema.type"
        class="geometry-type-item"
        :class="{ active: selectedType === schema.type }"
        @click="selectGeometry(schema.type)"
      >
        <img v-if="schema.icon.startsWith('/')" class="geometry-icon-img" :src="schema.icon" :alt="schema.label" />
        <span v-else class="geometry-icon">{{ schema.icon }}</span>
        <span class="geometry-label">{{ schema.label }}</span>
      </div>
    </div>

    <div v-if="currentSchema" class="geometry-properties">
      <h4>属性设置</h4>
      <div 
        v-for="prop in currentSchema.properties" 
        :key="prop.name"
        class="property-item"
      >
        <label>{{ prop.label }}</label>
        <input 
          v-if="prop.type === 'number'"
          type="number"
          :min="prop.min"
          :max="prop.max"
          :step="prop.step"
          v-model.number="currentProperties[prop.name]"
          @input="updatePreview"
        />
        <input 
          v-else-if="prop.type === 'color'"
          type="color"
          v-model="currentProperties[prop.name]"
          @input="updatePreview"
        />
        <select 
          v-else-if="prop.type === 'select' && prop.options"
          v-model="currentProperties[prop.name]"
          @change="updatePreview"
        >
          <option 
            v-for="option in prop.options" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="panel-actions">
      <button class="btn btn-primary" @click="startCreate">开始创建</button>
      <button class="btn btn-secondary" @click="resetProperties">重置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { geometryFactory, type GeometryProperties } from '../factories';
import type { GeometrySchema } from '../schemas/GeometrySchema';

const emit = defineEmits<{
  (e: 'start-create', type: string, properties: GeometryProperties): void;
}>();

const schemas = ref<GeometrySchema[]>(geometryFactory.getAllSchemas());
const selectedType = ref<string>('cube');
const currentProperties = ref<GeometryProperties>({});

const currentSchema = computed(() => {
  return geometryFactory.getSchema(selectedType.value);
});

const selectGeometry = (type: string) => {
  selectedType.value = type;
  loadDefaultProperties();
};

const loadDefaultProperties = () => {
  const schema = currentSchema.value;
  if (schema) {
    currentProperties.value = geometryFactory.getDefaultProperties(schema);
    updatePreview();
  }
};

const updatePreview = () => {
  emit('start-create', selectedType.value, { ...currentProperties.value });
};

const startCreate = () => {
  emit('start-create', selectedType.value, { ...currentProperties.value });
};

const resetProperties = () => {
  loadDefaultProperties();
};

watch(selectedType, () => {
  loadDefaultProperties();
});

loadDefaultProperties();
</script>

<style scoped>
.geometry-panel {
  background: #1a1a2e;
  border-radius: 8px;
  padding: 16px;
  color: #fff;
}

.panel-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3a3a5e;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.geometry-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.geometry-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #2a2a3e;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.geometry-type-item:hover {
  background: #3a3a5e;
}

.geometry-type-item.active {
  background: #1890ff;
  border-color: #40a9ff;
}

.geometry-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.geometry-icon-img {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  object-fit: contain;
}

.geometry-label {
  font-size: 12px;
}

.geometry-properties {
  margin-bottom: 20px;
  padding: 12px;
  background: #2a2a3e;
  border-radius: 8px;
}

.geometry-properties h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.property-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.property-item:last-child {
  margin-bottom: 0;
}

.property-item label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.property-item input,
.property-item select {
  padding: 6px 8px;
  background: #1a1a2e;
  border: 1px solid #3a3a5e;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.property-item input[type="color"] {
  padding: 0;
  height: 32px;
  cursor: pointer;
}

.property-item input:focus,
.property-item select:focus {
  outline: none;
  border-color: #1890ff;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #3a3a5e;
  color: #fff;
}

.btn-secondary:hover {
  background: #4a4a6e;
}
</style>
