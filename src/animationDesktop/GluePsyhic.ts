import { clamp } from './utils/clamp';


// var height = window.innerHeight;
const size = 400;
// var CIRCLES_COUNT = 30;
var CIRCLES_COUNT = 90;
// var MOVEMENT_DISTANCE = 0;
// var MOVEMENT_ANGLE = MOVEMENT_DISTANCE / 300;
var DUST_SPEED = 3
var DUST_SCATTER = 0//Math.PI;
// var DUST_SPEED = Math.min(3 - MOVEMENT_DISTANCE * 0.83, 3);

// const CANVAS_PADDING = 200;
// const groupSize = 100;
// const randomPos = () => Math.random() * groupSize - groupSize / 2;

// const PARTICLES_IN_GROUP = 15
// const GROUPS = 3
// const FRAMES = 100
// const SPEED = 1
// const MAX_TIME = FRAMES * Math.PI


export interface IParticle extends Point {
  lifeTime: number
  scale: number
  alpha: number
  speed: number
  modX: number | null
  modY: number | null
  pivotX: number
  pivotY: number
  size: number
}

interface ICenter extends Point {
  angle: number
  dustAngle: number
  dustScatter: number
}

export default class GluePsyhic {
  public particles: IParticle[];
  private center: ICenter
  private width: number
  private height: number
  private destination: Point;
  private timer: number;

  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.timer = 0;
    const angle = Math.PI;
    this.center = {
      x: this.width / 2,
      y: this.height / 2,
      angle,
      dustAngle: angle + Math.PI,
      dustScatter: DUST_SCATTER,
    }

    this.particles = Array.from(
      { length: CIRCLES_COUNT },
      (_, index) => this.createParticle(index)
    )

    this.destination = {
      x: this.center.x,
      y: this.center.y,
    };

    const updateMouse = (e: any) => {
      this.destination = {
        x: e.clientX,
        y: this.height - e.clientY,
      }
      this.timer = 0;
    }
    document.addEventListener('mousemove', updateMouse);

    window.addEventListener('resize', this.handleResize.bind(this))
  }

  private randomPos() {
    const randomDistance = Math.random() * size / 2;
    return {
      x: Math.sin(this.center.angle + Math.PI / 2) * randomDistance,
      y: -Math.cos(this.center.angle + Math.PI / 2) * randomDistance,
    }
  }

  private randomMovement(speed: number) {
    const randomAngle = Math.random() * 2 * this.center.dustScatter - this.center.dustScatter;
    return {
      x: Math.sin(this.center.dustAngle + randomAngle) * speed,
      y: -Math.cos(this.center.dustAngle + randomAngle) * speed,
    }
  }

  private createParticle(index: number) {
    const newPos = this.randomPos();
    const particle: IParticle = {
      x: this.center.x + newPos.x,
      y: this.center.y + newPos.y,
      lifeTime: 1 / CIRCLES_COUNT * index,
      speed: Math.random() * DUST_SPEED / 2 + DUST_SPEED / 2,
      modX: null,
      modY: null,
      scale: 1,
      alpha: 1,
      pivotX: 0.5,
      pivotY: 0.5,
      size,
    }
    return particle;
  }

  private handleResize() {
    const newWidth = window.innerWidth
    const newHeight = window.innerHeight
    const newX = this.center.x * newWidth / this.width
    const newY = this.center.y * newHeight / this.height
    this.center.x = newX
    this.center.y = newY

    this.width = newWidth
    this.height = newHeight
  }

  private updateGroupCenter = () => {
    this.timer += 0.02;
    if (this.timer > 5) {
      this.destination.x = Math.sin(-this.timer) * this.width * 0.5 + this.width / 2;
      this.destination.y = -Math.cos(-this.timer) * this.height * 0.5 + this.height / 2;
    }
    let diffX = this.destination.x - this.center.x;
    let diffY = this.destination.y - this.center.y;
    const angle = Math.atan2(diffY, diffX) + Math.PI / 2;
    const distance = Math.hypot(diffX, diffY);
    let newX = 0;
    let newY = 0;
    if(distance > 1) {
      const speed = distance * 0.01;
      newX = Math.sin(angle) * speed;
      newY = -Math.cos(angle) * speed;
      this.center.angle = angle;
      this.center.dustAngle = this.center.angle + Math.PI;
      this.center.x += newX;
      this.center.y += newY;
    }
    return [newX, newY];
  }

  private updateGroupParticles(circle: IParticle, newX: number, newY: number) {
    circle.lifeTime += 0.0028;

    if(circle.lifeTime < 0.2) {
      circle.x += newX;
      circle.y += newY;
      const growFactor = circle.lifeTime * 5;
      circle.scale = growFactor
      circle.alpha = growFactor;
    } else if (circle.lifeTime < 1) {
      const temp = (circle.lifeTime - 0.2) / 0.8;
      const reduceFactor = 1 - Math.tan(temp * 0.785); // Math.tan(0.785) => 0.999
      circle.scale = Math.pow(reduceFactor, 3)


      if(circle.modX === null || circle.modY === null) {
        const movement = this.randomMovement(circle.speed);
        circle.modX = movement.x;
        circle.modY = movement.y;

        const dis = clamp(-0.75, Math.random() * 2 - 1, 0.75);
        const anchorX = Math.sin(this.center.angle + Math.PI / 2) * dis;
        const anchorY = -Math.cos(this.center.angle + Math.PI / 2) * dis;
        circle.x += anchorX * (size * circle.scale) / 2;
        circle.y += anchorY * (size * circle.scale) / 2;
        circle.pivotX = (anchorX + 1) / 2;
        circle.pivotY = (anchorY + 1) / 2;
      } else {
        circle.x += circle.modX;
        circle.y += circle.modY;
        circle.modX *= 0.995;
        circle.modY *= 0.995;
      }
    } else {
      circle.x = this.center.x;
      circle.y = this.center.y;
      circle.modX = null;
      circle.modY = null;
      circle.lifeTime = 0;
      circle.alpha = 0;
      circle.scale = 0;
      circle.pivotX = 0.5;
      circle.pivotY = 0.5;
    }
  }

  public update() {
    const [newX, newY] = this.updateGroupCenter()
    this.particles.forEach(particle => this.updateGroupParticles(particle, newX, newY))
  }
}