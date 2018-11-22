import PIXI from './PixiCustomBuild';

const segmentsNumber = 20;
const textureWidth = 543;
const ropeLength = textureWidth / segmentsNumber;

const update = function() {
  this.count += this.speed;
  for (var i = 0; i < this.points.length; i++) {
    const x = Math.sin(this.count + (i * this.speed)) * this.distance;
    const y = -Math.cos(this.count + (i * this.speed)) * this.distance / 2.5;
    this.points[i].x = x;
    this.points[i].y = y;
    // this.points[i].y = Math.sin((i * 0.5) + this.count) * 30;
    // this.points[i].x = i * ropeLength + Math.cos((i * 0.3) + this.count) * 20;
  }
  // const scale = Math.cos(this.count + 1) / 2 + 0.5;
  // this.scale.set(1 - scale * 0.8);
  const alpha = Math.cos(this.count + 1) / 2 + 0.5;
  this.alpha = 1 - alpha * 0.8;
}

const createFlare = (texture, x, y) => {
  const points = [];

  for (let i = 0; i < segmentsNumber; i++) {
    points.push(new PIXI.Point(i * ropeLength, 0));
  }

  const strip = new PIXI.Rope(texture, points);


  // const snakeContainer = new PIXI.Container();
  strip.x = x;// + textureWidth / 2;
  strip.y = y;

  strip.scale.set(0.5);

  // snakeContainer.addChild(strip);
  strip.count = Math.random() * 5;
  strip.points = points;
  strip.distance = 250 + Math.random() * 1600;
  strip.speed = Math.random() / 20 + 0.05;
  strip.tint = '0x'+Math.floor(strip.distance / 115.625).toString(16) + '00000';
  strip.update = update.bind(strip)
  return strip;
}

export default createFlare;
