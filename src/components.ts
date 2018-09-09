import { V2, copy, v2 } from "pocket-physics/src/v2";
import { SpriteScale, SpriteScreen } from "./sprite-screen";
import { ECSMan } from "./ecsman";
import { Entity } from "js13k-ecs";
import { FontColor } from "./pico-font-sheet";

export class Geo {
  constructor(
    public pending: boolean = false,
    public pos: Position | null = null,
    public error: PositionError | null = null
  ) {}
}

export enum MapCellKind {
  GARDEN = 1,
  PIER,
  TAROT,
  BRIDGE,
  ABANDONED_WAREHOUSE,
  CITY_STREET_CORNER
}

type GhostId = number;

type GhostOptionIndex = number;

type GhostOption = {
  text: string;
};

type GhostProblem = {
  prompt: string;
  options: GhostOption[];
  correct: GhostOptionIndex;
};

export type CellDesc = {
  kind: MapCellKind;
  ghost: GhostId;
  problem: GhostProblem;
};

type MapCellIndex = number;

export class GridMap {
  public readonly rows = Math.floor(this.cells.length / this.cols);
  constructor(
    public readonly cells: CellDesc[] = [],
    public readonly cols = 8
  ) {}

  colRowValue(col: number, row: number): CellDesc {
    return this.cells[row * this.cols + col];
  }

  colRowIndex(col: number, row: number): MapCellIndex {
    return row * this.cols + col;
  }

  colFor(idx: MapCellIndex) {
    return idx % this.rows;
  }

  rowFor(idx: MapCellIndex) {
    return Math.floor(idx / this.rows);
  }
}

export class PlayerLocation {
  constructor(public index: MapCellIndex) {}
}

export class DynamicPos {
  public ppos = copy(v2(), this.cpos);
  public acel = v2();
  constructor(public cpos: V2) {}
}

export class DrawableImage {
  constructor(
    public drawable: HTMLCanvasElement | HTMLImageElement,
    public desc: { x: number, y: number, w: number, h: number },
    // public source: V2 = v2(),
    // public dims: V2 = v2(drawable.width, drawable.height),
    public scale: SpriteScale = SpriteScale.ONE
  ) {}
}

export class DrawableText {
  constructor(
    public text: string,
    public color: FontColor = FontColor.BLACK,
    public scale: SpriteScale = SpriteScale.ONE
  ) {}
}

export class Delayed {
  public elapsed: number = 0;
  constructor(public until: number, public action: (ecs: ECSMan) => void) {}
}

export class FrameAction {
  constructor(
    public action: (ecs: ECSMan, entity: Entity<FrameAction>) => void
  ) {}
}

export class DrawAction {
  constructor(
    public action: (
      ecs: ECSMan,
      sscreen: SpriteScreen,
      entity: Entity<DrawAction>
    ) => void
  ) {}
}
