// export class DRPScreenMan {
//   private released: DPRScreen[] = [];
//   private retained: DPRScreen[] = [];

//   constructor(public root: HTMLElement, public readonly width: number) {}

//   retain() {
//     let s = this.released.pop();

//     if (!s) {
//       s = new DPRScreen(this.root, this.width);
//     }

//     this.retained.push(s);
//     return s;
//   }

//   release (s: DPRScreen) {
//     const idx = this.retained.findIndex(retained => retained === s);
//     if (idx) this.retained.splice(idx, 1);
//     this.released.push(s);
//   }
// }

export class DPRScreen {
  public ctx: CanvasRenderingContext2D;
  public dpr: number;

  public cvs: HTMLCanvasElement;
  public height: number;

  static Duplicate(source: DPRScreen) {
    return new DPRScreen(source.root, source.width);
  }

  constructor(public root: HTMLElement, public width: number, public aspectRatio = 1.4, public fillViewport = true) {
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  detach() {
    if (this.cvs.parentNode) {
      this.root.removeChild(this.cvs);
    }

    return this;
  }

  resize() {
    let wasDetached = false;

    if (this.cvs && !this.cvs.parentNode) {
      wasDetached = true;
    }

    if (this.cvs) {
      this.detach();
    }

    const hwRatio = this.aspectRatio;

    const isTallEnough =
      window.innerHeight > window.innerWidth &&
      window.innerHeight / window.innerWidth >= hwRatio;

    if (isTallEnough) {
      this.height = window.innerHeight * (this.width / window.innerWidth);
    } else {
      this.height = this.width * hwRatio;
    }

    const cvs = (this.cvs = document.createElement("canvas"));
    const ctx = cvs.getContext("2d");

    if (!ctx) {
      const m = "Could not initiate canvas context!";
      alert(m);
      throw new Error(m);
    }

    this.ctx = ctx;

    cvs.style.margin = "0 auto";
    cvs.style.display = "block";

    // http://www.html5rocks.com/en/tutorials/canvas/hidpi/#toc-3

    cvs.width = this.width;
    cvs.height = this.height;

    // Must append to document before measuring.
    this.root.appendChild(cvs);
    const rect = cvs.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.dpr = dpr;

    cvs.width = rect.width * dpr;
    cvs.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    if (this.fillViewport) {
      if (isTallEnough) {
        // Assume we're in portrait
        cvs.style.width = "100%";
      } else {
        // probably a more landscape or desktop window
        cvs.style.height = "100%";
      }
    }

    

    const parent =
      cvs.parentNode && cvs.parentNode.nodeName !== "BODY"
        ? cvs.parentNode
        : null;

    if (parent) {
      (parent as HTMLElement).style.margin = "0 auto";
      (parent as HTMLElement).style.display = "block";
    }

    // These need to be set each time the canvas resizes to ensure the backing
    // store retains crisp pixels.
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    if (wasDetached) {
      this.detach();
    }
  }

  drawFrom(source: DPRScreen) {
    this.ctx!.drawImage(
      source.cvs,
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
