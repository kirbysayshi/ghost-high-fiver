import * as SpritesInfo from "../assets/sprites.json";

export const MapGrid = {
  cols: 4,
  rows: 3,
  cells: [
    {
      ghost: SpritesInfo.ghost_bun,
      location: SpritesInfo.loc_pier
    },
    {
      ghost: null,
      location: SpritesInfo.loc_pier
    },
    {
      ghost: SpritesInfo.ghost_ink,
      location: SpritesInfo.loc_street
    },
    {
      ghost: null,
      location: SpritesInfo.loc_tarot
    },

    {
      ghost: SpritesInfo.ghost_plant,
      location: SpritesInfo.loc_abandoned
    },
    {
      ghost: null,
      location: SpritesInfo.loc_abandoned
    },
    {
      ghost: null,
      location: SpritesInfo.loc_pier
    },
    {
      ghost: null,
      location: SpritesInfo.loc_pier
    },

    {
      ghost: null,
      location: SpritesInfo.loc_abandoned
    },
    {
      ghost: null,
      location: SpritesInfo.loc_abandoned
    },
    {
      ghost: null,
      location: SpritesInfo.loc_pier
    },
    {
      ghost: null,
      location: SpritesInfo.loc_pier
    }
  ]
};

export type CellIndex = number;
