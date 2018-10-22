import PIXI from './PixiCustomBuild';
import GlueMask from './GlueMask';
import GlueFilter from './GlueFilter';
import spaceBackgroundImage from './assets/space.png';
import circleMaskImage from './assets/circleSM30newInline.png';
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
const canvasNode = document.querySelector('.animation-block');
const workBtn = document.querySelector('.btn');
const workBtnContainer = document.querySelector('.btn-container');
canvasNode.width = dimensions.width;
canvasNode.height = dimensions.height;
const app = new PIXI.Application(dimensions.width, dimensions.height, { transparent: true, view: canvasNode, }, );

workBtnContainer.style.width = `${dimensions.width}px`;
workBtnContainer.style.height = `${dimensions.height}px`;

PIXI.Loader.shared
  .add([
    spaceBackgroundImage,
    circleMaskImage,
    floatButtonImage,
    ])
  .load(setup);

let bg, glueMask, floatButton = {
  node: workBtn,
  container: workBtnContainer,
  distance: dimensions.height * 0.2,
  currDistance: dimensions.height * 0.2,
  currRotation: 0,
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

    temp_angle = deviceOrientation  * Math.PI / 180 + Math.PI;
    const x = Math.sin(temp_angle) * (0.7 * dimensions.width / 2);
    const y = -Math.cos(temp_angle) * (0.7 * dimensions.height / 2);
    floatButton.distance = Math.sqrt(x * x + y * y);

    if (deviceOrientation == 0) {
      floatButton.container.style.transform = 'rotate(0deg)';
    } else if (-deviceOrientation == -90) {
      floatButton.container.style.transform = `rotate(${-deviceOrientation}deg) translate3d(${(dimensions.width - dimensions.height) / 2}px, ${(dimensions.width - dimensions.height) / 2}px, 0)`;
    } else if (-deviceOrientation == 90) {
      floatButton.container.style.transform = `rotate(${deviceOrientation}deg) translate3d(${(dimensions.height - dimensions.width) / 2}px, ${(dimensions.height - dimensions.width) / 2}px, 0)`;
    }
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

  const angleDiff = animateAngle(floatButton.currRotation, temp_angle + Math.PI);
  const distanceDiff = -floatButton.currDistance + floatButton.distance;
  if (Math.abs(distanceDiff) < 1 && Math.abs(angleDiff) < 0.002) {
    floatButton.currDistance = floatButton.distance;
    floatButton.currRotation = temp_angle + Math.PI;
    const x = Math.sin(floatButton.currRotation - Math.PI) * floatButton.currDistance + dimensions.width / 2;
    const y = -Math.cos(floatButton.currRotation - Math.PI) * floatButton.currDistance + dimensions.height / 2;
    floatButton.node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${floatButton.currRotation * 180 / Math.PI}deg)`;
  } else {
    floatButton.currDistance += distanceDiff * 0.05;
    floatButton.currRotation -= angleDiff * 0.02;
    const x = Math.sin(floatButton.currRotation - Math.PI) * floatButton.currDistance + dimensions.width / 2;
    const y = -Math.cos(floatButton.currRotation - Math.PI) * floatButton.currDistance + dimensions.height / 2;
    floatButton.node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${floatButton.currRotation * 180 / Math.PI}deg)`;
  }
}

if(window.console.log_temp) {
  window.console.log = window.console.log_temp;
}

export default toggleRFA;