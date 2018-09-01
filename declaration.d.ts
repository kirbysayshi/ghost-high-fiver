declare module "*.png";

// The official is missing the prefixed versions.
interface CanvasRenderingContext2D {
  imageSmoothingEnabled: boolean;
  webkitImageSmoothingEnabled: boolean;
  msImageSmoothingEnabled: boolean;
  mozImageSmoothingEnabled: boolean;
}