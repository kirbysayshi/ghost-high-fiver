import { set, get } from "idb-keyval";
import { DPRScreen } from "./screen";
import * as SpritesPath from "../assets/sprites.png";
import * as SpritesInfo from "../assets/sprites.json";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { PicoFont, FontColor } from './pico-font-sheet';
import { GameLoop } from "./loop";

import { ECSMan } from "./ecsman";
import {
  GeoSystem,
  LocateSystem,
  DrawableSystem,
  DrawableTextSystem,
  DelayedSystem,
  FrameActionSystem,
  DrawActionSystem
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
  FrameAction,
  DrawAction
} from "./components";
import { SceneManager } from "./sceneman";
import { Scenes } from "./constants";
import { BootScene } from "./scenes/boot";
import { LocateScene } from "./scenes/locate";
// import { DemoScene } from "./scenes/demo";

// MADNESS TAKES ITS TOLL: I have no idea how to get TS to not complain about
// this import. If you don't put .default here, it will undefined at runtime
// or in a structure like this: { default: { default: { the module }}}! But if
// you put .default here, then it won't work during development! GUGHGHGHG!
// const ecsman = new ECSMan(ECSGlobal.default);
const ecsman = new ECSMan();

(async function() {
  // Boot up: aka geolocate, load data from idb, compute grid position

  // Encounter: Display current location to user

  // Settings: Toggle sound?

  // Splashhelp: Could be same as settings, but displays credits

  const dprScreen = new DPRScreen(
    document.body,
    128
  );

  const bgSheet = new SpriteSheet(SpritesPath.default);
  await bgSheet.load();

  const sscreen = new SpriteScreen(dprScreen);

  const pfont = new PicoFont(sscreen);
  await pfont.load();

  ecsman.register(
    Geo,
    GridMap,
    PlayerLocation,
    DrawableImage,
    DynamicPos,
    DrawableText,
    Delayed,
    FrameAction,
    DrawAction,
  );
  ecsman.process(
    new DelayedSystem(ecsman),
    new FrameActionSystem(ecsman),
    new GeoSystem(ecsman),
    new LocateSystem(ecsman)
  );

  // We have to manage our own list of systems that only deal with drawing.
  const drawSystems = [
    new DrawableSystem(ecsman, sscreen),
    new DrawableTextSystem(ecsman, pfont),
    new DrawActionSystem(ecsman, sscreen),
  ];

  const scenes = new SceneManager(ecsman);

  // TODO: Ensure this is not imported in final build!
  // scenes.register(DemoScene(pfont, bgSheet));

  scenes.register(BootScene(scenes, pfont));
  scenes.register(LocateScene(bgSheet));

  scenes.toScene(Scenes.BOOT);
  // scenes.toScene('demo');

  // TODO: these "global" components should probably avoid the ECSMan so they
  // persist forever. A SUPER HACK, but better than having to re-init/reload
  // them every time?
  ecsman.createPersistent().add(
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
