import { DPRScreen } from "./screen";
import * as SpritesPath from "../assets/sprites.png";
import { SpriteSheet } from "./sprite-sheet";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { PicoFont } from "./pico-font-sheet";
import { Ghosts } from "./ghosts";
import { MapGrid } from "./map-grid";
import { getUserLocation, mapUserLocationToGrid } from "./location";
import { GameState } from "./game-state";
import { PanelIcon, drawPanels, Panel, layoutPanel } from "./panel";
import { loadPlayerData } from "./save-load";
import { attachHandlers } from "./screen-taps";

const NEXT_PROMPT_ICON: PanelIcon = {
  x: 0,
  y: 0,
  flash: 0,
  flashInterval: 500
};

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

  attachHandlers(sscreen);

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

  const cell = mapUserLocationToGrid(MapGrid, GameState.player.geo);
  GameState.player.cell = cell;

  if (GameState.player.cell !== null) {
    GameState.panels.push({
      content: ["Acquired!"],
      noDimPrev: true
    });

    const mapPanel: Panel = {
      content: {
        desc: { x: 0, y: 0, w: 64, h: 64 },
        img: new Image(),
        scale: SpriteScale.TWO
      },
      icon: {
        ...NEXT_PROMPT_ICON
      },
      drawAction: (p: Panel, layout, sscreen) => {
        // HACK: draw the map
        const { ctx } = sscreen.dprScreen;
        const cellSize = 8;

        const row = Math.floor(GameState.player.cell! / MapGrid.cols);
        const col = GameState.player.cell! % MapGrid.cols;

        for (let i = 0; i < MapGrid.rows; i++) {
          for (let j = 0; j < MapGrid.cols; j++) {
            ctx.fillStyle = "pink";
            ctx.fillRect(
              layout.x + layout.padding + j * cellSize,
              layout.y + layout.padding + i * cellSize,
              cellSize - 2,
              cellSize - 2
            );
            if (i === row && j === col) {
              ctx.fillStyle = "yellow";
              ctx.fillRect(
                layout.x + layout.padding + j * cellSize,
                layout.y + layout.padding + i * cellSize,
                cellSize - 2,
                cellSize - 2
              );
            }
          }
        }
      }
    };

    GameState.panels.push({
      content: [
        GameState.player.geo!.coords.latitude + ", ",
        GameState.player.geo!.coords.longitude + ""
      ],
      icon: {
        ...NEXT_PROMPT_ICON
      }
    });

    GameState.tapActions.push(() => {
      GameState.panels.push(mapPanel);
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

    GameState.tapActions.push(() => {
      GameState.panels.push(locPanel);
    });

    if (solved) {
      // location is alrady solved
      GameState.tapActions.push(
        () => {
          GameState.panels.push({
            content: ["Back here again..."],
            noDimPrev: true,
            icon: {
              ...NEXT_PROMPT_ICON
            }
          });
        },
        () => {
          GameState.panels.push({
            content: ["I don't see any ghosts around"],
            noDimPrev: true,
            icon: {
              ...NEXT_PROMPT_ICON
            }
          });
        }
      );
    } else if (!location.ghost) {
      GameState.tapActions.push(() => {
        GameState.panels.push({
          content: ["I don't see any ghosts around"],
          noDimPrev: true,
          icon: {
            ...NEXT_PROMPT_ICON
          }
        });
      });
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
          const prev = GameState.panels[GameState.panels.length - 1];
          if (!prev) return; // can't happen...

          const prevLayout = layoutPanel(prev.computedY!, prev, pfont, sscreen);
          let accumulatedY = prevLayout.y + prevLayout.h + prevLayout.padding;

          ghost!.answers.forEach((answer, answerIdx) => {
            const panel: Panel = {
              content: ["\x91 " + answer],
              noDimPrev: true,
              computedX: pfont.measure(" ", SpriteScale.TWO).w,
              computedY: accumulatedY
              // icon: { ...NEXT_PROMPT_ICON }
            };

            const layout = layoutPanel(accumulatedY, panel, pfont, sscreen);
            accumulatedY += layout.h;

            GameState.panels.push(panel);
            GameState.tapZones.push({
              x: layout.x,
              y: layout.y,
              w: layout.w,
              h: layout.h,
              action: zone => {
                // Only one chance!
                GameState.tapZones.length = 0;

                if (answerIdx === ghost!.correct) {
                  // corrrect!
                  // show ghost as resetY panel
                  GameState.panels.push({
                    content: {
                      desc: location.ghost!,
                      img: bgSheet.img,
                      scale: SpriteScale.FOUR
                    },
                    resetY: true,
                    icon: {
                      ...NEXT_PROMPT_ICON
                    }
                  });

                  GameState.tapActions.push(
                    () =>
                      GameState.panels.push({
                        content: ghost!.responses.right,
                        noDimPrev: true,
                        icon: {
                          ...NEXT_PROMPT_ICON
                        }
                      }),
                    () =>
                      GameState.panels.push({
                        content: ["You helped " + ghost!.name + "!"],
                        noDimPrev: true,
                        icon: {
                          ...NEXT_PROMPT_ICON
                        }
                      }),
                    () =>
                      GameState.panels.push({
                        content: ["And you continued on."],
                        noDimPrev: true,
                        icon: {
                          ...NEXT_PROMPT_ICON
                        }
                      }),

                    () => window.location.reload()
                  );

                  // But then what? Tap to refresh?
                } else {
                  // incorrect.
                  // mark as incorrect in game state with timestamp.
                  // save game state.
                  // show ghost response as resetY panel

                  // Temporary.
                  GameState.panels.push({ content: [""], noBorder: true });
                  GameState.panels.push({ content: [""], noBorder: true });
                  GameState.panels.push({ content: [""], noBorder: true });
                  GameState.panels.push({ content: [""], noBorder: true });

                  GameState.panels.push({
                    content: ghost!.responses.wrong,
                    resetY: true,
                    icon: {
                      ...NEXT_PROMPT_ICON
                    }
                  });
                  GameState.tapActions.push(() => window.location.reload());
                }
              }
            });
          });
        }
      );
    }
  } else {
    // couldn't get location, and it didn't throw?
  }
})();

// Prevent zooming and extra scrolling
document.addEventListener(
  "touchmove",
  function(e) {
    e.preventDefault();
  },
  { passive: false }
);
