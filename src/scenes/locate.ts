import { Scene } from "../sceneman";
import { Scenes } from "../constants";
import { ECSMan } from "../ecsman";
import { DynamicPos, DrawableImage, DrawableText } from "../components";
import { SpriteScale } from "../sprite-screen";
import { SpriteSheet } from "../sprite-sheet";
import * as SpritesInfo from "../../assets/sprites.json";
import { FontColor } from "../pico-font-sheet";

export const LocateScene = (bgSheet: SpriteSheet, ): Scene => ({
  id: Scenes.LOCATE,
  onEnter: async (ecs: ECSMan) => {
    ecs
      .create()
      .add(
        new DynamicPos({ x: 0, y: 0 }),
        new DrawableImage(
          bgSheet.img,
          SpritesInfo.loc_pier,
          SpriteScale.ONE
        )
      );
    ecs
      .create()
      .add(
        new DynamicPos({ x: 4, y: 64 }),
        new DrawableText(
          "Location: THE FIRST ONE",
          FontColor.BLACK,
          SpriteScale.ONE
        )
      );
  },
  onExit: async (ecs: ECSMan) => {}
})