export type TypedEntity<T> = Entity;
export type System = { update: (dt: number) => void };
export type EntityId = string;

type ComponentSymbol = string;
const ecsComponentSign: ComponentSymbol = Symbol('_sign') as any;
const ecsComponentMask: ComponentSymbol = Symbol('_mask') as any;


export type ComponentConstructor<T = {}> = {
  [key: string]: any;
};
export type ComponentInstance<T = {}, P = ComponentConstructor<T>> = T & { constructor: P, destructor?: () => void; };

// type Constructor<T = {}> = new (...args: any[]) => T;
// export interface ComponentConstructor extends Constructor<Component> {
//   [key: string]: string;
// }
// export type Component = {};

const selectors: Selector[] = [];
const systems: System[] = [];
const entities: { [key: string]: Entity } = {};

const getComponentProperty = (ecsComponentProperty: ComponentSymbol, Component: ComponentConstructor): string | number => {
  const property = Component[ecsComponentProperty];
  if (!property) {
    throw new Error('The component is not registered');
  }
  return property as (string | number);
};

const getComponentSign = (cmp: ComponentConstructor): string => getComponentProperty(ecsComponentSign, cmp).toString();
const getComponentMask = (cmp: ComponentConstructor): number => getComponentProperty(ecsComponentMask, cmp) as number;

// const getComponentSign = getComponentProperty.bind(null, ecsComponentSign);
// const getComponentMask = getComponentProperty.bind(null, ecsComponentMask);

const matchEntity = (entity: Entity) => {
  entity.id && selectors.forEach(selector => selector.match(entity));
};

const ejectEntity = (entity: Entity) => {
  Object.keys(entity.components).forEach(key => {
    const component = entity.components[key];
    if (component.destructor) {
      component.destructor();
    }
  })
  // Object.values(entity.components).forEach(
  //   component => component.destructor && component.destructor(),
  // );

  selectors.forEach(selector => selector.remove(entity));
  delete entities[entity.id];
  entity.id = '0';
  // entity.mask = 0;
  // entity.components = {};
};

let sequence = 1;

export class Entity {
  public components: { [key: string]: ComponentInstance } = {};
  public mask = 0;
  constructor(public id: string = (sequence++).toString(36)) {
    // this.id = id || (sequence++).toString(36);
  }

  add(...components: ComponentInstance[]) {
    components.forEach((component) => {
      this.components[getComponentSign(<ComponentConstructor<typeof component>> component.constructor)] = component;
      this.mask |= getComponentMask(<ComponentConstructor<typeof component>> component.constructor);
    });

    matchEntity(this);
  }

  remove(...Components: ComponentConstructor[]) {
    Components.forEach((Component) => {
      const sign = getComponentSign(Component);
      const component = this.components[sign];

      if (component) {
        component.destructor && component.destructor();
        delete this.components[sign];
        this.mask &= ~getComponentMask(Component);
      }
    });

    matchEntity(this);
  }

  has(Component: ComponentConstructor) {
    return getComponentSign(Component) in this.components;
  }

  get(Component: ComponentConstructor) {
    return this.components[getComponentSign(Component)];
  }

  /*
  set(Component, ...args) {
    const component = this.components[getComponentSign(Component)];

    if (component) {
      if (!component.setter) {
        throw new Error('Component does not have setter');
      }
      component.setter(...args);
    } else {
      this.add(new Component(...args));
    }
  }
  */

  eject() {
    ejectEntity(this);
  }
}

class Node {
  public prev: Node | null = null;
  constructor(public entity: Entity, public next: Node | null) {
    // this.prev = null;
    // this.next = next;
  }
}

class Selector {
  public map: { [key: string]: Node | undefined } = {};
  public list: Node | null = null;
  public length = 0;

  constructor(public mask: number) {
    if (!mask) {
      throw new Error('Empty selector');
    }

    // this.mask = mask;
    // this.map = {};
    // this.list = null;
    // this.length = 0;

    Object.keys(entities).forEach(key => {
      const entity = entities[key];
      this.match(entity);
    })
    // Object.values(entities).forEach(entity => this.match(entity));
  }

  iterate(fn: (e: Entity) => void) {
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
      // this.map[entity.id].entity = entity;
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

let bit = 0;

const perf = performance || Date;
const now = perf.now.bind(perf);

export const ECSGlobal = {
  register(...Components: ComponentConstructor[]) {
    Components.forEach((Component) => {
      if (bit > 31) {
        throw new Error('Components limit reached');
      }

      if (Component[ecsComponentSign]) {
        // throw new Error('The component is already registered');
        return;
      }

      Component[ecsComponentSign] = bit.toString(36);
      Component[ecsComponentMask] = 1 << bit;
      bit++;
    });
  },

  process(...s: System[]) {
    s.forEach(system => systems.push(system));
  },

  create(id?: string) {
    const entity = new Entity(id);

    if (entities[entity.id]) {
      throw new Error('The ID already exist');
    }

    entities[entity.id] = entity;
    return entity;
  },

  get(id: string) {
    return entities[id];
  },

  select(...Components: ComponentConstructor[]) {
    let mask = 0;

    Components.forEach((Component) => {
      mask |= getComponentMask(Component);
    });

    const exist = selectors.find(selector => selector.mask === mask);
    if (exist) return exist;

    const selector = new Selector(mask);
    selectors.push(selector);
    return selector;
  },

  update(delta: number) {
    const statistics: { [key: string]: number } = {};

    systems.forEach((system) => {
      const begin = now();
      system.update(delta);
      statistics[system.constructor.name] = now() - begin;
    });

    return statistics;
  },
};
