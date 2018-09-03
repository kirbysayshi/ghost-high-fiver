ghost high fiver
================


To dev:
-------

```
$ npm install
$ npm run dev
```

To make the final zip (and see how close you are to 13k limit):

```
$ npm run zip
```

To deploy to gh-pages branch:

```
$ npm run deploy
```


Dev Log
-------

### 2018-08-19 Sunday

Initial brainstorm. Perhaps something about walking around in the real world, finding ghosts, high-fiving them, and then sharing what you named them with other players via QR codes? And it all works offline.

### 2018-08-23 Thursday

Brainstormed more ideas. Perhaps fixed grid, fixed set of cells / experiences that modulos depending on lat/long? More story-focused than sharing focused.

### 2018-08-28

Pixel dimension exploration with Lisa. 64x64 for backgrounds, 32x32 for each ghost. Investigated State management via TS + Redux pattern, more to learn about how to make that type-safe (mostly).

### 2018-08-29

Investigated how to scale / size the canvas, if we go with canvas at all. Mobile web games are so discouraging. Browser chrome everywhere, and very difficult to make something pixel-accurate. Games online seem to take one of the following approaches:

- completely square, ignoring any actual screen size
- fixed-aspect ratio (like Night Shift Barista)
- Somewhat fluid, like flappylives.com, where there is built-in dead space (in this case, between the "ground" and the UI is a fluid amount of underground to make the entire screen be filled). Basically, lowest common denominator screen size: make sure everything fits, and then expand backgrounds to fill the empty voids.

### 3018-08-31

Sprite sheet loading, plus some code to draw with a fixed width, and potentially fluid height. Started working on importing font and text math.

Got fonts working, and preventing scrolling / zooming on mobile browsers (hopefully). Added Device Pixel Ratio scaling to make for crisper pixels on HDPI devices, and I can definitely see the difference on my phone. Layout is going to be very tricky, since you need to compute the final result of the previous element when stacking.

May need to change the pixel font. It's pretty harsh, even though it's the same I used for Night Shift Barista.

Lisa worked on a Tarot card location, using 128 x 64.

### 2018-09-01

Spent some time getting Google Sync and Backup working. Super slow to get started.

Got the preliminary Tarot card location in, and added Ghost Noise / Snow effect! Had to figure out some tricky Device Pixel Ratio math for Mobile Safari, since drawing from the same canvas was extremely slow (probably a mutex issue underneath?).

Took a look at remaining budget: at first was only ~6k, but once I mangled some props it dropped. Took a while to understand that Parcel uses Terser under the hood, and that it could be configured with a `.terserrc` (or `.uglifyrc`).

Game loop!

State is so hard. I'm trying too hard to come up with something elegant. Tried several Redux / React derivative approaches, and they're all probably more complicated than needed.

### 2018-09-02

More state madness. Eventually went with a ECS / CES framework, [js13k-ecs](https://github.com/kutuluk/js13k-ecs), but spent way more time than I would have liked adding type annotations. Still not perfect, but at least the type checker complains at me!

I _think_ mapping geo lat/long to a square map grid is working! Will have to tweak how far apart the cells are. Right now the entire world is only 160 sq ft... so tiny!

Lisa finished a beach scene (hot dog!) and started on an abandoned warehouse scene!