import { set, get } from "idb-keyval";
import { DPRScreen } from "./screen";
import * as SpritesPath from "../assets/LG-Tarot.png";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { FontSheet, FontColor } from "./font-sheet";
import { GameLoop } from "./loop";

import ecs from "js13k-ecs";
import { GeoSystem, LocateSystem } from "./systems";
import { Geo, GridMap, PlayerLocation, MapCellKind } from "./components";

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

  ecs.register(Geo, GridMap, PlayerLocation);
  ecs.process(new GeoSystem(ecs), new LocateSystem(ecs));

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

  spriteScreen.drawImg(bgSheet.img, 0, 0, 128, 64, 0, 0, SpriteScale.TWO);

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
      // const s = provider.getState();

      // if (s.volatile.errors) {
      //   s.volatile.errors.forEach(({ message }) => {
      //     // draw errors?
      //     fontSheet.drawText(8, 8, message, SpriteScale.ONE, FontColor.BLACK);
      //   });
      // } else {
      spriteScreen.dprScreen.ctx!.clearRect(
        0,
        0,
        spriteScreen.dprScreen.width,
        spriteScreen.dprScreen.height
      );
      spriteScreen.drawImg(bgSheet.img, 0, 0, 128, 64, 0, 0, SpriteScale.TWO);
      spriteScreen.ghostGlitch(128, 64, 32, 32);
      // }
    },
    update: dt => {
      updateCount++;

      const stats = ecs.update(dt);
      if (updateCount % 60 === 0) {
        console.log(stats);
      }

      // effects.tick
    }
  });

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
