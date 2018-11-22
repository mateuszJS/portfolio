import PIXI from './PixiCustomBuild';
import getStatesViewer from './stats';
import GlueMask from './GlueMask';
import GlueFilter from './GlueFilter';
import CircleImage from '../assets/circleSM30newFilterColor2_90deg.png';
import SpaceImage from '../assets/space.jpg';
import FlareImage from '../assets/flare.png';
import createFlare from './createFlare';

//Pixi main config-------------------------------------
var width = window.innerWidth;
var height = window.innerHeight;
var canvasNode = document.querySelector('.animation-block');
canvasNode.width = width;
canvasNode.height = height;
var app = new PIXI.Application(width, height, { transparent: true, view: canvasNode }, );

const stats = getStatesViewer();

PIXI.Loader.shared
  .add([
    SpaceImage,
    CircleImage,
    FlareImage,
    ])
  .load(setup);

let bg, glueMask;
// const flares = [];
function setup() {
  const filterArea = new PIXI.Rectangle(
    width / 2 - 200,
    height / 2 - 100,
    400,
    400
  );
  glueMask = new GlueMask(
    app.renderer,
    PIXI.Loader.shared.resources[CircleImage].texture,
    width,
    height
    // filterArea.width,
    // filterArea.height
  );
  bg = new PIXI.Sprite(PIXI.Loader.shared.resources[SpaceImage].texture);
  app.stage.addChild(bg, glueMask);

  var glueFilter = new GlueFilter(glueMask);
  bg.filterArea = app.screen;//filterArea;
    //app.screen; // not necessary, but I prefer to do it.
  glueFilter.padding = 0;
  glueFilter.filterArea = app.screen;
  bg.filters = [glueFilter];
  bg.anchor.set(0.5);
  bg.x = width / 2;
  bg.y = height / 2;
  // bg.width = width;
  // bg.height = height;
  bg.scale.set(1, 1.6);

  
  // for(let i = 0; i < 10; i++) {
  //   const flare = createFlare(
  //     PIXI.Loader.shared.resources[FlareImage].texture,
  //     width / 2,
  //     height / 2
  //   );
  //   flares.push(flare);
  //   app.stage.addChild(flare);
  // }


  //when user it on main page but script with animation is still not loaded
  if(window.runAnimation && window.runAnimation.router.currentAddress.index === 2) {//main page
    window.runAnimation = undefined;
    window.toggleRFA();
  }
}

let rFA;
window.toggleRFA = function () {
  if(rFA) {
    window.cancelAnimationFrame(rFA);
    rFA = undefined;
  } else {
    gameLoop();
  }
}
window.toggleRFA.loaded = true;

function gameLoop() {
  rFA = requestAnimationFrame(gameLoop);
  stats.begin();
  if(bg) {
    play();
  }
  stats.end();
  app.render();
}

function play() {
  bg.rotation -= 0.002;
  glueMask.update();
  // flares.forEach(flare => flare.update());
}

export default toggleRFA;