export class DPRScreen {
  public readonly ctx: CanvasRenderingContext2D | null = null;
  public readonly dpr: number;

  static Duplicate(source: DPRScreen) {
    return new DPRScreen(source.width, source.height, source.scale);
  }

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly scale: number,
    public cvs: HTMLCanvasElement = document.createElement("canvas")
  ) {
    const ctx = cvs.getContext("2d");
    this.ctx = ctx;

    if (!ctx) {
      const m = 'Could not initiate canvas context!'
      alert(m);
      throw new Error(m)
      return;
    }

    cvs.style.margin = "0 auto";
    cvs.style.display = "block";

    const parent =
      cvs.parentNode && cvs.parentNode.nodeName !== "BODY"
        ? cvs.parentNode
        : null;

    if (parent) {
      (parent as HTMLElement).style.margin = "0 auto";
      (parent as HTMLElement).style.display = "block";
    }

    // These can be adjusted to allow for UI / controls if necessary.
    if (width < height) {
      cvs.style.height = "100%";
      if (parent) (parent as HTMLElement).style.height = "100%";
    } else {
      cvs.style.width = "100%";
      if (parent) (parent as HTMLElement).style.width = "100%";
    }

    width *= scale;
    height *= scale;

    // http://www.html5rocks.com/en/tutorials/canvas/hidpi/#toc-3
    const dpr = window.devicePixelRatio || 1;
    this.dpr = dpr;

    cvs.width = width * dpr;
    cvs.height = height * dpr;

    ctx.scale(dpr, dpr);

    // These need to be set each time the canvas resizes to ensure the backing
    // store retains crisp pixels.
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
  }

  drawFrom (source: DPRScreen) {
    this.ctx!.drawImage(source.cvs,
      0,
      0,
      source.cvs.width,
      source.cvs.height,
      0,
      0,
      this.cvs.width / this.dpr,
      this.cvs.height / this.dpr
    );
  }
}
