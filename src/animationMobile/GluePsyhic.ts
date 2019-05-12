const circleCount = 170;

const gridWidth = 20;
const gridHeight = 20;

const circleData = new Float32Array(circleCount * 2);
const circlevData = new Float32Array(circleCount * 2);
const grid: number[][][] = [];

// const CANVAS_PADDING = 200;
// const groupSize = 100;
// const randomPos = () => Math.random() * groupSize - groupSize / 2;

// const PARTICLES_IN_GROUP = 15
// const GROUPS = 3
// const FRAMES = 100
// const SPEED = 1
// const MAX_TIME = FRAMES * Math.PI

export interface IParticle extends Point {
  tint: vec3;
}

const allTints: vec3[] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
];

export default class GluePsyhic {
  private width: number
  private height: number
  private radius: number;
  private radius2x: number;
  public circles: IParticle[]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.circles = []
    this.radius = Math.round(this.width / 25.7)
    this.radius2x = 2 * this.radius

    const spaceBetween = Math.round(this.radius / 7)
    const numberCirclesInRow = this.width / (this.radius + spaceBetween);
    for (let i = 0; i < circleData.length; i += 2) {

      const x = (i % numberCirclesInRow) * (this.radius + spaceBetween);
      const y = Math.floor(i / numberCirclesInRow) * (this.radius + spaceBetween) + this.radius + spaceBetween;
      
      circleData[i] = x;
      circleData[i + 1] = y;

      circlevData[i] = (Math.random() - 0.5) * 0.5;
      circlevData[i + 1] = (Math.random() - 0.5) * 0.5;
      const tintIndex = Math.random() > 0.65 ? 1 + Math.floor(Math.random() * 2) : 0
      const particle: IParticle = {
        x,
        y,
        tint: allTints[tintIndex]
      }
      this.circles.push(particle);
    }
  }

  private detectCircleCollision (x1: number, y1: number, x2: number, y2: number) {
    // before circle intersection, check bounding box intersection
    if (x1 + this.radius < x2 - this.radius || x1 - this.radius > x2 + this.radius ||
        y1 + this.radius < y2 - this.radius || y1 - this.radius > y2 + this.radius)
      return false;
    // circle intersection when distance between centers < radius total
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) <= this.radius + this.radius;
  }

  timeStep (gravityAngle: number) {
    const modX = Math.sin(gravityAngle) * 0.1;
    const modY = -Math.cos(gravityAngle) * 0.1;
    // initialize the grid
    for (let p = 0; p < gridWidth; p++) {
      const col = grid[p] = [];
      for (let q = 0; q < gridHeight; q++) {
        col[q] = [] as never // HACK: ugly fix...
      }
    }

    for (let i = 0; i < circleData.length; i += 2) {
      const xi = circleData[i];
      const yi = circleData[i + 1];

      let vxi = circlevData[i];
      let vyi = circlevData[i + 1];

      // gravity
      vxi += modX;
      vyi += modY;

      // window bounds
      if (this.width - (xi + this.radius) < 0 && vxi > 0 || xi - this.radius < 0 && vxi < 0) {
        vxi = -vxi * 0.7;
      }
      if (this.height - (yi + this.radius) < 0 && vyi > 0 || yi - this.radius < 0 && vyi < 0) {
        vyi = -vyi * 0.7;
      }

      circleData[i] = xi + vxi;
      circleData[i + 1] = yi + vyi;
      circlevData[i] = vxi;
      circlevData[i + 1] = vyi;

      // detect grid cell range for each circle
      let leftCol = Math.floor((xi - this.radius) / this.width * gridWidth);
      let rightCol = Math.floor((xi + this.radius) / this.width * gridWidth);
      let topRow = Math.floor((yi - this.radius) / this.height * gridHeight);
      let bottomRow = Math.floor((yi + this.radius) / this.height * gridHeight);

      if (leftCol < 0)
        leftCol = 0;
      if (rightCol >= gridWidth)
        rightCol = gridWidth - 1;
      if (topRow < 0)
        topRow = 0;
      if (bottomRow >= gridHeight)
        bottomRow = gridHeight - 1;

      // assign each circle to its grid cell range
      for (let p = leftCol; p <= rightCol; p++) {
        const col = grid[p];
        for (let q = topRow; q <= bottomRow; q++) {
          col[q].push(i);
        }
      }
    }

    // Collision detection
    for (let p = 0; p < gridWidth; p++) {
      const col = grid[p];
      for (let q = 0; q < gridHeight; q++) {
        const cell = col[q];

        // loop through each circle in each grid cell
        for (let k = 0; k < cell.length; k++) {
          const i = cell[k];
          // const iv = i / 3 * 2;

          const xi = circleData[i];
          const yi = circleData[i + 1];

          let vxi = circlevData[i];
          let vyi = circlevData[i + 1];

          // check for collisions with every other circle in the grid cell
          for (let l = k + 1; l < cell.length; l++) {
            const j = cell[l];
            // const jv = j / 3 * 2;

            const xj = circleData[j];
            const yj = circleData[j + 1];

            if (this.detectCircleCollision(xi, yi, xj, yj)) {
              const vxj = circlevData[j];
              const vyj = circlevData[j + 1];

              // calculate collision unit vector
              let collDx = xj - xi;
              let collDy = yj - yi;
              const collLen = Math.sqrt(collDx * collDx + collDy * collDy);
              collDx = collDx / collLen;
              collDy = collDy / collLen;

              // dot product of unit collision vector with velocity vector gives
              // 1d collision velocities before collision along collisionv vector
              const cui = collDx * vxi + collDy * vyi;
              const cuj = collDx * vxj + collDy * vyj;

              // skip collision if moving away from eachother
              if (cui - cuj <= 0)
                continue;

              // (https://en.wikipedia.org/wiki/Elastic_collision)
              const cvi = (2 * this.radius * cuj) / this.radius2x; // 2 * r
              const cvj = (2 * this.radius * cui) / this.radius2x;

              const dcvi = cvi - cui;
              const dcvj = cvj - cuj;

              circlevData[i] = vxi + collDx * dcvi;
              circlevData[i + 1] = vyi + collDy * dcvi;
              circlevData[j] = vxj + collDx * dcvj;
              circlevData[j + 1] = vyj + collDy * dcvj;
            }
          }
        }
      }
    }
  }

  public update(gravityAngle: number) {
    this.timeStep(gravityAngle);
    for(let i = 0; i < circleData.length; i+= 2) {
      const index = i / 2;
      this.circles[index].x = circleData[i];
      this.circles[index].y = circleData[i + 1];
    }
  }
}