/**
 * 灯光工厂类 - 采用工厂模式实现灯光的统一创建和管理
 * 
 * 设计理念：
 * 1. Schema驱动：通过LightSchema定义灯光属性结构
 * 2. 预设系统：支持多种预设光照模板一键应用
 * 3. 统一接口：提供一致的创建API，简化调用
 * 4. 辅助对象：自动创建灯光辅助器便于调试
 * 
 * 支持的灯光类型：
 * - AmbientLight（环境光）
 * - DirectionalLight（方向光）
 * - PointLight（点光源）
 * - SpotLight（聚光灯）
 * - HemisphereLight（半球光）
 * - RectAreaLight（矩形光）
 */
import * as THREE from 'three';
import type { LightSchema, LightInstance, LightPropertySchema, LightPreset } from '../schemas/LightSchema';
import { lightSchemas, lightPresets } from '../schemas/LightSchema';

export type LightProperties = Record<string, number | string | boolean>;

export interface CreateLightOptions {
  position?: [number, number, number];
  target?: [number, number, number];
  properties?: LightProperties;
}

export class LightFactory {
  /** 灯光属性定义映射 */
  private schemas: Map<string, LightSchema> = new Map();
  
  /** 灯光创建函数映射 */
  private creators: Map<string, (props: LightProperties) => THREE.Light> = new Map();

  /**
   * 构造函数 - 初始化时注册默认灯光类型
   */
  constructor() {
    this.registerDefaultLights();
  }

  /**
   * 注册默认灯光类型
   */
  private registerDefaultLights(): void {
    // 注册所有默认Schema
    lightSchemas.forEach((schema) => {
      this.registerSchema(schema);
    });

    // 1. 环境光创建器
    this.registerCreator('ambient', (props) => {
      const color = props.color as string || '#ffffff';
      const intensity = (props.intensity as number) || 0.5;
      return new THREE.AmbientLight(color, intensity);
    });

    // 2. 方向光创建器
    this.registerCreator('directional', (props) => {
      const color = props.color as string || '#ffffff';
      const intensity = (props.intensity as number) || 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.castShadow = props.castShadow as boolean || true;
      return light;
    });

    // 3. 点光源创建器
    this.registerCreator('point', (props) => {
      const color = props.color as string || '#ffffff';
      const intensity = (props.intensity as number) || 1;
      const distance = (props.distance as number) || 0;
      const decay = (props.decay as number) || 2;
      const light = new THREE.PointLight(color, intensity, distance, decay);
      light.castShadow = props.castShadow as boolean || false;
      return light;
    });

    // 4. 聚光灯创建器
    this.registerCreator('spot', (props) => {
      const color = props.color as string || '#ffffff';
      const intensity = (props.intensity as number) || 1;
      const distance = (props.distance as number) || 0;
      const angle = (props.angle as number) || Math.PI / 6;
      const penumbra = (props.penumbra as number) || 0;
      const decay = (props.decay as number) || 2;
      const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
      light.castShadow = props.castShadow as boolean || true;
      return light;
    });

    // 5. 半球光创建器
    this.registerCreator('hemisphere', (props) => {
      const skyColor = props.skyColor as string || '#87ceeb';
      const groundColor = props.groundColor as string || '#696969';
      const intensity = (props.intensity as number) || 1;
      return new THREE.HemisphereLight(skyColor, groundColor, intensity);
    });

    // 6. 矩形光创建器
    this.registerCreator('rectArea', (props) => {
      const color = props.color as string || '#ffffff';
      const intensity = (props.intensity as number) || 1;
      const width = (props.width as number) || 1;
      const height = (props.height as number) || 1;
      return new THREE.RectAreaLight(color, intensity, width, height);
    });
  }

  /**
   * 注册灯光属性定义
   * @param schema 灯光属性定义
   */
  public registerSchema(schema: LightSchema): void {
    this.schemas.set(schema.type, schema);
  }

  /**
   * 注册灯光创建函数
   * @param type 灯光类型标识
   * @param creator 创建函数
   */
  public registerCreator(type: string, creator: (props: LightProperties) => THREE.Light): void {
    this.creators.set(type, creator);
  }

  /**
   * 获取指定类型的属性定义
   * @param type 灯光类型标识
   * @returns 灯光属性定义
   */
  public getSchema(type: string): LightSchema | undefined {
    return this.schemas.get(type);
  }

  /**
   * 获取所有已注册的灯光属性定义
   * @returns 灯光属性定义数组
   */
  public getAllSchemas(): LightSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * 获取所有预设模板
   * @returns 预设模板数组
   */
  public getAllPresets(): LightPreset[] {
    return lightPresets;
  }

  /**
   * 获取指定预设模板
   * @param name 预设名称
   * @returns 预设模板
   */
  public getPreset(name: string): LightPreset | undefined {
    return lightPresets.find(preset => preset.name === name);
  }

  /**
   * 创建灯光实例
   * @param type 灯光类型标识
   * @param options 创建选项
   * @returns 灯光实例
   * @throws 如果类型未注册则抛出错误
   */
  public create(type: string, options: CreateLightOptions = {}): LightInstance {
    // 获取属性定义
    const schema = this.getSchema(type);
    if (!schema) {
      throw new Error(`Light type "${type}" not registered`);
    }

    // 获取创建函数
    const creator = this.creators.get(type);
    if (!creator) {
      throw new Error(`Creator for light type "${type}" not registered`);
    }

    // 合并默认属性和用户属性
    const defaultProps = this.getDefaultProperties(schema);
    const props = { ...defaultProps, ...options.properties };

    // 创建灯光
    const light = creator(props);

    // 设置位置
    if (options.position) {
      light.position.set(...options.position);
    } else {
      light.position.set(...schema.previewConfig.position);
    }

    // 设置目标（方向光、聚光灯、矩形光需要）
    if (options.target && 'target' in light) {
      (light as any).target.position.set(...options.target);
    } else if (schema.previewConfig.target && 'target' in light) {
      (light as any).target.position.set(...schema.previewConfig.target);
    }

    // 存储元数据
    light.userData = {
      type,
      properties: props
    };

    // 创建辅助对象
    let helper: THREE.Object3D | undefined;
    if (type === 'point') {
      helper = new THREE.PointLightHelper(light as THREE.PointLight, 0.2);
    } else if (type === 'spot') {
      helper = new THREE.SpotLightHelper(light as THREE.SpotLight);
    } else if (type === 'directional') {
      helper = new THREE.DirectionalLightHelper(light as THREE.DirectionalLight, 1);
    }

    if (helper) {
      helper.userData = { isHelper: true, lightId: light.id };
    }

    return {
      type,
      light,
      helper
    };
  }

  /**
   * 创建预览灯光（带辅助对象）
   * @param type 灯光类型标识
   * @param options 创建选项
   * @returns 灯光实例
   */
  public createPreview(type: string, options: CreateLightOptions = {}): LightInstance {
    const result = this.create(type, options);
    
    // 预览模式下启用辅助对象
    if (!result.helper) {
      const light = result.light;
      if (type === 'point') {
        result.helper = new THREE.PointLightHelper(light as THREE.PointLight, 0.2);
      } else if (type === 'spot') {
        result.helper = new THREE.SpotLightHelper(light as THREE.SpotLight);
      } else if (type === 'directional') {
        result.helper = new THREE.DirectionalLightHelper(light as THREE.DirectionalLight, 1);
      }
    }

    result.light.name = 'PreviewLight';
    
    return result;
  }

  /**
   * 获取灯光的默认属性
   * @param schema 灯光属性定义
   * @returns 默认属性对象
   */
  public getDefaultProperties(schema: LightSchema): LightProperties {
    const props: LightProperties = {};
    schema.properties.forEach((prop: LightPropertySchema) => {
      props[prop.name] = prop.default;
    });
    return props;
  }

  /**
   * 释放灯光资源
   * @param instance 灯光实例
   */
  public dispose(instance: LightInstance): void {
    instance.light.dispose?.();
    if (instance.helper && instance.helper.parent) {
      instance.helper.parent.remove(instance.helper);
    }
  }

  /**
   * 应用预设模板
   * @param presetName 预设名称
   * @returns 灯光实例数组
   */
  public applyPreset(presetName: string): LightInstance[] {
    const preset = this.getPreset(presetName);
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    const instances: LightInstance[] = [];
    
    preset.lights.forEach((config) => {
      const instance = this.create(config.type, {
        position: config.position,
        properties: config.properties
      });
      instances.push(instance);
    });

    return instances;
  }
}

/**
 * 全局灯光工厂实例
 * 提供单例访问方式
 */
export const lightFactory = new LightFactory();
