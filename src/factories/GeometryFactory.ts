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
 * │  ├── loadGLBModel()      异步加载GLB模型           │
 * │  └── dispose()           释放资源                   │
 * └─────────────────────────────────────────────────────┘
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GeometrySchema, PropertySchema } from '../schemas/GeometrySchema';
import { defaultSchemas } from '../schemas/GeometrySchema';

/**
 * 示例模型URLs - 用于演示
 */
const EXAMPLE_MODEL_URLS = {
  glbCar: '/model/glb1.glb',
  glbRobot: 'https://threelab.cn/ThreeEditX/resources/models/glb/glb-2.glb',
  glbFurniture: 'https://threelab.cn/ThreeEditX/resources/models/glb/glb-2.glb'
};

/**
 * GLB模型加载器实例
 */
const gltfLoader = new GLTFLoader();

/**
 * 几何体实例接口 - 支持单个Mesh或Group组合
 */
export interface GeometryInstance {
  type: string;
  object: THREE.Object3D;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
}

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
  
  /** 几何体创建函数映射 - 支持返回BufferGeometry或Group */
  private creators: Map<string, (props: GeometryProperties) => THREE.BufferGeometry | THREE.Group> = new Map();

  /**
   * 构造函数 - 初始化时注册默认几何体类型
   */
  constructor() {
    this.registerDefaultGeometries();
  }

  /**
   * 注册默认几何体类型
   * 包括：立方体、胶囊、圆形、圆锥、圆柱、十二面体、二十面体、八面体、平面、圆环、球体、四面体、圆环体、圆环扭结、茶壶、椅子、桌子
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

    // 15. 茶壶 - 组合模型
    this.registerCreator('teapot', (props) => {
      const size = (props.size as number) || 1;
      const group = new THREE.Group();
      
      const bodyGeo = new THREE.CylinderGeometry(0.4 * size, 0.35 * size, 0.6 * size, 32);
      const lidGeo = new THREE.CylinderGeometry(0.42 * size, 0.4 * size, 0.15 * size, 32);
      const spoutGeo = new THREE.TorusGeometry(0.15 * size, 0.08 * size, 8, 16);
      const handleGeo = new THREE.TorusGeometry(0.3 * size, 0.08 * size, 8, 16);
      
      const ceramicMat = new THREE.MeshStandardMaterial({ 
        color: 0xD4A574, 
        metalness: 0.1, 
        roughness: 0.3 
      });
      
      const body = new THREE.Mesh(bodyGeo, ceramicMat);
      body.position.y = 0.3 * size;
      body.castShadow = true;
      
      const lid = new THREE.Mesh(lidGeo, ceramicMat);
      lid.position.y = 0.75 * size;
      lid.castShadow = true;
      
      const spout = new THREE.Mesh(spoutGeo, ceramicMat);
      spout.position.set(0.45 * size, 0.3 * size, 0);
      spout.rotation.z = -Math.PI / 2;
      spout.castShadow = true;
      
      const handle = new THREE.Mesh(handleGeo, ceramicMat);
      handle.position.set(-0.35 * size, 0.35 * size, 0);
      handle.rotation.z = Math.PI / 2;
      handle.castShadow = true;
      
      group.add(body, lid, spout, handle);
      return group;
    });

    // 16. 椅子 - 组合模型
    this.registerCreator('chair', (props) => {
      const size = (props.size as number) || 1;
      const group = new THREE.Group();
      
      const seatGeo = new THREE.BoxGeometry(0.5 * size, 0.08 * size, 0.5 * size);
      const legGeo = new THREE.CylinderGeometry(0.04 * size, 0.04 * size, 0.5 * size, 8);
      const backGeo = new THREE.BoxGeometry(0.5 * size, 0.6 * size, 0.05 * size);
      
      const woodMat = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        metalness: 0.0, 
        roughness: 0.8 
      });
      
      const seat = new THREE.Mesh(seatGeo, woodMat);
      seat.position.y = 0.5 * size;
      seat.castShadow = true;
      
      const legPositions = [
        [-0.2 * size, 0.25 * size, -0.2 * size],
        [0.2 * size, 0.25 * size, -0.2 * size],
        [-0.2 * size, 0.25 * size, 0.2 * size],
        [0.2 * size, 0.25 * size, 0.2 * size]
      ];
      
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        group.add(leg);
      });
      
      const back = new THREE.Mesh(backGeo, woodMat);
      back.position.set(0, 0.85 * size, -0.225 * size);
      back.castShadow = true;
      
      group.add(seat, back);
      return group;
    });

    // 17. 桌子 - 组合模型
    this.registerCreator('table', (props) => {
      const size = (props.size as number) || 1;
      const group = new THREE.Group();
      
      const topGeo = new THREE.CylinderGeometry(0.7 * size, 0.7 * size, 0.08 * size, 32);
      const legGeo = new THREE.CylinderGeometry(0.05 * size, 0.05 * size, 0.6 * size, 8);
      
      const tableTopMat = new THREE.MeshStandardMaterial({ 
        color: 0xDEB887, 
        metalness: 0.0, 
        roughness: 0.7 
      });
      const tableLegMat = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        metalness: 0.0, 
        roughness: 0.8 
      });
      
      const top = new THREE.Mesh(topGeo, tableTopMat);
      top.position.y = 0.65 * size;
      top.castShadow = true;
      
      const legPositions = [
        [-0.45 * size, 0.3 * size, -0.45 * size],
        [0.45 * size, 0.3 * size, -0.45 * size],
        [-0.45 * size, 0.3 * size, 0.45 * size],
        [0.45 * size, 0.3 * size, 0.45 * size]
      ];
      
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, tableLegMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        group.add(leg);
      });
      
      group.add(top);
      return group;
    });

    // 18. GLB模型
    // 由于GLB加载是异步的，我们先注册一个占位符
    this.registerCreator('glbModel', (props) => {
      const size = (props.scale as number) || 1;
      const group = new THREE.Group();
      
      // 占位几何体 - 实际模型将在loadGLBModel中异步加载
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.3, roughness: 0.4 })
      );
      group.add(placeholder);
      
      return group;
    });

    // 19. 汽车模型 - 用代码创建汽车造型替代
    this.registerCreator('glbCar', (props) => {
      const size = (props.scale as number) || 1;
      const group = new THREE.Group();
      
      // 车身
      const bodyGeo = new THREE.BoxGeometry(2 * size, 0.6 * size, 1 * size);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.5, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.4 * size;
      body.castShadow = true;
      
      // 车顶
      const roofGeo = new THREE.BoxGeometry(1.2 * size, 0.4 * size, 0.8 * size);
      const roof = new THREE.Mesh(roofGeo, bodyMat);
      roof.position.set(0, 0.9 * size, 0);
      roof.castShadow = true;
      
      // 轮子
      const wheelGeo = new THREE.CylinderGeometry(0.2 * size, 0.2 * size, 0.1 * size, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
      
      const wheelPositions = [
        [-0.8 * size, 0.2 * size, 0.5 * size],
        [0.8 * size, 0.2 * size, 0.5 * size],
        [-0.8 * size, 0.2 * size, -0.5 * size],
        [0.8 * size, 0.2 * size, -0.5 * size]
      ];
      
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        group.add(wheel);
      });
      
      group.add(body, roof);
      return group;
    });

    // 20. 机器人模型 - 用代码创建机器人造型替代
    this.registerCreator('glbRobot', (props) => {
      const size = (props.scale as number) || 1;
      const group = new THREE.Group();
      
      const mat = new THREE.MeshStandardMaterial({ color: 0x00aaff, metalness: 0.4, roughness: 0.4 });
      
      // 身体
      const bodyGeo = new THREE.BoxGeometry(0.6 * size, 1 * size, 0.4 * size);
      const body = new THREE.Mesh(bodyGeo, mat);
      body.position.y = 0.8 * size;
      body.castShadow = true;
      
      // 头部
      const headGeo = new THREE.SphereGeometry(0.3 * size, 16, 16);
      const head = new THREE.Mesh(headGeo, mat);
      head.position.y = 1.55 * size;
      head.castShadow = true;
      
      // 眼睛
      const eyeGeo = new THREE.SphereGeometry(0.08 * size, 8, 8);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 });
      
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.12 * size, 1.6 * size, 0.25 * size);
      
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.12 * size, 1.6 * size, 0.25 * size);
      
      // 手臂
      const armGeo = new THREE.CylinderGeometry(0.08 * size, 0.08 * size, 0.7 * size, 8);
      const leftArm = new THREE.Mesh(armGeo, mat);
      leftArm.position.set(-0.45 * size, 0.8 * size, 0);
      leftArm.rotation.z = Math.PI / 6;
      leftArm.castShadow = true;
      
      const rightArm = new THREE.Mesh(armGeo, mat);
      rightArm.position.set(0.45 * size, 0.8 * size, 0);
      rightArm.rotation.z = -Math.PI / 6;
      rightArm.castShadow = true;
      
      // 腿
      const legGeo = new THREE.CylinderGeometry(0.1 * size, 0.1 * size, 0.6 * size, 8);
      const leftLeg = new THREE.Mesh(legGeo, mat);
      leftLeg.position.set(-0.15 * size, 0.25 * size, 0);
      leftLeg.castShadow = true;
      
      const rightLeg = new THREE.Mesh(legGeo, mat);
      rightLeg.position.set(0.15 * size, 0.25 * size, 0);
      rightLeg.castShadow = true;
      
      group.add(body, head, leftEye, rightEye, leftArm, rightArm, leftLeg, rightLeg);
      return group;
    });

    // 21. 家具模型 - 用代码创建沙发造型替代
    this.registerCreator('glbFurniture', (props) => {
      const size = (props.scale as number) || 1;
      const group = new THREE.Group();
      
      const mat = new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0, roughness: 0.8 });
      
      // 底座
      const baseGeo = new THREE.BoxGeometry(1.5 * size, 0.3 * size, 0.8 * size);
      const base = new THREE.Mesh(baseGeo, mat);
      base.position.y = 0.15 * size;
      base.castShadow = true;
      
      // 靠背
      const backGeo = new THREE.BoxGeometry(1.5 * size, 0.6 * size, 0.15 * size);
      const back = new THREE.Mesh(backGeo, mat);
      back.position.set(0, 0.6 * size, -0.325 * size);
      back.castShadow = true;
      
      // 扶手
      const armGeo = new THREE.BoxGeometry(0.15 * size, 0.4 * size, 0.8 * size);
      const leftArm = new THREE.Mesh(armGeo, mat);
      leftArm.position.set(-0.675 * size, 0.35 * size, 0);
      leftArm.castShadow = true;
      
      const rightArm = new THREE.Mesh(armGeo, mat);
      rightArm.position.set(0.675 * size, 0.35 * size, 0);
      rightArm.castShadow = true;
      
      // 靠垫
      const cushionGeo = new THREE.BoxGeometry(1.2 * size, 0.2 * size, 0.6 * size);
      const cushionMat = new THREE.MeshStandardMaterial({ color: 0xCD853F, metalness: 0, roughness: 0.9 });
      const cushion = new THREE.Mesh(cushionGeo, cushionMat);
      cushion.position.set(0, 0.4 * size, 0);
      cushion.castShadow = true;
      
      group.add(base, back, leftArm, rightArm, cushion);
      return group;
    });
  }

  /**
   * 创建GLB模型
   * @param type 模型类型
   * @param options 创建选项
   * @returns Promise<GeometryInstance>
   */
  public async createGLBModel(type: string, options: CreateOptions = {}): Promise<GeometryInstance> {
    const schema = this.getSchema(type);
    if (!schema) {
      throw new Error(`Model type "${type}" not registered`);
    }

    const defaultProps = this.getDefaultProperties(schema);
    const props = { ...defaultProps, ...options.properties };
    
    // 获取模型URL
    let modelUrl: string;
    if (type === 'glbModel') {
      modelUrl = (props.modelUrl as string) || '';
    } else {
      modelUrl = (EXAMPLE_MODEL_URLS as any)[type] || '';
    }

    if (!modelUrl) {
      // 如果没有URL，返回占位几何体
      return this.create(type, options);
    }

    try {
      // 尝试加载模型
      const gltf = await new Promise<THREE.GLTF>((resolve, reject) => {
        gltfLoader.load(
          modelUrl,
          resolve,
          undefined,
          (error) => {
            console.warn('Failed to load external model, using placeholder:', error);
            reject(error);
          }
        );
      });

      const modelGroup = gltf.scene;
      const scale = (props.scale as number) || 1;
      modelGroup.scale.set(scale, scale, scale);

      const geometries: THREE.BufferGeometry[] = [];
      const materials: THREE.Material[] = [];
      
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.geometry) geometries.push(child.geometry);
          if (child.material) {
            if (Array.isArray(child.material)) {
              materials.push(...child.material);
            } else {
              materials.push(child.material);
            }
          }
        }
      });

      // 设置位置
      if (options.position) {
        modelGroup.position.set(...options.position);
      } else {
        modelGroup.position.set(...schema.previewConfig.position);
      }

      if (options.rotation) {
        modelGroup.rotation.set(...options.rotation);
      }

      modelGroup.userData = {
        type,
        properties: props
      };

      return {
        type,
        object: modelGroup,
        geometries,
        materials
      };
    } catch (error) {
      // 加载失败时使用代码生成的占位模型
      console.log('Using placeholder model due to loading error');
      return this.create(type, options);
    }
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
   * @param creator 创建函数，接收属性参数返回BufferGeometry或Group
   */
  public registerCreator(type: string, creator: (props: GeometryProperties) => THREE.BufferGeometry | THREE.Group): void {
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
   * @returns 几何体实例
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

    // 创建几何体/组合体
    const result = creator(props);
    const color = props.color as string || '#1890ff';
    
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    let object: THREE.Object3D;

    if (result instanceof THREE.Group) {
      // 组合模型 - 遍历所有子对象
      result.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 只有当 Mesh 没有材质时才创建新材质
          if (!child.material) {
            const material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(color),
              metalness: 0.1,
              roughness: 0.6
            });
            child.material = material;
          }
          // 收集几何体和材质
          if (child.geometry) geometries.push(child.geometry);
          if (child.material) {
            if (Array.isArray(child.material)) {
              materials.push(...child.material);
            } else {
              materials.push(child.material);
            }
          }
        }
      });
      object = result;
    } else {
      // 单个几何体
      const geometry = result;
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        shininess: 100,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      geometries.push(geometry);
      materials.push(material);
      object = mesh;
    }

    // 设置位置
    if (options.position) {
      object.position.set(...options.position);
    } else {
      object.position.set(...schema.previewConfig.position);
    }

    // 设置旋转
    if (options.rotation) {
      object.rotation.set(...options.rotation);
    }

    // 设置缩放
    if (options.scale) {
      object.scale.set(...options.scale);
    } else {
      object.scale.set(schema.previewConfig.scale, schema.previewConfig.scale, schema.previewConfig.scale);
    }

    // 存储元数据
    object.userData = {
      type,
      properties: props
    };

    return {
      type,
      object,
      geometries,
      materials
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
    result.materials.forEach(material => {
      if (material instanceof THREE.MeshPhongMaterial || material instanceof THREE.MeshStandardMaterial) {
        material.transparent = true;
        material.opacity = 0.6;
        if (material instanceof THREE.MeshStandardMaterial) {
          material.emissive = new THREE.Color('#40a9ff');
          material.emissiveIntensity = 0.3;
        }
      }
    });
    
    result.object.name = 'PreviewGeometry';
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
    instance.geometries.forEach(geo => geo.dispose());
    instance.materials.forEach(mat => mat.dispose());
  }
}

/**
 * 全局几何体工厂实例
 * 提供单例访问方式
 */
export const geometryFactory = new GeometryFactory();
