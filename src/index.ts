import { set, get } from "idb-keyval";
import { DPRScreen } from "./screen";
import * as SpritesPath from "../assets/LG-Tarot.png";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { FontSheet, FontColor } from "./font-sheet";
import { GameLoop } from "./loop";

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
  const dprScreen = new DPRScreen(window.innerWidth, window.innerHeight, 1, cvs);

  const bgSheet = new SpriteSheet(SpritesPath.default);
  await bgSheet.load();

  const spriteScreen = new SpriteScreen(dprScreen, 256);
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
    dprScreen.cvs.width +
      " " +
      dprScreen.cvs.height +
      " " +
      dprScreen.cvs.getBoundingClientRect().width,
    SpriteScale.TWO,
    FontColor.BLACK
  );

  const gloop = GameLoop({
    drawTime: 1000 / 60,
    updateTime: 1000 / 10,
    draw: (interp) => {
      spriteScreen.dprScreen.ctx.clearRect(0, 0, spriteScreen.dprScreen.width, spriteScreen.dprScreen.height);
      spriteScreen.drawImg(bgSheet.img, 0, 0, 128, 64, 0, 0, SpriteScale.TWO);
      spriteScreen.ghostGlitch(128, 64, 32, 32);
    },
    update: (dt) => {

    },
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      gloop.stop();
    }
  })

  // temporary, just to kill rendering on the phone.
  spriteScreen.dprScreen.cvs.addEventListener('touchstart', e => {
    dprScreen.ctx.fillStyle = 'red';
    dprScreen.ctx.fillRect(0, 0, screen.width, screen.height);
    gloop.stop();
  })


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
