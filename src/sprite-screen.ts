import { ScreenDesc } from "./screen";

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

  constructor(public screen: ScreenDesc, public width: SpritePixelUnit) {
    this.ratio = width / screen.width;
    this.height = this.ratio * screen.height;
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
}
