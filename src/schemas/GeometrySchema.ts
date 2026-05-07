import * as THREE from 'three';

export interface PropertySchema {
  name: string;
  label: string;
  type: 'number' | 'color' | 'select';
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export interface GeometrySchema {
  type: string;
  label: string;
  icon: string;
  properties: PropertySchema[];
  previewConfig: {
    scale: number;
    position: [number, number, number];
  };
}



export const defaultSchemas: GeometrySchema[] = [
  // 1. 立方体
  {
    type: 'cube',
    label: '立方体',
    icon: '◰',
    properties: [
      { name: 'width', label: '宽度', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1 },
      { name: 'height', label: '高度', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1 },
      { name: 'depth', label: '深度', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1 },
      { name: 'color', label: '颜色', type: 'color', default: '#1890ff' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 2. 胶囊
  {
    type: 'capsule',
    label: '胶囊',
    icon: '⬭',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.3, min: 0.1, max: 2, step: 0.1 },
      { name: 'length', label: '长度', type: 'number', default: 1, min: 0.2, max: 5, step: 0.1 },
      { name: 'capSegments', label: '帽部分段', type: 'number', default: 16, min: 4, max: 32, step: 1 },
      { name: 'radialSegments', label: '径向分段', type: 'number', default: 32, min: 8, max: 64, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#1890ff' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 3. 圆形
  {
    type: 'circle',
    label: '圆形',
    icon: '○',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'segments', label: '分段数', type: 'number', default: 32, min: 3, max: 64, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#52c41a' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0, 0]
    }
  },
  // 4. 圆锥
  {
    type: 'cone',
    label: '圆锥',
    icon: '△',
    properties: [
      { name: 'radius', label: '底面半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'height', label: '高度', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1 },
      { name: 'radialSegments', label: '径向分段', type: 'number', default: 32, min: 8, max: 64, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#f5222d' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 5. 圆柱
  {
    type: 'cylinder',
    label: '圆柱',
    icon: '◱',
    properties: [
      { name: 'radiusTop', label: '顶部半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'radiusBottom', label: '底部半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'height', label: '高度', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1 },
      { name: 'radialSegments', label: '径向分段', type: 'number', default: 32, min: 8, max: 64, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#faad14' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 6. 十二面体
  {
    type: 'dodecahedron',
    label: '十二面体',
    icon: '⬡',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'detail', label: '细节级别', type: 'number', default: 0, min: 0, max: 3, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#722ed1' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 7. 二十面体
  {
    type: 'icosahedron',
    label: '二十面体',
    icon: '⬢',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'detail', label: '细节级别', type: 'number', default: 0, min: 0, max: 3, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#13c2c2' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 8. 八面体
  {
    type: 'octahedron',
    label: '八面体',
    icon: '◈',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'detail', label: '细节级别', type: 'number', default: 0, min: 0, max: 3, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#eb2f96' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 9. 平面
  {
    type: 'plane',
    label: '平面',
    icon: '▭',
    properties: [
      { name: 'width', label: '宽度', type: 'number', default: 2, min: 0.1, max: 10, step: 0.1 },
      { name: 'height', label: '高度', type: 'number', default: 2, min: 0.1, max: 10, step: 0.1 },
      { name: 'widthSegments', label: '宽度分段', type: 'number', default: 1, min: 1, max: 32, step: 1 },
      { name: 'heightSegments', label: '高度分段', type: 'number', default: 1, min: 1, max: 32, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#91d5ff' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0, 0]
    }
  },
  // 10. 圆环
  {
    type: 'ring',
    label: '圆环',
    icon: '⊚',
    properties: [
      { name: 'innerRadius', label: '内半径', type: 'number', default: 0.2, min: 0.05, max: 2, step: 0.05 },
      { name: 'outerRadius', label: '外半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'radialSegments', label: '径向分段', type: 'number', default: 32, min: 8, max: 64, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#52c41a' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0, 0]
    }
  },
  // 11. 球体
  {
    type: 'sphere',
    label: '球体',
    icon: '◉',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'widthSegments', label: '宽度分段', type: 'number', default: 32, min: 8, max: 64, step: 1 },
      { name: 'heightSegments', label: '高度分段', type: 'number', default: 32, min: 8, max: 64, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#52c41a' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 12. 四面体
  {
    type: 'tetrahedron',
    label: '四面体',
    icon: '△',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'detail', label: '细节级别', type: 'number', default: 0, min: 0, max: 3, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#faad14' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 13. 圆环体
  {
    type: 'torus',
    label: '圆环体',
    icon: '◎',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'tube', label: '管径', type: 'number', default: 0.2, min: 0.05, max: 2, step: 0.05 },
      { name: 'radialSegments', label: '径向分段', type: 'number', default: 32, min: 8, max: 64, step: 1 },
      { name: 'tubularSegments', label: '管道分段', type: 'number', default: 16, min: 4, max: 32, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#722ed1' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 14. 圆环扭结
  {
    type: 'torusKnot',
    label: '圆环扭结',
    icon: '❖',
    properties: [
      { name: 'radius', label: '半径', type: 'number', default: 0.5, min: 0.1, max: 5, step: 0.1 },
      { name: 'tube', label: '管径', type: 'number', default: 0.2, min: 0.05, max: 2, step: 0.05 },
      { name: 'radialSegments', label: '径向分段', type: 'number', default: 32, min: 8, max: 64, step: 1 },
      { name: 'tubularSegments', label: '管道分段', type: 'number', default: 16, min: 4, max: 32, step: 1 },
      { name: 'p', label: '扭结参数p', type: 'number', default: 2, min: 1, max: 10, step: 1 },
      { name: 'q', label: '扭结参数q', type: 'number', default: 3, min: 1, max: 10, step: 1 },
      { name: 'color', label: '颜色', type: 'color', default: '#eb2f96' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 15. 茶壶
  {
    type: 'teapot',
    label: '茶壶',
    icon: '🍵',
    properties: [
      { name: 'size', label: '尺寸', type: 'number', default: 1, min: 0.5, max: 3, step: 0.1 },
      { name: 'color', label: '颜色', type: 'color', default: '#d4a373' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 16. 椅子
  {
    type: 'chair',
    label: '椅子',
    icon: '🪑',
    properties: [
      { name: 'size', label: '尺寸', type: 'number', default: 1, min: 0.5, max: 3, step: 0.1 },
      { name: 'color', label: '颜色', type: 'color', default: '#8b4513' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 17. 桌子
  {
    type: 'table',
    label: '桌子',
    icon: '🪔',
    properties: [
      { name: 'size', label: '尺寸', type: 'number', default: 1, min: 0.5, max: 3, step: 0.1 },
      { name: 'color', label: '颜色', type: 'color', default: '#654321' }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.35, 0]
    }
  },
  // 18. GLB模型
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
    icon: '/model/glb.png',
    properties: [
      { name: 'scale', label: '缩放', type: 'number', default: 1, min: 0.5, max: 3, step: 0.1 }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 20. 机器人模型 (示例)
  {
    type: 'glbRobot',
    label: '机器人模型',
    icon: '🤖',
    properties: [
      { name: 'scale', label: '缩放', type: 'number', default: 1, min: 0.5, max: 3, step: 0.1 }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  },
  // 21. 家具模型 (示例)
  {
    type: 'glbFurniture',
    label: '家具模型',
    icon: '🛋️',
    properties: [
      { name: 'scale', label: '缩放', type: 'number', default: 1, min: 0.5, max: 3, step: 0.1 }
    ],
    previewConfig: {
      scale: 1,
      position: [0, 0.5, 0]
    }
  }
];
