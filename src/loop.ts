// This is basically an adaptation of
// https://github.com/IceCreamYou/MainLoop.js/blob/gh-pages/src/mainloop.js,
// with some removals / shrinking.

// Without a stable game loop, the game will run quite differently on older
// computers or browsers. In one it might be way easier, since it could run
// much slower! This helps to prevent that.

// class GameLoop {

//   private rAF = window.requestAnimationFrame.bind(window);

//   constructor(
//     private drawTime: number,
//     private updateTime: number,
//     private draw: () => void,
//     private update: () => void,
//     private panidAt = 10,
//     private onPanic: () => void,
//     private onFPS: () => void
//   ) {}

//   private accumulate (now: number) {
//     raf = rAF(accumulate);

//     const dt = now - lastLoop;
//     accumulator += dt;
//     lastLoop = now;

//     let shouldDraw = accumulator - drawMs >= 0;
//     let step = Math.floor(accumulator / updateMs);

//     if (step >= panicAt) {
//       accumulator = 0;
//       lastLoop = pnow();
//       onPanic();
//       return;
//     }

//     while (step-- > 0) {
//       accumulator -= updateMs;
//       update(updateMs);
//     }

//     if (shouldDraw) {
//       // pass interpolation factor for smooth animations
//       draw(accumulator / drawMs);
//     }

//     framesThisSecond += 1;

//     if (lastFPS + 1000 <= now) {
//       fps = 0.25 * framesThisSecond + 0.75 * fps;
//       framesThisSecond = 0;
//       lastFPS = now;
//       onFPS(fps);
//     }
//   }
// }

interface GameLoopOptions {
    drawTime: number,
    updateTime: number,
    draw: (interp: number) => void,
    update: (dt: number) => void,
    panicAt?: number,
    onPanic?:  () => void,
    onFPS?: () => void
}

export const GameLoop = ({
  drawTime,
  updateTime,
  draw,
  update,
  panicAt = 10,
  onPanic = () => {},
  onFPS = (fps: number) => {}
}: GameLoopOptions) => {
  const perf = window.performance;

  const drawMs = drawTime;
  const updateMs = updateTime;
  const pnow = perf.now.bind(perf);
  const rAF: typeof window.requestAnimationFrame = window.requestAnimationFrame.bind(window);

  let accumulator = 0;
  let raf: number | null = null;
  let lastLoop = pnow();
  let lastFPS = pnow();
  let framesThisSecond = 0;
  let fps = 0;

  (function accumulate(now) {
    raf = rAF(accumulate);

    const dt = now - lastLoop;
    accumulator += dt;
    lastLoop = now;

    let shouldDraw = accumulator - drawMs >= 0;
    let step = Math.floor(accumulator / updateMs);

    if (step >= panicAt) {
      accumulator = 0;
      lastLoop = pnow();
      onPanic();
      return;
    }

    while (step-- > 0) {
      accumulator -= updateMs;
      update(updateMs);
    }

    if (shouldDraw) {
      // pass interpolation factor for smooth animations
      draw(accumulator / drawMs);
    }

    framesThisSecond += 1;

    if (lastFPS + 1000 <= now) {
      fps = 0.25 * framesThisSecond + 0.75 * fps;
      framesThisSecond = 0;
      lastFPS = now;
      onFPS(fps);
    }
  })(pnow());

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
  };

  return {
    stop
  };
};
