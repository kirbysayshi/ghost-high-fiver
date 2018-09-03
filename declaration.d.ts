declare module "*.png";

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