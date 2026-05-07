declare global {
  const THREE: typeof import('three');
}

declare module 'three' {
  export class Object3D {
    id: number;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    visible: boolean;
    name: string;
    userData: Record<string, any>;
    parent: Object3D | null;
    children: Object3D[];
    traverse(callback: (child: Object3D) => void): void;
    add(...objects: Object3D[]): void;
    remove(...objects: Object3D[]): void;
    getObjectById(id: number): Object3D | undefined;
  }

  export class Mesh extends Object3D {
    geometry: BufferGeometry | null;
    material: Material | Material[];
    castShadow: boolean;
    receiveShadow: boolean;
    constructor(geometry: BufferGeometry, material: Material);
  }

  export class BufferGeometry {
    dispose(): void;
  }

  export class Material {
    dispose(): void;
    color?: Color;
    transparent?: boolean;
    opacity?: number;
    side?: number;
    shininess?: number;
    wireframe?: boolean;
  }

  export class MeshPhongMaterial extends Material {
    constructor(params?: {
      color?: Color | string;
      shininess?: number;
      side?: number;
      transparent?: boolean;
      opacity?: number;
      wireframe?: boolean;
    });
  }

  export class MeshStandardMaterial extends Material {
    constructor(params?: {
      color?: Color | string;
      metalness?: number;
      roughness?: number;
    });
  }

  export class Color {
    constructor(color: string | number);
  }

  export class BoxGeometry extends BufferGeometry {
    constructor(width: number, height: number, depth: number);
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(radius: number, widthSegments?: number, heightSegments?: number);
  }

  export class CylinderGeometry extends BufferGeometry {
    constructor(radiusTop: number, radiusBottom: number, height: number, radialSegments?: number);
  }

  export class ConeGeometry extends BufferGeometry {
    constructor(radius: number, height: number, radialSegments?: number);
  }

  export class TorusGeometry extends BufferGeometry {
    constructor(radius: number, tube: number, tubularSegments?: number, radialSegments?: number);
  }

  export class PlaneGeometry extends BufferGeometry {
    constructor(width: number, height: number, widthSegments?: number, heightSegments?: number);
  }

  export class CapsuleGeometry extends BufferGeometry {
    constructor(radius: number, length: number, capSegments?: number, radialSegments?: number);
  }

  export class CircleGeometry extends BufferGeometry {
    constructor(radius: number, segments?: number);
  }

  export class DodecahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }

  export class IcosahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }

  export class OctahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }

  export class RingGeometry extends BufferGeometry {
    constructor(innerRadius: number, outerRadius: number, radialSegments?: number);
  }

  export class TetrahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }

  export class TorusKnotGeometry extends BufferGeometry {
    constructor(radius: number, tube: number, tubularSegments?: number, radialSegments?: number, p?: number, q?: number);
  }

  export class Light extends Object3D {
    color?: Color;
    intensity?: number;
    castShadow?: boolean;
    dispose?(): void;
  }

  export class AmbientLight extends Light {
    constructor(color?: Color | string, intensity?: number);
  }

  export class DirectionalLight extends Light {
    constructor(color?: Color | string, intensity?: number);
  }

  export class PointLight extends Light {
    constructor(color?: Color | string, intensity?: number, distance?: number);
  }

  export class SpotLight extends Light {
    constructor(color?: Color | string, intensity?: number, distance?: number);
  }

  export class PerspectiveCamera extends Object3D {
    constructor(fov: number, aspect: number, near: number, far: number);
    aspect: number;
    updateProjectionMatrix(): void;
    lookAt(x: number, y: number, z: number): void;
    lookAt(v: Vector3): void;
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    constructor(params?: { antialias?: boolean; powerPreference?: string });
    setSize(width: number, height: number): void;
    setPixelRatio(ratio: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
    shadowMap: { enabled?: boolean; type?: number };
  }

  export class Scene extends Object3D {
    background?: Color | null;
  }

  export class Raycaster {
    setFromCamera(coords: Vector2, camera: PerspectiveCamera): void;
    ray: { intersectPlane(plane: Plane, intersectPoint: Vector3): boolean };
    intersectObjects(objects: Object3D[], recursive?: boolean): { object: Object3D }[];
  }

  export class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): void;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): void;
  }

  export class Plane {
    constructor(normal: Vector3, constant: number);
  }

  export class GridHelper extends Object3D {
    constructor(size: number, divisions: number, color1?: number, color2?: number);
  }

  export const DoubleSide: number;
  export const PCFSoftShadowMap: number;
}

declare module 'three/addons/controls/OrbitControls.js' {
  import type { PerspectiveCamera } from 'three';
  
  export class OrbitControls {
    constructor(camera: PerspectiveCamera, domElement?: HTMLElement);
    enabled: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    enablePan: boolean;
    enableZoom: boolean;
    update(): void;
    dispose(): void;
    addEventListener(event: string, callback: () => void): void;
    removeEventListener(event: string, callback: () => void): void;
  }
}

declare module 'three/addons/controls/TransformControls.js' {
  import type { PerspectiveCamera } from 'three';
  
  export class TransformControls {
    constructor(camera: PerspectiveCamera, domElement?: HTMLElement);
    attach(object: THREE.Object3D): void;
    detach(): void;
    setMode(mode: 'translate' | 'rotate' | 'scale'): void;
    update(): void;
    dispose(): void;
    addEventListener(event: string, callback: () => void): void;
    removeEventListener(event: string, callback: () => void): void;
  }
}
