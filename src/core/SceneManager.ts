import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { geometryFactory, lightFactory, type GeometryProperties, type LightProperties } from '../factories';

export interface SceneManagerConfig {
  container: HTMLElement;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  backgroundColor?: number;
  enableShadow?: boolean;
  enableGrid?: boolean;
}


export interface ObjectTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface CreateCubeOptions {
  size?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface CreateGeometryOptions {
  type: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  properties?: GeometryProperties;
}

export interface AddLightOptions {
  type: string;
  properties?: LightProperties;
  position?: [number, number, number];
}

export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly orbitControls: OrbitControls;
  public readonly transformControls: TransformControls;
  public readonly transformControlsHelper: THREE.Object3D;

  private container: HTMLElement;
  private animationFrameId: number | null = null;
  private objects: THREE.Object3D[] = [];
  private lights: THREE.Light[] = [];
  private selectedObject: THREE.Object3D | null = null;
  private isInitialized: boolean = false;

  constructor(config: SceneManagerConfig) {
    this.container = config.container;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.backgroundColor ?? 0x1a1a2e);

    const { clientWidth, clientHeight } = config.container;
    this.camera = new THREE.PerspectiveCamera(
      config.fov ?? 75,
      clientWidth / clientHeight,
      config.near ?? 0.1,
      config.far ?? 1000
    );
    
    const cameraPos = config.cameraPosition ?? [3, 3, 5];
    this.camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
    
    const target = config.cameraTarget ?? [0, 0, 0];
    this.camera.lookAt(target[0], target[1], target[2]);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = config.enableShadow ?? true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.enablePan = true;
    this.orbitControls.enableZoom = true;

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    // 确保 TransformControls 启用
    this.transformControls.enabled = true;
    // 添加 TransformControls helper 到场景中（关键！）
    this.transformControlsHelper = this.transformControls.getHelper();
    // 初始化时隐藏 helper，选中对象时再显示
    this.transformControlsHelper.visible = false;
    this.scene.add(this.transformControlsHelper);
    console.log('TransformControls initialized:', this.transformControls);
    console.log('TransformControls helper added to scene:', this.transformControlsHelper);
    
    this.setupEventListeners();

    if (config.enableGrid !== false) {
      this.setupGridHelper();
    }
    this.setupDefaultLighting();
  }

  public init(): void {
    if (this.isInitialized) {
      console.warn('SceneManager has already been initialized');
      return;
    }
    
    this.container.appendChild(this.renderer.domElement);
    // TransformControls 不需要添加到场景中，它通过 DOM 和事件工作
    // this.scene.add(this.transformControls);
    // 确保 TransformControls 的 DOM 元素能正确访问
    console.log('TransformControls initialized, domElement:', this.transformControls.domElement);
    // 不再设置点击事件，由 SceneView.vue 统一处理
    // this.setupClickHandler();
    this.startRenderLoop();
    this.isInitialized = true;
  }

  public destroy(): void {
    if (!this.isInitialized) return;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.clearScene();
    this.orbitControls.dispose();
    this.transformControls.dispose();
    this.renderer.dispose();
    
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }

    window.removeEventListener('resize', this.handleResize);
    this.isInitialized = false;
  }

  public addObject(object: THREE.Object3D): void {
    if (!this.isInitialized) {
      throw new Error('SceneManager must be initialized before adding objects');
    }
    this.objects.push(object);
    this.scene.add(object);
  }

  public removeObject(object: THREE.Object3D): void {
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
    
    // 如果是灯光，也从lights数组中移除
    const lightIndex = this.lights.indexOf(object as THREE.Light);
    if (lightIndex > -1) {
      this.lights.splice(lightIndex, 1);
    }
    
    if (this.selectedObject === object) {
      this.deselectObject();
    }
    this.scene.remove(object);
    this.disposeObjectResources(object);
  }

  public clearScene(): void {
    this.deselectObject();
    this.objects.forEach(obj => this.disposeObjectResources(obj));
    this.scene.remove(...this.objects);
    this.objects = [];
  }

  public createCube(options: CreateCubeOptions = {}): THREE.Mesh {
    const {
      size = 1,
      color = '#1890ff',
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1]
    } = options;

    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.4
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.name = 'Cube';
    cube.castShadow = true;
    cube.receiveShadow = true;
    
    cube.position.set(position[0], position[1], position[2]);
    cube.rotation.set(rotation[0], rotation[1], rotation[2]);
    cube.scale.set(scale[0], scale[1], scale[2]);

    return cube;
  }

  public createGeometry(options: CreateGeometryOptions): THREE.Object3D {
    const {
      type,
      position = [0, 0.5, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1],
      properties = {}
    } = options;

    const instance = geometryFactory.create(type, {
      position,
      rotation,
      scale,
      properties
    });

    const object = instance.object;
    
    // 设置阴影
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return object;
  }

  public createPreviewGeometry(type: string, position: [number, number, number]): THREE.Object3D {
    const instance = geometryFactory.createPreview(type, {
      position,
      scale: [1, 1, 1]
    });

    return instance.object;
  }

  public getAllGeometryTypes() {
    return geometryFactory.getAllSchemas();
  }

  public getGeometrySchema(type: string) {
    return geometryFactory.getSchema(type);
  }

  public selectObject(object: THREE.Object3D): void {
    if (this.selectedObject === object) return;
    
    console.log('Selecting object:', object.name, object);
    
    this.deselectObject();
    this.selectedObject = object;
    this.transformControls.attach(object);
    
    // 确保 helper 可见
    this.transformControlsHelper.visible = true;
    
    console.log('TransformControls attached to:', object.name);
  }

  public deselectObject(): void {
    if (this.selectedObject) {
      this.transformControls.detach();
      this.selectedObject = null;
      // 隐藏 helper
      this.transformControlsHelper.visible = false;
    }
  }

  public getSelectedObject(): THREE.Object3D | null {
    return this.selectedObject;
  }

  public setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.transformControls.setMode(mode);
  }

  public getObjectTransform(object: THREE.Object3D): ObjectTransform {
    return {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: [object.scale.x, object.scale.y, object.scale.z]
    };
  }

  public setObjectTransform(object: THREE.Object3D, transform: ObjectTransform): void {
    object.position.set(transform.position[0], transform.position[1], transform.position[2]);
    object.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
    object.scale.set(transform.scale[0], transform.scale[1], transform.scale[2]);
  }

  public addLight(options: AddLightOptions): THREE.Light | null {
    try {
      const instance = lightFactory.create(options.type, {
        position: options.position,
        properties: options.properties
      });
      
      this.scene.add(instance.light);
      this.lights.push(instance.light);
      // 同时添加到objects数组，以便点击选中时也能检测到灯光
      this.objects.push(instance.light);
      
      if (instance.helper) {
        this.scene.add(instance.helper);
      }
      
      return instance.light;
    } catch (error) {
      console.error('Failed to add light:', error);
      return null;
    }
  }

  public applyLightPreset(presetName: string): void {
    try {
      // 清除现有灯光
      this.clearLights();
      
      // 应用预设
      const instances = lightFactory.applyPreset(presetName);
      
      instances.forEach((instance) => {
        this.scene.add(instance.light);
        this.lights.push(instance.light);
        
        if (instance.helper) {
          this.scene.add(instance.helper);
        }
      });
    } catch (error) {
      console.error('Failed to apply light preset:', error);
    }
  }

  public clearLights(): void {
    this.lights.forEach((light) => {
      // 从objects数组中移除
      const index = this.objects.indexOf(light);
      if (index > -1) {
        this.objects.splice(index, 1);
      }
      this.scene.remove(light);
      light.dispose?.();
    });
    this.lights = [];
  }

  public getLights(): THREE.Light[] {
    return [...this.lights];
  }

  public getObjects(): THREE.Object3D[] {
    return [...this.objects];
  }

  public getObjectByName(name: string): THREE.Object3D | undefined {
    return this.objects.find(obj => obj.name === name);
  }

  public getObjectById(id: number): THREE.Object3D | undefined {
    return this.objects.find(obj => (obj as any).userData.id === id);
  }

  private setupDefaultLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x8888cc, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  private setupGridHelper(): void {
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);
  }

  private setupEventListeners(): void {
    // 使用 dragging-changed 事件，这是更可靠的方式
    (this.transformControls as any).addEventListener('dragging-changed', (event: any) => {
      this.orbitControls.enabled = !event.value;
    });

    this.transformControls.addEventListener('objectChange', () => {
      this.onObjectChange();
    });

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  private setupClickHandler(): void {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.objects, true);

      if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target.parent && !this.objects.includes(target.parent)) {
          target = target.parent;
        }
        this.selectObject(target);
      } else {
        this.deselectObject();
      }
    };

    this.renderer.domElement.addEventListener('click', onClick);
  }

  private handleResize = (): void => {
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  private startRenderLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.orbitControls.update();
      this.transformControls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private onObjectChange(): void {
    if (this.selectedObject) {
      console.log('Object transformed:', {
        name: this.selectedObject.name,
        position: this.getObjectTransform(this.selectedObject)
      });
    }
  }

  private disposeObjectResources(object: THREE.Object3D): void {
    object.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: THREE.Material) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      } else if (child instanceof THREE.Light) {
        child.dispose?.();
      }
    });
  }
}

export default SceneManager;
