import { set, get } from "idb-keyval";
import { DPRScreen } from "./screen";
import * as SpritesPath from "../assets/LG-Tarot.png";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { FontSheet, FontColor } from "./font-sheet";
import { GameLoop } from "./loop";

import ecs from "js13k-ecs";
import { GeoSystem, LocateSystem, DrawableSystem } from "./systems";
import {
  Geo,
  GridMap,
  PlayerLocation,
  MapCellKind,
  StaticPos,
  DrawableImage,
  DynamicPos
} from "./components";

console.log(ecs, ecs.create);

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

  // const provider = new GameStateProvider({
  //   volatile: {
  //     geolocation: null,
  //     errors: []
  //   },
  //   serializable: {
  //     visitedLocations: {}
  //   }
  // });

  // const effects = new GameStateEffectsProvider(provider);

  // effects.geolocation();

  // setTimeout(() => {
  //   provider.actionGeolocationFailed({
  //     message: "Yo it failed! And whatever long message",
  //     code: 2
  //   } as PositionError);
  // }, 1000);

  const cvs = document.querySelector("#c") as HTMLCanvasElement;
  const dprScreen = new DPRScreen(
    window.innerWidth,
    window.innerHeight,
    1,
    cvs
  );

  const bgSheet = new SpriteSheet(SpritesPath.default);
  await bgSheet.load();

  const spriteScreen = new SpriteScreen(dprScreen, 256);
  const fontSheet = new FontSheet(spriteScreen);
  await fontSheet.load();

  ecs.register(Geo, GridMap, PlayerLocation, DrawableImage, StaticPos, DynamicPos);
  ecs.process(
    new GeoSystem(ecs),
    new LocateSystem(ecs),
  );

  // We have to manage our own list of systems that only deal with drawing.
  const drawSystems = [
    new DrawableSystem(ecs, spriteScreen)
  ];


  ecs
    .create()
    .add(
      new GridMap(
        [
          MapCellKind.TAROT,
          MapCellKind.TAROT,
          MapCellKind.TAROT,
          MapCellKind.TAROT,
          MapCellKind.TAROT,
          MapCellKind.TAROT,
          MapCellKind.TAROT,
          MapCellKind.TAROT
        ],
        8
      )
    );
  ecs.create().add(new Geo());

  // The location sheet?
  // TODO: a Tag(name) component to be able to reference by constant?
  ecs
    .create()
    .add(
      new StaticPos({ x: 0, y: 0 }),
      new DrawableImage(
        bgSheet.img,
        { x: 0, y: 0 },
        { x: 128, y: 64 },
        SpriteScale.TWO
      )
    );

  fontSheet.drawText(
    4,
    spriteScreen.projectToScreen(64),
    "Location: THE FIRST ONE",
    SpriteScale.TWO,
    FontColor.BLACK
  );

  fontSheet.drawText(
    0,
    spriteScreen.projectToScreen(64) + fontSheet.heightOf(SpriteScale.TWO),
    "Location: THE SECOND ONE",
    SpriteScale.TWO,
    FontColor.BLACK
  );

  fontSheet.drawText(
    0,
    spriteScreen.projectToScreen(64) +
      fontSheet.heightOf(SpriteScale.TWO) +
      fontSheet.heightOf(SpriteScale.TWO),
    dprScreen.cvs.width +
      " " +
      dprScreen.cvs.height +
      " " +
      dprScreen.cvs.getBoundingClientRect().width,
    SpriteScale.TWO,
    FontColor.BLACK
  );

  let updateCount = 0;

  const gloop = GameLoop({
    drawTime: 1000 / 60,
    updateTime: 1000 / 10,
    draw: interp => {
      spriteScreen.dprScreen.ctx!.clearRect(
        0,
        0,
        spriteScreen.dprScreen.width,
        spriteScreen.dprScreen.height
      );

      for (let i = 0; i < drawSystems.length; i++) {
        drawSystems[i].draw(interp);
      }

      spriteScreen.ghostGlitch(128, 64, 32, 32);
    },
    update: dt => {
      updateCount++;
      const stats = ecs.update(dt);
      if (updateCount % 60 === 0) {
        console.log("update", stats);
      }
    }
  });

  // setTimeout(() => gloop.stop(), 0);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      gloop.stop();
    }
  });

  // temporary, just to kill rendering on the phone.
  spriteScreen.dprScreen.cvs.addEventListener("touchstart", e => {
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
