import { set, get } from "idb-keyval";
import { DPRScreen } from "./screen";
import * as SpritesPath from "../assets/sprites.png";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { FontSheet, FontColor } from "./font-sheet";
import { GameLoop } from "./loop";

import ecs from "js13k-ecs";
import { ECSMan } from "./ecsman";
import {
  GeoSystem,
  LocateSystem,
  DrawableSystem,
  DrawableTextSystem,
  DelayedSystem,
  FrameActionSystem
} from "./systems";
import {
  Geo,
  GridMap,
  PlayerLocation,
  MapCellKind,
  DrawableImage,
  DynamicPos,
  DrawableText,
  Delayed,
  FrameAction
} from "./components";
import { SceneManager } from "./sceneman";
import { v2 } from "pocket-physics/src/v2";

const ecsman = new ECSMan(ecs);

enum Routes {
  BOOT = "BOOT",
  ENCOUNTER = "ENCOUNTER",
  SETTINGS = "SETTINGS",
  SPLASHHELP = "SPLASHHELP"
}

(async function() {
  // Boot up: aka geolocate, load data from idb, compute grid position

  // Encounter: Display current location to user

  // Settings: Toggle sound?

  // Splashhelp: Could be same as settings, but displays credits

  const cvs = document.querySelector("#c") as HTMLCanvasElement;
  const dprScreen = new DPRScreen(
    window.innerWidth,
    window.innerHeight,
    1,
    cvs
  );

  const bgSheet = new SpriteSheet(SpritesPath.default);
  await bgSheet.load();

  const sscreen = new SpriteScreen(dprScreen, 256);
  const fontSheet = new FontSheet(sscreen);
  await fontSheet.load();

  ecsman.register(
    Geo,
    GridMap,
    PlayerLocation,
    DrawableImage,
    DynamicPos,
    DrawableText,
    Delayed,
    FrameAction,
  );
  ecsman.process(
    new DelayedSystem(ecsman),
    new FrameActionSystem(ecsman),
    new GeoSystem(ecsman),
    new LocateSystem(ecsman),
  );

  // We have to manage our own list of systems that only deal with drawing.
  const drawSystems = [
    new DrawableSystem(ecsman, sscreen),
    new DrawableTextSystem(ecsman, fontSheet)
  ];

  const scenes = new SceneManager(ecsman);

  enum Scenes {
    BOOT = "BOOT",
    LOCATE = "LOCATE",
    SETTINGS = "SETTINGS"
  }

  scenes.register({
    id: Scenes.BOOT,
    onEnter: async (ecs: ECSMan) => {
      const fontHeight = fontSheet.heightOf(SpriteScale.ONE);
      const lineHeight = fontHeight + Math.floor(fontHeight / 2);

      ecs.create().add(
        new Delayed(0, ecs => {
          const MAX_RAM = 1792;
          let ram = 0;
          const line = ecs.create();
          line.add(
            new DynamicPos(v2(0, 0 * lineHeight)),
            new DrawableText("Checking ETHER RAM... 0", FontColor.BLACK, SpriteScale.ONE),
            new FrameAction((ecs, entity) => {
              ram += 96;
              const txt = entity.get<DrawableText>(DrawableText);
              if (!txt) return;

              let msg;
              if (ram >= MAX_RAM) {
                msg = ' ' + ram + 'PB OK!';
                entity.remove(FrameAction); // aka "self"!
              } else {
                msg = ' ' + ram;
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

  scenes.register({
    id: Scenes.LOCATE,
    onEnter: async (ecs: ECSMan) => {
      ecsman
        .create()
        .add(
          new DynamicPos({ x: 0, y: 0 }),
          new DrawableImage(
            bgSheet.img,
            { x: 0, y: 0 },
            { x: 128, y: 64 },
            SpriteScale.TWO
          )
        );
      ecsman
        .create()
        .add(
          new DynamicPos({ x: 4, y: sscreen.pts(64) }),
          new DrawableText(
            "Location: THE FIRST ONE",
            FontColor.BLACK,
            SpriteScale.TWO
          )
        );
    },
    onExit: async (ecs: ECSMan) => {}
  });

  scenes.toScene(Scenes.BOOT);

  // TODO: these "global" components should probably avoid the ECSMan so they
  // persist forever. A SUPER HACK, but better than having to re-init/reload
  // them every time?
  ecsman
    .create()
    .add(
      new GridMap(
        [
          {
            kind: MapCellKind.TAROT,
            ghost: 0,
            problem: {
              prompt: "",
              options: [{ text: "only option" }],
              correct: 0
            }
          },
          {
            kind: MapCellKind.PIER,
            ghost: 0,
            problem: {
              prompt: "",
              options: [{ text: "only option" }],
              correct: 0
            }
          },
          {
            kind: MapCellKind.ABANDONED_WAREHOUSE,
            ghost: 0,
            problem: {
              prompt: "",
              options: [{ text: "only option" }],
              correct: 0
            }
          },
          {
            kind: MapCellKind.TAROT,
            ghost: 0,
            problem: {
              prompt: "",
              options: [{ text: "only option" }],
              correct: 0
            }
          },
          {
            kind: MapCellKind.TAROT,
            ghost: 0,
            problem: {
              prompt: "",
              options: [{ text: "only option" }],
              correct: 0
            }
          },
          {
            kind: MapCellKind.TAROT,
            ghost: 0,
            problem: {
              prompt: "",
              options: [{ text: "only option" }],
              correct: 0
            }
          },
          {
            kind: MapCellKind.TAROT,
            ghost: 0,
            problem: {
              prompt: "",
              options: [{ text: "only option" }],
              correct: 0
            }
          },
          {
            kind: MapCellKind.TAROT,
            ghost: 0,
            problem: {
              prompt: "",
              options: [{ text: "only option" }],
              correct: 0
            }
          }
        ],
        8
      )
    );

  const geo = ecsman.create();
  geo.add(new Geo());

  // The location sheet?
  // TODO: a Tag(name) component to be able to reference by constant?

  // ecsman
  //   .create()
  //   .add(
  //     new DynamicPos({ x: 4, y: sscreen.pts(64) }),
  //     new DrawableText(
  //       "Location: THE FIRST ONE",
  //       FontColor.BLACK,
  //       SpriteScale.TWO
  //     )
  //   );

  let updateCount = 0;

  const gloop = GameLoop({
    drawTime: 1000 / 60,
    updateTime: 1000 / 10,
    draw: interp => {
      sscreen.dprScreen.ctx!.clearRect(
        0,
        0,
        sscreen.dprScreen.width,
        sscreen.dprScreen.height
      );

      for (let i = 0; i < drawSystems.length; i++) {
        drawSystems[i].draw(interp);
      }

      // sscreen.ghostGlitch(128, 64, 32, 32);
    },
    update: dt => {
      updateCount++;
      const stats = ecsman.update(dt);
      if (updateCount % 60 === 0) {
        console.log("update", stats);
      }
    }
  });

  // setTimeout(() => gloop.stop(), 100);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      gloop.stop();
    }
  });

  // temporary, just to kill rendering on the phone.
  sscreen.dprScreen.cvs.addEventListener("touchstart", e => {
    dprScreen.ctx!.fillStyle = "red";
    dprScreen.ctx!.fillRect(0, 0, screen.width, screen.height);
    gloop.stop();
  });

  // let route = await get('route');

  // if (route === undefined) {
  //   route = Routes.SPLASHHELP;
  //   await set('route', route);
  // }

  // console.log('route', route);

  // dispatch?
  // Or just... document.getElementById(route).style.display = 'block' ??? lol.
})();

// Prevent zooming and extra scrolling
document.addEventListener(
  "touchmove",
  function(e) {
    e.preventDefault();
  },
  { passive: false }
);
