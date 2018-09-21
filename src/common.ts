import { CellIndex } from "./map-grid";
import { PlayerSavedData } from "./save-load";

export type SpriteDesc = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TapZone = SpriteDesc & {
  action: (zone: TapZone) => void;
};

export type PlayerState = {
  geo: null | Position;
  cell: null | CellIndex;
  saveData: PlayerSavedData;
};

export type DrawableSprite = {
  desc: SpriteDesc;
  img: HTMLImageElement | HTMLCanvasElement;
  scale: number;
};
