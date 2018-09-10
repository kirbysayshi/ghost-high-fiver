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

Spent a while looking for a new font. Might have a contender in M46_LOSTPET. But also M05_DOKOITSU A still looks good when I see it in Font Book. Just not when in the game due to pixel weirdness. Wanted to get state under control before revisiting font rendering.

I _think_ mapping geo lat/long to a square map grid is working! Will have to tweak how far apart the cells are. Right now the entire world is only 160 sq ft... so tiny!

Lisa finished a beach scene (hot dog!) and started on an abandoned warehouse scene!

### 2018-09-03

Brought pocket-physics in to use mostly for vectors/points, and wrote a TypeScript declaration for it. I'm getting better at that.

js13k-ecs holds its systems in a closure, and I actually need access so I can separately call `draw` on render systems. I have two update loops, one for updating game state (10fps), and the other for drawing (60fps). Worked around by holding a separate array of draw-only systems.

Lisa finished the abandoned warehouse scene.

Got font rendering into ECS.

Spent hours experimenting with optimizing the sprites. Tried making a zip with a dummy sprite sheet (Link's Awakening), it was over by 6KB! Terrifying. After playing with various tools (giflossy, optipng) and even trying plain BMP files (they compress via zip very nicely, actually), the winner is [tinypng.com](https://tinypng.com/), which provides an API key and curl support. Currently: `1099 bytes remain`. I don't know if the vision is possible right now.

Started expanding the structure for MapCells to represent ghosts and their problems.

js13k-ecs gives no access to entity creation, so there was no way to "clear" entities between different scenes. Or even to provide a hook. Spent way too much time trying to copy js13k-ecs's js into my local project, and add type annotations via a d.ts file. It is ridiculously hard to get this to work! No amount of `export`(s), `declare`, etc would allow it to be imported properly. This is a huge problem with TypeScript: often there is a library that needs a tweak, and I don't want to convert it to TS and have already written type definitons for it. But it's impossible to make a local copy of the code without converting it to TS! Or at least, I have not yet understood what magical syntax I need to make default export (which lots of libraries use) work with a local type file. Tried to then convert js13k-ecs to TypeScript, which is actually a huge job given how dynamic the API is. Went to bed frustrated: how will I ever finish this and in the size required?

### 2018-09-04

Abandoned a local copy of js13k-ecs, and instead wrote an ECSManager class that wraps it, and if entities are created tracks them.

Then continued and made a SceneManager, which constructs / destroys entities automatically!

Found some bugs in the font rendering (there are still more, it looks so bad) related to double scaling the positions.

Created a FrameAction component/system that allows for arbitrary functions to execute once per frame. Cool, it's like script objects in GameMaker or something.

Also make a Delayed component/system that is basically a relative scheduler. Made a "boot sequence" with it, with some hacky text manipulation for a RAM checksum :D

Feeling good about this again. Scene manager + ECS manager are making things feel possible and experimental again!

### 2018-09-05

Tried to fix font rendering. Don't have a solution, but somewhat understand the problem: scaling up the canvas causes pixels to be irregular. Still investigating. 

### 2018-09-06

Solution to font rendering might be to have an even smaller base resolution. Going with 128px for now. Spent tons of time trying to get viewport ratios correct. Was doing impossible math before I relaized at least some sort of ratio needs to be hard coded.

I may revisit viewport ratios and attempt http://sbcgamesdev.blogspot.com/2015/04/phaser-tutorial-manage-different-screen.html?m=1, but it's probably not worth it. What good is an amazing viewport if there's no game!?

TODO: Not sure SpriteScreen serves a purpose anymore, since it seems like the wrong abstraction for layouts, and just adds confusion to the debugging of pixels.

TODO: Probably still worth trying a pixel font that is not 1px wide, such as Chrono Trigger DS. Hopefully it allows for at least a 256w screen, because 128 is very very tiny. And yet... pico-8 is 128x128. The main problem seems to be the font. Perhaps I should just use the Pico-8 font, which is CC-0.

### 2018-09-08

Tons of time trying to get the Chrono Trigger DS font packed while preserving height. Really time consuming in Pixelmator. After consulting with Lisa, who offered to do the pixel/layer pushing, we decided trying the pico-8 font was a better choice since it would be much less work.

Hours spent trying to get the viewport / scaling / rendering correct today and yesterday. Seems like I can't really win. You either get blurry but consistent pixels, or sharp but stretched pixels. Or you pick a fixed width and height that is the true pixel size for the device, but live with letter/pillar boxing. Pico-8 web builds do this: Pico-8 is 128x128, but they upscale to 256x256 and put black space around the rest of the viewport.

This is what I will do too, at least until I have a better sense of aesthetics.

Lisa cranked out six ghosts! And using TexturePacker, I can get all the sprites into the game _very_ easily and with minimal waste in both the image and offset data.

### 2018-09-09

Converted js13k-ecs to TypeScript to try to work around Parcel bugs: when minifying, it simply would not include the Class. Probably something to do with scope hoisting. Coverting it to TS actually didn't help! Same bug, just different situation. The bug only manifests when minifying via parcel. Using the `--no-minify` flag prevents the bug!

Worked around that bug by minifying / compressing as a separate step using Terser.

Completely out of space. Converting js13k-ecs did have a few benefits, which shows that it takes up a majority of the space. Tried writing my own, but once again got stuck on Function/Constructor types in TS, which seems to be a major weak spot (which, if you read GH Issues online, appears to be a pitfall of many, but more because JS offers no guarantees here).

Solution is probably to avoid Constructor functions and instead use String/Enum tags for component types???

But that is just a tangent to the real problem: out of space. Do I abandon the entire project? Try to start over and fit it into 13k? Or skip the competition and continue with the vision?