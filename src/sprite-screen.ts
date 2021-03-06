import { DPRScreen, DuplicateDPRScreen } from "./screen";

export type SpritePixelUnit = number;

export enum SpriteScale {
  ONE = 1,
  TWO,
  THREE,
  FOUR
}

export class SpriteScreen {
  private ratio: number;

  // height: SpritePixelUnit;
  backbuffer: DPRScreen;

  constructor(public dprScreen: DPRScreen) {
    // this.ratio = width / dprScreen.width;
    // this.height = this.ratio * dprScreen.height;

    this.backbuffer = DuplicateDPRScreen(dprScreen).detach();
  }

  // heightOf(h: number, scale: SpriteScale = SpriteScale.ONE) {
  //   return this.pts(h) * Math.floor(scale);
  // }

  drawImg(
    img: HTMLCanvasElement | HTMLImageElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: SpritePixelUnit,
    dy: SpritePixelUnit,
    scale = SpriteScale.ONE
  ) {
    this.dprScreen.ctx!.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      dx,// this.pts(dx),
      dy,// this.pts(dy),
      sw * Math.floor(scale),// this.pts(sw) * Math.floor(scale),
      sh * Math.floor(scale),// this.pts(sh) * Math.floor(scale),
    );
  }

  // projectToScreen
  // pts(p: SpritePixelUnit) {
  //   return p / this.ratio;
  // }

  ghostGlitch(
    x: SpritePixelUnit,
    y: SpritePixelUnit,
    width: SpritePixelUnit,
    height: SpritePixelUnit,
    lineCount = height / 2,
  ) {

    // Not sure why dpr is needed to properly copy.
    // Using a copy to drawFrom _DRASTICALLY_ speeds up Mobile Safari.
    // From 100ms per frame to 1ms...
    this.backbuffer.drawFrom(this.dprScreen);

    let sx = x;//this.pts(x);
    let sy = y;//this.pts(y);
    let sw = width;//this.pts(width);
    let sh = height;//this.pts(height);

    const lines = Math.floor(lineCount); //Math.floor(sh / this.pts(1) / 2);
    const incr = sh / lines;

    for (let i = 0; i < lines; i++) {
      const lineHeight = Math.floor(incr);
      const lineWidth = Math.floor(Math.random() * sw) || 1;
      const lineStart = Math.floor(Math.random() * (sw - lineWidth));
      const lineDest = Math.floor(Math.random() * lineWidth - lineWidth);

      const ssx = Math.floor(sx + lineStart);
      const ssy = Math.floor(sy + i * lineHeight);

      const ddx = Math.floor(sx + lineDest);
      const ddy = Math.floor(sy + i * lineHeight);

      this.dprScreen.ctx!.drawImage(
        this.backbuffer.cvs,
        ssx,
        ssy,
        lineWidth,
        lineHeight,

        ddx,
        ddy,
        lineWidth,
        lineHeight
      );
    }
  }
}
