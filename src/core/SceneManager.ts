import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

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

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot';
  color?: string;
  intensity?: number;
  position?: [number, number, number];
}

export interface CreateCubeOptions {
  size?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly orbitControls: OrbitControls;
  public readonly transformControls: TransformControls;

  private container: HTMLElement;
  private animationFrameId: number | null = null;
  private objects: THREE.Object3D[] = [];
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
    this.scene.add(this.transformControls);

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
    this.setupClickHandler();
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

  public selectObject(object: THREE.Object3D): void {
    if (this.selectedObject === object) return;
    
    this.deselectObject();
    this.selectedObject = object;
    this.transformControls.attach(object);
  }

  public deselectObject(): void {
    if (this.selectedObject) {
      this.transformControls.detach();
      this.selectedObject = null;
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

  public addLight(config: LightConfig): THREE.Light | null {
    let light: THREE.Light | null = null;

    switch (config.type) {
      case 'ambient':
        light = new THREE.AmbientLight(config.color ?? '#ffffff', config.intensity ?? 0.5);
        break;
      case 'directional':
        light = new THREE.DirectionalLight(config.color ?? '#ffffff', config.intensity ?? 1);
        if (config.position) {
          light.position.set(config.position[0], config.position[1], config.position[2]);
        }
        light.castShadow = true;
        break;
      case 'point':
        light = new THREE.PointLight(config.color ?? '#ffffff', config.intensity ?? 1);
        if (config.position) {
          light.position.set(config.position[0], config.position[1], config.position[2]);
        }
        break;
      case 'spot':
        light = new THREE.SpotLight(config.color ?? '#ffffff', config.intensity ?? 1);
        if (config.position) {
          light.position.set(config.position[0], config.position[1], config.position[2]);
        }
        break;
    }

    if (light) {
      this.scene.add(light);
    }

    return light;
  }

  public getObjects(): THREE.Object3D[] {
    return [...this.objects];
  }

  public getObjectByName(name: string): THREE.Object3D | undefined {
    return this.objects.find(obj => obj.name === name);
  }

  public getObjectById(id: string): THREE.Object3D | undefined {
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
    this.transformControls.addEventListener('mouseDown', () => {
      this.orbitControls.enabled = false;
    });

    this.transformControls.addEventListener('mouseUp', () => {
      this.orbitControls.enabled = true;
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
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
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
