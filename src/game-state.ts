import { Panel } from "./panel";
import { TapZone, PlayerState } from "./common";

export type GameState = {
  panels: Array<Panel>;
  tapActions: Array<() => void>;
  sincePrevTap: number;
  tapZones: TapZone[];
  player: PlayerState;
};

export const GameState: GameState = {
  panels: [],
  tapActions: [],
  sincePrevTap: 0,
  tapZones: [],
  player: {
    geo: null,
    cell: null,
    saveData: {
      solvedLocations: []
    }
  }
};
