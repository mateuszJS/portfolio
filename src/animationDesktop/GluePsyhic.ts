import { clamp } from './utils/clamp';


// var height = window.innerHeight;
const size = 400;
// var CIRCLES_COUNT = 30;
var CIRCLES_COUNT = 90;
// var MOVEMENT_DISTANCE = 0;
// var MOVEMENT_ANGLE = MOVEMENT_DISTANCE / 300;
var DUST_SPEED = 3
var DUST_SCATTER = Math.PI;
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
  rotation: number
  _x: number
  _y: number
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
  private mouse: Point;
  // private timer: number;

  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    // this.timer = 0;
    const angle = Math.PI;
    this.center = {
      x: this.width * 0.7,
      y: this.height * 0.5,
      angle,
      dustAngle: angle + Math.PI,
      dustScatter: DUST_SCATTER,
    }

    this.particles = Array.from(
      { length: CIRCLES_COUNT },
      (_, index) => this.createParticle(index)
    )

    this.mouse = {
      x: this.center.x,
      y: this.center.y,
    };

    const updateMouse = (e: any) => {
      this.mouse = {
        x: e.clientX,
        y: this.height - e.clientY,
      }
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
      _x: this.center.x + newPos.x,
      _y: this.center.y + newPos.y,
      lifeTime: 1 / CIRCLES_COUNT * index,
      speed: Math.random() * DUST_SPEED / 2 + DUST_SPEED / 2,
      modX: null,
      modY: null,
      scale: 1,
      alpha: 1,
      pivotX: 0.5,
      pivotY: 0.5,
      size,
      rotation: 0,
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

  private updateGroupParticles(circle: IParticle) {
    circle.lifeTime += 0.0028;

    if(circle.lifeTime < 0.2) {
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
        // circle.x = this.center.x
        // circle.y = this.center.y;
        
        // clamp
        const maxRange = 0.75;
        const dis = clamp(-maxRange, Math.random() * 2 - 1, maxRange);
        const anchorX = Math.sin(this.center.angle + Math.PI / 2) * dis;
        const anchorY = -Math.cos(this.center.angle + Math.PI / 2) * dis;
        circle._x += anchorX * (size * circle.scale) / 2;
        circle._y += anchorY * (size * circle.scale) / 2;
        circle.pivotX = (anchorX + 1) / 2;
        circle.pivotY = (anchorY + 1) / 2;
      } else {
        // const angle = Math.atan2(circle.y - this.destination.y, circle.x - this.destination.x) - Math.PI / 2;
        // const modX = Math.sin(angle);
        // const modY = -Math.cos(angle);
        // if (Math.abs(circle.modX) + Math.abs(circle.modY) < 4) {
        //   circle.modX += modX
        //   circle.modY += modY
        // }
        // const angle = Math.atan2(circle.modY, circle.modX) - Math.PI / 2;// + 0.1
        // circle.modX = Math.sin(angle) * circle.speed
        // circle.modY = -Math.cos(angle) * circle.speed
        // console.log(angle, circle.modX, circle.modY);

        circle._x += circle.modX;
        circle._y += circle.modY;
        circle.modX *= 0.995;
        circle.modY *= 0.995;
      }
    } else {
      circle._x = this.center.x;
      circle._y = this.center.y;
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
    const angle = Math.atan2(this.mouse.y - this.center.y, this.mouse.x - this.center.x) - Math.PI / 2;
    this.particles.forEach(particle =>  {
      this.updateGroupParticles(particle)
      const distance = Math.hypot(particle._x - this.center.x, particle._y - this.center.y)
      particle.x = particle._x; + Math.sin(angle) * (distance / 5)
      particle.y = particle._y; - Math.cos(angle) * (distance / 5)
      4
    })
  }
}