import { set, get } from "idb-keyval";
import { DPRScreen } from "./screen";
import * as SpritesPath from "../assets/sprites.png";
import * as SpritesInfo from "../assets/sprites.json";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { PicoFont, FontColor } from "./pico-font-sheet";
import { GameLoop } from "./loop";

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
  computedX?: number;
  computedY?: number;
};

type GameState = {
  panels: Array<Panel>;
  player: PlayerState;
};

const GameState: GameState = {
  panels: [],
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

  const PANEL_PADDING = pfont.measure(" ", SpriteScale.TWO).h;
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
      : panel.content.desc;

    // Draw panel
    const { ctx } = sscreen.dprScreen;
    const panelW = dimensions.w + PANEL_PADDING * 2;
    const panelH =
      Math.max(dimensions.h, MIN_PANEL_INNER_HEIGHT) + PANEL_PADDING * 2;

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

    // ctx.fillStyle = "grey";
    ctx.fillStyle = "blue";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.fillStyle = "blue";
    ctx.fillRect(
      panelX + PANEL_PADDING,
      panelY + PANEL_PADDING,
      panelW - 1 - PANEL_PADDING * 2,
      panelH - PANEL_PADDING * 2
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
      const { desc } = panel.content;
      sscreen.drawImg(
        panel.content.img,
        desc.x,
        desc.y,
        desc.w,
        desc.h,
        panelX + PANEL_PADDING,
        panelY + PANEL_PADDING
      );
    }
    accumulatedY = panelY + panelH;
  }
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

  const dprScreen = new DPRScreen(document.body, 256);
  const sscreen = new SpriteScreen(dprScreen);
  const bgSheet = new SpriteSheet(SpritesPath.default);
  const pfont = new PicoFont(sscreen);

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

      drawPanels(sscreen, pfont, GameState.panels);
    },
    update: dt => {
      updateCount++;
      // const stats = ecsman.update(dt);
      // if (updateCount % 60 === 0) {
      //   console.log("update", stats);
      // }
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      gloop.stop();
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

    await delay(
      () =>
        GameState.panels.push({
          content: {
            desc: location.location,
            img: bgSheet.img,
            scale: SpriteScale.ONE
          }
        }),
      1000
    );

    if (
      GameState.player.saveData.solvedLocations.find(
        idx => idx === GameState.player.cell
      )
    ) {
      // location is alrady solved
    } else {
      // show prompt!

      const ghost = Ghosts.get(location.ghost);
      console.log(ghost);
    }
  } else {
    // couldn't get location, and it didn't throw?
  }

  // // TODO: these "global" components should probably avoid the ECSMan so they
  // // persist forever. A SUPER HACK, but better than having to re-init/reload
  // // them every time?
  // ecsman.createPersistent().add(
  //   new GridMap(
  //     [
  //       {
  //         kind: MapCellKind.TAROT,
  //         ghost: 0,
  //         problem: {
  //           prompt: "",
  //           options: [{ text: "only option" }],
  //           correct: 0
  //         }
  //       },
  //       {
  //         kind: MapCellKind.PIER,
  //         ghost: 0,
  //         problem: {
  //           prompt: "",
  //           options: [{ text: "only option" }],
  //           correct: 0
  //         }
  //       },
  //       {
  //         kind: MapCellKind.ABANDONED_WAREHOUSE,
  //         ghost: 0,
  //         problem: {
  //           prompt: "",
  //           options: [{ text: "only option" }],
  //           correct: 0
  //         }
  //       },
  //       {
  //         kind: MapCellKind.TAROT,
  //         ghost: 0,
  //         problem: {
  //           prompt: "",
  //           options: [{ text: "only option" }],
  //           correct: 0
  //         }
  //       },
  //       {
  //         kind: MapCellKind.TAROT,
  //         ghost: 0,
  //         problem: {
  //           prompt: "",
  //           options: [{ text: "only option" }],
  //           correct: 0
  //         }
  //       },
  //       {
  //         kind: MapCellKind.TAROT,
  //         ghost: 0,
  //         problem: {
  //           prompt: "",
  //           options: [{ text: "only option" }],
  //           correct: 0
  //         }
  //       },
  //       {
  //         kind: MapCellKind.TAROT,
  //         ghost: 0,
  //         problem: {
  //           prompt: "",
  //           options: [{ text: "only option" }],
  //           correct: 0
  //         }
  //       },
  //       {
  //         kind: MapCellKind.TAROT,
  //         ghost: 0,
  //         problem: {
  //           prompt: "",
  //           options: [{ text: "only option" }],
  //           correct: 0
  //         }
  //       }
  //     ],
  //     8
  //   )
  // );

  // const geo = ecsman.create();
  // geo.add(new Geo());

  // setTimeout(() => gloop.stop(), 100);

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
