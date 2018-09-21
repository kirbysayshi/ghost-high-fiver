import { DrawAction, DynamicPos, DrawableText, DrawableImage } from "../components";
import { SpriteScale } from "../sprite-screen";
import { v2 } from "pocket-physics/src/v2";
import { ECSMan } from "../ecsman";
import { PicoFont, FontColor } from "../pico-font-sheet";
import { SpriteSheet } from "../sprite-sheet";
import * as SpritesInfo from "../../assets/sprites.json";
import { Scene } from "../sceneman";

export const DemoScene = (pfont: PicoFont, bgSheet: SpriteSheet): Scene => ({
  id: "demo",
  onEnter: async (ecs: ECSMan) => {

    ecs
      .create()
      .add(new DrawAction((ecs, sscreen, e) => {

        sscreen.dprScreen.ctx!.fillStyle = 'black';
        for (let i = 0; i < 256; i++) {
          if (i % 2 === 0) {
            sscreen.dprScreen.ctx!.fillRect(i, 50, 1, 1);
          }
        }

        pfont.drawText(0, 30, 'Some PICO text for you!');
        pfont.drawText(0, 36, 'Some PICO text for you!', SpriteScale.TWO);
        pfont.drawText(0, 140, 'SOME PICO TEXT FOR YOU!', SpriteScale.ONE);
      }));

    ecs
      .create()
      .add(
        new DynamicPos(v2(0, 0)),
        new DrawableText(
          "This is a FONT TEST... With lots more following.",
          FontColor.BLACK,
          SpriteScale.ONE
        )
      );
    
      ecs
      .create()
      .add(
        new DynamicPos(v2(0, 8)),
        new DrawableText(
          "And the TEST! " + window.devicePixelRatio,
          FontColor.BLACK,
          SpriteScale.TWO
        )
      );


      // ecs
      // .create()
      // .add(
      //   new DynamicPos({ x: 64, y: 75 }),
      //   new DrawableImage(
      //     ghostSheet.img,
      //     { x: 0, y: 0 },
      //     { x: 32, y: 32 },
      //     SpriteScale.TWO
      //   )
      // );

      ecs
      .create()
      .add(
        new DynamicPos({ x: 0, y: 51 }),
        new DrawableImage(
          bgSheet.img,
          SpritesInfo.loc_pier,
          SpriteScale.ONE
        )
      );

  }
})