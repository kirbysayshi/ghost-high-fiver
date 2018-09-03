import { V2, copy, v2 } from "pocket-physics/src/v2";
import { SpriteScale } from "./sprite-screen";
import { FontColor } from "./font-sheet";

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

type MapCellIndex = number;

export class GridMap {
  public readonly rows = Math.floor(this.cells.length / this.cols);
  constructor(
    public readonly cells: MapCellKind[] = [],
    public readonly cols = 8
  ) {}

  colRowValue(col: number, row: number): MapCellKind {
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
    public source: V2 = v2(),
    public dims: V2 = v2(drawable.width, drawable.height),
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
