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

  rowFor (idx: MapCellIndex) {
    return Math.floor(idx / this.rows);
  }
}

export class PlayerLocation {
  constructor(public index: MapCellIndex) {}
}
// export class Sprite {
//   constructor()
// }
