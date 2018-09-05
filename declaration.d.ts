declare module "*.png";
declare module "*.bmp";

// The official is missing the prefixed versions.
interface CanvasRenderingContext2D {
  imageSmoothingEnabled: boolean;
  webkitImageSmoothingEnabled: boolean;
  msImageSmoothingEnabled: boolean;
  mozImageSmoothingEnabled: boolean;
}


declare module 'js13k-ecs' {

  type Constructor<T = {}> = new (...args: any[]) => T;

  export interface ComponentConstructor extends Constructor {}
  export type Component<T> = T;
  export type System = { update: (dt: number) => void };
  export type Entity<T> = {
    // id: EntityId;
    components: { [key: string]: Component<T> };
    // TODO: this is actually instance of Component, not Component constructor
    add (...components: T[]): void;
    remove (...components: ComponentConstructor[]): void;
    has (component: ComponentConstructor): boolean;
    get<T> (component: ComponentConstructor): T | undefined; // TODO: returns an instance
    eject (): void;
  };

  export type EntityId = string;

  export type Selector<T> = {
    iterate: (fn: (e: Entity<T>) => void) => void;
    match: (e: Entity<T>) => void;
    add: (e: Entity<T>) => void;
    remove: (e: Entity<T>) => void;
  }

  export type DurationMs = number;

  export type Statistics = {
    [key: string]: DurationMs;
  }

  export type ECS = {
    register(...components: ComponentConstructor[]): void;
    process(...systems: System[]): void;
    create<T>(id?: EntityId): Entity<{}>;
    get(id: EntityId): Entity<{}> | undefined;
    select<T>(...components: ComponentConstructor[]): Selector<T>;
    update(delta: number): Statistics;
  };

  const ecs: ECS;

  export default ecs;
}

declare module 'pocket-physics/src/v2' {

  export type V2 = {
    x: number;
    y: number;
  }

  export function v2(x?: number, y?: number): V2;
  export function copy(out: V2, a: V2): V2;
  export function set(out: V2, x: number, y: number): V2;
  export function add(out: V2, a: V2, b: V2): V2;
  export function sub(out: V2, a: V2, b: V2): V2;
  export function dot(a: V2, b: V2): number;
  export function scale(out: V2, a: V2, factor: number): V2;
  export function distance(a: V2, b: V2): number;
  export function distance2(a: V2, b: V2): number;
  export function magnitude(a: V2): number;
  export function normalize(out: V2, a: V2): V2;
  export function normal(out: V2, a: V2, b: V2): V2;
  export function perpDot(a: V2, b: V2): number;
}