export interface ScreenDesc {
  width: number;
  height: number;
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;
  dpr: number;
  destroy: () => void;
}

export const CreateScreenDesc = (cvs: HTMLCanvasElement, width: number, height: number, scale: number): ScreenDesc => {
  const ctx = cvs.getContext('2d');

  cvs.style.margin = '0 auto';
  cvs.style.display = 'block';

  const parent = cvs.parentNode && cvs.parentNode.nodeName !== 'BODY'
    ? cvs.parentNode
    : null;

  if (parent) {
    (parent as HTMLElement).style.margin = '0 auto';
    (parent as HTMLElement).style.display = 'block';
  }

  // These can be adjusted to allow for UI / controls if necessary.
  if (width < height) {
    cvs.style.height = '100%';
    if (parent) (parent as HTMLElement).style.height = '100%';
  } else {
    cvs.style.width = '100%';
    if (parent) (parent as HTMLElement).style.width = '100%';
  }

  width *= scale;
  height *= scale;

  // http://www.html5rocks.com/en/tutorials/canvas/hidpi/#toc-3
  const dpr = window.devicePixelRatio || 1;

  cvs.width = width * dpr;
  cvs.height = height * dpr;

  ctx.scale(dpr, dpr);

  // These need to be set each time the canvas resizes to ensure the backing
  // store retains crisp pixels.
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  const screen = {
    width,
    height,
    cvs,
    ctx,
    scale,
    dpr,
    destroy: () => {
      Object.keys(screen).map(k => delete screen[k]);
    }
  };

  return screen;
}