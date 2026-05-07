/**
 * 灯光属性定义模块
 * 支持多种灯光类型：环境光、方向光、点光源、聚光灯、半球光、矩形光、区域光
 */
import * as THREE from 'three';

export interface LightPropertySchema {
  name: string;
  label: string;
  type: 'number' | 'color' | 'select' | 'boolean';
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export interface LightSchema {
  type: string;
  label: string;
  icon: string;
  properties: LightPropertySchema[];
  previewConfig: {
    position: [number, number, number];
    target?: [number, number, number];
  };
}

export interface LightInstance {
  type: string;
  light: THREE.Light;
  helper?: THREE.Object3D;
}

export interface LightPreset {
  name: string;
  label: string;
  lights: {
    type: string;
    position: [number, number, number];
    properties: Record<string, number | string | boolean>;
  }[];
}

export const lightSchemas: LightSchema[] = [
  // 1. 环境光
  {
    type: 'ambient',
    label: '环境光',
    icon: '◐',
    properties: [
      { name: 'color', label: '颜色', type: 'color', default: '#ffffff' },
      { name: 'intensity', label: '强度', type: 'number', default: 0.5, min: 0, max: 2, step: 0.1 }
    ],
    previewConfig: {
      position: [0, 0, 0]
    }
  },
  // 2. 方向光
  {
    type: 'directional',
    label: '方向光',
    icon: '⬭',
    properties: [
      { name: 'color', label: '颜色', type: 'color', default: '#ffffff' },
      { name: 'intensity', label: '强度', type: 'number', default: 1, min: 0, max: 5, step: 0.1 },
      { name: 'castShadow', label: '投射阴影', type: 'boolean', default: true }
    ],
    previewConfig: {
      position: [5, 5, 5],
      target: [0, 0, 0]
    }
  },
  // 3. 点光源
  {
    type: 'point',
    label: '点光源',
    icon: '●',
    properties: [
      { name: 'color', label: '颜色', type: 'color', default: '#ffffff' },
      { name: 'intensity', label: '强度', type: 'number', default: 1, min: 0, max: 10, step: 0.1 },
      { name: 'distance', label: '距离', type: 'number', default: 0, min: 0, max: 100, step: 1 },
      { name: 'decay', label: '衰减', type: 'number', default: 2, min: 0, max: 4, step: 0.1 },
      { name: 'castShadow', label: '投射阴影', type: 'boolean', default: false }
    ],
    previewConfig: {
      position: [2, 2, 2]
    }
  },
  // 4. 聚光灯
  {
    type: 'spot',
    label: '聚光灯',
    icon: '◆',
    properties: [
      { name: 'color', label: '颜色', type: 'color', default: '#ffffff' },
      { name: 'intensity', label: '强度', type: 'number', default: 1, min: 0, max: 10, step: 0.1 },
      { name: 'distance', label: '距离', type: 'number', default: 0, min: 0, max: 100, step: 1 },
      { name: 'angle', label: '角度', type: 'number', default: Math.PI / 6, min: 0, max: Math.PI / 2, step: 0.01 },
      { name: 'penumbra', label: '半影', type: 'number', default: 0, min: 0, max: 1, step: 0.05 },
      { name: 'decay', label: '衰减', type: 'number', default: 2, min: 0, max: 4, step: 0.1 },
      { name: 'castShadow', label: '投射阴影', type: 'boolean', default: true }
    ],
    previewConfig: {
      position: [5, 5, 5],
      target: [0, 0, 0]
    }
  },
  // 5. 半球光
  {
    type: 'hemisphere',
    label: '半球光',
    icon: '⊕',
    properties: [
      { name: 'skyColor', label: '天空颜色', type: 'color', default: '#87ceeb' },
      { name: 'groundColor', label: '地面颜色', type: 'color', default: '#696969' },
      { name: 'intensity', label: '强度', type: 'number', default: 1, min: 0, max: 2, step: 0.1 }
    ],
    previewConfig: {
      position: [0, 10, 0]
    }
  },
  // 6. 矩形光
  {
    type: 'rectArea',
    label: '矩形光',
    icon: '▭',
    properties: [
      { name: 'color', label: '颜色', type: 'color', default: '#ffffff' },
      { name: 'intensity', label: '强度', type: 'number', default: 1, min: 0, max: 10, step: 0.1 },
      { name: 'width', label: '宽度', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1 },
      { name: 'height', label: '高度', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1 }
    ],
    previewConfig: {
      position: [0, 3, 2],
      target: [0, 0, 0]
    }
  }
];

export const lightPresets: LightPreset[] = [
  {
    name: 'default',
    label: '默认光照',
    lights: [
      {
        type: 'ambient',
        position: [0, 0, 0],
        properties: { color: '#ffffff', intensity: 0.3 }
      },
      {
        type: 'directional',
        position: [5, 5, 5],
        properties: { color: '#ffffff', intensity: 1, castShadow: true }
      }
    ]
  },
  {
    name: 'studio',
    label: '工作室光照',
    lights: [
      {
        type: 'ambient',
        position: [0, 0, 0],
        properties: { color: '#ffffff', intensity: 0.4 }
      },
      {
        type: 'point',
        position: [-3, 3, 3],
        properties: { color: '#ffd700', intensity: 2, distance: 10 }
      },
      {
        type: 'point',
        position: [3, 3, -3],
        properties: { color: '#add8e6', intensity: 2, distance: 10 }
      },
      {
        type: 'point',
        position: [0, -2, 0],
        properties: { color: '#ffffff', intensity: 1, distance: 8 }
      }
    ]
  },
  {
    name: 'dramatic',
    label: '戏剧光照',
    lights: [
      {
        type: 'ambient',
        position: [0, 0, 0],
        properties: { color: '#2c3e50', intensity: 0.2 }
      },
      {
        type: 'spot',
        position: [5, 5, 5],
        properties: { color: '#ffffff', intensity: 3, angle: Math.PI / 8, penumbra: 0.3 }
      },
      {
        type: 'point',
        position: [-2, 1, 2],
        properties: { color: '#ff4444', intensity: 1.5, distance: 6 }
      }
    ]
  },
  {
    name: 'outdoor',
    label: '户外光照',
    lights: [
      {
        type: 'hemisphere',
        position: [0, 10, 0],
        properties: { skyColor: '#87ceeb', groundColor: '#90ee90', intensity: 0.8 }
      },
      {
        type: 'directional',
        position: [10, 15, 10],
        properties: { color: '#ffffff', intensity: 1.2, castShadow: true }
      }
    ]
  }
];
