import { ScreenDesc, CreateScreenDesc } from "./screen";

export type SpritePixelUnit = number;

export enum SpriteScale {
  ONE = 1,
  TWO,
  THREE,
  FOUR
}

export class SpriteScreen {
  private ratio: number;

  height: SpritePixelUnit;
  backbuffer: ScreenDesc;

  constructor(public screen: ScreenDesc, public width: SpritePixelUnit) {
    this.ratio = width / screen.width;
    this.height = this.ratio * screen.height;

    this.backbuffer = CreateScreenDesc(
      document.createElement("canvas"),
      screen.width,
      screen.height,
      screen.scale
    );
  }

  heightOf(h: number, scale: SpriteScale = SpriteScale.ONE) {
    return this.projectToScreen(h) * Math.floor(scale);
  }

  drawImg(
    img,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: SpritePixelUnit,
    dy: SpritePixelUnit,
    scale = SpriteScale.ONE
  ) {
    this.screen.ctx.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      this.projectToScreen(dx),
      this.projectToScreen(dy),
      this.projectToScreen(sw) * Math.floor(scale),
      this.projectToScreen(sh) * Math.floor(scale)
    );
  }

  projectToScreen(p: SpritePixelUnit) {
    return p / this.ratio;
  }

  ghostGlitch(
    x: SpritePixelUnit,
    y: SpritePixelUnit,
    width: SpritePixelUnit,
    height: SpritePixelUnit
  ) {

    // Not sure why dpr is needed to properly copy.
    // Using a copy to drawFrom _DRASTICALLY_ speeds up Mobile Safari.
    // From 100ms per frame to 1ms...
    this.backbuffer.ctx.drawImage(
      this.screen.cvs,
      0,
      0,
      this.screen.cvs.width,
      this.screen.cvs.height,
      0,
      0,
      this.backbuffer.cvs.width / this.backbuffer.dpr,
      this.backbuffer.cvs.height / this.backbuffer.dpr
    );

    let sx = this.projectToScreen(x);
    let sy = this.projectToScreen(y);
    let sw = this.projectToScreen(width);
    let sh = this.projectToScreen(height);

    const lines = Math.floor(sh / this.projectToScreen(1) / 2);
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

      this.screen.ctx.drawImage(
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
