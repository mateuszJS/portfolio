import PIXI from './PixiCustomBuild';
import GlueMask from './GlueMask';
import GlueFilter from './GlueFilter';
import spaceBackgroundImage from './assets/space.png';
import circleMaskImage from './assets/circleSM30newInline.png';
import leftBoundaryImage from './assets/leftBoundaryInline.png';
import floatButtonImage from './assets/floatButton.png';
import clamp from './utils/clamp';

// initial positon is vertical
const dimensions = {
  width: Math.min(screen.width, screen.height),
  height: Math.max(screen.width, screen.height),
};

let deviceOrientation = window.orientation;
const initialGamma = deviceOrientation;
let temp_angle = initialGamma * Math.PI / 180 + Math.PI;
let allowCalcPhycis = true;

//Pixi main config-------------------------------------
var canvasNode = document.querySelector('.animation-block');
canvasNode.width = dimensions.width;
canvasNode.height = dimensions.height;
var app = new PIXI.Application(dimensions.width, dimensions.height, { transparent: true, view: canvasNode, }, );

PIXI.Loader.shared
  .add([
    spaceBackgroundImage,
    circleMaskImage,
    leftBoundaryImage,
    floatButtonImage,
    ])
  .load(setup);

let bg, glueMask, floatButton = {
  sprite: null,
  distance: dimensions.height * 0.2,
  currDistance: dimensions.height * 0.2,
}
function setup() {
  glueMask = new GlueMask(
    app.renderer,
    PIXI.Loader.shared.resources[circleMaskImage].texture,
    dimensions,
  );

  bg = new PIXI.Sprite(PIXI.Loader.shared.resources[spaceBackgroundImage].texture);
  app.stage.addChild(bg, glueMask);
  app.stage.interactiveChildren = false; // performance

  var glueFilter = new GlueFilter(glueMask);
  // glueFilter.filterArea = app.screen; // not necessary, but I prefer to do it.
  // bg.filterArea = app.screen;
  // glueFilter.padding = 0;
  bg.filters = [glueFilter];
  bg.width = dimensions.width;
  bg.height = dimensions.height;


  floatButton.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources[floatButtonImage].texture);
  floatButton.sprite.width = 180;
  floatButton.sprite.height = 50;
  floatButton.sprite.anchor.set(0.5);
  floatButton.sprite.x = dimensions.width * 0.5;
  floatButton.sprite.y = dimensions.height * 0.7;
  app.stage.addChild(floatButton.sprite);
  
  app.stage.pivot.set(dimensions.width / 2, dimensions.height / 2);
  app.stage.interactiveChildren = false; // performance

  //when user it on main page but script with animation is still not loaded
  if (window.runAnimation && window.runAnimation.router.currentAddress.index === 2) {//main page
    window.runAnimation = undefined;
    window.toggleRFA();
  }

  const handleResizeAndOrientation = () => {
    deviceOrientation = window.orientation
    const width = screen.width;
    const height = screen.height;

    app.stage.position.set(width / 2, height / 2);
    app.stage.rotation = -deviceOrientation * Math.PI / 180;
    
    glueFilter.matrix.setTransform(
      0.5,
      0.5,
      0.5,
      0.5,
      1,
      1,
      -app.stage.rotation,
      0,
      0
    );
    app.renderer.resize(width, height);
  }

  window.addEventListener('resize', () => {
    handleResizeAndOrientation();
  });

  window.addEventListener('orientationchange', () => {
    allowCalcPhycis = false
    setTimeout(() => allowCalcPhycis = true, 500);
    handleResizeAndOrientation(); // avoid unnecessary call
  });

  handleResizeAndOrientation();

  function handleOrientation(event) {
    const absolute = Math.round(event.absolute);
    const alpha    = Math.round(event.alpha);
    const beta     = Math.round(event.beta);
    const gamma    = Math.round(event.gamma);
    document.querySelector('#sensor-test').innerHTML = `a: ${absolute}, alpha: ${alpha}, b: ${beta}, g:${gamma}, o:${window.orientation}`;
    if (window.orientation == 90) {
      temp_angle = -(beta * 1.5 + gamma);
    } else if (window.orientation == -90) {
      temp_angle = -(gamma - beta * 1.5);
    } else {
      temp_angle = -gamma;
    }
    temp_angle = temp_angle  * Math.PI / 180 + Math.PI;
    const x = Math.sin(temp_angle) * (0.7 * dimensions.width / 2);
    const y = -Math.cos(temp_angle) * (0.7 * dimensions.height / 2);
    floatButton.distance = Math.sqrt(x * x + y * y);
  }
  window.addEventListener("deviceorientation", handleOrientation);

}

let rFA;
window.toggleRFA = function () {
  if(rFA) {
    app.ticker.stop(); // check simple requestAnimationFrame
    rFA = false;
  } else {
    app.ticker.start();
    rFA = true;
  }
}
window.toggleRFA.loaded = true;


function gameLoop() {
  if(bg && allowCalcPhycis) {
    play();
    app.render();
  }
}

app.ticker.add(gameLoop);
app.ticker.stop();

const animateAngle = (curr, end) => {
  const d = Math.abs(curr - end) % (Math.PI * 2); 
  const r = d > Math.PI ? (Math.PI * 2) - d : d;
  //calculate sign 
  const sign = (curr - end >= 0 && curr - end <= Math.PI) || (curr - end <=-Math.PI && curr - end>= -(Math.PI * 2)) ? 1 : -1; 
  return r * sign;
}

function play() {
  glueMask.update(dimensions, temp_angle);

  const angleDiff = animateAngle(floatButton.sprite.rotation, temp_angle + Math.PI);
  const distanceDiff = -floatButton.currDistance + floatButton.distance;
  if (Math.abs(distanceDiff) < 1 && Math.abs(angleDiff) < 0.005) {
    floatButton.currDistance = floatButton.distance;
    floatButton.sprite.rotation = temp_angle + Math.PI;
    floatButton.sprite.x = Math.sin(floatButton.sprite.rotation - Math.PI) * floatButton.currDistance + dimensions.width / 2;
    floatButton.sprite.y = -Math.cos(floatButton.sprite.rotation - Math.PI) * floatButton.currDistance + dimensions.height / 2;
  } else {
    floatButton.currDistance += distanceDiff * 0.04;
    floatButton.sprite.rotation -= angleDiff * 0.02;
    floatButton.sprite.x = Math.sin(floatButton.sprite.rotation - Math.PI) * floatButton.currDistance + dimensions.width / 2;
    floatButton.sprite.y = -Math.cos(floatButton.sprite.rotation - Math.PI) * floatButton.currDistance + dimensions.height / 2;
  }
}

if(window.console.log_temp) {
  window.console.log = window.console.log_temp;
}

export default toggleRFA;