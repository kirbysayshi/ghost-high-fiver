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
  name: string;
  // desc: SpriteDesc;
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
  name: "BUNNY GHOST",
  problem: [
    "I'm so fluffy and cuddly,",
    "no one will ever be scared",
    "of me!"
  ],
  answers: ["Hug it", "Love it", "Yell at it", "Back slowly away from it"],
  correct: 3,
  responses: {
    right: ["I scared you!?", "AMAZING WILL YOU BE MY FRIEND?"],
    wrong: ["Ugh please don't touch me."]
  }
});

Ghosts.set(SpritesInfo.ghost_bat, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_cat, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_hungry, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_ink, {
  name: "INKY GHOST",
  problem: [
    "Everywhere I go I leave",
    "a trail!",
    "I'll never scare anyone",
    "like this..."
  ],
  answers: ["High five it", "Give it a pen", "Poke it", "Give it some paper"],
  correct: 1,
  responses: {
    right: ["Now I can write scary letters!", "Will you be my friend?"],
    wrong: ["Sigh. Follow the trail when", "you think of something better."]
  }
});

Ghosts.set(SpritesInfo.ghost_jaws, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_petrified, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_plant, {
  name: "SPROUTY SPIRIT",
  problem: ["I was taken from my forest", "and I really miss my garden."],
  answers: [
    "Water it",
    "Coax it into the sun",
    "Give it a pot",
    'Say, "I\'m sorry"'
  ],
  correct: 2,
  responses: {
    right: ["I can grow things with you!", "YOUR HOME WILL BE MY FOREST!"],
    wrong: ["My plant love is wasted..."]
  }
});

Ghosts.set(SpritesInfo.ghost_shy, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
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

type PanelIcon = {
  x: number;
  y: number;
  flash: number;
  flashInterval: number;
  content?: string;
};

const NEXT_PROMPT_ICON: PanelIcon = {
  x: 0,
  y: 0,
  flash: 0,
  flashInterval: 500
};

type Panel = {
  content: string[] | DrawableSprite;
  icon?: PanelIcon;
  action?: (p: Panel, time: number) => void;
  resetY?: boolean;
  noBorder?: boolean;
  noDimPrev?: boolean;
  // tag?: string;
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

function drawPanels(
  sscreen: SpriteScreen,
  bgSheet: SpriteSheet,
  pfont: PicoFont,
  panels: Panel[]
) {
  let accumulatedY = 0;

  // const textScale = Math.floor(window.innerWidth / (pfont.measure(" ", SpriteScale.ONE).h / 320));

  const PANEL_PADDING = SpritesInfo.chrome_tl.w * SpriteScale.TWO;
  const MIN_PANEL_INNER_HEIGHT = pfont.measure(" ", SpriteScale.TWO).h * 2;

  // TODO: add check where if next panel will be off the screen, put it at the top!
  // TODO: if border: false, don't add panel padding!

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    // const panelsRemain = i !== panels.length - 1;

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
      dimensions.w + (panel.noBorder ? 0 : PANEL_PADDING * 2),
      sscreen.dprScreen.width
    );
    const panelH = Math.min(
      Math.max(dimensions.h, MIN_PANEL_INNER_HEIGHT) +
        (panel.noBorder ? 0 : PANEL_PADDING * 2),
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
      if (panel.resetY) {
        panelY = 0;
      } else {
        panelY = Math.max(
          accumulatedY - Math.floor((panelH / 2) * Math.random()),
          0
        );
      }
      panel.computedY = panelY;
    } else {
      panelY = panel.computedY;
    }

    // Make sure previous prompts always are a little faded.
    if (!panel.noDimPrev) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, sscreen.dprScreen.width, sscreen.dprScreen.height);
    }

    const innerX = panelX + (panel.noBorder ? 0 : PANEL_PADDING);
    const innerY = panelY + (panel.noBorder ? 0 : PANEL_PADDING);
    const innerW = panelW - (panel.noBorder ? 0 : PANEL_PADDING * 2);
    const innerH = panelH - (panel.noBorder ? 0 : PANEL_PADDING * 2);

    // ctx.fillStyle = "grey";
    ctx.fillStyle = "blue";
    ctx.fillRect(panelX, panelY, panelW, panelH);

    if (!panel.noBorder) {
      const tl = SpritesInfo.chrome_tl;
      const top = SpritesInfo.chrome_top;

      // draw panel border

      // type BorderDesc = {
      //   t: [number, number];
      //   r: number;
      //   d: [number, number];
      // };

      // (<BorderDesc[]>[
      //   {
      //     t: [panelX, panelY],
      //     r: 0,
      //     d: [panelW, top.h * SpriteScale.TWO]
      //   },
      //   {
      //     t: [panelX + panelW, panelY],
      //     r: Math.PI / 2,
      //     d: [panelH, top.h * SpriteScale.TWO]
      //   },
      //   {
      //     t: [panelX + panelW, panelY + panelH],
      //     r: Math.PI,
      //     d: [panelW, top.h * SpriteScale.TWO]
      //   },
      //   {
      //     t: [panelX, panelY + panelH],
      //     r: -Math.PI / 2,
      //     d: [panelH, top.h * SpriteScale.TWO]
      //   }
      // ]).forEach(b => {
      //   ctx.save();
      //   ctx.translate(b.t[0], b.t[1]);
      //   ctx.rotate(b.r);
      //   ctx.drawImage(
      //     bgSheet.img,
      //     top.x,
      //     top.y,
      //     top.w,
      //     top.h,
      //     0,
      //     0,
      //     b.d[0], b.d[1]
      //   );
      //   ctx.restore();
      // });

      // top
      ctx.save();
      ctx.translate(0, 0);
      ctx.rotate(0);
      ctx.drawImage(
        bgSheet.img,
        top.x,
        top.y,
        top.w,
        top.h,
        panelX,
        panelY,
        panelW,
        top.h * SpriteScale.TWO
      );
      ctx.restore();

      // right
      ctx.save();
      ctx.translate(panelX + panelW, panelY);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(
        bgSheet.img,
        top.x,
        top.y,
        top.w,
        top.h,
        0,
        0,
        panelH,
        top.h * SpriteScale.TWO
      );
      ctx.restore();

      // bottom
      ctx.save();
      ctx.translate(panelX + panelW, panelY + panelH);
      ctx.rotate(Math.PI);
      ctx.drawImage(
        bgSheet.img,
        top.x,
        top.y,
        top.w,
        top.h,
        0,
        0,
        panelW,
        top.h * SpriteScale.TWO
      );
      ctx.restore();

      // left
      ctx.save();
      ctx.translate(panelX, panelY + panelH);
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(
        bgSheet.img,
        top.x,
        top.y,
        top.w,
        top.h,
        0,
        0,
        panelH,
        top.h * SpriteScale.TWO
      );
      ctx.restore();

      // top left
      sscreen.drawImg(
        bgSheet.img,
        tl.x,
        tl.y,
        tl.w,
        tl.h,
        panelX,
        panelY,
        SpriteScale.TWO
      );

      // top right
      ctx.save();
      ctx.translate(panelX + panelW, panelY);
      ctx.scale(-1, 1);
      sscreen.drawImg(
        bgSheet.img,
        tl.x,
        tl.y,
        tl.w,
        tl.h,
        0,
        0,
        SpriteScale.TWO
      );
      ctx.restore();

      // bottom right
      ctx.save();
      ctx.translate(panelX + panelW, panelY + panelH);
      ctx.scale(-1, -1);
      sscreen.drawImg(
        bgSheet.img,
        tl.x,
        tl.y,
        tl.w,
        tl.h,
        0,
        0,
        SpriteScale.TWO
      );
      ctx.restore();

      // bottom left
      ctx.save();
      ctx.translate(panelX, panelY + panelH);
      ctx.scale(1, -1);
      sscreen.drawImg(
        bgSheet.img,
        tl.x,
        tl.y,
        tl.w,
        tl.h,
        0,
        0,
        SpriteScale.TWO
      );
      ctx.restore();
    }

    ctx.fillStyle = "blue";
    ctx.fillRect(innerX, innerY, innerW, innerH);

    if (Array.isArray(panel.content)) {
      // draw the text!
      let lineY = 0;
      panel.content.forEach(line => {
        pfont.drawText(
          panelX + (panel.noBorder ? 0 : PANEL_PADDING),
          panelY + lineY + (panel.noBorder ? 0 : PANEL_PADDING),
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
        panelX + (panel.noBorder ? 0 : PANEL_PADDING),
        panelY + (panel.noBorder ? 0 : PANEL_PADDING),
        scale
      );
    }

    if (panel.ghostEffect) {
      // TODO: should this be over the entire panel, or smaller to represent actually seeing the ghost?

      const glitchW = innerW / 8;
      const glitchH = innerH / 4;
      // TODO: making x/y _slightly_ random might make it appear to waver...
      const glitchX = innerX + innerW / 4;
      const glitchY = innerY + innerH / 4;

      sscreen.ghostGlitch(glitchX, glitchY, glitchW, glitchH, 5);
    }

    accumulatedY = panelY + panelH;

    if (panel.icon) {
      if (panel.icon.flash <= panel.icon.flashInterval / 2) {
        pfont.drawText(
          panelX + panelW - PANEL_PADDING * 4,
          panelY + panelH - PANEL_PADDING,
          panel.icon.content || "\x83",
          SpriteScale.FOUR,
          FontColor.WHITE
        );
      }
    }
  }
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
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

  const dprScreen = new DPRScreen(document.body, 256);
  const sscreen = new SpriteScreen(dprScreen);
  const bgSheet = new SpriteSheet(SpritesPath.default);
  const pfont = new PicoFont(sscreen);

  let time = 0;

  const gloop = {
    running: true,
    stop: () => {
      gloop.running = false;
    },
    anim: () => {
      if (!gloop.running) return;

      const DT = 16;
      time += DT;

      GameState.sincePrevTap = Math.max(GameState.sincePrevTap - DT, 0);

      GameState.panels.forEach((panel, i) => {
        const isLast = i === GameState.panels.length - 1;
        if (panel.action && isLast) {
          panel.action(panel, time);
        }

        if (!panel.icon) return;
        if (!isLast) return;
        panel.icon.flash -= DT;
        if (panel.icon.flash < 0) {
          panel.icon.flash = panel.icon.flashInterval;
        }
      });

      sscreen.dprScreen.ctx!.fillStyle = "black";
      sscreen.dprScreen.ctx!.fillRect(
        0,
        0,
        sscreen.dprScreen.width,
        sscreen.dprScreen.height
      );

      drawPanels(sscreen, bgSheet, pfont, GameState.panels);
      requestAnimationFrame(gloop.anim);
    }
  };

  gloop.anim();

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      gloop.stop();
      console.log("stopped");
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
    content: ["Acquiring spectral...", "triangulation!"],
    icon: {
      ...NEXT_PROMPT_ICON,
      content: ""
    },
    action: (p, time) => {
      const r = time % 300;
      if (r < 100) {
        p.icon!.content = "\x80";
      } else if (r >= 100 && r < 200) {
        p.icon!.content = "\x81";
      } else {
        p.icon!.content = "\x84";
      }
    }
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
      content: ["Acquired!"],
      noDimPrev: true,
    });

    // Always show Location panel...
    const location = MapGrid.cells[GameState.player.cell];

    const solved = GameState.player.saveData.solvedLocations.find(
      idx => idx === GameState.player.cell
    );

    const locPanel: Panel = {
      content: {
        desc: location.location,
        img: bgSheet.img,
        scale: SpriteScale.TWO
      },
      noBorder: true,
      // Always help this be at the top...
      resetY: true,
      icon: {
        ...NEXT_PROMPT_ICON,
        content: solved ? undefined : "!?"
      }
    };

    GameState.panels.push(locPanel);

    if (solved) {
      // location is alrady solved
      GameState.tapActions.push(
        () => {
          GameState.panels.push({
            content: ["\x8c Back here again..."],
            noDimPrev: true,
            icon: {
              ...NEXT_PROMPT_ICON
            }
          });
        },
        () => {
          GameState.panels.push({
            content: ["\x8c I don't see any ghosts around"],
            noDimPrev: true,
            icon: {
              ...NEXT_PROMPT_ICON
            }
          });
        }
      );
    } else {
      // show prompt!
      locPanel.ghostEffect = true;
      const ghost = Ghosts.get(location.ghost);
      console.log(ghost);

      GameState.tapActions.push(
        () => {
          GameState.panels.push({
            content: ["\x8c Ahh! A ghost!"],
            noDimPrev: true,
            icon: {
              ...NEXT_PROMPT_ICON
            }
          });
        },
        () => {
          GameState.panels.push({
            content: ["It has something to say..."],
            noDimPrev: true,
            icon: {
              ...NEXT_PROMPT_ICON
            }
          });
        },
        () =>
          GameState.panels.push({
            content: ghost!.problem,
            noDimPrev: true,
            icon: { ...NEXT_PROMPT_ICON }
          }),
        () => {

          ghost!.answers.forEach(answer => {
            GameState.panels.push({
              content: ['\x91 ' + answer],
              noDimPrev: true,
              computedX: pfont.measure(' ', SpriteScale.TWO).w,
              // icon: { ...NEXT_PROMPT_ICON }
            });
          })

          
        }
      );
    }
  } else {
    // couldn't get location, and it didn't throw?
  }

  const MIN_TAP_INTERVAL_MS = 500;

  const nextTapAction = () => {
    if (GameState.sincePrevTap > 0) {
      return;
    }

    GameState.sincePrevTap = MIN_TAP_INTERVAL_MS;

    const next = GameState.tapActions.shift();
    if (next) {
      next();
    }
  };

  // temporary, just to kill rendering on the phone.
  sscreen.dprScreen.cvs.addEventListener("touchstart", e => {
    // dprScreen.ctx!.fillStyle = "red";
    // dprScreen.ctx!.fillRect(0, 0, screen.width, screen.height);
    // gloop.stop();
    nextTapAction();
  });

  sscreen.dprScreen.cvs.addEventListener("click", e => {
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
