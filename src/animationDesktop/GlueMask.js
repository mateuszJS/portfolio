import PIXI from './PixiCustomBuild';

var width = window.innerWidth - 400;
var height = window.innerHeight;
var CANVAS_PADDING = 100;

const SCALE_OF_CIRCLE = 0.5;
const randomPos = () => (Math.random() * 100 - 50 / 2) * SCALE_OF_CIRCLE;
const randomDirection = (x, y) => {
  const angle = Math.random() * Math.PI * 2,
        modX = Math.sin(angle) * 2,
        modY = -Math.cos(angle) * 2,
        toBoundaryX = modX < 0 ? x / -modX : (width - x - 100) / modX,
        toBoundaryY = modY < 0 ? y / -modY : (height - y - 100) / modY,
        timer = Math.min(toBoundaryX, toBoundaryY);
  return {
    modX,
    modY,
    timer,
  }
};
var CIRCLES_COUNT = 75;//45
var FRAMES = 100;//100
var MOTION = 400; //smaller => faster//400
var MAX_TIME = FRAMES * Math.PI;
var CIRCLES_IN_GROUP = 15;



export default class GlueMask extends PIXI.Sprite {
  constructor(renderer, circleTexture) {
    var renderTexture = new PIXI.RenderTexture.create(width, height);
    super(renderTexture);
    this.renderer = renderer;

    this.center = Array.from(Array(Math.floor(CIRCLES_COUNT - 1 / CIRCLES_IN_GROUP)), (_, index) => {
      const x = Math.random() * (width - CANVAS_PADDING * 2) + CANVAS_PADDING;
      const y = Math.random() * (height - CANVAS_PADDING * 2) + CANVAS_PADDING;
      return {
        x,
        y,
        modX: 0,
        modY: 0,
        destiny: {
          timeTo: 0,
          x: 0,
          y: 0
        },
        speed: 1,//1,
      } 
    });

    this.container = new PIXI.Container();

    this.circles = Array.from(Array(CIRCLES_COUNT), (_, index) => {
      const sprite = new PIXI.Sprite(circleTexture);
      const groupIndex = Math.floor(index / CIRCLES_IN_GROUP);
      sprite.x = this.center[groupIndex].x + randomPos();
      sprite.y = this.center[groupIndex].y + randomPos();
      sprite.anchor.set(0.5);
      sprite.scale.set(0);
      sprite.visible = false;
      this.container.addChild(sprite);
      return {
        sprite,
        timer: Math.round(-MAX_TIME * (index % CIRCLES_IN_GROUP) / CIRCLES_IN_GROUP),
        groupIndex,
      }
    });

    this.allCirclesIsAreVisible = CIRCLES_COUNT;
    this.screenSize = {
      x: CANVAS_PADDING,
      y: CANVAS_PADDING,
      width: width - 2 * CANVAS_PADDING,
      height: height - 2 * CANVAS_PADDING
    };
  }

  renderCircles() {
    if (this.allCirclesIsAreVisible > 0) {
      this.circles.forEach(circle => {
        if(circle.timer === 0) {
          circle.sprite.visible = true;
          circle.sprite.x = this.center[circle.groupIndex].x + randomPos();
          circle.sprite.y = this.center[circle.groupIndex].y + randomPos();
          this.allCirclesIsAreVisible--;
        }
      });
    }
  }

  updateCenters() {
    this.center.forEach((center) => {

      center.destiny.timeTo--;
      center.x += center.modX;
      center.y += center.modY;

      if (center.destiny.timeTo <= 0) {
        const destiny = center.destiny;
        destiny.x = Math.random() * this.screenSize.width + this.screenSize.x;
        destiny.y = Math.random() * this.screenSize.height + this.screenSize.y;
        // console.log(destiny.x, destiny.y);

        const distance = Math.hypot(destiny.x - center.x, destiny.y - center.y);
        center.destiny.timeTo = distance / center.speed;
        console.log(center.destiny.timeTo);
        
        const angle = Math.atan2(destiny.y - center.y, destiny.x - center.x) + Math.PI / 2;
        center.modX = Math.sin(angle) * center.speed;
        center.modY = -Math.cos(angle) * center.speed;
      }

    });
  }

  updateCircles() {
    this.circles.forEach(circle => {
      circle.timer++;
      circle.sprite.scale.set(Math.sin(circle.timer / FRAMES) * SCALE_OF_CIRCLE);
      if(circle.timer >= MAX_TIME) {
        circle.sprite.x = this.center[circle.groupIndex].x + randomPos();
        circle.sprite.y = this.center[circle.groupIndex].y + randomPos();
        circle.timer = 0;
        circle.sprite.alpha = 1;
      } else if(circle.timer >= MAX_TIME * 0.8) {
        circle.sprite.alpha = (MAX_TIME - circle.timer) / (MAX_TIME * 0.2);
      }
    });
  }

  update() {
    this.renderCircles();
    this.updateCenters();
    this.updateCircles();
    
    this.renderer.render(this.container, this.texture);
  }
}