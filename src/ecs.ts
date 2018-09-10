// Adapted from https://github.com/kutuluk/js13k-ecs.
// Converted to TypeScript, and made non-global.

export type TypedEntity<T> = Entity;
export type System = { update: (dt: number) => void };
export type EntityId = string;

type ComponentSymbol = string;
const ecsComponentSign: ComponentSymbol = Symbol("_sign") as any;
const ecsComponentMask: ComponentSymbol = Symbol("_mask") as any;

export type ComponentConstructor<T = {}> = {
  [key: string]: any;
};
export type ComponentInstance<T = {}, P = ComponentConstructor<T>> = T & {
  constructor: P;
  destructor?: () => void;
};

const getComponentProperty = (
  ecsComponentProperty: ComponentSymbol,
  Component: ComponentConstructor
): string | number => {
  const property = Component[ecsComponentProperty];
  if (!property) {
    throw new Error("The component is not registered");
  }
  return property as string | number;
};

const getComponentSign = (cmp: ComponentConstructor): string =>
  getComponentProperty(ecsComponentSign, cmp).toString();
const getComponentMask = (cmp: ComponentConstructor): number =>
  getComponentProperty(ecsComponentMask, cmp) as number;

let sequence = 1;

export class Entity {
  public components: { [key: string]: ComponentInstance } = {};
  public mask = 0;
  constructor(
    private ecs: EntityComponentSystem,
    public id: string = (sequence++).toString(36)
  ) {}

  private updateSelectors() {
    if (this.id) {
      this.ecs.selectors.forEach(selector => selector.match(this));
    }
  }

  add(...components: ComponentInstance[]) {
    components.forEach(component => {
      this.components[
        getComponentSign(<ComponentConstructor<typeof component>>(
          component.constructor
        ))
      ] = component;
      this.mask |= getComponentMask(<ComponentConstructor<typeof component>>(
        component.constructor
      ));
    });

    this.updateSelectors();
  }

  remove(...Components: ComponentConstructor[]) {
    Components.forEach(Component => {
      const sign = getComponentSign(Component);
      const component = this.components[sign];

      if (component) {
        component.destructor && component.destructor();
        delete this.components[sign];
        this.mask &= ~getComponentMask(Component);
      }
    });

    this.updateSelectors();
  }

  has(Component: ComponentConstructor) {
    return getComponentSign(Component) in this.components;
  }

  get<T>(
    Component: ComponentConstructor<T>
  ): ComponentInstance<T, ComponentConstructor<T>> {
    return this.components[getComponentSign(Component)] as T;
  }

  eject() {
    Object.keys(this.components).forEach(key => {
      const component = this.components[key];
      if (component.destructor) {
        component.destructor();
      }
    });

    this.ecs.selectors.forEach(selector => selector.remove(this));
    delete this.ecs.entities[this.id];
    this.id = "0";
  }
}

class Node {
  public prev: Node | null = null;
  constructor(public entity: Entity, public next: Node | null) {}
}

export class Selector<T = {}> {
  public map: { [key: string]: Node | undefined } = {};
  public list: Node | null = null;
  public length = 0;

  constructor(public mask: number, private ecs: EntityComponentSystem) {
    if (!mask) {
      throw new Error("Empty selector");
    }

    Object.keys(this.ecs.entities).forEach(key => {
      const entity = this.ecs.entities[key];
      this.match(entity);
    });
  }

  iterate(fn: (e: TypedEntity<T>) => void) {
    let node = this.list;
    while (node) {
      fn(node.entity);
      node = node.next;
    }
  }

  match(entity: Entity) {
    if ((this.mask & entity.mask) === this.mask) {
      this.add(entity);
    } else {
      this.remove(entity);
    }
  }

  add(entity: Entity) {
    if (this.map[entity.id]) {
      return;
    }

    const node = new Node(entity, this.list);

    this.list && (this.list.prev = node);
    this.list = node;

    this.map[entity.id] = node;
    this.length++;
  }

  remove(entity: Entity) {
    const node = this.map[entity.id];

    if (node) {
      if (node.prev) {
        node.prev.next = node.next;
      } else {
        this.list = node.next;
      }

      node.next && (node.next.prev = node.prev);

      delete this.map[entity.id];
      this.length--;
    }
  }
}

const perf = performance || Date;
const now = perf.now.bind(perf);

export class EntityComponentSystem {
  private bit = 0;
  constructor(
    public selectors: Selector[] = [],
    public systems: System[] = [],
    public entities: { [key: string]: Entity } = {}
  ) {}

  register(...Components: ComponentConstructor[]) {
    Components.forEach(Component => {
      if (this.bit > 31) {
        throw new Error("Components limit reached");
      }

      if (Component[ecsComponentSign]) {
        // throw new Error('The component is already registered');
        return;
      }

      Component[ecsComponentSign] = this.bit.toString(36);
      Component[ecsComponentMask] = 1 << this.bit;
      this.bit++;
    });
  }

  process(...s: System[]) {
    s.forEach(system => this.systems.push(system));
  }

  create(id?: string) {
    const entity = new Entity(this, id);

    if (this.entities[entity.id]) {
      throw new Error("The ID already exist");
    }

    this.entities[entity.id] = entity;
    return entity;
  }

  get(id: string) {
    return this.entities[id];
  }

  select<T>(...Components: ComponentConstructor<T>[]): Selector<T> {
    let mask = 0;

    Components.forEach(Component => {
      mask |= getComponentMask(Component);
    });

    const exist = this.selectors.find(selector => selector.mask === mask);
    if (exist) return exist;

    const selector = new Selector<T>(mask, this);
    this.selectors.push(selector);
    return selector;
  }

  update(delta: number) {
    const statistics: { [key: string]: number } = {};

    this.systems.forEach(system => {
      const begin = now();
      system.update(delta);
      statistics[system.constructor.name] = now() - begin;
    });

    return statistics;
  }
}
