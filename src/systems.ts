import {
  Geo,
  GridMap,
  PlayerLocation,
  DrawableImage,
  DynamicPos,
  DrawableText,
  Delayed,
  FrameAction,
  DrawAction
} from "./components";
import { SpriteScreen } from "./sprite-screen";
import { ECSMan, Selector, ComponentConstructor, TypedEntity } from "./ecsman";
import { PicoFont } from "./pico-font-sheet";

// Some ECS helpers for known "singletons".

function firstEntity<T>(selector: Selector<T>): undefined | TypedEntity<T> {
  let found: TypedEntity<T> | undefined = undefined;
  selector.iterate(e => {
    if (!found) found = e;
  });
  return found;
}

function firstCmp<T>(
  selector: Selector<T>,
  Cmp: ComponentConstructor
): T | undefined {
  const e = firstEntity(selector);
  if (!e) return undefined;
  return e.get<T>(Cmp);
}

export class GeoSystem {
  selector = this.ecs.select(Geo);
  constructor(private ecs: ECSMan, private maxAge = 10000) {}

  private geoSuccess = (pos: Position) => {
    this.selector.iterate(e => {
      const g = e.get<Geo>(Geo);
      if (!g) return;
      g.pending = false;
      g.pos = pos;

      // console.log(g);
    });
  };

  private geoError = (err: PositionError) => {
    this.selector.iterate(e => {
      const g = e.get<Geo>(Geo);
      if (!g) return;
      g.pending = false;
      g.error = err;
    });
  };

  private requestLocation() {
    this.selector.iterate(e => {
      const g = e.get<Geo>(Geo);
      if (!g) return;
      g.pending = true;
    });

    navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: this.maxAge
    });
  }

  update(dt: number) {
    this.selector.iterate(e => {
      const g = e.get<Geo>(Geo);
      if (!g) return;
      if (g.pos && g.pos.timestamp >= Date.now() - this.maxAge) {
        return;
      } else if (
        !g.pending &&
        (!g.pos || g.pos.timestamp < Date.now() - this.maxAge)
      ) {
        this.requestLocation();
      }
    });
  }
}

export class LocateSystem {
  geos = this.ecs.select<Geo>(Geo);
  maps = this.ecs.select<GridMap>(GridMap);
  plocs = this.ecs.select<PlayerLocation>(PlayerLocation);
  constructor(private ecs: ECSMan) {}

  update(dt: number) {
    const g = firstCmp<Geo>(this.geos, Geo);
    if (g && g.pos) {
      // map to a grid cell, and set ploc
      const m = firstCmp<GridMap>(this.maps, GridMap);

      if (!m) return;

      // TODO: after Geo exists, this will execute each time. Probably
      // should also be checking how old geo is?

      // 1 degree of lat/long is approx 69 miles (111km).
      // Apparently 1/60th of a degree (a minute) is approximately 1 nautical mile!

      // GPS is only accurate to around 3-6 meters... so maybe each grid cell
      // should be...

      const cellWidth = 20; // feet? which means the entire world is only 160 ft sq...
      const mapWidth = m.cols * cellWidth;
      const mapHeight = m.rows * cellWidth;

      // https://stackoverflow.com/a/2911469/169491
      const x = (mapWidth * (180 + g.pos.coords.longitude)) / 360;
      const y = (mapHeight * (90 - g.pos.coords.latitude)) / 180;

      const col = Math.floor((x / mapWidth) * m.cols);
      const row = Math.floor((y / mapHeight) * m.rows);

      const idx = m.colRowIndex(col, row);

      let loc = firstCmp<PlayerLocation>(this.plocs, PlayerLocation);

      if (!loc) {
        this.ecs.create().add(new PlayerLocation(idx));
      } else {
        loc.index = idx;
      }
    }
  }
}

export class DrawableSystem {
  private dynamics = this.ecs.select<DrawableImage & DynamicPos>(
    DrawableImage,
    DynamicPos
  );

  constructor(private ecs: ECSMan, private sscreen: SpriteScreen) {}

  draw(interp: number) {
    this.dynamics.iterate(e => {
      const img = e.get<DrawableImage>(DrawableImage);
      const pos = e.get<DynamicPos>(DynamicPos);
      if (!img || !pos) return;
      const interpX = pos.ppos.x + (pos.cpos.x - pos.ppos.x) * interp;
      const interpY = pos.ppos.y + (pos.cpos.y - pos.ppos.y) * interp;
      this.sscreen.drawImg(
        img.drawable,
        img.desc.x,
        img.desc.y,
        img.desc.w,
        img.desc.h,
        interpX,
        interpY,
        img.scale
      );
    });
  }
}

export class DrawableTextSystem {
  private dynamics = this.ecs.select<DrawableText & DynamicPos>(
    DrawableText,
    DynamicPos
  );
  constructor(private ecs: ECSMan, private fontSheet: PicoFont) {}

  draw(interp: number) {
    this.dynamics.iterate(e => {
      const txt = e.get<DrawableText>(DrawableText);
      const pos = e.get<DynamicPos>(DynamicPos);
      if (!txt || !pos) return;
      const interpX = pos.ppos.x + (pos.cpos.x - pos.ppos.x) * interp;
      const interpY = pos.ppos.y + (pos.cpos.y - pos.ppos.y) * interp;
      this.fontSheet.drawText(interpX, interpY, txt.text, txt.scale, txt.color);
    });
  }
}

export class DelayedSystem {
  private entities = this.ecs.select<Delayed>(Delayed);
  constructor(private ecs: ECSMan) {}

  update (dt: number) {
    this.entities.iterate(e => {
      const del = e.get<Delayed>(Delayed);
      if (del) {
        del.elapsed += dt;
        if (del.elapsed > del.until) {
          del.action(this.ecs);
          if (Object.keys(e.components).length === 1) {
            e.eject();
          } else {
            // Not sure how this case could come up, but whatever.
            e.remove(Delayed);
          }
        }
      }
    })
  }
}

export class FrameActionSystem {
  private entities = this.ecs.select<FrameAction>(FrameAction);
  constructor(private ecs: ECSMan) {}

  update (dt: number) {
    this.entities.iterate(e => {
      const cmp = e.get<FrameAction>(FrameAction);
      if (cmp) {
        cmp.action(this.ecs, e);
      }
    })
  }
}

export class DrawActionSystem {
  private entities = this.ecs.select<DrawAction>(DrawAction);
  constructor(private ecs: ECSMan, private sscreen: SpriteScreen) {}

  draw (iterp: number) {
    this.entities.iterate(e => {
      const cmp = e.get<DrawAction>(DrawAction);
      if (cmp) {
        cmp.action(this.ecs, this.sscreen, e);
      }
    })
  }
}