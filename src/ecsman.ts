import { EntityComponentSystem, Entity, EntityId } from "./ecs";
export { TypedEntity } from './ecs';

export class ECSMan extends EntityComponentSystem {
  private emphemerals: Entity[] = [];

  create<T>(id?: EntityId) {
    const e = super.create(id);
    this.emphemerals.push(e);
    return e;
  }

  // AKA Leak a global entity :D
  createPersistent<T>() {
    return this.create();
  }

  ejectEphemerals () {
    this.emphemerals.forEach(e => e.eject());
  }
}
