/**
 * 几何体工厂类 - 采用工厂模式实现几何体的统一创建和管理
 * 
 * 设计理念：
 * 1. Schema驱动：通过GeometrySchema定义几何体属性结构
 * 2. 注册机制：支持动态注册新的几何体类型
 * 3. 统一接口：提供一致的创建API，简化调用
 * 4. 资源管理：提供dispose方法释放资源
 * 
 * 架构层次：
 * ┌─────────────────────────────────────────────────────┐
 * │  GeometryFactory (工厂类)                            │
 * │  ├── registerSchema()    注册属性定义               │
 * │  ├── registerCreator()   注册创建函数               │
 * │  ├── create()            创建真实几何体             │
 * │  ├── createPreview()     创建预览几何体             │
 * │  └── dispose()           释放资源                   │
 * └─────────────────────────────────────────────────────┘
 */
import * as THREE from 'three';
import type { GeometrySchema, GeometryInstance, PropertySchema } from '../schemas/GeometrySchema';
import { defaultSchemas } from '../schemas/GeometrySchema';

/**
 * 几何体属性类型 - 键值对形式存储属性
 */
export type GeometryProperties = Record<string, number | string>;

/**
 * 创建选项接口
 */
export interface CreateOptions {
  position?: [number, number, number];  // 位置
  rotation?: [number, number, number];  // 旋转
  scale?: [number, number, number];     // 缩放
  properties?: GeometryProperties;      // 属性参数
}

/**
 * 几何体工厂类
 * 负责管理几何体类型的注册和创建
 */
export class GeometryFactory {
  /** 几何体属性定义映射 */
  private schemas: Map<string, GeometrySchema> = new Map();
  
  /** 几何体创建函数映射 */
  private creators: Map<string, (props: GeometryProperties) => THREE.BufferGeometry> = new Map();

  /**
   * 构造函数 - 初始化时注册默认几何体类型
   */
  constructor() {
    this.registerDefaultGeometries();
  }

  /**
   * 注册默认几何体类型
   * 包括：立方体、胶囊、圆形、圆锥、圆柱、十二面体、二十面体、八面体、平面、圆环、球体、四面体、圆环体、圆环扭结
   */
  private registerDefaultGeometries(): void {
    // 注册所有默认Schema
    defaultSchemas.forEach((schema) => {
      this.registerSchema(schema);
    });

    // 1. 立方体
    this.registerCreator('cube', (props) => {
      const width = (props.width as number) || 1;
      const height = (props.height as number) || 1;
      const depth = (props.depth as number) || 1;
      return new THREE.BoxGeometry(width, height, depth);
    });

    // 2. 胶囊
    this.registerCreator('capsule', (props) => {
      const radius = (props.radius as number) || 0.3;
      const length = (props.length as number) || 1;
      const capSegments = (props.capSegments as number) || 16;
      const radialSegments = (props.radialSegments as number) || 32;
      return new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments);
    });

    // 3. 圆形
    this.registerCreator('circle', (props) => {
      const radius = (props.radius as number) || 0.5;
      const segments = (props.segments as number) || 32;
      return new THREE.CircleGeometry(radius, segments);
    });

    // 4. 圆锥
    this.registerCreator('cone', (props) => {
      const radius = (props.radius as number) || 0.5;
      const height = (props.height as number) || 1;
      const radialSegments = (props.radialSegments as number) || 32;
      return new THREE.ConeGeometry(radius, height, radialSegments);
    });

    // 5. 圆柱
    this.registerCreator('cylinder', (props) => {
      const radiusTop = (props.radiusTop as number) || 0.5;
      const radiusBottom = (props.radiusBottom as number) || 0.5;
      const height = (props.height as number) || 1;
      const radialSegments = (props.radialSegments as number) || 32;
      return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    });

    // 6. 十二面体
    this.registerCreator('dodecahedron', (props) => {
      const radius = (props.radius as number) || 0.5;
      const detail = (props.detail as number) || 0;
      return new THREE.DodecahedronGeometry(radius, detail);
    });

    // 7. 二十面体
    this.registerCreator('icosahedron', (props) => {
      const radius = (props.radius as number) || 0.5;
      const detail = (props.detail as number) || 0;
      return new THREE.IcosahedronGeometry(radius, detail);
    });

    // 8. 八面体
    this.registerCreator('octahedron', (props) => {
      const radius = (props.radius as number) || 0.5;
      const detail = (props.detail as number) || 0;
      return new THREE.OctahedronGeometry(radius, detail);
    });

    // 9. 平面
    this.registerCreator('plane', (props) => {
      const width = (props.width as number) || 2;
      const height = (props.height as number) || 2;
      const widthSegments = (props.widthSegments as number) || 1;
      const heightSegments = (props.heightSegments as number) || 1;
      return new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    });

    // 10. 圆环
    this.registerCreator('ring', (props) => {
      const innerRadius = (props.innerRadius as number) || 0.2;
      const outerRadius = (props.outerRadius as number) || 0.5;
      const radialSegments = (props.radialSegments as number) || 32;
      return new THREE.RingGeometry(innerRadius, outerRadius, radialSegments);
    });

    // 11. 球体
    this.registerCreator('sphere', (props) => {
      const radius = (props.radius as number) || 0.5;
      const widthSegments = (props.widthSegments as number) || 32;
      const heightSegments = (props.heightSegments as number) || 32;
      return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    });

    // 12. 四面体
    this.registerCreator('tetrahedron', (props) => {
      const radius = (props.radius as number) || 0.5;
      const detail = (props.detail as number) || 0;
      return new THREE.TetrahedronGeometry(radius, detail);
    });

    // 13. 圆环体
    this.registerCreator('torus', (props) => {
      const radius = (props.radius as number) || 0.5;
      const tube = (props.tube as number) || 0.2;
      const radialSegments = (props.radialSegments as number) || 32;
      const tubularSegments = (props.tubularSegments as number) || 16;
      return new THREE.TorusGeometry(radius, tube, tubularSegments, radialSegments);
    });

    // 14. 圆环扭结
    this.registerCreator('torusKnot', (props) => {
      const radius = (props.radius as number) || 0.5;
      const tube = (props.tube as number) || 0.2;
      const radialSegments = (props.radialSegments as number) || 32;
      const tubularSegments = (props.tubularSegments as number) || 16;
      const p = (props.p as number) || 2;
      const q = (props.q as number) || 3;
      return new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
    });
  }

  /**
   * 注册几何体属性定义
   * @param schema 几何体属性定义
   */
  public registerSchema(schema: GeometrySchema): void {
    this.schemas.set(schema.type, schema);
  }

  /**
   * 注册几何体创建函数
   * @param type 几何体类型标识
   * @param creator 创建函数，接收属性参数返回BufferGeometry
   */
  public registerCreator(type: string, creator: (props: GeometryProperties) => THREE.BufferGeometry): void {
    this.creators.set(type, creator);
  }

  /**
   * 获取指定类型的属性定义
   * @param type 几何体类型标识
   * @returns 几何体属性定义，如果不存在返回undefined
   */
  public getSchema(type: string): GeometrySchema | undefined {
    return this.schemas.get(type);
  }

  /**
   * 获取所有已注册的几何体属性定义
   * @returns 几何体属性定义数组
   */
  public getAllSchemas(): GeometrySchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * 创建几何体实例
   * @param type 几何体类型标识
   * @param options 创建选项
   * @returns 几何体实例，包含geometry、material、mesh
   * @throws 如果类型未注册则抛出错误
   */
  public create(type: string, options: CreateOptions = {}): GeometryInstance {
    // 获取属性定义
    const schema = this.getSchema(type);
    if (!schema) {
      throw new Error(`Geometry type "${type}" not registered`);
    }

    // 获取创建函数
    const creator = this.creators.get(type);
    if (!creator) {
      throw new Error(`Creator for geometry type "${type}" not registered`);
    }

    // 合并默认属性和用户属性
    const defaultProps = this.getDefaultProperties(schema);
    const props = { ...defaultProps, ...options.properties };

    // 创建几何体
    const geometry = creator(props);
    const color = props.color as string || '#1890ff';
    
    // 创建材质
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      shininess: 100,
      side: THREE.DoubleSide
    });

    // 创建网格对象
    const mesh = new THREE.Mesh(geometry, material);

    // 设置位置
    if (options.position) {
      mesh.position.set(...options.position);
    } else {
      mesh.position.set(...schema.previewConfig.position);
    }

    // 设置旋转
    if (options.rotation) {
      mesh.rotation.set(...options.rotation);
    }

    // 设置缩放
    if (options.scale) {
      mesh.scale.set(...options.scale);
    } else {
      mesh.scale.set(schema.previewConfig.scale, schema.previewConfig.scale, schema.previewConfig.scale);
    }

    // 存储元数据
    mesh.userData = {
      type,
      properties: props
    };

    return {
      type,
      geometry,
      material,
      mesh
    };
  }

  /**
   * 创建预览几何体（半透明效果）
   * @param type 几何体类型标识
   * @param options 创建选项
   * @returns 预览几何体实例
   */
  public createPreview(type: string, options: CreateOptions = {}): GeometryInstance {
    // 先创建普通几何体
    const result = this.create(type, options);
    
    // 替换为半透明材质
    result.material = new THREE.MeshPhongMaterial({
      color: (result.mesh.userData.properties.color as string) || '#40a9ff',
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      wireframe: false
    });
    
    // 更新网格的材质
    result.mesh.material = result.material;
    result.mesh.name = 'PreviewGeometry';

    return result;
  }

  /**
   * 获取几何体的默认属性
   * @param schema 几何体属性定义
   * @returns 默认属性对象
   */
  public getDefaultProperties(schema: GeometrySchema): GeometryProperties {
    const props: GeometryProperties = {};
    schema.properties.forEach((prop: PropertySchema) => {
      props[prop.name] = prop.default;
    });
    return props;
  }

  /**
   * 释放几何体资源
   * @param instance 几何体实例
   */
  public dispose(instance: GeometryInstance): void {
    instance.geometry.dispose();
    instance.material.dispose();
  }
}

/**
 * 全局几何体工厂实例
 * 提供单例访问方式
 */
export const geometryFactory = new GeometryFactory();
