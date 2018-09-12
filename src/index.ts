import { set, get } from "idb-keyval";
import { DPRScreen } from "./screen";
import * as SpritesPath from "../assets/sprites.png";
import * as SpritesInfo from "../assets/sprites.json";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { PicoFont, FontColor } from "./pico-font-sheet";
// import { GameLoop } from "./loop";

type SpriteDesc = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type GhostAnswer = string;
type GhostAnswerIndex = number;

type GhostPrompt = {
  problem: string[];
  answers: GhostAnswer[];
  correct: GhostAnswerIndex;
  responses: {
    right: string[];
    wrong: string[];
  };
};

const Ghosts = new Map<SpriteDesc, GhostPrompt>();
Ghosts.set(SpritesInfo.ghost_bun, {
  problem: ["I'm so fluffy and cuddly,", "no one will ever be scared of me!"],
  answers: ["Hug it", "Love it", "Yell at it", "Back slowly away from it"],
  correct: 3,
  responses: {
    right: ["I scared you!?", "AMAZING WILL YOU BE MY FRIEND?"],
    wrong: ["Ugh please don't touch me."]
  }
});

const MapGrid = {
  cols: 1,
  rows: 1,
  cells: [
    {
      ghost: SpritesInfo.ghost_bun,
      location: SpritesInfo.loc_pier
    }
  ]
};

type CellIndex = number;

type PlayerSavedData = {
  solvedLocations: CellIndex[];
};

type PlayerState = {
  geo: null | Position;
  cell: null | CellIndex;
  saveData: PlayerSavedData;
};

type DrawableSprite = {
  desc: SpriteDesc;
  img: HTMLImageElement | HTMLCanvasElement;
  scale: number;
};

type Panel = {
  // x: number;
  // y: number;
  content: string[] | DrawableSprite;
  tag?: string;
  ghostEffect?: boolean;
  computedX?: number;
  computedY?: number;
};

type GameState = {
  panels: Array<Panel>;
  tapActions: Array<() => void>;
  sincePrevTap: number;
  player: PlayerState;
};

const GameState: GameState = {
  panels: [],
  tapActions: [],
  sincePrevTap: 0,
  player: {
    geo: null,
    cell: null,
    saveData: {
      solvedLocations: []
    }
  }
};

async function getUserLocation() {
  return new Promise<Position>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 10000
    });
  });
}

function mapUserLocationToGrid(grid: typeof MapGrid, state: PlayerState) {
  const cellWidth = 20; // feet? which means the entire world is only 160 ft sq...
  const mapWidth = grid.cols * cellWidth;
  const mapHeight = grid.rows * cellWidth;

  if (!state.geo) return;

  // https://stackoverflow.com/a/2911469/169491
  const x = (mapWidth * (180 + state.geo.coords.longitude)) / 360;
  const y = (mapHeight * (90 - state.geo.coords.latitude)) / 180;

  const col = Math.floor((x / mapWidth) * grid.cols);
  const row = Math.floor((y / mapHeight) * grid.rows);

  const idx = row * grid.cols + col;
  state.cell = idx;
}

function drawPanels(sscreen: SpriteScreen, pfont: PicoFont, panels: Panel[]) {
  let accumulatedY = 0;

  // const textScale = Math.floor(window.innerWidth / (pfont.measure(" ", SpriteScale.ONE).h / 320));

  const PANEL_PADDING = pfont.measure(" ", SpriteScale.ONE).h;
  const MIN_PANEL_INNER_HEIGHT = pfont.measure(" ", SpriteScale.TWO).h * 2;

  // TODO: add check where if next panel will be off the screen, put it at the top!
  // TODO: if border: false, don't add panel padding!

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];

    const dimensions = Array.isArray(panel.content)
      ? panel.content.map(line => pfont.measure(line, SpriteScale.TWO)).reduce(
          (total, dims) => {
            total.w = Math.max(dims.w, total.w);
            total.h += dims.h;
            return total;
          },
          { w: 0, h: 0 }
        )
      : {
          w: panel.content.desc.w * panel.content.scale,
          h: panel.content.desc.h * panel.content.scale
        };

    // Draw panel
    const { ctx } = sscreen.dprScreen;
    const panelW = Math.min(
      dimensions.w + PANEL_PADDING * 2,
      sscreen.dprScreen.width
    );
    const panelH = Math.min(
      Math.max(dimensions.h, MIN_PANEL_INNER_HEIGHT) + PANEL_PADDING * 2,
      sscreen.dprScreen.height
    );

    let panelX: number;
    if (panel.computedX === undefined) {
      panelX = Math.floor((sscreen.dprScreen.width - panelW) * Math.random());
      panel.computedX = panelX;
    } else {
      panelX = panel.computedX;
    }

    let panelY: number;
    if (panel.computedY === undefined) {
      panelY = Math.max(
        accumulatedY - Math.floor((panelH / 2) * Math.random()),
        0
      );
      panel.computedY = panelY;
    } else {
      panelY = panel.computedY;
    }

    // Make sure previous prompts always are a little faded.
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, sscreen.dprScreen.width, sscreen.dprScreen.height);

    const innerX = panelX + PANEL_PADDING;
    const innerY = panelY + PANEL_PADDING;
    const innerW = panelW - 1 - PANEL_PADDING * 2;
    const innerH = panelH - PANEL_PADDING * 2;

    // ctx.fillStyle = "grey";
    ctx.fillStyle = "blue";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.fillStyle = "blue";
    ctx.fillRect(
      innerX,
      innerY,
      innerW,
      innerH,
    );

    if (Array.isArray(panel.content)) {
      // draw the text!
      let lineY = 0;
      panel.content.forEach(line => {
        pfont.drawText(
          panelX + PANEL_PADDING,
          panelY + lineY + PANEL_PADDING,
          line,
          SpriteScale.TWO,
          FontColor.WHITE
        );
        lineY += pfont.measure(line, SpriteScale.TWO).h;
      });
    } else {
      // just draw!
      const { desc, scale } = panel.content;
      sscreen.drawImg(
        panel.content.img,
        desc.x,
        desc.y,
        desc.w,
        desc.h,
        panelX + PANEL_PADDING,
        panelY + PANEL_PADDING,
        scale
      );
    }

    if (panel.ghostEffect) {

      // TODO: should this be over the entire panel, or smaller to represent actually seeing the ghost?

      const glitchW = innerW / 8 
      const glitchH = innerH / 4 
      // TODO: making x/y _slightly_ random might make it appear to waver...
      const glitchX = innerX + (innerW / 4)
      const glitchY = innerY + (innerH / 4)

      sscreen.ghostGlitch(glitchX, glitchY, glitchW, glitchH, 5);
    }

    accumulatedY = panelY + panelH;
  }
}

function randomBetween(min: number, max: number) {
  return min + (Math.random() * (max - min));
}

async function delay(action: () => void, delay = 300) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      action();
      resolve();
    }, delay);
  });
}

const PLAYER_DATA_KEY = "lgsavedata";

async function savePlayerData(state: GameState) {
  await set(PLAYER_DATA_KEY, state.player.saveData);
}

async function loadPlayerData(state: GameState) {
  const data = await get<PlayerSavedData>(PLAYER_DATA_KEY);

  if (!data) return;

  state.player.saveData = data;
}

(async function() {
  // Load sprites
  // Load inventory data from idb
  // Merge with static data
  // Await geolocation
  // If new ghost, display ghost effect + background + message + prompts
  // if not new ghost, show generic empty message
  // Save inventory to idb.

  // const innerWidth = window.innerWidth;
  // const targetWidth = innerWidth > 

  const dprScreen = new DPRScreen(document.body, 320);
  const sscreen = new SpriteScreen(dprScreen);
  const bgSheet = new SpriteSheet(SpritesPath.default);
  const pfont = new PicoFont(sscreen);

  const gloop = {
    running: true,
    stop: () => {
      gloop.running = false;
    },
    anim: () => {
      if (!gloop.running) return;

      GameState.sincePrevTap = Math.max(GameState.sincePrevTap - 16, 0);

      sscreen.dprScreen.ctx!.fillStyle = "black";
      sscreen.dprScreen.ctx!.fillRect(
        0,
        0,
        sscreen.dprScreen.width,
        sscreen.dprScreen.height
      );

      drawPanels(sscreen, pfont, GameState.panels);
      requestAnimationFrame(gloop.anim);
    }
  };

  gloop.anim();

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      gloop.stop();
      console.log('stopped');
    }
  });

  await Promise.all([bgSheet.load(), pfont.load()]);
  GameState.panels.push({
    content: ["Loaded immaterial photograms!"]
  });

  GameState.panels.push({
    content: ["Retrieving past lives..."]
  });

  await loadPlayerData(GameState);
  console.log("loaded save data", GameState.player.saveData);

  GameState.panels.push({
    content: ["OK!"]
  });

  GameState.panels.push({
    content: ["Acquiring spectral...", "triangulation!"]
  });

  let loc;

  // TODO: need to provide some user feedback while this is locating,
  // especially if it is slow and going to time out...
  // TODO: why does it time out!?!?!

  try {
    loc = await getUserLocation();
  } catch (e) {
    GameState.panels.push({
      content: ["Failed to acquire! Sorry."]
    });
    return;
  }

  GameState.player.geo = loc;

  mapUserLocationToGrid(MapGrid, GameState.player);

  if (GameState.player.cell !== null) {
    GameState.panels.push({
      content: ["Acquired!"]
    });

    // Always show Location panel...
    const location = MapGrid.cells[GameState.player.cell];

    await delay(() => {}, 1000);

    const locPanel: Panel = {
      content: {
        desc: location.location,
        img: bgSheet.img,
        scale: SpriteScale.TWO
      },
      tag: 'loc',
      // Always help this be at the top...
      computedY: 0
    };

    GameState.panels.push(locPanel);

    // TODO: tell the user they need to tap!!!!!

    GameState.tapActions.push(() => {
      GameState.panels.push({
        content: ['"Back at the place again..."']
      })
    })

    if (
      GameState.player.saveData.solvedLocations.find(
        idx => idx === GameState.player.cell
      )
    ) {
      // location is alrady solved
    } else {
      // show prompt!

      // TODO: how to add ghost effect to panel???
      // Maybe a panel could have a tagged name to reference?

      // This will only be the first...
      // const locPanel = GameState.panels.filter(p => p.tag === 'loc').pop();
      // if (locPanel) {
      //   // something went really wrong if there is no panel...
      // }

      locPanel.ghostEffect = true;

      const ghost = Ghosts.get(location.ghost);
      console.log(ghost);
    }
  } else {
    // couldn't get location, and it didn't throw?
  }

  const MIN_TAP_INTERVAL_MS = 100;

  const nextTapAction = () => {

    if(GameState.sincePrevTap > 0) {
      return;
    }

    GameState.sincePrevTap = MIN_TAP_INTERVAL_MS;

    const next = GameState.tapActions.shift();
    if (next) {
      next();
    }
  }

  // temporary, just to kill rendering on the phone.
  sscreen.dprScreen.cvs.addEventListener("touchstart", e => {
    // dprScreen.ctx!.fillStyle = "red";
    // dprScreen.ctx!.fillRect(0, 0, screen.width, screen.height);
    // gloop.stop();
    nextTapAction();
  });

  sscreen.dprScreen.cvs.addEventListener('click', e => {
    nextTapAction();
  });

})();

// Prevent zooming and extra scrolling
document.addEventListener(
  "touchmove",
  function(e) {
    e.preventDefault();
  },
  { passive: false }
);
