parcelRequire = (function (init) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;
  var modules = {};

  function localRequire(name, jumped) {
    if (name in modules) {
      return modules[name];
    }

    // if we cannot find the module within our internal map or
    // cache jump to the current global require ie. the last bundle
    // that was added to the page.
    var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
    if (!jumped && currentRequire) {
      return currentRequire(name, true);
    }

    // If there are other bundles on this page the require from the
    // previous one is saved to 'previousRequire'. Repeat this as
    // many times as there are bundles until the module is found or
    // we exhaust the require chain.
    if (previousRequire) {
      return previousRequire(name, true);
    }

    // Try the node require function if it exists.
    if (nodeRequire && typeof name === 'string') {
      return nodeRequire(name);
    }

    var err = new Error('Cannot find module \'' + name + '\'');
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }

  localRequire.register = function register(id, exports) {
    modules[id] = exports;
  };

  modules = init(localRequire);
  localRequire.modules = modules;
  return localRequire;
})(function (require) {
// ASSET: node_modules/idb-keyval/dist/idb-keyval.mjs
var $frz$exports = {};

class $frz$export$Store {
  constructor(dbName = 'keyval-store', storeName = 'keyval') {
    this.storeName = storeName;
    this._dbp = new Promise((resolve, reject) => {
      const openreq = indexedDB.open(dbName, 1);

      openreq.onerror = () => reject(openreq.error);

      openreq.onsuccess = () => resolve(openreq.result); // First time setup: create an empty object store


      openreq.onupgradeneeded = () => {
        openreq.result.createObjectStore(storeName);
      };
    });
  }

  _withIDBStore(type, callback) {
    return this._dbp.then(db => new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, type);

      transaction.oncomplete = () => resolve();

      transaction.onabort = transaction.onerror = () => reject(transaction.error);

      callback(transaction.objectStore(this.storeName));
    }));
  }

}

let $frz$var$store;

function $frz$var$getDefaultStore() {
  if (!$frz$var$store) $frz$var$store = new $frz$export$Store();
  return $frz$var$store;
}

function $frz$export$get(key, store = $frz$var$getDefaultStore()) {
  let req;
  return store._withIDBStore('readonly', store => {
    req = store.get(key);
  }).then(() => req.result);
}

function $frz$export$set(key, value, store = $frz$var$getDefaultStore()) {
  return store._withIDBStore('readwrite', store => {
    store.put(value, key);
  });
}

function $frz$export$del(key, store = $frz$var$getDefaultStore()) {
  return store._withIDBStore('readwrite', store => {
    store.delete(key);
  });
}

function $frz$export$clear(store = $frz$var$getDefaultStore()) {
  return store._withIDBStore('readwrite', store => {
    store.clear();
  });
}

function $frz$export$keys(store = $frz$var$getDefaultStore()) {
  const keys = [];
  return store._withIDBStore('readonly', store => {
    // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
    // And openKeyCursor isn't supported by Safari.
    (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
      if (!this.result) return;
      keys.push(this.result.key);
      this.result.continue();
    };
  }).then(() => keys);
}

$frz$exports.keys = $frz$export$keys;
$frz$exports.clear = $frz$export$clear;
$frz$exports.del = $frz$export$del;
$frz$exports.set = $frz$export$set;
$frz$exports.get = $frz$export$get;
$frz$exports.Store = $frz$export$Store;
// ASSET: src/screen.ts
var $d04M$exports = {}; // export class DRPScreenMan {
//   private released: DPRScreen[] = [];
//   private retained: DPRScreen[] = [];

Object.defineProperty($d04M$exports, "__esModule", {
  value: true
}); //   constructor(public root: HTMLElement, public readonly width: number) {}
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
// Some sort of Parcel bug, where it didn't realize internal DPRScreen
// was same symbol as external DPRScreen.

function $d04M$var$DuplicateDPRScreen(source) {
  return new $d04M$var$DPRScreen(source.root, source.width);
}

var $d04M$export$DuplicateDPRScreen = $d04M$var$DuplicateDPRScreen;
$d04M$exports.DuplicateDPRScreen = $d04M$export$DuplicateDPRScreen;

class $d04M$var$DPRScreen {
  constructor(root, width, aspectRatio = 1.4, fillViewport = true) {
    this.root = root;
    this.width = width;
    this.aspectRatio = aspectRatio;
    this.fillViewport = fillViewport;
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
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    const isTallEnough = innerHeight > innerWidth && innerHeight / innerWidth >= hwRatio;

    if (isTallEnough) {
      this.height = innerHeight * (this.width / innerWidth);
    } else {
      this.height = this.width * hwRatio;
    }

    const cvs = this.cvs = document.createElement("canvas");
    const ctx = cvs.getContext("2d");

    if (!ctx) {
      const m = "Could not initiate canvas context!";
      alert(m);
      throw new Error(m);
    }

    this.ctx = ctx;
    cvs.style.margin = "0 auto";
    cvs.style.display = "block"; // http://www.html5rocks.com/en/tutorials/canvas/hidpi/#toc-3

    cvs.width = this.width;
    cvs.height = this.height; // Must append to document before measuring.

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

    const parent = cvs.parentNode && cvs.parentNode.nodeName !== "BODY" ? cvs.parentNode : null;

    if (parent) {
      parent.style.margin = "0 auto";
      parent.style.display = "block";
    } // These need to be set each time the canvas resizes to ensure the backing
    // store retains crisp pixels.


    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    if (wasDetached) {
      this.detach();
    }
  }

  drawFrom(source) {
    this.ctx.drawImage(source.cvs, 0, 0, source.cvs.width, source.cvs.height, 0, 0, this.cvs.width / this.dpr, this.cvs.height / this.dpr);
  }

}

var $d04M$export$DPRScreen = $d04M$var$DPRScreen;
$d04M$exports.DPRScreen = $d04M$export$DPRScreen;
// ASSET: assets/sprites.png
var $P0I$exports = {};
$P0I$exports = "sprites.d74a2cd0.png";
// ASSET: assets/sprites.json
var $CRbR$exports = {};
$CRbR$exports = {
  "ghost_bat": {
    "x": 0,
    "y": 0,
    "w": 32,
    "h": 32
  },
  "ghost_bun": {
    "x": 32,
    "y": 0,
    "w": 32,
    "h": 32
  },
  "ghost_cat": {
    "x": 64,
    "y": 0,
    "w": 32,
    "h": 32
  },
  "ghost_hungry": {
    "x": 96,
    "y": 0,
    "w": 32,
    "h": 32
  },
  "ghost_ink": {
    "x": 0,
    "y": 32,
    "w": 32,
    "h": 32
  },
  "ghost_petrified": {
    "x": 32,
    "y": 32,
    "w": 32,
    "h": 32
  },
  "ghost_plant": {
    "x": 64,
    "y": 32,
    "w": 32,
    "h": 32
  },
  "loc_abandoned": {
    "x": 0,
    "y": 64,
    "w": 128,
    "h": 64
  },
  "loc_pier": {
    "x": 0,
    "y": 128,
    "w": 128,
    "h": 64
  },
  "loc_street": {
    "x": 0,
    "y": 192,
    "w": 128,
    "h": 64
  },
  "loc_tarot": {
    "x": 0,
    "y": 256,
    "w": 128,
    "h": 64
  },
  "pico8_font": {
    "x": 0,
    "y": 320,
    "w": 128,
    "h": 40
  }
};
// ASSET: src/sprite-sheet.ts
var $bFN$exports = {};

var $bFN$var$__awaiter = $bFN$exports && $bFN$exports.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty($bFN$exports, "__esModule", {
  value: true
});

class $bFN$var$SpriteSheet {
  constructor(path) {
    this.path = path;
  }

  colorShift(r, g, b, a) {
    return $bFN$var$__awaiter(this, void 0, void 0, function* () {
      const c = document.createElement('canvas');
      c.width = this.img.width;
      c.height = this.img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(this.img, 0, 0);
      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const data = imgData.data;

      for (var i = 0; i < data.length; i += 4) {
        data[i + 0] = r; //| data[i+0];

        data[i + 1] = g; //| data[i+1];

        data[i + 2] = b; //| data[i+2];

        data[i + 3] = data[i + 3] !== 0 ? a : 0; //| data[i+3];
      }

      ctx.putImageData(imgData, 0, 0);
      return new Promise((resolve, reject) => {
        this.img.onload = resolve;
        this.img.onerror = reject;
        this.img.src = c.toDataURL();
      });
    });
  }

  load() {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");

      img.onload = () => resolve(img);

      img.onerror = err => reject(err);

      img.src = this.path;
    }).then(img => {
      this.img = img;
    });
  }

}

var $bFN$export$SpriteSheet = $bFN$var$SpriteSheet;
$bFN$exports.SpriteSheet = $bFN$export$SpriteSheet;
// ASSET: src/sprite-screen.ts
var $D8Y$export$SpriteScale,
    $D8Y$exports = {};
Object.defineProperty($D8Y$exports, "__esModule", {
  value: true
});
var $D8Y$var$SpriteScale;

(function (SpriteScale) {
  SpriteScale[SpriteScale["ONE"] = 1] = "ONE";
  SpriteScale[SpriteScale["TWO"] = 2] = "TWO";
  SpriteScale[SpriteScale["THREE"] = 3] = "THREE";
  SpriteScale[SpriteScale["FOUR"] = 4] = "FOUR";
})($D8Y$var$SpriteScale = $D8Y$exports.SpriteScale || ($D8Y$export$SpriteScale = {}, $D8Y$exports.SpriteScale = $D8Y$export$SpriteScale));

class $D8Y$var$SpriteScreen {
  constructor(dprScreen) {
    // this.ratio = width / dprScreen.width;
    // this.height = this.ratio * dprScreen.height;
    this.dprScreen = dprScreen;
    this.backbuffer = $d04M$export$DuplicateDPRScreen(dprScreen).detach();
  } // heightOf(h: number, scale: SpriteScale = SpriteScale.ONE) {
  //   return this.pts(h) * Math.floor(scale);
  // }


  drawImg(img, sx, sy, sw, sh, dx, dy, scale = $D8Y$var$SpriteScale.ONE) {
    this.dprScreen.ctx.drawImage(img, sx, sy, sw, sh, dx, // this.pts(dx),
    dy, // this.pts(dy),
    sw * Math.floor(scale), // this.pts(sw) * Math.floor(scale),
    sh * Math.floor(scale));
  } // projectToScreen
  // pts(p: SpritePixelUnit) {
  //   return p / this.ratio;
  // }


  ghostGlitch(x, y, width, height) {
    // Not sure why dpr is needed to properly copy.
    // Using a copy to drawFrom _DRASTICALLY_ speeds up Mobile Safari.
    // From 100ms per frame to 1ms...
    this.backbuffer.drawFrom(this.dprScreen);
    let sx = x; //this.pts(x);

    let sy = y; //this.pts(y);

    let sw = width; //this.pts(width);

    let sh = height; //this.pts(height);

    const lines = Math.floor(sh / 2); //Math.floor(sh / this.pts(1) / 2);

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
      this.dprScreen.ctx.drawImage(this.backbuffer.cvs, ssx, ssy, lineWidth, lineHeight, ddx, ddy, lineWidth, lineHeight);
    }
  }

}

var $D8Y$export$SpriteScreen = $D8Y$var$SpriteScreen;
$D8Y$exports.SpriteScreen = $D8Y$export$SpriteScreen;
// ASSET: src/pico-font-sheet.ts
var $dx0K$export$FontColor,
    $dx0K$exports = {};

var $dx0K$var$__importStar = $dx0K$exports && $dx0K$exports.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};

Object.defineProperty($dx0K$exports, "__esModule", {
  value: true
});
const $dx0K$var$SpritesPath = $dx0K$var$__importStar($P0I$exports);
const $dx0K$var$SpritesInfo = $dx0K$var$__importStar($CRbR$exports);
const $dx0K$var$FONT_ORDER = " !\"#$%&'()*+,-./0123456789:;<=>?@abcdefghijklmnopqrstuvwxyz[\\]^_`ABCDEFGHIJKLMNOPQRSTUVWXYZ{|}~∆";
const $dx0K$var$FONT_WIDTH = 4; // + 4px of padding/doublewide

const $dx0K$var$FONT_HEIGHT = 5;
const $dx0K$var$FONT_CHRS_PER_ROW = 16;
const $dx0K$var$FONT_DATA = $dx0K$var$SpritesInfo.pico8_font;
var $dx0K$var$FontColor;

(function (FontColor) {
  FontColor[FontColor["WHITE"] = 0] = "WHITE";
  FontColor[FontColor["BLACK"] = 1] = "BLACK";
})($dx0K$var$FontColor = $dx0K$export$FontColor || ($dx0K$export$FontColor = {}, $dx0K$exports.FontColor = $dx0K$export$FontColor));

class $dx0K$var$PicoFont {
  constructor(sscreen) {
    this.sscreen = sscreen;
    this.white = new $bFN$exports.SpriteSheet($dx0K$var$SpritesPath.default);
    this.black = new $bFN$exports.SpriteSheet($dx0K$var$SpritesPath.default);
  }

  load() {
    return Promise.all([this.white.load(), this.black.load()]).then(() => this.black.colorShift(0, 0, 0, 255));
  }

  measure(text, scale = $D8Y$exports.SpriteScale.ONE) {
    // TODO: if we use double wide glyphs, this will need to be adjusted.
    const w = text.split("").reduce((total, chr) => total + $dx0K$var$FONT_WIDTH * scale, 0);
    const h = $dx0K$var$FONT_HEIGHT * scale;
    return {
      w,
      h
    };
  } // heightOf (scale: SpriteScale = SpriteScale.ONE): SpritePixelUnit {
  //   return this.white.img.height * scale;
  //   // return this.sscreen.heightOf(this.white.img.height, scale);
  // }


  drawText(x, y, text, scale = $D8Y$exports.SpriteScale.ONE, color = $dx0K$var$FontColor.BLACK) {
    let screenX = x; //this.sscreen.pts(x);

    let screenY = y; //this.sscreen.pts(y);

    const chrs = text.split("");

    for (let i = 0; i < chrs.length; i++) {
      const c = chrs[i];

      if (c !== " ") {
        const idx = $dx0K$var$FONT_ORDER.indexOf(c);
        const row = Math.floor(idx / $dx0K$var$FONT_CHRS_PER_ROW);
        const col = idx % $dx0K$var$FONT_CHRS_PER_ROW; // draw to screen

        const img = color === $dx0K$var$FontColor.WHITE ? this.white.img : this.black.img;
        this.sscreen.drawImg(img, $dx0K$var$FONT_DATA.x + col * ($dx0K$var$FONT_WIDTH * 2), $dx0K$var$FONT_DATA.y + row * $dx0K$var$FONT_HEIGHT, $dx0K$var$FONT_WIDTH * 2, $dx0K$var$FONT_HEIGHT, screenX, screenY, scale);
      }

      screenX += $dx0K$var$FONT_WIDTH * scale;
    }
  }

}

var $dx0K$export$PicoFont = $dx0K$var$PicoFont;
$dx0K$exports.PicoFont = $dx0K$export$PicoFont;
// ASSET: src/index.ts
var $B6d$exports = {};

var $B6d$var$__awaiter = $B6d$exports && $B6d$exports.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var $B6d$var$__importStar = $B6d$exports && $B6d$exports.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};

Object.defineProperty($B6d$exports, "__esModule", {
  value: true
});
const $B6d$var$SpritesPath = $B6d$var$__importStar($P0I$exports);
const $B6d$var$SpritesInfo = $B6d$var$__importStar($CRbR$exports);
const $B6d$var$Ghosts = new Map();
$B6d$var$Ghosts.set($B6d$var$SpritesInfo.ghost_bun, {
  problem: ["I'm so fluffy and cuddly,", "no one will ever be scared of me!"],
  answers: ["Hug it", "Love it", "Yell at it", "Back slowly away from it"],
  correct: 3,
  responses: {
    right: ["I scared you!?", "AMAZING WILL YOU BE MY FRIEND?"],
    wrong: ["Ugh please don't touch me."]
  }
});
const $B6d$var$MapGrid = {
  cols: 1,
  rows: 1,
  cells: [{
    ghost: $B6d$var$SpritesInfo.ghost_bun,
    location: $B6d$var$SpritesInfo.loc_pier
  }]
};
const $B6d$var$GameState = {
  panels: [],
  player: {
    geo: null,
    cell: null,
    saveData: {
      solvedLocations: []
    }
  }
};

function $B6d$var$getUserLocation() {
  return $B6d$var$__awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000
      });
    });
  });
}

function $B6d$var$mapUserLocationToGrid(grid, state) {
  const cellWidth = 20; // feet? which means the entire world is only 160 ft sq...

  const mapWidth = grid.cols * cellWidth;
  const mapHeight = grid.rows * cellWidth;
  if (!state.geo) return; // https://stackoverflow.com/a/2911469/169491

  const x = mapWidth * (180 + state.geo.coords.longitude) / 360;
  const y = mapHeight * (90 - state.geo.coords.latitude) / 180;
  const col = Math.floor(x / mapWidth * grid.cols);
  const row = Math.floor(y / mapHeight * grid.rows);
  const idx = row * grid.cols + col;
  state.cell = idx;
}

function $B6d$var$drawPanels(sscreen, pfont, panels) {
  let accumulatedY = 0;
  const PANEL_PADDING = pfont.measure(" ", $D8Y$exports.SpriteScale.ONE).h;
  const MIN_PANEL_INNER_HEIGHT = pfont.measure(" ", $D8Y$exports.SpriteScale.TWO).h * 2; // TODO: add check where if next panel will be off the screen, put it at the top!
  // TODO: if border: false, don't add panel padding!

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    const dimensions = Array.isArray(panel.content) ? panel.content.map(line => pfont.measure(line, $D8Y$exports.SpriteScale.TWO)).reduce((total, dims) => {
      total.w = Math.max(dims.w, total.w);
      total.h += dims.h;
      return total;
    }, {
      w: 0,
      h: 0
    }) : {
      w: panel.content.desc.w * panel.content.scale,
      h: panel.content.desc.h * panel.content.scale
    }; // Draw panel

    const {
      ctx
    } = sscreen.dprScreen;
    const panelW = Math.min(dimensions.w + PANEL_PADDING * 2, sscreen.dprScreen.width);
    const panelH = Math.min(Math.max(dimensions.h, MIN_PANEL_INNER_HEIGHT) + PANEL_PADDING * 2, sscreen.dprScreen.height);
    let panelX;

    if (panel.computedX === undefined) {
      panelX = Math.floor((sscreen.dprScreen.width - panelW) * Math.random());
      panel.computedX = panelX;
    } else {
      panelX = panel.computedX;
    }

    let panelY;

    if (panel.computedY === undefined) {
      panelY = Math.max(accumulatedY - Math.floor(panelH / 2 * Math.random()), 0);
      panel.computedY = panelY;
    } else {
      panelY = panel.computedY;
    } // Make sure previous prompts always are a little faded.


    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, sscreen.dprScreen.width, sscreen.dprScreen.height); // ctx.fillStyle = "grey";

    ctx.fillStyle = "blue";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.fillStyle = "blue";
    ctx.fillRect(panelX + PANEL_PADDING, panelY + PANEL_PADDING, panelW - 1 - PANEL_PADDING * 2, panelH - PANEL_PADDING * 2);

    if (Array.isArray(panel.content)) {
      // draw the text!
      let lineY = 0;
      panel.content.forEach(line => {
        pfont.drawText(panelX + PANEL_PADDING, panelY + lineY + PANEL_PADDING, line, $D8Y$exports.SpriteScale.TWO, $dx0K$export$FontColor.WHITE);
        lineY += pfont.measure(line, $D8Y$exports.SpriteScale.TWO).h;
      });
    } else {
      // just draw!
      const {
        desc,
        scale
      } = panel.content;
      sscreen.drawImg(panel.content.img, desc.x, desc.y, desc.w, desc.h, panelX + PANEL_PADDING, panelY + PANEL_PADDING, scale);
    }

    accumulatedY = panelY + panelH;
  }
}

function $B6d$var$delay(action, delay = 300) {
  return $B6d$var$__awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        action();
        resolve();
      }, delay);
    });
  });
}

const $B6d$var$PLAYER_DATA_KEY = "lgsavedata";

function $B6d$var$loadPlayerData(state) {
  return $B6d$var$__awaiter(this, void 0, void 0, function* () {
    const data = yield $frz$exports.get($B6d$var$PLAYER_DATA_KEY);
    if (!data) return;
    state.player.saveData = data;
  });
}

(function () {
  return $B6d$var$__awaiter(this, void 0, void 0, function* () {
    // Load sprites
    // Load inventory data from idb
    // Merge with static data
    // Await geolocation
    // If new ghost, display ghost effect + background + message + prompts
    // if not new ghost, show generic empty message
    // Save inventory to idb.
    const dprScreen = new $d04M$export$DPRScreen(document.body, window.innerWidth);
    const sscreen = new $D8Y$exports.SpriteScreen(dprScreen);
    const bgSheet = new $bFN$exports.SpriteSheet($B6d$var$SpritesPath.default);
    const pfont = new $dx0K$export$PicoFont(sscreen);
    let updateCount = 0;
    const gloop = {
      running: true,
      stop: () => {
        gloop.running = false;
      },
      anim: () => {
        if (!gloop.running) return;
        sscreen.dprScreen.ctx.fillStyle = "black";
        sscreen.dprScreen.ctx.fillRect(0, 0, sscreen.dprScreen.width, sscreen.dprScreen.height);
        $B6d$var$drawPanels(sscreen, pfont, $B6d$var$GameState.panels);
        requestAnimationFrame(gloop.anim);
      }
    };
    gloop.anim();
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        gloop.stop();
      }
    });
    yield Promise.all([bgSheet.load(), pfont.load()]);
    $B6d$var$GameState.panels.push({
      content: ["Loaded immaterial photograms!"]
    });
    $B6d$var$GameState.panels.push({
      content: ["Retrieving past lives..."]
    });
    yield $B6d$var$loadPlayerData($B6d$var$GameState);
    console.log("loaded save data", $B6d$var$GameState.player.saveData);
    $B6d$var$GameState.panels.push({
      content: ["OK!"]
    });
    $B6d$var$GameState.panels.push({
      content: ["Acquiring spectral...", "triangulation!"]
    });
    let loc; // TODO: need to provide some user feedback while this is locating,
    // especially if it is slow and going to time out...
    // TODO: why does it time out!?!?!

    try {
      loc = yield $B6d$var$getUserLocation();
    } catch (e) {
      $B6d$var$GameState.panels.push({
        content: ["Failed to acquire! Sorry."]
      });
      return;
    }

    $B6d$var$GameState.player.geo = loc;
    $B6d$var$mapUserLocationToGrid($B6d$var$MapGrid, $B6d$var$GameState.player);

    if ($B6d$var$GameState.player.cell !== null) {
      $B6d$var$GameState.panels.push({
        content: ["Acquired!"]
      }); // Always show Location panel...

      const location = $B6d$var$MapGrid.cells[$B6d$var$GameState.player.cell];
      yield $B6d$var$delay(() => $B6d$var$GameState.panels.push({
        content: {
          desc: location.location,
          img: bgSheet.img,
          scale: $D8Y$exports.SpriteScale.TWO
        },
        // Always help this be at the top...
        computedY: 0
      }), 1000);

      if ($B6d$var$GameState.player.saveData.solvedLocations.find(idx => idx === $B6d$var$GameState.player.cell)) {// location is alrady solved
      } else {
        // show prompt!
        const ghost = $B6d$var$Ghosts.get(location.ghost);
        console.log(ghost);
      }
    } else {} // couldn't get location, and it didn't throw?
    // // TODO: these "global" components should probably avoid the ECSMan so they
    // // persist forever. A SUPER HACK, but better than having to re-init/reload
    // // them every time?
    // ecsman.createPersistent().add(
    //   new GridMap(
    //     [
    //       {
    //         kind: MapCellKind.TAROT,
    //         ghost: 0,
    //         problem: {
    //           prompt: "",
    //           options: [{ text: "only option" }],
    //           correct: 0
    //         }
    //       },
    //       {
    //         kind: MapCellKind.PIER,
    //         ghost: 0,
    //         problem: {
    //           prompt: "",
    //           options: [{ text: "only option" }],
    //           correct: 0
    //         }
    //       },
    //       {
    //         kind: MapCellKind.ABANDONED_WAREHOUSE,
    //         ghost: 0,
    //         problem: {
    //           prompt: "",
    //           options: [{ text: "only option" }],
    //           correct: 0
    //         }
    //       },
    //       {
    //         kind: MapCellKind.TAROT,
    //         ghost: 0,
    //         problem: {
    //           prompt: "",
    //           options: [{ text: "only option" }],
    //           correct: 0
    //         }
    //       },
    //       {
    //         kind: MapCellKind.TAROT,
    //         ghost: 0,
    //         problem: {
    //           prompt: "",
    //           options: [{ text: "only option" }],
    //           correct: 0
    //         }
    //       },
    //       {
    //         kind: MapCellKind.TAROT,
    //         ghost: 0,
    //         problem: {
    //           prompt: "",
    //           options: [{ text: "only option" }],
    //           correct: 0
    //         }
    //       },
    //       {
    //         kind: MapCellKind.TAROT,
    //         ghost: 0,
    //         problem: {
    //           prompt: "",
    //           options: [{ text: "only option" }],
    //           correct: 0
    //         }
    //       },
    //       {
    //         kind: MapCellKind.TAROT,
    //         ghost: 0,
    //         problem: {
    //           prompt: "",
    //           options: [{ text: "only option" }],
    //           correct: 0
    //         }
    //       }
    //     ],
    //     8
    //   )
    // );
    // const geo = ecsman.create();
    // geo.add(new Geo());
    // setTimeout(() => gloop.stop(), 100);
    // temporary, just to kill rendering on the phone.


    sscreen.dprScreen.cvs.addEventListener("touchstart", e => {
      dprScreen.ctx.fillStyle = "red";
      dprScreen.ctx.fillRect(0, 0, screen.width, screen.height);
      gloop.stop();
    }); // let route = await get('route');
    // if (route === undefined) {
    //   route = Routes.SPLASHHELP;
    //   await set('route', route);
    // }
    // console.log('route', route);
    // dispatch?
    // Or just... document.getElementById(route).style.display = 'block' ??? lol.
  });
})(); // Prevent zooming and extra scrolling


document.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, {
  passive: false
});

if (typeof exports === "object" && typeof module !== "undefined") {
  // CommonJS
  module.exports = $B6d$exports;
} else if (typeof define === "function" && define.amd) {
  // RequireJS
  define(function () {
    return $B6d$exports;
  });
}

return {
  "9B6d": $B6d$exports
};
});