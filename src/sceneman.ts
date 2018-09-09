import { ECSMan } from "./ecsman";

export class SceneManager {
  private scenes: Scene[] = [];
  private current: Scene | null = null;
  constructor(private ecs: ECSMan) {}

  register(scene: Scene) {
    this.scenes.push(scene);
  }

  async toScene(id: string) {
    if (this.current && this.current.onExit) {
      await this.current.onExit(this.ecs);
    }

    this.ecs.ejectEphemerals();

    const s = this.scenes.find(s => s.id === id);
    if (!s) throw new Error("Could not find scene " + id);

    await s.onEnter(this.ecs);
    this.current = s;
  }
}

export type Scene = {
  id: string;
  onEnter: (ecs: ECSMan) => Promise<void>;
  onExit?: (ecs: ECSMan) => Promise<void>;
};
