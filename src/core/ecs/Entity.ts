export type EntityType =
  | 'Character'
  | 'Environment'
  | 'Prop'
  | 'Camera'
  | 'Light'
  | 'Audio'
  | 'Dialogue'
  | 'Vehicle'
  | 'Effect';

export interface BaseComponent {
  type: string;
}

export interface TransformComponent extends BaseComponent {
  type: 'Transform';
  position: { x: number; y: number; z: number };
  rotation: { pitch: number; yaw: number; roll: number };
  scale: { x: number; y: number; z: number };
}

export interface AppearanceComponent extends BaseComponent {
  type: 'Appearance';
  faceDescription?: string;
  hairStyle?: string;
  wardrobe?: string;
  accessories?: string[];
  colorPalette?: string[];
}

export interface CameraComponent extends BaseComponent {
  type: 'Camera';
  motionType: string;
  amplitude: string;
  speed: string;
  targetSubjectId?: string;
  lensFocalLength?: string;
}

export interface DialogueComponent extends BaseComponent {
  type: 'Dialogue';
  speakerId: string;
  language: string;
  text: string;
  isOffScreenVoiceover: boolean;
}

export type Component = TransformComponent | AppearanceComponent | CameraComponent | DialogueComponent;

export class Entity {
  public id: string;
  public name: string;
  public type: EntityType;
  public components: Map<string, Component>;

  constructor(id: string, name: string, type: EntityType) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.components = new Map();
  }

  public addComponent(component: Component): this {
    this.components.set(component.type, component);
    return this;
  }

  public getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }
}
