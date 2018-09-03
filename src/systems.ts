import { ECS, Selector, Entity, ComponentConstructor } from "js13k-ecs";
import {
  Geo,
  GridMap,
  PlayerLocation,
  DrawableImage,
  StaticPos,
  DynamicPos
} from "./components";
import { SpriteScreen } from "./sprite-screen";

// Some ECS helpers for known "singletons".

function firstEntity<T>(selector: Selector<T>): undefined | Entity<T> {
  let found: Entity<T> | undefined = undefined;
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
  constructor(private ecs: ECS, private maxAge = 10000) {}

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
  constructor(private ecs: ECS) {}

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
  private statics = this.ecs.select<DrawableImage & StaticPos>(
    DrawableImage,
    StaticPos
  );
  private dynamics = this.ecs.select<DrawableImage & DynamicPos>(
    DrawableImage,
    DynamicPos
  );

  constructor(private ecs: ECS, private sscreen: SpriteScreen) {}

  draw(interp: number) {
    this.statics.iterate(e => {
      const img = e.get<DrawableImage>(DrawableImage);
      const pos = e.get<StaticPos>(StaticPos);
      if (!img || !pos) return;
      this.sscreen.drawImg(
        img.drawable,
        img.source.x,
        img.source.y,
        img.dims.x,
        img.dims.y,
        pos.cpos.x,
        pos.cpos.y,
        img.scale
      );
    });

    this.dynamics.iterate(e => {
      const img = e.get<DrawableImage>(DrawableImage);
      const pos = e.get<DynamicPos>(DynamicPos);
      if (!img || !pos) return;
      const interpX = pos.ppos.x + ((pos.cpos.x - pos.ppos.x) * interp);
      const interpY = pos.ppos.y + ((pos.cpos.y - pos.ppos.y) * interp);
      this.sscreen.drawImg(
        img.drawable,
        img.source.x,
        img.source.y,
        img.dims.x,
        img.dims.y,
        interpX,
        interpY,
        img.scale
      );
    })
  }
}
