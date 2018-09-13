import { SpriteSheet } from "./sprite-sheet";
import * as SpritesPath from "../assets/sprites.png";
import * as SpritesInfo from "../assets/sprites.json";
import { SpriteScreen, SpritePixelUnit, SpriteScale } from "./sprite-screen";

// LOL PICO8 IS UNICODE-ish OF COURSE!!!

// https://www.lexaloffle.com/bbs/?tid=3739
// https://www.lexaloffle.com/bbs/files/13845/glyphs.png
// Special Symbols are Unicode >= 128 (decimal)
// e.g. const str = '\x80'
// In hex:
// 80 BLOCK
// 81 SEMI-BLOCK
// 82 ALIEN
// 83 DOWN BUTTON
// 84 QUASI-BLOCK
// 85 SHURIKEN
// 86 SHINY BALL
// 87 HEART
// 88 EYE OF SAURON
// 89 HUMAN
// 8a HOUSE
// 8b LEFT BUTTON
// 8c FACE
// 8d MUSIC NOTE
// 8e O BUTTON
// 8f DIAMOND
// 90 FOUR DOTS
// 91 RIGHT BUTTON
// 92 STAR
// 93 HOURGLASS
// 94 UP BUTTON
// 95 DOWN ARROWS
// 96 TRIANGLE WAVE
// 97 X BUTTON
// 98 HORIZONTAL LINES
// 99 VERTICAL LINES

const FONT_WIDTH = 4; // + 4px of padding/doublewide
const FONT_HEIGHT = 5;
const FONT_CHRS_PER_ROW = 16;
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

    // const chrs = text.split("");
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);

      let w = FONT_WIDTH;

      // Pico8 sheet has upper case and lower case reversed
      const idx =
        (code >= 65 && code <= 90
          ? code + 32
          : code >= 97 && code <= 122
            ? code - 32
            : code) - 32;

      if (code >= 128) {
        // double wide
        w = FONT_WIDTH * 2;
      }

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

      screenX += w * scale;
    }
  }
}
