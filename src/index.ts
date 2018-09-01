import { set, get } from "idb-keyval";
import { Screen } from "./screen";
import * as SpritesPath from "../assets/sprites.png";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { FontSheet, FontColor } from "./font-sheet";

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
  const screen = Screen(cvs, window.innerWidth, window.innerHeight, 1);

  const bgSheet = new SpriteSheet(SpritesPath.default);
  await bgSheet.load();

  const spriteScreen = new SpriteScreen(screen, 256);
  const fontSheet = new FontSheet(spriteScreen);
  await fontSheet.load();

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
    screen.cvs.width +
      " " +
      screen.cvs.height +
      " " +
      screen.cvs.getBoundingClientRect().width,
    SpriteScale.TWO,
    FontColor.BLACK
  );

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

console.log("hello!");
