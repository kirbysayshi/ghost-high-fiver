import { GameState } from "./game-state";
import { SpriteScreen } from "./sprite-screen";

const MIN_TAP_INTERVAL_MS = 500;

type InteractionInfo = {
  x: number;
  y: number;
};

const nextTapAction = (info: InteractionInfo) => {
  if (GameState.sincePrevTap > 0) {
    return;
  }

  GameState.sincePrevTap = MIN_TAP_INTERVAL_MS;

  if (GameState.tapZones.length) {
    // These take higher priority.

    const idx = GameState.tapZones.findIndex(
      zone =>
        info.x > zone.x &&
        info.y > zone.y &&
        info.x < zone.x + zone.w &&
        info.y < zone.y + zone.h
    );
    if (idx === -1) return;

    // we have a tap!
    const zone = GameState.tapZones.splice(idx, 1)[0];
    zone.action(zone);

    return;
  }

  const next = GameState.tapActions.shift();
  if (next) {
    next();
  }
};

export function attachHandlers(sscreen: SpriteScreen) {
  // temporary, just to kill rendering on the phone.
  sscreen.dprScreen.cvs.addEventListener("touchstart", e => {
    // dprScreen.ctx!.fillStyle = "red";
    // dprScreen.ctx!.fillRect(0, 0, screen.width, screen.height);
    // gloop.stop();
    const touch = e.touches[0];
    const rect = (touch.target as HTMLCanvasElement).getBoundingClientRect();
    const factor = rect.width / sscreen.dprScreen.width;
    const info: InteractionInfo = {
      x: touch.clientX / factor,
      y: touch.clientY / factor
    };
    nextTapAction(info);
  });

  sscreen.dprScreen.cvs.addEventListener("click", e => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const factor = rect.width / sscreen.dprScreen.width;
    const info: InteractionInfo = {
      x: e.offsetX / factor,
      y: e.offsetY / factor
    };
    nextTapAction(info);
  });
}
