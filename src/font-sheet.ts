import { SpriteSheet } from "./sprite-sheet";
import * as FontPath from "../assets/m05-short.png";
import { SpriteScreen, SpritePixelUnit, SpriteScale } from "./sprite-screen";

const fontChrOrder =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?&.'-○✗❤★♪:█,";
const fontChrWidths: {[key: string]: string} = {
  2: "ilI!.':,",
  3: "t1",
  4: "abcdefghjknopqrsuvxyzL?-",
  5: "ABCDEFGHJKNOPRSUZ023456789& █",
  6: "mwMQTVWXY○✗❤★♪"
};

const chrToWidth = Object.keys(fontChrWidths).reduce(
  (all, width) => {
    fontChrWidths[width].split("").forEach(l => (all[l] = parseInt(width, 10)));
    return all;
  },
  {} as { [key: string]: number }
);

export enum FontColor {
  WHITE,
  BLACK
}

export class FontSheet {
  private white: SpriteSheet;
  private black: SpriteSheet;

  constructor(private spriteScreen: SpriteScreen) {
    this.white = new SpriteSheet(FontPath.default);
    this.black = new SpriteSheet(FontPath.default);
  }

  load() {
    return Promise.all([this.white.load(), this.black.load()]).then(() =>
      this.black.colorShift(0, 0, 0, 255)
    );
  }

  heightOf (scale: SpriteScale = SpriteScale.ONE) {
    return this.spriteScreen.heightOf(this.white.img.height, scale);
  }

  drawText(
    x: SpritePixelUnit,
    y: SpritePixelUnit,
    text: string,
    scale = SpriteScale.ONE,
    color = FontColor.BLACK
  ) {
    let screenX = this.spriteScreen.projectToScreen(x);
    let screenY = this.spriteScreen.projectToScreen(y);

    // scale *= 320 / 128;

    const chrs = text.split("");
    for (let i = 0; i < chrs.length; i++) {
      const c = chrs[i];

      // determine where in the sheet
      let sheetX = 0;
      for (let j = 0; j < fontChrOrder.length; j++) {
        const orderChr = fontChrOrder[j];
        if (c === orderChr) break;
        sheetX += chrToWidth[orderChr];
      }

      if (c !== " ") {
        // draw to screen
        const img =
          color === FontColor.WHITE ? this.white.img : this.black.img;

        this.spriteScreen.drawImg(
          img,
          sheetX,
          0,
          chrToWidth[c] - 1, // why -1???? Without it lines appear.
          img.height,
          screenX,
          screenY,
          scale
        );

        // this.spriteScreen.screen.ctx.drawImage(
        //   img,
        //   sheetX,
        //   0,
        //   chrToWidth[c],
        //   img.height,
        //   (screenX),
        //   (screenY),
        //   (this.spriteScreen.projectToScreen(chrToWidth[c] * scale)),
        //   (this.spriteScreen.projectToScreen(img.height * scale)),
        // );
      }

      // screenX += this.spriteScreen.projectToScreen(chrToWidth[c] * scale);
      // screenX += this.spriteScreen.projectToScreen(chrToWidth[c]);
      screenX += chrToWidth[c] * scale;
    }
  }
}
