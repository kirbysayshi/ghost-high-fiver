export class SpriteSheet {
  public img: HTMLImageElement;

  constructor(private path: string) {}

  async colorShift (r: number, g: number, b: number, a: number) {
    const c = document.createElement('canvas');
    c.width = this.img.width;
    c.height = this.img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(this.img, 0, 0);
    const imgData = ctx.getImageData(0, 0, c.width, c.height);
    const data = imgData.data;
    for (var i = 0; i < data.length; i+=4) {
      data[i+0] = r; //| data[i+0];
      data[i+1] = g; //| data[i+1];
      data[i+2] = b; //| data[i+2];
      data[i+3] = data[i+3] !== 0 ? a : 0; //| data[i+3];
    }
    ctx.putImageData(imgData, 0, 0);
    return new Promise((resolve, reject) => {
      this.img.onload = resolve;
      this.img.onerror = reject;
      this.img.src = c.toDataURL();
    })
  }

  load() {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement("img") as HTMLImageElement;
      img.onload = () => resolve(img);
      img.onerror = err => reject(err);
      img.src = this.path;
    }).then(img => {
      this.img = img;
    });
  }
}
