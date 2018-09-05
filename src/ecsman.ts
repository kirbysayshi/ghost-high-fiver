import ecs, { ECS, ComponentConstructor, System, EntityId, Entity } from "js13k-ecs";

export class ECSMan {
  private entities: Entity<{}>[] = [];
  constructor(private ecs: ECS) {}

  register(...components: ComponentConstructor[]) {
    return this.ecs.register(...components);
  }

  process(...systems: System[]) {
    return this.ecs.process(...systems);
  }

  create<T>(id?: EntityId) {
    const e = this.ecs.create<T>(id);
    this.entities.push(e);
    return e;
  }

  // AKA Leak a global entity :D
  createPersistent<T>() {
    return this.ecs.create<T>();
  }

  get(id: EntityId) {
    return this.ecs.get(id);
  }

  select<T>(...components: ComponentConstructor[]) {
    return this.ecs.select<T>(...components);
  }

  update(delta: number) {
    return this.ecs.update(delta);
  }

  ejectAll () {
    this.entities.forEach(e => e.eject());
  }
}
