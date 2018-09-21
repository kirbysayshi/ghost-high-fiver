import { DrawableSprite } from "./common";
import { SpriteScreen, SpriteScale } from "./sprite-screen";
import { PicoFont, FontColor } from "./pico-font-sheet";
import { SpriteSheet } from "./sprite-sheet";
import * as SpritesInfo from "../assets/sprites.json";

export type PanelMeasure = {
  padding: number;
  w: number;
  h: number;
  x: number;
  y: number;
};

export type PanelIcon = {
  x: number;
  y: number;
  flash: number;
  flashInterval: number;
  content?: string;
};

export type Panel = {
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
  drawAction?: (
    p: Panel,
    layout: PanelMeasure,
    sscreen: SpriteScreen,
    time: number
  ) => void;
};

export function layoutPanel(
  accumulatedY: number,
  panel: Panel,
  pfont: PicoFont,
  sscreen: SpriteScreen
): PanelMeasure {
  const PANEL_PADDING = SpritesInfo.chrome_tl.w * SpriteScale.TWO;
  const MIN_PANEL_INNER_HEIGHT = pfont.measure(" ", SpriteScale.TWO).h * 2;

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

  return {
    w: panelW,
    h: panelH,
    padding: PANEL_PADDING,
    x: panelX,
    y: panelY
  };
}

export function drawPanels(
  sscreen: SpriteScreen,
  bgSheet: SpriteSheet,
  pfont: PicoFont,
  panels: Panel[]
) {
  let accumulatedY = 0;

  // const textScale = Math.floor(window.innerWidth / (pfont.measure(" ", SpriteScale.ONE).h / 320));

  // const PANEL_PADDING = SpritesInfo.chrome_tl.w * SpriteScale.TWO;
  const MIN_PANEL_INNER_HEIGHT = pfont.measure(" ", SpriteScale.TWO).h * 2;

  // TODO: add check where if next panel will be off the screen, put it at the top!
  // TODO: if border: false, don't add panel padding!

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    const layout = layoutPanel(accumulatedY, panel, pfont, sscreen);
    const {
      w: panelW,
      h: panelH,
      x: panelX,
      y: panelY,
      padding: PANEL_PADDING
    } = layout;
    const { ctx } = sscreen.dprScreen;

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

      const glitchW = innerW / 5;
      const glitchH = innerH / 2;
      // TODO: making x/y _slightly_ random might make it appear to waver...
      const glitchX = innerX + innerW / 4;
      const glitchY = innerY + innerH / 4;

      sscreen.ghostGlitch(glitchX, glitchY, glitchW, glitchH, 8);
    }

    if (panel.drawAction) {
      panel.drawAction(panel, layout, sscreen, 0);
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
