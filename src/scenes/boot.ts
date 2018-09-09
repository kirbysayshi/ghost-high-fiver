import { SceneManager, Scene } from "../sceneman";
import { PicoFont } from "../pico-font-sheet";
import { Scenes } from "../constants";
import { ECSMan } from "../ecsman";
import { Delayed, DynamicPos, DrawableText, FrameAction } from "../components";
import { v2 } from "pocket-physics/src/v2";
import { FontColor } from "../font-sheet";
import { SpriteScale } from "../sprite-screen";

export const BootScene = (scenes: SceneManager, pfont: PicoFont): Scene => ({
  id: Scenes.BOOT,
  onEnter: async (ecs: ECSMan) => {
    const fontHeight = pfont.measure("").h;
    const lineHeight = fontHeight + Math.floor(fontHeight / 2);

    ecs.create().add(
      new Delayed(0, ecs => {
        const MAX_RAM = 1792;
        let ram = 0;
        const line = ecs.create();
        line.add(
          new DynamicPos(v2(0, 0 * lineHeight)),
          new DrawableText(
            "Checking ETHER RAM... 0",
            FontColor.BLACK,
            SpriteScale.ONE
          ),
          new FrameAction((ecs, entity) => {
            ram += 96;
            const txt = entity.get<DrawableText>(DrawableText);
            if (!txt) return;

            let msg;
            if (ram >= MAX_RAM) {
              msg = " " + ram + "PB OK!";
              entity.remove(FrameAction); // aka "self"!
            } else {
              msg = " " + ram;
            }

            const subbed = txt.text.replace(/\s\d+/, msg);
            txt.text = subbed;
          })
        );
      })
    );

    ecs.create().add(
      new Delayed(3000, ecs => {
        ecs
          .create()
          .add(
            new DynamicPos(v2(0, 1 * lineHeight)),
            new DrawableText("Settling ectoplasmic tether... OK")
          );
      })
    );

    ecs.create().add(
      new Delayed(4000, ecs => {
        ecs
          .create()
          .add(
            new DynamicPos(v2(0, 2 * lineHeight)),
            new DrawableText("Booting Spectral Scope... OK")
          );
      })
    );

    ecs.create().add(
      new Delayed(5000, ecs => {
        scenes.toScene(Scenes.LOCATE);
      })
    );
  },
  onExit: async (ecs: ECSMan) => {}
});
