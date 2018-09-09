import { SpriteSheet } from "./sprite-sheet";
import * as SpritesPath from "../assets/sprites.png";
import * as SpritesInfo from "../assets/sprites.json";
import { SpriteScreen, SpritePixelUnit, SpriteScale } from "./sprite-screen";

const FONT_ORDER =
  " !\"#$%&'()*+,-./0123456789:;<=>?@abcdefghijklmnopqrstuvwxyz[\\]^_`ABCDEFGHIJKLMNOPQRSTUVWXYZ{|}~∆";
const FONT_WIDTH = 4; // + 4px of padding/doublewide
const FONT_HEIGHT = 5;
const FONT_CHRS_PER_ROW = 16;
const FONT_DOUBLE_WIDE_ROWS = 6;

const FONT_DATA = SpritesInfo.pico8_font;

export enum FontColor {
  WHITE,
  BLACK
}

export class PicoFont {
  private white: SpriteSheet;
  private black: SpriteSheet;

  constructor(private sscreen: SpriteScreen) {
    this.white = new SpriteSheet(SpritesPath.default);
    this.black = new SpriteSheet(SpritesPath.default);
  }

  load() {
    return Promise.all([this.white.load(), this.black.load()]).then(() =>
      this.black.colorShift(0, 0, 0, 255)
    );
  }

  measure(text: string, scale: SpriteScale = SpriteScale.ONE) {
    // TODO: if we use double wide glyphs, this will need to be adjusted.
    const w: SpritePixelUnit = text
      .split("")
      .reduce((total, chr) => total + FONT_WIDTH * scale, 0);
    const h: SpritePixelUnit = FONT_HEIGHT * scale;
    return { w, h };
  }

  // heightOf (scale: SpriteScale = SpriteScale.ONE): SpritePixelUnit {
  //   return this.white.img.height * scale;
  //   // return this.sscreen.heightOf(this.white.img.height, scale);
  // }

  drawText(
    x: SpritePixelUnit,
    y: SpritePixelUnit,
    text: string,
    scale = SpriteScale.ONE,
    color = FontColor.BLACK
  ) {
    let screenX = x; //this.sscreen.pts(x);
    let screenY = y; //this.sscreen.pts(y);

    const chrs = text.split("");
    for (let i = 0; i < chrs.length; i++) {
      const c = chrs[i];

      if (c !== " ") {
        const idx = FONT_ORDER.indexOf(c);
        const row = Math.floor(idx / FONT_CHRS_PER_ROW);
        const col = idx % FONT_CHRS_PER_ROW;

        // draw to screen
        const img = color === FontColor.WHITE ? this.white.img : this.black.img;

        this.sscreen.drawImg(
          img,
          FONT_DATA.x + col * (FONT_WIDTH * 2),
          FONT_DATA.y + row * FONT_HEIGHT,
          FONT_WIDTH * 2,
          FONT_HEIGHT,
          screenX,
          screenY,
          scale
        );
      }

      screenX += FONT_WIDTH * scale;
    }
  }
}
