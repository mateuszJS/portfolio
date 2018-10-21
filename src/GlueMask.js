import PIXI from './PixiCustomBuild';

const circleCount = 120;

const gridWidth = 20;
const gridHeight = 20;

const circleData = new Float32Array(circleCount * 2);
const circlevData = new Float32Array(circleCount * 2);
const grid = [];

const r = 16;

export default class GlueMask extends PIXI.Sprite {
  constructor(renderer, circleTexture, dimensions) {
    const renderTexture = new PIXI.RenderTexture.create(dimensions.width, dimensions.height);
    super(renderTexture);
    this.renderer = renderer;

    this.container = new PIXI.Container();

    const createSprite = (x, y) => {
      const sprite = new PIXI.Sprite(circleTexture);
      sprite.anchor.set(0.5);
      sprite.width = 120;
      sprite.height = 120;
      sprite.x = x;
      sprite.y = y;
      sprite.tint = 0xFF0000;
      this.container.addChild(sprite);
      return sprite;
    }
    
    this.circles = [];
    this.init(dimensions.width, dimensions.height, createSprite);
  }


  detectCircleCollision (x1, y1, x2, y2) {
    // before circle intersection, check bounding box intersection
    if (x1 + r < x2 - r || x1 - r > x2 + r ||
        y1 + r < y2 - r || y1 - r > y2 + r)
      return false;
    // circle intersection when distance between centers < radius total
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) <= r + r;
  }

  init (displayWidth, displayHeight, createSprite) {
    const spaceBetween = 2;
    const numberCirclesInRow = displayWidth / (r + spaceBetween);
    for (let i = 0; i < circleData.length; i += 2) {

      const x = (i % numberCirclesInRow) * (r + spaceBetween);
      const y = displayHeight - Math.floor(i / numberCirclesInRow) * (r + spaceBetween);

      
      circleData[i] = x;
      circleData[i + 1] = y;

      circlevData[i] = (Math.random() - 0.5) * 0.5;
      circlevData[i + 1] = (Math.random() - 0.5) * 0.5;
      this.circles.push(createSprite(x, y));
    }
  }


  timeStep (displayWidth, displayHeight, gravityAngle) {
    const modX = Math.sin(gravityAngle) * 0.1;
    const modY = -Math.cos(gravityAngle) * 0.1;
    // initialize the grid
    for (let p = 0; p < gridWidth; p++) {
      const col = grid[p] = [];
      for (let q = 0; q < gridHeight; q++) {
        col[q] = [];
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
      if (displayWidth - (xi + r) < 0 && vxi > 0 || xi - r < 0 && vxi < 0) {
        vxi = -vxi * 0.7;
      }
      if (displayHeight - (yi + r) < 0 && vyi > 0 || yi - r < 0 && vyi < 0) {
        vyi = -vyi * 0.7;
      }

      circleData[i] = xi + vxi;
      circleData[i + 1] = yi + vyi;
      circlevData[i] = vxi;
      circlevData[i + 1] = vyi;

      // detect grid cell range for each circle
      let leftCol = Math.floor((xi - r) / displayWidth * gridWidth);
      let rightCol = Math.floor((xi + r) / displayWidth * gridWidth);
      let topRow = Math.floor((yi - r) / displayHeight * gridHeight);
      let bottomRow = Math.floor((yi + r) / displayHeight * gridHeight);

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
              const cvi = (2 * r * cuj) / 32; // 2 * r
              const cvj = (2 * r * cui) / 32;

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

  update(dimensions, gravityAngle) {
    this.timeStep(dimensions.width, dimensions.height, gravityAngle);
    for(let i = 0; i < circleData.length; i+= 2) {
      const index = i / 2;
      this.circles[index].x = circleData[i];
      this.circles[index].y = circleData[i + 1];
    }
    this.renderer.render(this.container, this.texture);
  }
}
