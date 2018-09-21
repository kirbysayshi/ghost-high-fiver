import { set, get } from "idb-keyval";
import { CellIndex } from "./map-grid";
import { GameState } from "./game-state";

export type PlayerSavedData = {
  solvedLocations: CellIndex[];
};

const PLAYER_DATA_KEY = "lgsavedata";

export async function savePlayerData(state: GameState) {
  await set(PLAYER_DATA_KEY, state.player.saveData);
}

export async function loadPlayerData(state: GameState) {
  const data = await get<PlayerSavedData>(PLAYER_DATA_KEY);

  if (!data) return;

  state.player.saveData = data;
}
