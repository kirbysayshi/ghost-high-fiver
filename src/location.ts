import { MapGrid } from "./map-grid";

export async function getUserLocation() {
  const qs = window.location.search
    .slice(1)
    .split("&")
    .reduce((all, pair) => {
      const [key, val] = pair.split("=");
      all.set(key, val);
      return all;
    }, new Map());

  const [lat, lng] = [parseFloat(qs.get("lat")), parseFloat(qs.get("lng"))];

  return new Promise<Position>((resolve, reject) => {
    if (lat && lng) {
      return resolve({
        coords: {
          latitude: lat,
          longitude: lng,
          accuracy: 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      });
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 10000
    });
  });
}

export type Meters = number;

// https://blog.utoctadel.com.ar/2016/05/20/fast-haversine.html
export const haversine = (function() {
  // (mean) radius of Earth (meters)
  const R = 6378137;
  const PI_360 = Math.PI / 360;

  return function dist(
    latA: number,
    lngA: number,
    latB: number,
    lngB: number
  ): Meters {
    const cLat = Math.cos((latA + latB) * PI_360);
    const dLat = (latB - latA) * PI_360;
    const dLon = (lngB - lngA) * PI_360;

    const f = dLat * dLat + cLat * cLat * dLon * dLon;
    const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));

    return (R * c) as Meters;
  };
})();

export type Radians = number;

export function bearing(
  latA: number,
  lngA: number,
  latB: number,
  lngB: number
): Radians {
  var y = Math.sin(lngB - lngA) * Math.cos(latB);
  var x =
    Math.cos(latA) * Math.sin(latB) -
    Math.sin(latA) * Math.cos(latB) * Math.cos(lngB - lngA);
  return Math.atan2(y, x) as Radians;
}

export function mapUserLocationToGrid(grid: typeof MapGrid, geo: Position) {
  // What do the various decimal places of a lat/lng imply in distance?
  // https://gis.stackexchange.com/a/8674
  // Fifth decimal place is roughly up to 1.1m: 0.00000

  const cellWidth = 20; // meters
  const mapWidth = grid.cols * cellWidth;
  const mapHeight = grid.rows * cellWidth;

  // if (!state.geo) return;

  const origin = {
    lng: 0,
    lat: 0
  };

  const dist = haversine(
    origin.lat,
    origin.lng,
    geo.coords.latitude,
    geo.coords.longitude
  );

  const theta = bearing(
    origin.lat,
    origin.lng,
    geo.coords.latitude,
    geo.coords.longitude
  );

  const absX = Math.cos(theta) * dist;
  const absY = Math.sin(theta) * dist;

  const relX = absX % mapWidth;
  const relY = absY % mapHeight;

  const x = relX < 0 ? mapWidth + relX : relX;
  const y = relY < 0 ? mapHeight + relY : relY;

  const col = Math.floor((x / mapWidth) * grid.cols);
  const row = Math.floor((y / mapHeight) * grid.rows);

  const idx = row * grid.cols + col;
  // state.cell = idx;
  return idx;
}
